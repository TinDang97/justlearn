# Lesson 9: Capstone Project 3 — CLI Developer Tool

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Project Overview

Build `devkit` — a professional command-line developer tool that helps with common development tasks.

**Features:**
- `devkit init` — scaffold a new Python project (venv, structure, pre-commit, etc.)
- `devkit check` — run quality gates (lint, type check, tests)
- `devkit deps` — manage dependencies (audit, update, check unused)
- `devkit secrets` — scan for hardcoded secrets
- `devkit report` — generate project health report
- Plugin system for extensibility
- Configuration via `devkit.toml`

---

## Architecture

```
devkit/
├── cli.py                  # Main argparse entry point
├── commands/
│   ├── init.py             # Project scaffolding
│   ├── check.py            # Quality gates
│   ├── deps.py             # Dependency management
│   ├── secrets.py          # Secret scanning
│   └── report.py           # Health report
├── plugins/
│   ├── base.py             # Plugin base class
│   └── registry.py         # Plugin discovery
├── config.py               # devkit.toml configuration
├── utils/
│   ├── subprocess.py       # Command runner wrapper
│   ├── output.py           # Terminal output (colors, tables)
│   └── fs.py               # File system utilities
├── tests/
│   ├── test_init.py
│   ├── test_check.py
│   └── test_config.py
├── pyproject.toml          # Package config + entry point
└── README.md
```

---

## Key Implementation

### Entry Point

```python
# cli.py
import argparse
import sys
from commands import init, check, deps, secrets, report

def main():
    parser = argparse.ArgumentParser(
        prog="devkit",
        description="Developer toolkit for Python projects",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  devkit init my_project
  devkit check --fix
  devkit deps --audit
  devkit report --output report.html
        """
    )
    parser.add_argument("--version", action="version", version="devkit 1.0.0")
    parser.add_argument("--verbose", "-v", action="store_true")

    subparsers = parser.add_subparsers(dest="command", metavar="COMMAND")

    # Register all commands:
    init.register(subparsers)
    check.register(subparsers)
    deps.register(subparsers)
    secrets.register(subparsers)
    report.register(subparsers)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    sys.exit(args.func(args) or 0)


if __name__ == "__main__":
    main()
```

### Command Module Pattern

```python
# commands/check.py
import argparse
import subprocess
from pathlib import Path
from utils.output import print_section, print_success, print_error


def register(subparsers):
    """Register 'check' subcommand."""
    parser = subparsers.add_parser(
        "check",
        help="Run quality gates (lint, type check, tests)"
    )
    parser.add_argument("--fix", action="store_true",
                        help="Auto-fix issues where possible")
    parser.add_argument("--no-tests", action="store_true",
                        help="Skip running tests")
    parser.set_defaults(func=run)


def run(args) -> int:
    """Execute the check command. Returns exit code."""
    exit_code = 0
    src = Path("src") if Path("src").exists() else Path(".")

    # 1. Format with black:
    print_section("Formatting")
    result = subprocess.run(
        ["black", "--check" if not args.fix else "", str(src)],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print_success("Formatting: OK")
    else:
        if args.fix:
            subprocess.run(["black", str(src)])
            print_success("Formatting: Fixed")
        else:
            print_error("Formatting: Issues found (run with --fix)")
            exit_code = 1

    # 2. Lint with ruff:
    print_section("Linting")
    cmd = ["ruff", "check"]
    if args.fix:
        cmd.append("--fix")
    cmd.append(str(src))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print_success("Linting: OK")
    else:
        print_error(f"Linting: {result.stdout}")
        exit_code = 1

    # 3. Type check:
    print_section("Type Checking")
    result = subprocess.run(
        ["mypy", str(src), "--ignore-missing-imports"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print_success("Type checking: OK")
    else:
        print_error(f"Type checking issues:\n{result.stdout}")
        exit_code = 1

    # 4. Tests:
    if not args.no_tests:
        print_section("Tests")
        result = subprocess.run(
            ["pytest", "tests/", "--tb=short", "-q"],
            capture_output=True, text=True
        )
        print(result.stdout)
        if result.returncode == 0:
            print_success("Tests: PASSED")
        else:
            print_error("Tests: FAILED")
            exit_code = 1

    return exit_code
```

### Plugin System

```python
# plugins/base.py
from abc import ABC, abstractmethod

class DevkitPlugin(ABC):
    """Base class for devkit plugins."""

    name: str = ""          # Plugin name
    description: str = ""  # One-line description

    @abstractmethod
    def register_commands(self, subparsers) -> None:
        """Register argparse subcommands."""
        ...

    @abstractmethod
    def run(self, args) -> int:
        """Execute the plugin. Returns exit code."""
        ...


# plugins/registry.py
import importlib
import pkgutil

def discover_plugins(plugin_dirs: list[str]) -> list[DevkitPlugin]:
    """Auto-discover plugins from directories."""
    plugins = []
    for dir_path in plugin_dirs:
        for finder, name, ispkg in pkgutil.iter_modules([dir_path]):
            try:
                module = importlib.import_module(f"{dir_path}.{name}")
                for attr in dir(module):
                    obj = getattr(module, attr)
                    if (isinstance(obj, type) and
                        issubclass(obj, DevkitPlugin) and
                        obj is not DevkitPlugin):
                        plugins.append(obj())
            except ImportError as e:
                print(f"Warning: Could not load plugin {name}: {e}")
    return plugins
```

### Configuration

```python
# config.py
from dataclasses import dataclass, field
from pathlib import Path
import tomllib   # Python 3.11+ standard library

@dataclass
class CheckConfig:
    formatter: str = "black"
    linter: str = "ruff"
    type_checker: str = "mypy"
    skip_tests: bool = False

@dataclass
class DevkitConfig:
    check: CheckConfig = field(default_factory=CheckConfig)
    plugin_dirs: list[str] = field(default_factory=list)
    src_dir: str = "src"

def load_config(path: str = "devkit.toml") -> DevkitConfig:
    config_file = Path(path)
    if not config_file.exists():
        return DevkitConfig()
    with open(config_file, "rb") as f:
        data = tomllib.load(f)
    return DevkitConfig(
        check=CheckConfig(**data.get("check", {})),
        plugin_dirs=data.get("plugin_dirs", []),
        src_dir=data.get("src_dir", "src"),
    )
```

**devkit.toml example:**
```toml
src_dir = "src"
plugin_dirs = ["custom_plugins"]

[check]
formatter = "black"
linter = "ruff"
skip_tests = false
```

### Package Setup (pyproject.toml)

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "devkit"
version = "1.0.0"
description = "Developer toolkit for Python projects"
dependencies = ["click", "rich", "tomllib"]

[project.scripts]
devkit = "devkit.cli:main"   # Makes 'devkit' command available after pip install
```

---

## Evaluation Criteria

- [ ] All 5 commands work correctly
- [ ] `devkit check --fix` actually fixes linting issues
- [ ] Plugin system: at least 1 custom plugin loads automatically
- [ ] Configuration via `devkit.toml` overrides defaults
- [ ] Colorful terminal output (use `colorama` or `rich`)
- [ ] `devkit --help` and `devkit COMMAND --help` show useful docs
- [ ] Installable as a package: `pip install -e .` then `devkit` works
- [ ] 70%+ test coverage on all command logic

---

[← Previous](./lesson-08-capstone-analytics-pipeline.md) | [Back to Course](./README.md) | [Next →](./lesson-10-completion-next-steps.md)

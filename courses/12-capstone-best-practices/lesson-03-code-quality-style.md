# Lesson 3: Code Quality & Style

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Apply PEP 8 consistently
- Use linters (flake8, ruff) and formatters (black)
- Add type hints for clarity and tooling support
- Configure pre-commit hooks for automated quality gates

---

## Lesson Outline

### Part 1: PEP 8 and Black (30 minutes)

#### Explanation

```python
# BAD: inconsistent style
def calculateDiscount(price,discount_pct,tax=0.1):
    """calculate discount"""
    RESULT=price*(1-discount_pct)*(1+tax)
    return RESULT

# GOOD: PEP 8 compliant
def calculate_discount(
    price: float,
    discount_pct: float,
    tax: float = 0.1,
) -> float:
    """Calculate discounted price with tax.

    Args:
        price: Original price in USD.
        discount_pct: Discount as decimal (0.1 = 10%).
        tax: Tax rate as decimal (0.1 = 10%).

    Returns:
        Final price after discount and tax.
    """
    return price * (1 - discount_pct) * (1 + tax)
```

**Tools:**
```bash
# Install:
pip install black ruff mypy

# Format code with black (no config needed):
black src/

# Lint with ruff (fast, replaces flake8 + isort + more):
ruff check src/
ruff check --fix src/   # Auto-fix what's possible

# Type check with mypy:
mypy src/ --ignore-missing-imports

# Check all at once:
black --check src/ && ruff check src/ && mypy src/
```

**pyproject.toml configuration:**
```toml
[tool.black]
line-length = 88
target-version = ["py312"]

[tool.ruff]
line-length = 88
select = ["E", "F", "W", "I", "N", "UP"]   # Enable rule categories
ignore = ["E501"]   # Ignore line length (black handles it)

[tool.mypy]
python_version = "3.12"
strict = true
ignore_missing_imports = true
```

#### Practice

Run black and ruff on one of your existing scripts. Fix all reported issues.

---

### Part 2: Type Hints (30 minutes)

#### Explanation

```python
from typing import Optional, Union, Any
from collections.abc import Callable, Iterator, Sequence

# Basic type hints:
def greet(name: str) -> str:
    return f"Hello, {name}!"

def get_user(user_id: int) -> dict | None:   # Python 3.10+
    ...

# Collections:
def process_scores(scores: list[float]) -> dict[str, float]:
    return {"mean": sum(scores) / len(scores), "max": max(scores)}

# Callable:
def apply_transform(
    data: list[int],
    transform: Callable[[int], int]
) -> list[int]:
    return [transform(x) for x in data]

# Generic classes:
from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Protocols (structural typing — duck typing with type hints):
from typing import Protocol

class Serializable(Protocol):
    def to_dict(self) -> dict: ...
    def to_json(self) -> str: ...

def save_to_file(obj: Serializable, path: str) -> None:
    import json
    with open(path, "w") as f:
        json.dump(obj.to_dict(), f)
# Works with ANY class that has to_dict() and to_json(), no inheritance needed!
```

#### Practice

Add type hints to your entire task manager service layer. Run mypy and fix all errors.

---

### Part 3: Pre-commit Hooks (30 minutes)

#### Explanation

```bash
# pip install pre-commit
# Create .pre-commit-config.yaml:
```

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.1.1
    hooks:
      - id: black
        language_version: python3.12

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.2.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: detect-private-key
```

```bash
# Install hooks:
pre-commit install

# Now every git commit runs all checks automatically!
# git commit -m "Add feature"  → runs black, ruff, mypy first

# Run manually:
pre-commit run --all-files
```

#### Practice

Set up pre-commit hooks for your capstone project. Make a commit and verify all checks run.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Code Review Checklist

Review your largest project against this checklist:
- [ ] All functions have type hints
- [ ] All public functions have docstrings
- [ ] No function longer than 30 lines
- [ ] No file longer than 300 lines
- [ ] No magic numbers (use named constants)
- [ ] Error messages are descriptive
- [ ] No `print()` in production code (use logging)
- [ ] All test functions are named `test_*`

Fix the 5 worst violations.

#### Exercise 2: Automated Quality Pipeline

Create a `Makefile` (or `justfile`) with quality commands:
```makefile
.PHONY: lint format typecheck test quality

format:
	black src/ tests/
	ruff check --fix src/ tests/

lint:
	ruff check src/ tests/

typecheck:
	mypy src/

test:
	pytest tests/ -v --tb=short

quality: format lint typecheck test
```

---

## Key Takeaways

- `black` formats code automatically with zero config (just run it)
- `ruff` is a fast, modern linter that replaces flake8 + isort
- Type hints: `str`, `int`, `list[str]`, `dict[str, int]`, `X | None`, `X | Y`
- Pre-commit hooks run quality checks before every commit — catch issues early
- `mypy --strict` is aggressive but produces the most robust code

---

[← Previous](./lesson-02-testing-strategies.md) | [Back to Course](./README.md) | [Next →](./lesson-04-documentation.md)

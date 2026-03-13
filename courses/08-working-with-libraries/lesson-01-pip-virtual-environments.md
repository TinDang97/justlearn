# Lesson 1: pip & Virtual Environments

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Install packages with `pip` and `uv`
- Create and use virtual environments
- Manage `requirements.txt`
- Understand dependency isolation

---

## Lesson Outline

### Part 1: pip Basics (30 minutes)

#### Explanation

```bash
# Install a package:
pip install requests

# Install specific version:
pip install requests==2.31.0

# Install minimum version:
pip install "requests>=2.28"

# Uninstall:
pip uninstall requests

# List installed packages:
pip list

# Show package info:
pip show requests

# Search PyPI:
pip index versions requests   # Show available versions

# Upgrade a package:
pip install --upgrade requests
```

**What is PyPI?** The Python Package Index (pypi.org) hosts 500,000+ packages. When you `pip install requests`, pip downloads from PyPI.

> **Teacher's Note:** This course recommends `uv` (modern Python package manager) alongside pip. `uv` is 10-100x faster. Syntax: `uv pip install requests`. For beginners, both work identically.

#### Practice

Install `requests`, `Pillow`, and `colorama`. Verify with `pip list`.

---

### Part 2: Virtual Environments (30 minutes)

#### Explanation

**The Problem:** Different projects need different versions of the same library. Without isolation, they conflict.

**The Solution:** Virtual environments — isolated Python installations per project.

```bash
# Create virtual environment:
python -m venv venv          # Creates 'venv' folder

# Activate (Mac/Linux):
source venv/bin/activate

# Activate (Windows):
venv\Scripts\activate

# Your prompt changes to show: (venv) $

# Now install packages (goes into venv, not system Python):
pip install requests

# Deactivate:
deactivate
```

**With uv (faster, modern alternative):**
```bash
uv venv                      # Create .venv
source .venv/bin/activate    # Same activation
uv pip install requests      # Install
```

**Project structure:**
```
my_project/
├── venv/                # Virtual environment (don't commit!)
├── src/
│   └── app.py
├── requirements.txt
└── .gitignore           # Should include: venv/, .venv/
```

#### Practice

Create a new project directory, set up a virtual environment, install 3 packages.

---

### Part 3: requirements.txt (30 minutes)

#### Explanation

```bash
# Freeze current installed packages:
pip freeze > requirements.txt

# requirements.txt looks like:
# requests==2.31.0
# Pillow==10.1.0
# colorama==0.4.6

# Install from requirements.txt (new machine or teammate):
pip install -r requirements.txt

# Development vs production requirements:
# requirements.txt - production only
# requirements-dev.txt - includes testing, linting tools
```

**Good `requirements.txt` practices:**
```
# Production dependencies:
requests>=2.28,<3.0
Pillow>=10.0

# Pin exact versions for reproducibility:
requests==2.31.0
Pillow==10.1.0
```

**Modern approach with pyproject.toml:**
```toml
[project]
name = "my-app"
dependencies = [
    "requests>=2.28",
    "Pillow>=10.0",
]

[project.optional-dependencies]
dev = ["pytest", "black", "mypy"]
```

#### Practice

Create a project, install some packages, generate requirements.txt, create a new venv, and reproduce the environment from requirements.txt.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Environment Setup

Set up a complete project environment:
1. Create directory `weather_app/`
2. Create virtual environment
3. Install: `requests`, `python-dotenv`, `colorama`
4. Create `requirements.txt`
5. Create `.gitignore` that excludes venv
6. Write a test script that imports all three

#### Exercise 2: Dependency Audit

Given a `requirements.txt` with 10 packages:
- Check which are outdated (`pip list --outdated`)
- Research what each package does on PyPI
- Update 2 packages to latest versions
- Update requirements.txt

---

## Key Takeaways

- Always work in a virtual environment — never install to system Python
- `pip install package` downloads from PyPI
- `pip freeze > requirements.txt` captures current environment
- `pip install -r requirements.txt` reproduces environment elsewhere
- Add `venv/` and `.venv/` to `.gitignore`

---

[Back to Course](./README.md) | [Next →](./lesson-02-reading-documentation.md)

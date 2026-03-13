# Lesson 4: Documentation

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Write effective docstrings in Google/NumPy style
- Generate API documentation with Sphinx or mkdocs
- Create a useful README
- Document APIs with OpenAPI/Swagger

---

## Lesson Outline

### Part 1: Docstrings (30 minutes)

#### Explanation

```python
# Google-style docstrings (recommended):
def calculate_discount(
    price: float,
    discount_pct: float,
    tax: float = 0.08,
) -> float:
    """Calculate final price after discount and tax.

    Args:
        price: Original price in USD. Must be positive.
        discount_pct: Discount percentage as decimal (0.1 = 10% off).
        tax: Tax rate as decimal. Defaults to 0.08 (8% sales tax).

    Returns:
        Final price after applying discount then adding tax.

    Raises:
        ValueError: If price is negative or discount_pct is outside [0, 1].

    Examples:
        >>> calculate_discount(100, 0.1)
        97.2
        >>> calculate_discount(100, 0.5, tax=0)
        50.0
    """
    if price < 0:
        raise ValueError(f"Price must be non-negative, got {price}")
    if not 0 <= discount_pct <= 1:
        raise ValueError(f"Discount must be 0-1, got {discount_pct}")
    return price * (1 - discount_pct) * (1 + tax)


class UserService:
    """Handles user account operations.

    Provides create, update, and delete operations for user accounts,
    with email notifications on key events.

    Attributes:
        repo: User data repository.
        emailer: Email notification service.

    Example:
        >>> service = UserService(repo, emailer)
        >>> user_id = service.create("Alice", "alice@example.com")
    """

    def __init__(self, repo: UserRepository, emailer: Emailer):
        """Initialize UserService.

        Args:
            repo: Repository for user data persistence.
            emailer: Service for sending email notifications.
        """
        self.repo = repo
        self.emailer = emailer
```

#### Practice

Add Google-style docstrings to all public classes and functions in your task manager app.

---

### Part 2: README Best Practices (30 minutes)

#### Explanation

**Great README structure:**
```markdown
# Project Name

One-line description of what this project does and who it's for.

## Features

- Feature 1: brief description
- Feature 2: brief description

## Quick Start

```bash
git clone https://github.com/you/project
cd project
pip install -r requirements.txt
cp .env.example .env  # Edit with your credentials
python app.py
```

## Installation

Detailed installation instructions...

## Usage

```python
from myproject import MainClass
instance = MainClass(config="settings.cfg")
result = instance.process(data)
```

## API Reference

| Function | Description | Returns |
|----------|-------------|---------|
| `process(data)` | Process input data | Processed DataFrame |

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | SQLite/PostgreSQL URL |
| SECRET_KEY | Yes | - | Flask secret key |

## Development

```bash
pip install -r requirements-dev.txt
pre-commit install
pytest tests/
```

## License

MIT
```

#### Practice

Write a complete README for your task manager app following this structure.

---

### Part 3: API Documentation (30 minutes)

#### Explanation

```python
# flask-openapi3 generates Swagger UI automatically:
# pip install flask-openapi3

from flask_openapi3 import OpenAPI, Info
from pydantic import BaseModel

info = Info(title="Task Manager API", version="1.0.0")
app = OpenAPI(__name__, info=info)

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"

class TaskResponse(BaseModel):
    id: int
    title: str
    status: str

@app.post("/api/v1/tasks", responses={"201": TaskResponse})
def create_task(body: TaskCreate):
    """Create a new task.

    Creates a task with the provided details and returns the created task.
    """
    task = task_service.create(body.dict())
    return TaskResponse(**task), 201
```

**Doctest — runnable examples in docstrings:**
```python
def fibonacci(n: int) -> int:
    """Calculate nth Fibonacci number.

    >>> fibonacci(0)
    0
    >>> fibonacci(1)
    1
    >>> fibonacci(10)
    55
    """
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Run doctests:
# python -m doctest math_utils.py -v
# pytest --doctest-modules
```

#### Practice

Add OpenAPI documentation to your Flask API. Verify it shows correctly at `/openapi/swagger-ui`.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Documentation Audit

Audit your task manager for documentation quality:
- Every public function: has docstring with Args, Returns, Raises
- README: installation, quick start, configuration table
- API: at least one endpoint with full OpenAPI docs
- At least 5 functions with doctest examples

#### Exercise 2: MkDocs Site

Generate documentation website with mkdocs:
```bash
pip install mkdocs mkdocstrings[python]
mkdocs new docs
# Edit mkdocs.yml, run:
mkdocs serve   # Live preview at localhost:8000
mkdocs build   # Build static site
```

---

## Key Takeaways

- Google-style docstrings: Args, Returns, Raises, Examples sections
- README = your project's sales pitch; include Quick Start within first screen
- Doctest examples in docstrings are both documentation AND tests
- OpenAPI/Swagger docs are auto-generated from your code
- Good docs attract contributors and save your future self time

---

[← Previous](./lesson-03-code-quality-style.md) | [Back to Course](./README.md) | [Next →](./lesson-05-security-best-practices.md)

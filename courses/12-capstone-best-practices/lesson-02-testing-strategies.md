# Lesson 2: Testing Strategies

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Understand testing pyramid and test types
- Write effective unit, integration, and end-to-end tests
- Apply Test-Driven Development (TDD)
- Measure and improve test coverage

---

## Lesson Outline

### Part 1: Testing Pyramid (30 minutes)

#### Explanation

```
        /\
       /E2E\         Few, slow, expensive
      /------\       Full system tests
     /Integr. \      More, test modules together
    /----------\
   /Unit Tests  \    Many, fast, isolated
  /--------------\
```

**Unit tests:** Test one function/class in isolation.
- Fast: run in milliseconds
- Isolated: no database, network, or file system
- Many: aim for 70-80% of your test suite

**Integration tests:** Test multiple components working together.
- Slower: may use a real database
- Catch bugs that unit tests miss
- 15-20% of your test suite

**E2E tests:** Test the whole system from user perspective.
- Slowest: use real browser/API
- Catch UX issues
- 5-10% of your test suite

```python
# Unit test (fast, isolated):
def test_calculate_discount():
    from pricing import calculate_discount
    assert calculate_discount(100, 0.1) == 90.0
    assert calculate_discount(100, 0.0) == 100.0
    assert calculate_discount(100, 1.0) == 0.0

# Integration test (uses real SQLite):
def test_create_and_retrieve_user(tmp_path):
    db_path = str(tmp_path / "test.db")
    repo = SQLiteUserRepository(db_path)
    user_id = repo.create({"name": "Alice", "email": "alice@test.com"})
    user = repo.find_by_id(user_id)
    assert user["name"] == "Alice"

# E2E test (uses real Flask test client):
def test_register_and_login(client):
    # Register:
    res = client.post("/register", json={"name": "Alice",
                      "email": "alice@test.com", "password": "secure123"})
    assert res.status_code == 201
    # Login:
    res = client.post("/login", json={"email": "alice@test.com",
                                      "password": "secure123"})
    assert res.status_code == 200
    assert "token" in res.json
```

#### Practice

Categorize 10 test scenarios for your task manager: which are unit, integration, or E2E?

---

### Part 2: TDD (Test-Driven Development) (30 minutes)

#### Explanation

**TDD cycle: RED → GREEN → REFACTOR**

```python
# Step 1: RED - Write failing test first:
def test_fibonacci():
    from math_utils import fibonacci
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1
    assert fibonacci(10) == 55
# Run: FAIL (fibonacci doesn't exist)

# Step 2: GREEN - Write minimal code to pass:
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
# Run: PASS

# Step 3: REFACTOR - Clean up:
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
# Run: STILL PASS (tests protect against regression)
```

**TDD for a new feature:**
```python
# Write tests BEFORE implementation:
class TestPasswordValidator:
    def test_minimum_8_chars(self):
        from auth import validate_password
        assert validate_password("short") is False
        assert validate_password("longenough") is True

    def test_requires_uppercase(self):
        assert validate_password("nouppercase1") is False
        assert validate_password("HasUppercase1") is True

    def test_requires_digit(self):
        assert validate_password("NoDigitHere") is False
        assert validate_password("HasDigit1") is True

# Now implement until all tests pass:
def validate_password(password: str) -> bool:
    return (len(password) >= 8
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password))
```

#### Practice

Use TDD to implement a `ShoppingCart` class: write all tests first, then implement until they pass.

---

### Part 3: pytest Advanced (30 minutes)

#### Explanation

```python
import pytest

# Fixtures with scope:
@pytest.fixture(scope="session")   # Created once per test session
def database():
    """Expensive setup: create DB once, reuse all tests."""
    db = create_test_database()
    yield db
    db.cleanup()

@pytest.fixture(scope="function")  # Default: new instance per test
def user_service(database):
    return UserService(UserRepository(database))

# Parametrize with IDs:
@pytest.mark.parametrize("email,valid", [
    ("alice@example.com", True),
    ("invalid-email", False),
    ("@missing.com", False),
    ("", False),
], ids=["valid", "no_at", "no_local", "empty"])
def test_email_validation(email, valid):
    from auth import validate_email
    assert validate_email(email) == valid

# Mark tests:
@pytest.mark.slow
@pytest.mark.integration
def test_large_dataset_processing():
    ...

# conftest.py - shared fixtures:
# (pytest automatically loads conftest.py from current and parent directories)

# Run only fast tests:
# pytest -m "not slow"
# pytest -m "integration"
# pytest --tb=short -v

# Coverage:
# pytest --cov=src --cov-report=term-missing --cov-fail-under=80
```

#### Practice

Set up `conftest.py` for your app with: Flask test client fixture, database fixture, sample data factory fixtures.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Test Coverage Analysis

Run coverage on your task manager app. Find the 5 functions with 0% coverage and write tests for them.

```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

#### Exercise 2: Property-Based Testing

Use `hypothesis` for property-based testing:
```python
from hypothesis import given, strategies as st

@given(st.text(min_size=1), st.integers(min_value=0, max_value=100))
def test_discount_never_negative(price_str, discount_pct):
    price = abs(float(len(price_str)))  # silly but works
    result = apply_discount(price, discount_pct / 100)
    assert result >= 0
```

---

## Key Takeaways

- Testing pyramid: many unit tests, fewer integration, few E2E
- TDD: write test first, then minimal code, then refactor
- `pytest` fixtures manage setup/teardown; `scope` controls reuse
- Mark slow/integration tests so you can skip them during development
- Coverage tells you WHAT isn't tested, not HOW WELL tests are written

---

[← Previous](./lesson-01-software-architecture.md) | [Back to Course](./README.md) | [Next →](./lesson-03-code-quality-style.md)

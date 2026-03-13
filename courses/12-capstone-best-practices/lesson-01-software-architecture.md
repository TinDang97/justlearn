# Lesson 1: Software Architecture

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Apply SOLID principles to Python code
- Organize code into layers (presentation, business logic, data)
- Use common design patterns appropriately
- Understand dependency injection

---

## Lesson Outline

### Part 1: SOLID Principles (30 minutes)

#### Explanation

**S — Single Responsibility Principle:** Each class/function does ONE thing.

```python
# BAD: UserManager does everything
class UserManager:
    def create_user(self, name, email, password):
        # Validate input
        # Hash password
        # Save to database
        # Send welcome email
        # Log the action
        pass  # 5 responsibilities!

# GOOD: Each class has one job
class UserValidator:
    def validate(self, data: dict) -> list[str]: ...

class PasswordHasher:
    def hash(self, password: str) -> str: ...

class UserRepository:
    def save(self, user: dict) -> int: ...

class WelcomeEmailer:
    def send(self, user: dict): ...

class UserService:
    """Orchestrates the other classes."""
    def create_user(self, name, email, password):
        errors = self.validator.validate({"name": name, "email": email})
        if errors:
            raise ValueError(errors)
        hash = self.hasher.hash(password)
        user_id = self.repo.save({"name": name, "email": email, "hash": hash})
        self.emailer.send({"email": email, "name": name})
        return user_id
```

**O — Open/Closed Principle:** Open for extension, closed for modification.

```python
# Use inheritance/composition to extend, not modify:
class NotificationSender:
    def send(self, message: str): raise NotImplementedError

class SlackSender(NotificationSender):
    def send(self, message: str): ...

class EmailSender(NotificationSender):
    def send(self, message: str): ...

# Adding TelegramSender doesn't touch existing code
class TelegramSender(NotificationSender):
    def send(self, message: str): ...
```

**D — Dependency Inversion:** Depend on abstractions, not concretions.

```python
from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def find_by_id(self, id: int): ...
    @abstractmethod
    def save(self, entity): ...

class SQLiteRepository(Repository):
    def find_by_id(self, id: int): ...

class UserService:
    def __init__(self, repo: Repository):   # Takes abstraction!
        self.repo = repo

# Easy to swap implementations:
service = UserService(SQLiteRepository())
service = UserService(InMemoryRepository())  # For testing!
```

#### Practice

Refactor a monolithic `ReportGenerator` class into SOLID components.

---

### Part 2: Layered Architecture (30 minutes)

#### Explanation

```
┌─────────────────────────────┐
│  Presentation Layer         │  Flask routes, CLI, API endpoints
│  (how users interact)       │
└──────────────┬──────────────┘
               │ calls
┌──────────────▼──────────────┐
│  Business Logic Layer       │  Services, domain models, rules
│  (what the app does)        │
└──────────────┬──────────────┘
               │ calls
┌──────────────▼──────────────┐
│  Data Access Layer          │  Repositories, DB queries, APIs
│  (where data comes from)    │
└─────────────────────────────┘
```

```python
# data/user_repository.py:
class UserRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def find_by_email(self, email: str) -> dict | None:
        # Pure database logic
        ...

    def create(self, user_data: dict) -> int:
        ...


# services/user_service.py:
class UserService:
    def __init__(self, repo: UserRepository, emailer: Emailer):
        self.repo = repo
        self.emailer = emailer

    def register(self, name: str, email: str, password: str) -> int:
        # Business logic: validate, hash, create, notify
        if self.repo.find_by_email(email):
            raise ValueError("Email already registered")
        ...


# routes/auth.py (Flask):
@bp.route("/register", methods=["POST"])
def register():
    data = request.json
    try:
        user_id = user_service.register(**data)
        return jsonify({"id": user_id}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
```

#### Practice

Reorganize your task manager app (Course 9) into a proper 3-layer architecture.

---

### Part 3: Design Patterns (30 minutes)

#### Explanation

```python
# Repository Pattern (abstract data access):
class TaskRepository(ABC):
    def get(self, id: int) -> Task: ...
    def list(self, filters: dict = None) -> list[Task]: ...
    def save(self, task: Task) -> Task: ...
    def delete(self, id: int): ...

class SQLiteTaskRepository(TaskRepository): ...
class InMemoryTaskRepository(TaskRepository): ...  # For testing


# Factory Pattern (create complex objects):
class NotificationFactory:
    @staticmethod
    def create(channel: str) -> NotificationSender:
        channels = {
            "email": EmailSender,
            "slack": SlackSender,
            "telegram": TelegramSender,
        }
        cls = channels.get(channel)
        if not cls:
            raise ValueError(f"Unknown channel: {channel}")
        return cls()


# Observer Pattern (event-driven):
class EventBus:
    def __init__(self):
        self._handlers: dict[str, list] = {}

    def subscribe(self, event: str, handler):
        self._handlers.setdefault(event, []).append(handler)

    def publish(self, event: str, data=None):
        for handler in self._handlers.get(event, []):
            handler(data)

bus = EventBus()
bus.subscribe("user.created", send_welcome_email)
bus.subscribe("user.created", create_default_settings)
bus.publish("user.created", {"id": 1, "email": "alice@example.com"})
```

#### Practice

Implement the Observer pattern for a task management app: when a task is completed, notify the user via email AND update the dashboard stats.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Architecture Review

Review your largest project from this course. Identify:
- Which responsibilities are mixed in one class?
- What would need to change if you switched from SQLite to PostgreSQL?
- What would be hard to test without setting up a real database?

Refactor to fix the three biggest issues.

#### Exercise 2: Plugin System

Design a plugin architecture where:
- `BasePlugin` defines the interface
- Plugins are discovered automatically from a `plugins/` directory
- Main app doesn't know about specific plugins (only the interface)

---

## Key Takeaways

- **SRP**: one reason to change per class
- **OCP**: extend with new classes, don't modify existing ones
- **DIP**: depend on abstractions (interfaces), not concrete classes
- **Repository pattern**: abstract data storage behind an interface
- **Factory pattern**: centralize object creation logic

---

[Back to Course](./README.md) | [Next →](./lesson-02-testing-strategies.md)

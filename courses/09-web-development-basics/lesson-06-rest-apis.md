# Lesson 6: REST APIs

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Design a RESTful API following conventions
- Build a complete API with Flask
- Handle errors consistently
- Document your API

---

## Lesson Outline

### Part 1: REST Design Principles (30 minutes)

#### Explanation

**REST conventions:**
```
Resource: /tasks
GET    /tasks          → list all tasks
POST   /tasks          → create new task
GET    /tasks/{id}     → get one task
PUT    /tasks/{id}     → replace entire task
PATCH  /tasks/{id}     → update part of task
DELETE /tasks/{id}     → delete task

Nested: GET /users/{id}/tasks → tasks for a specific user
```

**API response conventions:**
```python
# Success responses:
{"id": 1, "title": "Buy milk", "done": False}   # Single item
{"items": [...], "total": 50, "page": 1}         # List with pagination
{}   # Empty body (204 No Content for DELETE)

# Error responses (consistent format):
{"error": "Not found", "code": "TASK_NOT_FOUND"}
{"error": "Validation failed", "details": {"title": "Required"}}
```

**Versioning:**
```
/api/v1/tasks
/api/v2/tasks  (when you make breaking changes)
```

#### Practice

Design (on paper) a REST API for a bookstore: books, authors, orders. List all endpoints with methods.

---

### Part 2: Building a Complete REST API (30 minutes)

#### Explanation

```python
from flask import Flask, jsonify, request
from functools import wraps

app = Flask(__name__)

# Error response helper:
def error_response(message: str, code: str, status: int):
    return jsonify({"error": message, "code": code}), status

# Simple in-memory store (replace with DB in production):
tasks = {}
next_id = 1

@app.route("/api/v1/tasks", methods=["GET"])
def list_tasks():
    status_filter = request.args.get("status")  # ?status=done
    result = list(tasks.values())
    if status_filter:
        result = [t for t in result if t["status"] == status_filter]

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    start = (page - 1) * per_page

    return jsonify({
        "items": result[start:start + per_page],
        "total": len(result),
        "page": page,
        "per_page": per_page,
    })


@app.route("/api/v1/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = tasks.get(task_id)
    if not task:
        return error_response("Task not found", "TASK_NOT_FOUND", 404)
    return jsonify(task)


@app.route("/api/v1/tasks", methods=["POST"])
def create_task():
    global next_id
    data = request.json

    # Validation:
    if not data or not data.get("title"):
        return error_response("Title is required", "VALIDATION_ERROR", 400)

    task = {
        "id": next_id,
        "title": data["title"].strip(),
        "description": data.get("description", ""),
        "status": "pending",
    }
    tasks[next_id] = task
    next_id += 1
    return jsonify(task), 201, {"Location": f"/api/v1/tasks/{task['id']}"}


@app.route("/api/v1/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    task = tasks.get(task_id)
    if not task:
        return error_response("Task not found", "TASK_NOT_FOUND", 404)

    data = request.json or {}
    allowed = {"title", "description", "status"}
    for field in allowed:
        if field in data:
            task[field] = data[field]

    return jsonify(task)


@app.route("/api/v1/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    if task_id not in tasks:
        return error_response("Task not found", "TASK_NOT_FOUND", 404)
    del tasks[task_id]
    return "", 204
```

#### Practice

Add filtering, sorting (by title, status), and a `GET /api/v1/tasks/stats` endpoint returning counts by status.

---

### Part 3: Authentication and Error Handling (30 minutes)

#### Explanation

```python
import functools

# Simple API key authentication:
API_KEYS = {"key1": "user1", "key2": "admin"}

def require_api_key(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-Key")
        if not key or key not in API_KEYS:
            return jsonify({"error": "Unauthorized", "code": "INVALID_API_KEY"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route("/api/v1/protected")
@require_api_key
def protected():
    key = request.headers.get("X-API-Key")
    username = API_KEYS[key]
    return jsonify({"message": f"Hello, {username}!"})


# Global error handlers:
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad request", "code": "BAD_REQUEST"}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found", "code": "NOT_FOUND"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error", "code": "INTERNAL_ERROR"}), 500


# Content negotiation:
@app.before_request
def check_content_type():
    if request.method in ("POST", "PUT", "PATCH"):
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415
```

#### Practice

Add API key auth to your task API. Create keys with different permissions (read-only vs read-write).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Complete Task API

Finish the task API with:
- SQLAlchemy backend (use lesson 5 models)
- Pagination on list endpoint
- Filter by status, search by title
- Proper error handling for all endpoints
- API key authentication

#### Exercise 2: API Documentation

Create a `GET /api/v1/docs` endpoint that returns API documentation in JSON:
```json
{
  "endpoints": [
    {
      "path": "/api/v1/tasks",
      "methods": ["GET", "POST"],
      "description": "List and create tasks",
      "params": {"status": "Filter by status (optional)"}
    }
  ]
}
```

---

## Key Takeaways

- REST uses HTTP methods to express CRUD: GET=Read, POST=Create, PUT/PATCH=Update, DELETE=Delete
- Return consistent error format: `{"error": "message", "code": "MACHINE_CODE"}`
- Include pagination on list endpoints: `items`, `total`, `page`, `per_page`
- Use HTTP status codes correctly (201 for created, 204 for deleted, 400/422 for validation errors)
- Always validate input before processing

---

[← Previous](./lesson-05-database-with-flask.md) | [Back to Course](./README.md) | [Next →](./lesson-07-user-authentication.md)

# Lesson 2: Flask Introduction

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Create a Flask application
- Define routes with URL patterns
- Return HTML and JSON responses
- Understand the development server

---

## Lesson Outline

### Part 1: Your First Flask App (30 minutes)

#### Explanation

```python
# Install: pip install flask
# app.py

from flask import Flask, jsonify, request

app = Flask(__name__)   # __name__ tells Flask where to find templates

@app.route("/")
def home():
    return "<h1>Hello, Flask!</h1>"

@app.route("/about")
def about():
    return "<p>About page</p>"

# JSON response:
@app.route("/api/status")
def status():
    return jsonify({"status": "ok", "version": "1.0"})

# Run the development server:
if __name__ == "__main__":
    app.run(debug=True, port=5000)
```

**Run it:**
```bash
python app.py
# * Running on http://127.0.0.1:5000
# * Debug mode: on (auto-reloads on code change)
```

Visit `http://localhost:5000` in your browser!

> **Teacher's Note:** `debug=True` enables auto-reload (changes take effect without restart) and shows detailed error pages. NEVER use debug=True in production — it's a security risk.

#### Practice

Create a Flask app with 3 routes: `/`, `/about`, `/contact`. Each returns a different HTML page.

---

### Part 2: URL Variables and Methods (30 minutes)

#### Explanation

```python
from flask import Flask, jsonify, abort

app = Flask(__name__)

# Static data (in real app, this comes from database):
USERS = {
    1: {"id": 1, "name": "Alice", "email": "alice@example.com"},
    2: {"id": 2, "name": "Bob", "email": "bob@example.com"},
}

# URL variable (dynamic segment):
@app.route("/users/<int:user_id>")
def get_user(user_id):
    user = USERS.get(user_id)
    if not user:
        abort(404)   # Return 404 Not Found
    return jsonify(user)

# Multiple variables:
@app.route("/users/<int:user_id>/posts/<int:post_id>")
def get_user_post(user_id, post_id):
    return jsonify({"user": user_id, "post": post_id})

# Query parameters (?key=value):
@app.route("/search")
def search():
    query = request.args.get("q", "")        # ?q=python
    limit = request.args.get("limit", 10, type=int)  # ?limit=5
    if not query:
        return jsonify({"error": "q parameter required"}), 400
    return jsonify({"query": query, "limit": limit, "results": []})

# HTTP method restriction:
@app.route("/api/users", methods=["GET", "POST"])
def users():
    if request.method == "GET":
        return jsonify(list(USERS.values()))
    # POST: handled below
    return jsonify({"created": True}), 201
```

#### Practice

Create a `/calculator/<operation>/<float:a>/<float:b>` route that handles add, subtract, multiply, divide.

---

### Part 3: Response Objects (30 minutes)

#### Explanation

```python
from flask import Flask, jsonify, make_response, redirect, url_for

app = Flask(__name__)

# Return with status code:
@app.route("/api/create", methods=["POST"])
def create():
    return jsonify({"id": 1, "created": True}), 201   # 201 Created

# Custom response with headers:
@app.route("/api/download")
def download():
    response = make_response("file content here")
    response.headers["Content-Disposition"] = "attachment; filename=data.txt"
    response.headers["Content-Type"] = "text/plain"
    return response

# Redirect:
@app.route("/old-path")
def old():
    return redirect("/new-path")   # 302 by default

# Redirect to named route:
@app.route("/new-path")
def new():
    return "New page"

@app.route("/go-home")
def go_home():
    return redirect(url_for("home"))   # url_for generates URL from function name

# Error handlers:
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500
```

#### Practice

Create a Flask API for the `USERS` dict with proper status codes: 200 for found, 201 for created, 404 for not found.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Book API

Build a Flask API for a book library (in-memory dict):
- `GET /books` → list all books
- `GET /books/<id>` → get one book (404 if missing)
- `POST /books` → create new book from JSON body
- `PUT /books/<id>` → update book
- `DELETE /books/<id>` → delete book

#### Exercise 2: URL Shortener

Build a simple URL shortener:
- `POST /shorten` → accepts `{"url": "https://example.com"}`, returns `{"short": "abc123"}`
- `GET /<short_code>` → redirects to original URL (404 if not found)
- Store mappings in a dict (in-memory for now)
- `GET /stats/<short_code>` → returns click count

---

## Key Takeaways

- `@app.route("/path")` maps URLs to Python functions
- URL variables: `<int:id>`, `<string:name>`, `<float:value>`
- `request.args` for query parameters; `request.json` for JSON body
- `jsonify(dict)` returns JSON response with correct Content-Type
- Return `(response, status_code)` tuple to set non-200 status

---

[← Previous](./lesson-01-how-the-web-works.md) | [Back to Course](./README.md) | [Next →](./lesson-03-html-templates.md)

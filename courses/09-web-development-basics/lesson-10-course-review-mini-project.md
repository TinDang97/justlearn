# Lesson 10: Course 9 Review & Mini Project

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Course Review

| Lesson | Topic | Key Skill |
|--------|-------|-----------|
| 1 | How the Web Works | HTTP, status codes, request/response |
| 2 | Flask Introduction | Routes, jsonify, URL variables |
| 3 | HTML Templates | Jinja2, template inheritance |
| 4 | Forms & User Input | POST, validation, PRG pattern |
| 5 | Database with Flask | SQLAlchemy, CRUD |
| 6 | REST APIs | Design, implementation, errors |
| 7 | User Authentication | Hashing, sessions, login_required |
| 8 | Static Files & CSS | Bootstrap, JS Fetch API |
| 9 | Deployment | Gunicorn, env vars, Docker |

---

## Mini Project: Task Manager Web App

### Architecture

```
task_manager/
├── app.py              # Flask app factory
├── config.py           # Configuration classes
├── models.py           # SQLAlchemy models
├── routes/
│   ├── auth.py         # Login, register, logout
│   ├── tasks.py        # Task CRUD routes
│   └── api.py          # REST API endpoints
├── templates/
│   ├── base.html       # Base template with nav
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   └── tasks/
│       ├── list.html
│       ├── detail.html
│       └── form.html
├── static/
│   ├── css/style.css
│   └── js/app.js
├── requirements.txt
└── .env.example
```

### Core Features

**User Stories:**
1. As a user, I can register with email and password
2. As a user, I can log in and log out
3. As a logged-in user, I can create tasks with title, description, due date, priority
4. As a user, I can view my task list, filtered by status
5. As a user, I can mark tasks complete, edit, and delete them
6. As a user, I can access a JSON API for my tasks

### Key Code Snippets

**models.py:**
```python
from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    _password_hash = db.Column("password_hash", db.String(256))
    tasks = db.relationship("Task", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self._password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self._password_hash, password)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    status = db.Column(db.String(20), default="pending")  # pending, in_progress, done
    priority = db.Column(db.String(10), default="medium")  # low, medium, high
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
```

**routes/tasks.py:**
```python
from flask import Blueprint, render_template, redirect, url_for, request, flash, g
from models import Task, db
from auth import login_required

bp = Blueprint("tasks", __name__, url_prefix="/tasks")

@bp.route("/")
@login_required
def list_tasks():
    status = request.args.get("status")
    query = Task.query.filter_by(user_id=g.user.id)
    if status:
        query = query.filter_by(status=status)
    tasks = query.order_by(Task.due_date, Task.priority).all()
    return render_template("tasks/list.html", tasks=tasks, current_status=status)

@bp.route("/new", methods=["GET", "POST"])
@login_required
def create():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        if not title:
            flash("Title is required", "error")
            return render_template("tasks/form.html"), 422

        task = Task(
            title=title,
            description=request.form.get("description", ""),
            priority=request.form.get("priority", "medium"),
            user_id=g.user.id
        )
        db.session.add(task)
        db.session.commit()
        flash("Task created!", "success")
        return redirect(url_for("tasks.list_tasks"))

    return render_template("tasks/form.html")
```

### Extension Ideas

1. Tags/labels for tasks with filtering
2. Task sharing between users
3. Due date reminders via email (use Flask-Mail)
4. Export tasks to CSV
5. Drag-and-drop task reordering

---

## Next Course

**Course 10: Data Analysis & Visualization** — NumPy, Pandas, Matplotlib: analyzing real datasets and creating charts.

---

[← Previous](./lesson-09-deployment-basics.md) | [Back to Course](./README.md)

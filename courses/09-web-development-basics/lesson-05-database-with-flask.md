# Lesson 5: Database with Flask

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Connect Flask to a SQLite database
- Use Flask-SQLAlchemy ORM for database operations
- Perform CRUD operations through an ORM
- Manage database migrations

---

## Lesson Outline

### Part 1: Flask-SQLAlchemy (30 minutes)

#### Explanation

```python
# pip install flask-sqlalchemy
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Define models (classes map to tables):
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    # Relationship:
    posts = db.relationship("Post", backref="author", lazy=True)

    def __repr__(self):
        return f"<User {self.name}>"


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)


# Create all tables:
with app.app_context():
    db.create_all()
```

#### Practice

Define `Student` and `Course` models with a many-to-many relationship (enrollment table).

---

### Part 2: CRUD with SQLAlchemy (30 minutes)

#### Explanation

```python
from flask import jsonify, request, abort

# CREATE:
@app.route("/users", methods=["POST"])
def create_user():
    data = request.json
    user = User(name=data["name"], email=data["email"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name}), 201


# READ:
@app.route("/users")
def list_users():
    users = User.query.order_by(User.name).all()
    return jsonify([{"id": u.id, "name": u.name} for u in users])

@app.route("/users/<int:user_id>")
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({"id": user.id, "name": user.name, "email": user.email})

# Filter and search:
@app.route("/users/search")
def search_users():
    q = request.args.get("q", "")
    users = User.query.filter(User.name.ilike(f"%{q}%")).all()
    return jsonify([u.name for u in users])


# UPDATE:
@app.route("/users/<int:user_id>", methods=["PATCH"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name})


# DELETE:
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return "", 204
```

#### Practice

Build CRUD endpoints for a `Task` model (title, description, status, due_date, user_id).

---

### Part 3: Queries and Relationships (30 minutes)

#### Explanation

```python
# Filtering:
active_users = User.query.filter_by(is_active=True).all()
admins = User.query.filter(User.role == "admin").all()
recent = User.query.filter(User.created_at > cutoff_date).all()

# Ordering, limiting:
top_users = User.query.order_by(User.name).limit(10).all()
first_user = User.query.first()
count = User.query.count()

# Relationships:
user = User.query.get(1)
user.posts    # List of Post objects (SQLAlchemy fetches automatically)

# Join query:
results = db.session.query(User, Post)\
    .join(Post, Post.user_id == User.id)\
    .filter(User.id == 1)\
    .all()

# Aggregates:
from sqlalchemy import func
avg_age = db.session.query(func.avg(User.age)).scalar()
post_counts = db.session.query(
    User.name, func.count(Post.id).label("post_count")
).join(Post).group_by(User.id).all()
```

#### Practice

Write queries to: find all tasks due this week, count tasks per status, find users with most tasks.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Task Manager Backend

Build a Flask API with SQLAlchemy:
- Models: `User`, `Task`, `Tag`
- Task-Tag many-to-many via `task_tags` table
- Endpoints: full CRUD for tasks, filter by status/user/tag
- Auto-set `created_at` timestamp

#### Exercise 2: Blog Backend

Build models and routes for a blog:
- `User`: id, username, password_hash, email
- `Post`: id, title, slug, body, published, user_id, created_at
- `Comment`: id, body, post_id, author_name, created_at
- Route: `GET /posts` with pagination (`?page=1&per_page=10`)

---

## Key Takeaways

- Flask-SQLAlchemy maps Python classes to database tables
- `db.Column(Type, options)` defines columns; `db.relationship()` defines relations
- `db.session.add(obj)` + `db.session.commit()` to save; `db.session.delete()` to remove
- `Model.query.filter_by(attr=value)` for simple filters; `.filter(Model.attr == value)` for complex
- Always call `db.session.commit()` to persist changes

---

[← Previous](./lesson-04-forms-user-input.md) | [Back to Course](./README.md) | [Next →](./lesson-06-rest-apis.md)

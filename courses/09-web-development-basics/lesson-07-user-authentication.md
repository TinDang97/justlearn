# Lesson 7: User Authentication

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Implement user registration and login
- Hash passwords securely with werkzeug
- Use Flask sessions to maintain login state
- Protect routes with login_required

---

## Lesson Outline

### Part 1: Password Hashing (30 minutes)

#### Explanation

**NEVER store passwords in plain text.** Always hash them.

```python
from werkzeug.security import generate_password_hash, check_password_hash

# Hash a password:
password_hash = generate_password_hash("my_secure_password")
# $pbkdf2-sha256$260000$... (long hash string)

# Verify:
check_password_hash(password_hash, "my_secure_password")  # True
check_password_hash(password_hash, "wrong_password")      # False

# In your User model:
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    _password_hash = db.Column("password_hash", db.String(256), nullable=False)

    def set_password(self, password: str):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        self._password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self._password_hash, password)
```

**Why hashing?** If your database is stolen, attackers see only hashes — not actual passwords. `pbkdf2-sha256` makes brute-force attacks computationally expensive.

#### Practice

Create a `User` model with secure password handling. Test that you can set and verify passwords.

---

### Part 2: Sessions and Login (30 minutes)

#### Explanation

```python
from flask import session, redirect, url_for, flash, request

# Flask sessions store data in a secure, signed cookie:
app.secret_key = "your-secret-key"   # NEVER hardcode in production!

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").lower().strip()
        password = request.form.get("password", "")

        user = User.query.filter_by(email=email).first()

        # Don't reveal whether email or password was wrong:
        if not user or not user.check_password(password):
            flash("Invalid email or password", "error")
            return render_template("login.html"), 401

        # Store user ID in session:
        session.clear()
        session["user_id"] = user.id
        session.permanent = True   # Persist across browser close

        flash("Welcome back!", "success")
        next_url = request.args.get("next") or url_for("dashboard")
        return redirect(next_url)

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.")
    return redirect(url_for("login"))


# Get current user helper:
def get_current_user():
    user_id = session.get("user_id")
    if user_id:
        return User.query.get(user_id)
    return None
```

#### Practice

Build the complete login/logout flow with a simple login form template.

---

### Part 3: Login Required Decorator (30 minutes)

#### Explanation

```python
import functools
from flask import g

# Store current user in Flask's g object:
@app.before_request
def load_logged_in_user():
    user_id = session.get("user_id")
    g.user = User.query.get(user_id) if user_id else None

# Login required decorator:
def login_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if g.user is None:
            flash("Please log in to access this page.")
            return redirect(url_for("login", next=request.path))
        return f(*args, **kwargs)
    return decorated

# Use it on protected routes:
@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", user=g.user)

@app.route("/tasks")
@login_required
def list_tasks():
    tasks = Task.query.filter_by(user_id=g.user.id).all()
    return render_template("tasks.html", tasks=tasks)
```

**In templates, access current user:**
```html
{% if g.user %}
    <p>Welcome, {{ g.user.email }}!</p>
    <a href="/logout">Logout</a>
{% else %}
    <a href="/login">Login</a>
{% endif %}
```

#### Practice

Add `login_required` to all task routes. Ensure users can only see their own tasks.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Full Auth System

Build complete authentication:
- `GET/POST /register` — create account (validate: unique email, password >= 8 chars, passwords match)
- `GET/POST /login` — login with email/password
- `GET /logout` — clear session
- `GET /profile` — show current user info (login required)
- `GET/POST /change-password` — change password (must know current)

#### Exercise 2: Flask-Login (Optional Extension)

Refactor your auth to use Flask-Login:
```python
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

login_manager = LoginManager(app)
login_manager.login_view = "login"

class User(db.Model, UserMixin):
    ...

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
```

---

## Key Takeaways

- NEVER store plain text passwords — use `generate_password_hash`
- Sessions store data in signed cookies: safe from tampering, not encrypted
- `session["user_id"] = user.id` after login; `session.clear()` on logout
- `g.user` makes the current user available across the request
- Always use `@login_required` on routes that need authentication

---

[← Previous](./lesson-06-rest-apis.md) | [Back to Course](./README.md) | [Next →](./lesson-08-static-files-css.md)

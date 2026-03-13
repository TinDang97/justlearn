# Lesson 5: Security Best Practices

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Keep secrets out of code
- Prevent SQL injection and XSS
- Validate and sanitize all input
- Understand the OWASP Top 10 for Python

---

## Lesson Outline

### Part 1: Secrets Management (30 minutes)

#### Explanation

```python
# NEVER do this:
DATABASE_URL = "postgresql://admin:password123@db.company.com/prod"
API_KEY = "sk_live_abc123xyz"
SECRET_KEY = "my-secret-key"

# CORRECT: use environment variables:
import os
from dotenv import load_dotenv

load_dotenv()   # Loads .env file

DATABASE_URL = os.environ["DATABASE_URL"]      # Raises if missing
API_KEY = os.environ.get("API_KEY")            # None if missing
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"


# .env file (NEVER commit this):
# DATABASE_URL=postgresql://...
# API_KEY=sk_live_...
# SECRET_KEY=randomly-generated-string

# .gitignore should always include:
# .env
# *.env
# .env.local

# .env.example (commit this - shows what vars are needed):
# DATABASE_URL=postgresql://user:password@host:5432/dbname
# API_KEY=your-api-key-here
# SECRET_KEY=generate-with-python-secrets-module


# Generate secure secret keys:
import secrets
print(secrets.token_urlsafe(32))   # For SECRET_KEY
print(secrets.token_hex(16))       # For API tokens


# Check for leaked secrets (pre-commit hook):
# pip install detect-secrets
# detect-secrets scan > .secrets.baseline
```

#### Practice

Audit your task manager app. Find and remove ALL hardcoded secrets. Move them to `.env`.

---

### Part 2: Input Validation and Injection (30 minutes)

#### Explanation

```python
# SQL Injection - NEVER do this:
user_input = "'; DROP TABLE users; --"
query = f"SELECT * FROM users WHERE name = '{user_input}'"  # DANGEROUS!

# CORRECT: Always use parameterized queries:
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
# OR with SQLAlchemy:
User.query.filter_by(name=user_input)   # Always safe

# XSS (Cross-Site Scripting):
# Jinja2 auto-escapes by default:
# {{ user.name }}  → safe, HTML entities escaped
# {{ user.name | safe }}  → DANGEROUS, only if you trust the value

# Input validation:
import re
from pathlib import Path

def validate_username(username: str) -> str:
    """Validate and clean username."""
    username = username.strip()
    if len(username) < 3 or len(username) > 30:
        raise ValueError("Username must be 3-30 characters")
    if not re.match(r"^[a-zA-Z0-9_-]+$", username):
        raise ValueError("Username can only contain letters, numbers, _, -")
    return username

# File path traversal prevention:
def safe_file_path(base_dir: str, user_filename: str) -> Path:
    """Prevent path traversal attacks."""
    from werkzeug.utils import secure_filename
    safe_name = secure_filename(user_filename)   # Removes ../, etc.
    if not safe_name:
        raise ValueError("Invalid filename")
    full_path = Path(base_dir) / safe_name
    # Verify the path is inside the base directory:
    full_path.resolve().relative_to(Path(base_dir).resolve())
    return full_path

# Rate limiting:
# pip install flask-limiter
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@app.route("/api/login", methods=["POST"])
@limiter.limit("5 per minute")   # Max 5 login attempts per minute per IP
def login(): ...
```

#### Practice

Add input validation to all form fields and API endpoints in your task manager.

---

### Part 3: Authentication Security (30 minutes)

#### Explanation

```python
# Passwords:
from werkzeug.security import generate_password_hash, check_password_hash

# Use scrypt or bcrypt, NOT md5/sha1:
hash = generate_password_hash(password, method="scrypt")

# Session security:
app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SESSION_COOKIE_SECURE=True,       # HTTPS only
    SESSION_COOKIE_HTTPONLY=True,     # No JS access
    SESSION_COOKIE_SAMESITE="Lax",   # CSRF protection
    PERMANENT_SESSION_LIFETIME=3600  # 1 hour timeout
)

# CSRF protection:
# pip install flask-wtf
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)
# All forms automatically include CSRF token

# Security headers:
@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Password reset: use time-limited tokens:
import secrets
from datetime import datetime, timedelta

def create_reset_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=1)
    # Store: {token: (user_id, expiry)} in DB or cache
    return token
```

#### Practice

Add CSRF protection to all your Flask forms. Add security headers to your app.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Security Checklist

Run a security audit of your task manager:
- [ ] No hardcoded secrets
- [ ] All SQL uses parameterized queries
- [ ] All user input is validated
- [ ] Passwords are hashed with bcrypt/scrypt
- [ ] Rate limiting on login endpoint
- [ ] Security headers present
- [ ] Session cookies are secure
- [ ] File uploads use `secure_filename()`
- [ ] Error messages don't leak system info

#### Exercise 2: Security Scanner

Run Bandit (Python security linter):
```bash
pip install bandit
bandit -r src/ -f txt -o security_report.txt
cat security_report.txt
```

Fix all HIGH severity issues found.

---

## Key Takeaways

- Secrets in environment variables — never in code or git
- SQL injection: ALWAYS use parameterized queries (?, :name, etc.)
- XSS: Jinja2 escapes by default; only use `| safe` for trusted HTML
- Hash passwords with `werkzeug.security.generate_password_hash` (uses scrypt)
- Rate limit authentication endpoints to prevent brute force

---

[← Previous](./lesson-04-documentation.md) | [Back to Course](./README.md) | [Next →](./lesson-06-performance-optimization.md)

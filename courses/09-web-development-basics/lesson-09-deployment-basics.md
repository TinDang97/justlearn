# Lesson 9: Deployment Basics

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand why `flask run` is not for production
- Use Gunicorn as a production WSGI server
- Manage configuration with environment variables
- Deploy to a cloud platform (Heroku/Render basics)

---

## Lesson Outline

### Part 1: Production Configuration (30 minutes)

#### Explanation

```python
# config.py - manage settings for different environments:
import os
from pathlib import Path

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-CHANGE-ME")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev.db"

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///prod.db")
    # In production: "postgresql://user:pass@host/db"

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}


# app.py:
from config import config

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    db.init_app(app)
    return app
```

**Environment variables with `.env` file:**
```bash
# .env (NEVER commit this!)
SECRET_KEY=super-secret-production-key-here
DATABASE_URL=postgresql://user:password@localhost/mydb
FLASK_ENV=production
```

```python
# Load .env file:
from dotenv import load_dotenv   # pip install python-dotenv
load_dotenv()
```

#### Practice

Refactor your Flask app to use `create_app()` and a config class.

---

### Part 2: Gunicorn (30 minutes)

#### Explanation

Flask's built-in server is single-threaded, not production-ready. Gunicorn (Green Unicorn) is the standard WSGI server for Python web apps.

```bash
# Install:
pip install gunicorn

# Run (4 worker processes):
gunicorn --workers 4 --bind 0.0.0.0:8000 "app:create_app()"

# With config file (gunicorn.conf.py):
# workers = 4
# bind = "0.0.0.0:8000"
# accesslog = "access.log"
# errorlog = "error.log"

gunicorn -c gunicorn.conf.py "app:create_app()"
```

**gunicorn.conf.py:**
```python
import multiprocessing

workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
bind = "0.0.0.0:8000"
timeout = 30
keepalive = 2
accesslog = "-"    # stdout
errorlog = "-"     # stderr
loglevel = "info"
```

**Worker count formula:** `(2 × CPU cores) + 1` for CPU-bound tasks; more workers for I/O-bound tasks.

#### Practice

Run your app with Gunicorn using 2 workers and verify it handles requests correctly.

---

### Part 3: Docker Basics (30 minutes)

#### Explanation

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (Docker cache optimization):
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application:
COPY . .

# Create non-root user:
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:8000", "app:create_app()"]
```

```bash
# Build image:
docker build -t my-flask-app .

# Run container:
docker run -p 8000:8000 \
  -e SECRET_KEY=mysecret \
  -e DATABASE_URL=sqlite:///app.db \
  my-flask-app
```

**docker-compose.yml (for local development):**
```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=dev-secret
      - FLASK_ENV=development
    volumes:
      - .:/app
```

#### Practice

Write a Dockerfile for your task manager app. Build and run it locally.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Production Checklist

Go through your app and make it production-ready:
- [ ] `SECRET_KEY` from environment variable
- [ ] `DEBUG=False` in production
- [ ] Database URL from environment variable
- [ ] All secrets in `.env` (not committed)
- [ ] `.gitignore` includes `.env`, `*.db`, `__pycache__`
- [ ] Error pages for 404 and 500
- [ ] Logging configured

#### Exercise 2: Deploy to Render.com (Free Tier)

1. Push your app to GitHub
2. Create account at render.com
3. Create a new Web Service connected to your repo
4. Set environment variables in Render dashboard
5. Deploy and test your live URL

---

## Key Takeaways

- Flask's `debug=True` server is for development only — never production
- Gunicorn is the standard WSGI server: `gunicorn "app:create_app()"`
- Store ALL secrets in environment variables, never in code
- Use `create_app()` factory pattern for testable, configurable Flask apps
- Docker packages your app + dependencies for consistent deployments

---

[← Previous](./lesson-08-static-files-css.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)

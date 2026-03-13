# Lesson 9: logging Module

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Use Python's `logging` module instead of print statements
- Configure log levels, formatters, and handlers
- Write logs to files and console simultaneously
- Structure logging for libraries vs applications

---

## Lesson Outline

### Part 1: Logging Basics (30 minutes)

#### Explanation

```python
import logging

# Basic setup:
logging.basicConfig(level=logging.DEBUG)

# Log at different levels:
logging.debug("Detailed debugging info")      # For developers
logging.info("Normal operation: user logged in")  # General info
logging.warning("Disk space low: 10% remaining")  # Potential problem
logging.error("Failed to connect to database")    # Serious problem
logging.critical("System is shutting down!")      # Program cannot continue

# Output:
# WARNING:root:Disk space low: 10% remaining
# ERROR:root:Failed to connect to database
# CRITICAL:root:System is shutting down!
# (DEBUG and INFO hidden by default level)

# Log with extra data:
user_id = 123
logging.info("User action", extra={"user_id": user_id})

# Log exceptions:
try:
    result = 1 / 0
except ZeroDivisionError:
    logging.exception("Calculation failed")   # Logs error + full traceback
```

**Log levels (lowest to highest):**
```
DEBUG    10 - Detailed diagnostic info
INFO     20 - Confirmation things work as expected
WARNING  30 - Something unexpected, but still working
ERROR    40 - Serious problem, function failed
CRITICAL 50 - Severe error, program may abort
```

#### Practice

Add logging to your `JournalStorage` class from Course 7. Log every operation at appropriate levels.

---

### Part 2: Handlers and Formatters (30 minutes)

#### Explanation

```python
import logging

# Create logger (use module name as convention):
logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)

# Create formatter:
formatter = logging.Formatter(
    fmt="%(asctime)s | %(name)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Console handler (WARNING and above):
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.WARNING)
console_handler.setFormatter(formatter)

# File handler (all levels):
file_handler = logging.FileHandler("app.log", encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

# Attach handlers to logger:
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# Now use it:
logger.debug("Processing 1000 records")     # File only
logger.info("Task started")                  # File only
logger.warning("Cache is 90% full")          # Console + File
logger.error("API call failed", exc_info=True)  # Console + File + traceback
```

**Format string codes:**
```
%(asctime)s    - Timestamp
%(name)s       - Logger name
%(levelname)s  - Level name (DEBUG, INFO, etc.)
%(message)s    - The log message
%(filename)s   - Source filename
%(lineno)d     - Line number
```

#### Practice

Configure a logger with two handlers: console (INFO+) and rotating file (DEBUG+).

---

### Part 3: Logger Hierarchy and Configuration (30 minutes)

#### Explanation

```python
import logging

# Logger hierarchy: root → app → app.module → app.module.submodule
# Child loggers inherit parent's handlers if propagate=True (default)

# Application logger:
app_logger = logging.getLogger("myapp")

# Module logger (inherits from myapp):
db_logger = logging.getLogger("myapp.database")
api_logger = logging.getLogger("myapp.api")

# In database.py, you'd write:
logger = logging.getLogger(__name__)   # "myapp.database" if in that module
logger.debug("Query executed in 0.05s")


# Configuration via dict (clean, centralizable):
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "standard",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "app.log",
            "maxBytes": 10_000_000,  # 10 MB
            "backupCount": 5,
            "level": "DEBUG",
            "formatter": "standard",
        },
    },
    "root": {
        "level": "DEBUG",
        "handlers": ["console", "file"],
    },
}

import logging.config
logging.config.dictConfig(LOGGING_CONFIG)
```

#### Practice

Set up logging for a multi-module application with separate log files for errors and general logs.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Logging Decorator

```python
import logging
import functools
import time

def log_calls(logger=None, level=logging.DEBUG):
    """Decorator that logs function calls, arguments, return value, and duration."""
    def decorator(func):
        _logger = logger or logging.getLogger(func.__module__)

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Log the call with args
            # Time the execution
            # Log return value or exception
            # Return result or re-raise exception
            ...

        return wrapper
    return decorator


@log_calls()
def fetch_data(url: str, timeout: int = 30):
    import requests
    return requests.get(url, timeout=timeout).json()
```

Complete the decorator and apply it to 3 functions.

#### Exercise 2: App Logger Setup

Create a `setup_logging(app_name, log_dir, level)` function that:
- Creates log directory if needed
- Console handler: colored output (use `colorlog` library), WARNING+
- File handler: rotating, DEBUG+, max 10MB, keep 5 backups
- Returns configured logger

---

## Key Takeaways

- Use `logging.getLogger(__name__)` in every module (not the root logger)
- Set level on logger; set level on handlers for fine-grained control
- Handlers determine WHERE logs go; Formatters determine HOW they look
- Use `logging.exception()` inside `except` blocks to capture tracebacks
- Never use `print()` in production code — use `logging`

---

[← Previous](./lesson-08-argparse-cli-tools.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)

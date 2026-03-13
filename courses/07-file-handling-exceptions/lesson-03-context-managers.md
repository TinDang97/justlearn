# Lesson 3: Context Managers

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand `with` statement mechanics
- Create custom context managers using `__enter__`/`__exit__`
- Use `contextlib.contextmanager` decorator
- Apply context managers for resource management

---

## Lesson Outline

### Part 1: The with Statement (30 minutes)

#### Explanation

```python
# Without context manager (error-prone):
f = open("data.txt")
try:
    content = f.read()
finally:
    f.close()   # Must always close, even on error

# With context manager (cleaner):
with open("data.txt") as f:
    content = f.read()
# Automatically closed, even if read() raises an error

# Multiple context managers:
with open("input.txt") as infile, open("output.txt", "w") as outfile:
    for line in infile:
        outfile.write(line.upper())

# How it works:
# 1. Python calls file.__enter__() → returns file object
# 2. Code in 'with' block runs
# 3. Python calls file.__exit__() → closes file
# This happens even if an exception is raised!
```

#### Practice

Write a function `copy_file(src, dst)` using context managers for both files.

---

### Part 2: Custom Context Managers (30 minutes)

#### Explanation

```python
class Timer:
    """Context manager that measures execution time."""
    import time

    def __init__(self, name: str = ""):
        self.name = name
        self.elapsed = 0.0

    def __enter__(self):
        import time
        self._start = time.time()
        return self   # Available as 'as' clause

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.elapsed = time.time() - self._start
        label = f"[{self.name}] " if self.name else ""
        print(f"{label}Elapsed: {self.elapsed:.3f}s")
        return False   # Don't suppress exceptions


# Usage:
with Timer("Sort operation") as t:
    data = sorted(range(100000))
print(f"Took {t.elapsed:.3f} seconds")


class TempDirectory:
    """Creates a temp directory and cleans up after use."""
    import tempfile, shutil
    from pathlib import Path

    def __enter__(self):
        import tempfile
        from pathlib import Path
        self.path = Path(tempfile.mkdtemp())
        return self.path

    def __exit__(self, *args):
        import shutil
        shutil.rmtree(self.path)
        return False


with TempDirectory() as tmpdir:
    (tmpdir / "test.txt").write_text("hello")
    print(list(tmpdir.iterdir()))
# tmpdir is cleaned up automatically
```

#### Practice

Create a `DatabaseTransaction` context manager (simulated) that "commits" on success and "rolls back" on exception.

---

### Part 3: contextlib (30 minutes)

#### Explanation

```python
from contextlib import contextmanager, suppress

# @contextmanager decorator (simpler than __enter__/__exit__):
@contextmanager
def managed_file(path, mode="r"):
    f = open(path, mode, encoding="utf-8")
    try:
        yield f      # Code in 'with' block runs here
    finally:
        f.close()

with managed_file("data.txt") as f:
    content = f.read()


# suppress - ignore specific exceptions:
from contextlib import suppress

with suppress(FileNotFoundError):
    import os
    os.remove("nonexistent.txt")
# No error - FileNotFoundError is suppressed


# redirect_stdout - capture print output:
from contextlib import redirect_stdout
from io import StringIO

output = StringIO()
with redirect_stdout(output):
    print("This goes to output, not screen")
    print("And this too")

captured = output.getvalue()
print(f"Captured: {captured!r}")
```

#### Practice

Use `@contextmanager` to create a `log_calls(name)` context manager that prints "Starting X" and "Done X" around a block.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Connection Pool

```python
class ConnectionPool:
    def __init__(self, max_connections=5):
        self._available = list(range(max_connections))
        self._in_use = set()

    def acquire(self):
        """Context manager that checks out a connection."""
        @contextmanager
        def _acquire():
            conn_id = self._available.pop()
            self._in_use.add(conn_id)
            try:
                yield conn_id
            finally:
                self._in_use.discard(conn_id)
                self._available.append(conn_id)
        return _acquire()
```

Complete this and test it with multiple concurrent "connections".

#### Exercise 2: Progress File Writer

Create a context manager that:
- Opens a file for writing
- Tracks how many bytes were written
- On exit, prints a summary: "Wrote N bytes to filename"
- On exception, deletes the incomplete file

---

## Key Takeaways

- `with` ensures cleanup code runs even if exceptions occur
- `__enter__` sets up the resource; `__exit__` tears it down
- `@contextmanager` is simpler for one-off context managers
- `contextlib.suppress` cleanly ignores specific exceptions
- Return `False` (or `None`) from `__exit__` to not suppress exceptions

---

[← Previous](./lesson-02-writing-text-files.md) | [Back to Course](./README.md) | [Next →](./lesson-04-exception-basics.md)

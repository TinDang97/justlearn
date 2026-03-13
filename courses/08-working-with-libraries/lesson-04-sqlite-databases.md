# Lesson 4: SQLite & Databases

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Create and query SQLite databases with Python's `sqlite3`
- Execute CRUD operations safely
- Use parameterized queries to prevent SQL injection
- Design a simple database schema

---

## Lesson Outline

### Part 1: SQLite Basics (30 minutes)

#### Explanation

```python
import sqlite3

# Connect (creates DB file if not exists):
conn = sqlite3.connect("myapp.db")
cursor = conn.cursor()

# Create table:
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT NOT NULL,
        email   TEXT UNIQUE NOT NULL,
        age     INTEGER,
        created TEXT DEFAULT CURRENT_TIMESTAMP
    )
""")
conn.commit()   # Save changes

# Insert row (ALWAYS use parameterized queries!):
cursor.execute(
    "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
    ("Alice", "alice@example.com", 25)
)
conn.commit()

# Select rows:
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()   # List of tuples
for row in rows:
    print(row)

# Row as dict using row_factory:
conn.row_factory = sqlite3.Row   # Enable dict-like access
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE name = ?", ("Alice",))
user = cursor.fetchone()
print(user["name"], user["email"])   # dict-style access

conn.close()
```

#### Practice

Create a `contacts` table and insert 5 contacts. Query all contacts sorted by name.

---

### Part 2: CRUD Operations (30 minutes)

#### Explanation

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db(db_path: str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")  # Enable FK constraints
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# CRUD using context manager:
def create_user(db_path: str, name: str, email: str) -> int:
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (name, email)
        )
        return cursor.lastrowid   # ID of new row


def get_user(db_path: str, user_id: int) -> dict | None:
    with get_db(db_path) as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        return dict(row) if row else None


def update_user(db_path: str, user_id: int, **fields) -> bool:
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [user_id]
    with get_db(db_path) as conn:
        cursor = conn.execute(
            f"UPDATE users SET {set_clause} WHERE id = ?", values
        )
        return cursor.rowcount > 0


def delete_user(db_path: str, user_id: int) -> bool:
    with get_db(db_path) as conn:
        cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return cursor.rowcount > 0


def search_users(db_path: str, query: str) -> list[dict]:
    with get_db(db_path) as conn:
        rows = conn.execute(
            "SELECT * FROM users WHERE name LIKE ? OR email LIKE ?",
            (f"%{query}%", f"%{query}%")
        ).fetchall()
        return [dict(row) for row in rows]
```

#### Practice

Build a `TaskManager` backed by SQLite with full CRUD: create task, mark complete, list by status, delete.

---

### Part 3: Schemas and Relationships (30 minutes)

#### Explanation

```python
# Multiple related tables:
SCHEMA = """
CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    price       REAL NOT NULL CHECK(price > 0),
    category_id INTEGER REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
"""

# JOIN query:
query = """
    SELECT p.name, p.price, c.name as category
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.price < ?
    ORDER BY p.price
"""

with get_db("shop.db") as conn:
    conn.executescript(SCHEMA)
    rows = conn.execute(query, (100.0,)).fetchall()
```

#### Practice

Design a schema for a blog: `users`, `posts`, `comments`. Write queries to get all posts with comment counts.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Student Database

Build a complete `StudentDB` class:
- `add_student(name, email, major)` → id
- `add_grade(student_id, subject, score)`
- `get_student_gpa(student_id)` → float
- `get_honor_roll(min_gpa=3.7)` → list of students
- `get_subject_averages()` → dict of subject → avg score

#### Exercise 2: Inventory System

Create an `Inventory` SQLite database with:
- Products table (id, name, sku, price, quantity)
- Transactions table (id, product_id, type, quantity, timestamp)
- Methods: `add_stock(sku, qty)`, `sell(sku, qty)`, `get_low_stock(threshold)`, `get_transaction_history(sku)`

---

## Key Takeaways

- ALWAYS use parameterized queries (`?` placeholders) — never f-strings in SQL
- `conn.row_factory = sqlite3.Row` enables dict-style access to rows
- Wrap operations in transactions; use `commit()` or `rollback()`
- `CREATE TABLE IF NOT EXISTS` prevents errors on repeated runs
- `PRAGMA foreign_keys = ON` enables foreign key constraints in SQLite

---

[← Previous](./lesson-03-requests-http.md) | [Back to Course](./README.md) | [Next →](./lesson-05-date-time.md)

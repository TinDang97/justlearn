# Lesson 6: Performance & Optimization

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Profile Python code to find bottlenecks
- Apply caching to speed up expensive operations
- Use async/await for I/O-bound code
- Understand N+1 query problem and solutions

---

## Lesson Outline

### Part 1: Profiling (30 minutes)

#### Explanation

```python
# Rule: Profile first, then optimize.
# "Premature optimization is the root of all evil" — Knuth

# cProfile - find slow functions:
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code to profile:
result = slow_function(data)

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats("cumulative")   # Sort by total time
stats.print_stats(20)            # Show top 20

# OR use line_profiler for line-by-line:
# pip install line_profiler
# @profile decorator, then run: kernprof -l -v script.py

# Quick timing with timeit:
import timeit

# Compare two approaches:
time_list = timeit.timeit(
    "[x**2 for x in range(1000)]",
    number=10000
)
time_generator = timeit.timeit(
    "list(x**2 for x in range(1000))",
    number=10000
)
print(f"List comprehension: {time_list:.3f}s")
print(f"Generator: {time_generator:.3f}s")

# Memory profiling:
# pip install memory-profiler
# @memory_profiler.profile decorator
```

#### Practice

Profile your CSV processing function. Find the 3 slowest lines and optimize them.

---

### Part 2: Caching (30 minutes)

#### Explanation

```python
from functools import lru_cache
import time

# LRU Cache for expensive pure functions:
@lru_cache(maxsize=128)   # Cache last 128 unique argument combinations
def fetch_user_from_db(user_id: int) -> dict:
    # Expensive DB query
    time.sleep(0.1)   # Simulate slow query
    return {"id": user_id, "name": "Alice"}

# Second call: instant (from cache)
fetch_user_from_db(1)   # Slow
fetch_user_from_db(1)   # Instant - cached!
print(fetch_user_from_db.cache_info())

# Clear cache when data might have changed:
fetch_user_from_db.cache_clear()

# File-level cache with diskcache:
# pip install diskcache
import diskcache
cache = diskcache.Cache("cache_dir")

@cache.memoize(expire=3600)   # Cache for 1 hour
def get_exchange_rate(currency: str) -> float:
    # Expensive API call
    response = requests.get(f"https://api.exchangerates.io/{currency}")
    return response.json()["rate"]

# Flask-Caching for web responses:
from flask_caching import Cache

cache = Cache(app, config={"CACHE_TYPE": "SimpleCache"})

@app.route("/api/products")
@cache.cached(timeout=300)   # Cache for 5 minutes
def list_products():
    return jsonify(Product.query.all())
```

#### Practice

Add caching to your Flask API's most-expensive endpoints. Measure the speedup with `timeit`.

---

### Part 3: Async Programming (30 minutes)

#### Explanation

```python
import asyncio
import aiohttp   # pip install aiohttp
import time

# Sequential (slow):
def fetch_all_sequential(urls: list[str]) -> list[str]:
    results = []
    for url in urls:
        response = requests.get(url, timeout=10)
        results.append(response.text)
    return results  # Takes: len(urls) × avg_request_time

# Async (fast - all requests in parallel):
async def fetch_url(session: aiohttp.ClientSession, url: str) -> str:
    async with session.get(url) as response:
        return await response.text()

async def fetch_all_async(urls: list[str]) -> list[str]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        return await asyncio.gather(*tasks)   # All run concurrently!

# Run:
urls = ["https://httpbin.org/delay/1"] * 5

start = time.time()
asyncio.run(fetch_all_async(urls))
print(f"Async: {time.time() - start:.1f}s")  # ~1 second!
# Sequential would take 5 seconds

# FastAPI - async web framework:
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await db.fetch_user(user_id)   # Non-blocking DB query
    return user
```

**When to use async:**
- Many I/O operations (HTTP requests, database queries, file reads)
- Web servers handling many concurrent connections
- NOT for CPU-bound work (use multiprocessing instead)

#### Practice

Convert your price tracker (fetches multiple URLs) from sequential to async using `aiohttp`. Measure the speedup.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Database Query Optimization

Find and fix N+1 query problems:
```python
# N+1 problem:
tasks = Task.query.all()
for task in tasks:
    user = User.query.get(task.user_id)  # 1 query per task!
    print(f"{user.name}: {task.title}")

# Fixed with join:
tasks = Task.query.join(User).options(
    db.contains_eager(Task.user)
).all()
```

Profile before and after. Report the query count reduction.

#### Exercise 2: Benchmark Comparison

Compare performance of 3 approaches to the same task (e.g., process 100,000 records):
1. Plain Python loops
2. Pandas vectorized operations
3. NumPy operations

Use `timeit` and `cProfile`. Write up findings.

---

## Key Takeaways

- Always profile before optimizing — find the actual bottleneck
- `@lru_cache` for pure functions; `@cache.cached()` for web routes
- Async I/O (`asyncio`) enables 10-100x speedup for network-heavy code
- N+1 queries: load related data in one query with `JOIN` or `selectinload`
- Pandas/NumPy vectorized operations are 10-100x faster than Python loops

---

[← Previous](./lesson-05-security-best-practices.md) | [Back to Course](./README.md) | [Next →](./lesson-07-capstone-blog-platform.md)

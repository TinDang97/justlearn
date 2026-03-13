# Lesson 3: requests: HTTP

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Make GET and POST requests
- Handle JSON API responses
- Manage authentication and headers
- Handle errors and timeouts

---

## Lesson Outline

### Part 1: GET Requests (30 minutes)

#### Explanation

```python
import requests

# Simple GET request:
response = requests.get("https://httpbin.org/get")
print(response.status_code)    # 200
print(response.headers)        # Response headers dict
print(response.text)           # Response as text string
print(response.json())         # Parse JSON response

# GET with query parameters:
params = {"q": "python tutorial", "limit": 5}
response = requests.get("https://api.example.com/search", params=params)
print(response.url)  # https://api.example.com/search?q=python+tutorial&limit=5

# Status code checks:
if response.ok:            # True if 200-299
    data = response.json()
elif response.status_code == 404:
    print("Not found")
else:
    print(f"Error: {response.status_code}")

# Raise exception on bad status:
response.raise_for_status()  # Raises HTTPError if 4xx or 5xx
```

#### Practice

Fetch a list of public repositories for a GitHub username using the GitHub API. Print name and star count for each.

---

### Part 2: POST Requests and Authentication (30 minutes)

#### Explanation

```python
import requests

# POST with JSON body:
payload = {"username": "alice", "message": "Hello!"}
response = requests.post(
    "https://httpbin.org/post",
    json=payload,          # Auto-sets Content-Type: application/json
    headers={"Accept": "application/json"}
)

# POST with form data:
response = requests.post(
    "https://httpbin.org/post",
    data={"field1": "value1", "field2": "value2"}  # Form-encoded
)

# Authentication:
# Basic auth:
response = requests.get(
    "https://api.example.com/user",
    auth=("username", "password")
)

# API key in header:
response = requests.get(
    "https://api.example.com/data",
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

# API key as parameter:
response = requests.get(
    "https://api.openweathermap.org/data/2.5/weather",
    params={"q": "London", "appid": "YOUR_KEY"}
)
```

#### Practice

Create a `WeatherClient` class that fetches weather data from a free API (OpenWeatherMap or wttr.in) and formats the output.

---

### Part 3: Sessions and Error Handling (30 minutes)

#### Explanation

```python
import requests
from requests.exceptions import (
    ConnectionError, Timeout, HTTPError, RequestException
)

# Session reuses connection (faster for multiple requests):
session = requests.Session()
session.headers.update({"Authorization": "Bearer TOKEN"})

# All requests in session use these headers:
response1 = session.get("https://api.example.com/users")
response2 = session.get("https://api.example.com/posts")

# Timeout (always set this!):
try:
    response = requests.get("https://api.example.com/data", timeout=10)
    response.raise_for_status()
    return response.json()
except Timeout:
    print("Request timed out")
except ConnectionError:
    print("Could not connect")
except HTTPError as e:
    print(f"HTTP error: {e.response.status_code}")
except RequestException as e:
    print(f"Request failed: {e}")


# Retry logic:
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503])
adapter = HTTPAdapter(max_retries=retry)
session.mount("https://", adapter)
```

#### Practice

Build a function `fetch_with_retry(url, max_retries=3, timeout=10)` that handles all common errors and retries on network failures.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: GitHub Profile Fetcher

```python
def get_github_profile(username: str) -> dict:
    """Fetch GitHub user profile and repos."""
    base = "https://api.github.com"

    user = requests.get(f"{base}/users/{username}").json()
    repos = requests.get(
        f"{base}/users/{username}/repos",
        params={"sort": "stars", "per_page": 5}
    ).json()

    return {
        "name": user.get("name"),
        "bio": user.get("bio"),
        "followers": user.get("followers"),
        "top_repos": [{"name": r["name"], "stars": r["stargazers_count"]}
                      for r in repos]
    }
```

Extend this to handle rate limiting, pagination, and authentication.

#### Exercise 2: REST API Client

Build a `JSONPlaceholderClient` for the free API at `jsonplaceholder.typicode.com`:
- `get_posts(limit=10)` → list of posts
- `get_post(post_id)` → single post
- `create_post(title, body, user_id)` → POST request
- `update_post(post_id, **fields)` → PATCH request
- `delete_post(post_id)` → DELETE request

---

## Key Takeaways

- `requests.get(url, params=dict)` builds query strings automatically
- `requests.post(url, json=dict)` sends JSON body with correct Content-Type
- Always set `timeout=N` on requests — never let them hang forever
- `response.raise_for_status()` converts bad status codes to exceptions
- Use `Session` for multiple requests to the same host

---

[← Previous](./lesson-02-reading-documentation.md) | [Back to Course](./README.md) | [Next →](./lesson-04-sqlite-databases.md)

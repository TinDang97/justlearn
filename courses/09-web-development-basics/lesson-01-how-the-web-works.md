# Lesson 1: How the Web Works

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand the client-server model
- Know HTTP methods and status codes
- Understand URLs, headers, and request/response cycles
- See how Python fits into web development

---

## Lesson Outline

### Part 1: Client-Server Model (30 minutes)

#### Explanation

**The Web in one sentence:** A browser (client) sends an HTTP request to a server; the server runs code and returns an HTTP response.

```
Browser → HTTP Request → [Your Python Server]
Browser ← HTTP Response ← [Your Python Server]
```

**Anatomy of a URL:**
```
https://api.example.com:443/users/123?format=json#section
  │         │              │     │         │          │
scheme    hostname       port  path     query      fragment
```

**HTTP Methods (verbs):**
```
GET    - Retrieve data (safe, idempotent)
POST   - Create new resource
PUT    - Replace entire resource
PATCH  - Update part of resource
DELETE - Delete resource
HEAD   - Like GET but no body (check if resource exists)
```

**HTTP Status Codes:**
```
2xx Success:  200 OK, 201 Created, 204 No Content
3xx Redirect: 301 Moved Permanently, 302 Found
4xx Client Error: 400 Bad Request, 401 Unauthorized,
                  403 Forbidden, 404 Not Found, 422 Unprocessable
5xx Server Error: 500 Internal Server Error, 503 Service Unavailable
```

#### Practice

Using `requests` from Course 8, make GET requests to `httpbin.org` and inspect the response headers, status code, and body.

---

### Part 2: HTTP Headers and Bodies (30 minutes)

#### Explanation

```python
import requests

# Inspect a real HTTP request:
response = requests.get("https://httpbin.org/get",
                        headers={"Accept": "application/json"})

# Response headers tell you about the response:
print(response.headers["Content-Type"])    # application/json
print(response.headers["Content-Length"])  # size in bytes
print(response.headers.get("X-RateLimit-Limit"))  # API rate limit

# Request body (for POST):
payload = {"name": "Alice", "role": "student"}
response = requests.post("https://httpbin.org/post", json=payload)

# What the server received:
data = response.json()
print(data["json"])      # Our payload
print(data["headers"])   # Headers we sent

# Cookies:
session = requests.Session()
session.get("https://httpbin.org/cookies/set/session_id/abc123")
response = session.get("https://httpbin.org/cookies")
print(response.json())   # {"cookies": {"session_id": "abc123"}}
```

#### Practice

Make a POST request with form data vs JSON body. Compare how the server receives each.

---

### Part 3: How Python Serves the Web (30 minutes)

#### Explanation

Python web frameworks handle the plumbing:
1. Listen on a port (e.g., port 5000)
2. Accept incoming HTTP connections
3. Parse the request (method, path, headers, body)
4. Route to the right function based on URL path
5. Run your Python code
6. Build an HTTP response (status, headers, body)
7. Send response back to browser

```
HTTP Request: "GET /users/123 HTTP/1.1\r\nHost: ..."
                         ↓
Flask router: matches route "/users/<int:id>"
                         ↓
Your function: get_user(id=123) → {"name": "Alice"}
                         ↓
HTTP Response: "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{...}"
```

**Common Python web frameworks:**
- **Flask**: minimal, explicit, great for learning (we'll use this)
- **Django**: batteries-included, opinionated
- **FastAPI**: modern, async, automatic docs

```python
# A complete minimal web server in pure Python (for understanding only):
from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(b"<h1>Hello, Web!</h1>")

server = HTTPServer(("localhost", 8000), Handler)
server.serve_forever()
```

#### Practice

Run the minimal HTTP server above and visit `http://localhost:8000` in your browser. Observe the request in the terminal.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: HTTP Inspector

Using `requests`, build an `HTTPInspector` that:
- Makes a request to any URL
- Prints: status code, response time, content type, size
- Follows redirects and shows the redirect chain
- Detects if the response is HTML, JSON, or other

#### Exercise 2: Status Code Explorer

Write a function that fetches `https://httpbin.org/status/{code}` for each code in `[200, 201, 301, 400, 401, 403, 404, 500]` and displays a table of code → description → what it means in practice.

---

## Key Takeaways

- HTTP is a request-response protocol: client sends request, server returns response
- HTTP methods express intent: GET (read), POST (create), PUT/PATCH (update), DELETE
- Status codes: 2xx=success, 3xx=redirect, 4xx=client error, 5xx=server error
- Headers carry metadata about the request/response
- Python web frameworks abstract HTTP parsing and response building

---

[Back to Course](./README.md) | [Next →](./lesson-02-flask-introduction.md)

# Lesson 8: Static Files & CSS

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Serve static files (CSS, JS, images) with Flask
- Use Bootstrap for rapid styling
- Organize static assets
- Understand caching and versioning

---

## Lesson Outline

### Part 1: Serving Static Files (30 minutes)

#### Explanation

**Project structure:**
```
app/
├── app.py
├── templates/
└── static/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── images/
        └── logo.png
```

**In templates:**
```html
<!-- url_for generates the correct URL for static files: -->
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
<script src="{{ url_for('static', filename='js/app.js') }}"></script>
<img src="{{ url_for('static', filename='images/logo.png') }}" alt="Logo">
```

**Why `url_for`?** It generates correct URLs even if your app runs at a sub-path (like `/myapp/`) and handles cache-busting.

```python
# Serve from custom directory:
from flask import Flask, send_from_directory

@app.route("/files/<filename>")
def serve_file(filename):
    return send_from_directory("user_uploads", filename)
```

**Basic CSS (static/css/style.css):**
```css
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
}

.alert { padding: 0.75rem; border-radius: 4px; margin: 1rem 0; }
.alert-success { background: #d4edda; color: #155724; }
.alert-error { background: #f8d7da; color: #721c24; }
```

#### Practice

Create a CSS stylesheet and apply it to your Flask app's base template.

---

### Part 2: Bootstrap Integration (30 minutes)

#### Explanation

**Via CDN (simplest, no files to download):**
```html
<!-- In base.html <head>: -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet">

<!-- Before </body>: -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

**Bootstrap classes for common UI:**
```html
<!-- Navigation: -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand" href="/">My App</a>
        <div class="navbar-nav ms-auto">
            <a class="nav-link" href="/login">Login</a>
        </div>
    </div>
</nav>

<!-- Card: -->
<div class="card shadow-sm mb-3">
    <div class="card-body">
        <h5 class="card-title">Task Title</h5>
        <p class="card-text">Task description goes here.</p>
        <a href="#" class="btn btn-primary btn-sm">View</a>
        <button class="btn btn-danger btn-sm">Delete</button>
    </div>
</div>

<!-- Form: -->
<form method="POST">
    <div class="mb-3">
        <label for="title" class="form-label">Title</label>
        <input type="text" class="form-control" id="title" name="title">
        <div class="invalid-feedback">Title is required.</div>
    </div>
    <button type="submit" class="btn btn-primary">Save</button>
</form>

<!-- Alert: -->
<div class="alert alert-success alert-dismissible fade show">
    Task created successfully!
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>

<!-- Grid: -->
<div class="row row-cols-1 row-cols-md-3 g-4">
    {% for task in tasks %}
    <div class="col">
        <div class="card h-100">...</div>
    </div>
    {% endfor %}
</div>
```

#### Practice

Restyle your task list page using Bootstrap cards, with a responsive grid layout.

---

### Part 3: JavaScript Basics for Flask (30 minutes)

#### Explanation

```html
<!-- static/js/app.js -->
```

```javascript
// AJAX: fetch data without page reload
async function fetchTasks() {
    const response = await fetch('/api/v1/tasks');
    const data = await response.json();

    const list = document.getElementById('task-list');
    list.innerHTML = data.items.map(task => `
        <li class="list-group-item d-flex justify-content-between">
            ${task.title}
            <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-danger">
                Delete
            </button>
        </li>
    `).join('');
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;

    await fetch(`/api/v1/tasks/${id}`, {method: 'DELETE'});
    fetchTasks();  // Refresh list
}

// Load on page load:
document.addEventListener('DOMContentLoaded', fetchTasks);
```

```html
<!-- In template: -->
<ul id="task-list" class="list-group"></ul>
<script src="{{ url_for('static', filename='js/app.js') }}"></script>
```

#### Practice

Add a "mark complete" button that sends a PATCH request to update task status without reloading the page.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Styled Task Manager

Fully style the task manager with Bootstrap:
- Navbar with app name and login/logout
- Dashboard with task stats in cards (total, pending, done)
- Task list with status badges, due date, priority color coding
- Create/edit form with proper Bootstrap form styling
- Flash messages as dismissible Bootstrap alerts

#### Exercise 2: Dark Mode Toggle

Add a dark/light mode toggle:
- Store preference in localStorage
- Toggle Bootstrap's `data-bs-theme="dark"` attribute
- Remember preference across page loads
- Show sun/moon icon button in navbar

---

## Key Takeaways

- Static files live in `static/` and are served at `/static/filename`
- Always use `url_for('static', filename='...')` to reference static files
- Bootstrap CDN is the fastest way to add professional styling
- Separate CSS, JS, and images into subdirectories of `static/`
- Fetch API allows updating page content without full reload (AJAX)

---

[← Previous](./lesson-07-user-authentication.md) | [Back to Course](./README.md) | [Next →](./lesson-09-deployment-basics.md)

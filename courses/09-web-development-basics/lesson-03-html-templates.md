# Lesson 3: HTML Templates

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Render HTML templates with Jinja2
- Pass variables to templates
- Use template control structures (if, for)
- Build reusable templates with inheritance

---

## Lesson Outline

### Part 1: Jinja2 Basics (30 minutes)

#### Explanation

Flask uses Jinja2 as its template engine. Templates live in a `templates/` directory.

**Project structure:**
```
app/
├── app.py
└── templates/
    ├── base.html
    ├── index.html
    └── users/
        ├── list.html
        └── detail.html
```

**templates/index.html:**
```html
<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>
    <h1>Hello, {{ name }}!</h1>

    {# This is a comment #}

    <!-- If/else: -->
    {% if user %}
        <p>Welcome back, {{ user.name }}!</p>
    {% else %}
        <p>Please log in.</p>
    {% endif %}

    <!-- For loop: -->
    <ul>
    {% for item in items %}
        <li>{{ loop.index }}. {{ item }}</li>
    {% endfor %}
    </ul>
</body>
</html>
```

**app.py:**
```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html",
        title="My App",
        name="Alice",
        items=["Python", "Flask", "Jinja2"]
    )
```

**Jinja2 syntax:**
- `{{ variable }}` — output a variable
- `{% block %}` — control structures
- `{# comment #}` — comments
- `{{ variable | filter }}` — apply filter

#### Practice

Create a template that displays a list of students with their names and GPAs, highlighting students with GPA >= 3.7.

---

### Part 2: Template Filters and Expressions (30 minutes)

#### Explanation

```html
<!-- Built-in filters: -->
{{ name | upper }}           <!-- ALICE -->
{{ name | lower }}           <!-- alice -->
{{ name | title }}           <!-- Alice Smith -->
{{ price | round(2) }}       <!-- 19.99 -->
{{ text | truncate(50) }}    <!-- First 50 chars... -->
{{ items | length }}         <!-- Count of items -->
{{ html_text | safe }}       <!-- Render HTML (be careful!) -->
{{ value | default("N/A") }} <!-- Show N/A if None -->
{{ date | strftime('%Y-%m-%d') }} <!-- Format date (custom filter) -->

<!-- Expressions: -->
{% if items | length > 0 %}
{% for student in students | sort(attribute='gpa', reverse=true) %}
{% if student.gpa >= 3.7 %}

<!-- Custom filter in Python: -->
@app.template_filter('currency')
def currency_filter(value):
    return f"${value:,.2f}"
```

```html
<!-- In template: -->
{{ price | currency }}  <!-- $1,234.56 -->
```

#### Practice

Create a product listing page that shows products sorted by price with formatted prices and stock status badges.

---

### Part 3: Template Inheritance (30 minutes)

#### Explanation

**templates/base.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}My App{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <nav>
        <a href="{{ url_for('index') }}">Home</a>
        <a href="{{ url_for('about') }}">About</a>
    </nav>

    <main>
        {% with messages = get_flashed_messages(with_categories=true) %}
        {% for category, message in messages %}
            <div class="alert alert-{{ category }}">{{ message }}</div>
        {% endfor %}
        {% endwith %}

        {% block content %}{% endblock %}
    </main>

    <footer>
        <p>© 2024 My App</p>
    </footer>
</body>
</html>
```

**templates/index.html:**
```html
{% extends "base.html" %}

{% block title %}Home - My App{% endblock %}

{% block content %}
    <h1>Welcome!</h1>
    <p>This content replaces the block.</p>

    {% include "partials/user_card.html" %}   <!-- Include sub-template -->
{% endblock %}
```

**templates/partials/user_card.html:**
```html
<div class="user-card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
</div>
```

#### Practice

Create a base template with navigation and a footer, then create Home, About, and Contact pages that extend it.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Student Directory

Build a multi-page Flask app:
- `/students` → list all students (name, GPA, major)
- `/students/<id>` → student detail page with courses and grades
- `/students/top` → honor roll (GPA >= 3.7)
- All pages extend a base template with navigation

#### Exercise 2: Blog Interface

Create a read-only blog interface:
- `/` → list of posts (title, author, date, excerpt)
- `/posts/<slug>` → full post view
- `/authors/<name>` → author page with their posts
- Add pagination: show 5 posts per page

---

## Key Takeaways

- `render_template("file.html", **context)` renders a Jinja2 template
- `{{ variable }}` outputs; `{% statement %}` is control flow
- `{{ value | filter }}` transforms values (upper, round, length, etc.)
- Template inheritance with `{% extends %}` and `{% block %}` eliminates duplication
- `{% include %}` for reusable template fragments

---

[← Previous](./lesson-02-flask-introduction.md) | [Back to Course](./README.md) | [Next →](./lesson-04-forms-user-input.md)

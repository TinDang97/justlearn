# Lesson 4: Forms and User Input

**Course:** Web Development Basics | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Create HTML forms and handle POST requests
- Validate form data server-side
- Use Flask's flash messages for feedback
- Redirect after POST (PRG pattern)

---

## Lesson Outline

### Part 1: HTML Forms and POST (30 minutes)

#### Explanation

```html
<!-- templates/create_user.html -->
<form method="POST" action="/users">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="1" max="120">

    <button type="submit">Create User</button>
</form>
```

```python
from flask import Flask, request, redirect, url_for, flash, render_template

app = Flask(__name__)
app.secret_key = "dev-secret-key"  # Required for sessions/flash

@app.route("/users/new", methods=["GET"])
def new_user():
    return render_template("create_user.html")

@app.route("/users", methods=["POST"])
def create_user():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    age = request.form.get("age", type=int)

    # Validate:
    errors = []
    if not name:
        errors.append("Name is required")
    if not email or "@" not in email:
        errors.append("Valid email is required")

    if errors:
        for error in errors:
            flash(error, "error")
        return render_template("create_user.html"), 422

    # Save user...
    flash("User created successfully!", "success")
    return redirect(url_for("list_users"))   # PRG pattern
```

**POST-Redirect-GET (PRG) pattern:** After a successful POST, redirect to a GET request. This prevents form resubmission on page refresh.

#### Practice

Build a contact form with name, email, subject, message. Validate all fields and show appropriate error/success messages.

---

### Part 2: File Uploads (30 minutes)

#### Explanation

```python
import os
from pathlib import Path
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "pdf"}

def allowed_file(filename: str) -> bool:
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        if "file" not in request.files:
            flash("No file selected")
            return redirect(request.url)

        file = request.files["file"]
        if file.filename == "":
            flash("No file selected")
            return redirect(request.url)

        if file and allowed_file(file.filename):
            # secure_filename sanitizes the filename:
            filename = secure_filename(file.filename)
            file.save(UPLOAD_DIR / filename)
            flash(f"Uploaded: {filename}")
            return redirect(url_for("index"))

        flash("File type not allowed")

    return render_template("upload.html")
```

```html
<!-- HTML form for file upload: -->
<form method="POST" enctype="multipart/form-data">
    <input type="file" name="file" accept=".jpg,.png,.pdf">
    <button type="submit">Upload</button>
</form>
```

#### Practice

Create a profile picture upload feature: save to `static/avatars/`, validate file type and size (max 2MB).

---

### Part 3: WTForms (Optional but Recommended) (30 minutes)

#### Explanation

```python
# pip install flask-wtf wtforms
from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email, Length, NumberRange

class CreateUserForm(FlaskForm):
    name = StringField("Name", validators=[
        DataRequired(), Length(min=2, max=100)
    ])
    email = StringField("Email", validators=[
        DataRequired(), Email()
    ])
    age = IntegerField("Age", validators=[
        NumberRange(min=1, max=120)
    ])
    bio = TextAreaField("Bio", validators=[Length(max=500)])
    submit = SubmitField("Create User")


@app.route("/users/new", methods=["GET", "POST"])
def new_user():
    form = CreateUserForm()
    if form.validate_on_submit():   # True only on valid POST
        # form.name.data, form.email.data, form.age.data
        flash("User created!")
        return redirect(url_for("list_users"))
    return render_template("create_user.html", form=form)
```

```html
<!-- template with form errors: -->
{% for error in form.name.errors %}
    <span class="error">{{ error }}</span>
{% endfor %}
{{ form.name(class="input", placeholder="Your name") }}
```

#### Practice

Convert your contact form to use WTForms with server-side and CSRF validation.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Registration Form

Build a user registration form:
- Fields: username (3-20 chars), email, password, confirm password
- Validate: all required, email format, passwords match, username alphanumeric only
- Show specific error messages next to each field
- On success: store in session and redirect to "dashboard"

#### Exercise 2: Search with Filters

Build a product search page:
- Search box (text query)
- Category dropdown
- Price range (min, max)
- Sort by (name, price, date)
- Show results below the form (or "No results found")
- Form retains values after submit

---

## Key Takeaways

- `request.form.get("field_name")` reads POST form data
- Always validate server-side — never trust client-side validation alone
- Flash messages + redirect after POST (PRG pattern) prevent form resubmission
- `secure_filename()` from werkzeug sanitizes uploaded filenames
- WTForms adds validation, CSRF protection, and cleaner form handling

---

[← Previous](./lesson-03-html-templates.md) | [Back to Course](./README.md) | [Next →](./lesson-05-database-with-flask.md)

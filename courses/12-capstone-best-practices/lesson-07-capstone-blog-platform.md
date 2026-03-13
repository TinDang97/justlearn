# Lesson 7: Capstone Project 1 — Blog Platform

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Project Overview

Build a full-featured blog platform demonstrating everything from Courses 1-12.

**Features:**
- User registration, login, logout with Flask-Login
- Create, edit, delete blog posts (Markdown supported)
- Comments on posts
- Tag system with filtering
- REST API for posts
- Admin panel
- Scheduled email digest (weekly newsletter)

---

## Architecture

```
blog/
├── app.py                  # Flask app factory
├── config.py               # Config classes
├── models/
│   ├── user.py             # User model
│   ├── post.py             # Post model
│   └── comment.py          # Comment model
├── services/
│   ├── auth_service.py     # Authentication logic
│   ├── post_service.py     # Post CRUD + validation
│   └── email_service.py    # Email notifications
├── routes/
│   ├── auth.py             # /login, /register, /logout
│   ├── posts.py            # /posts, /posts/<slug>
│   ├── admin.py            # /admin/* routes
│   └── api.py              # /api/v1/* REST API
├── templates/
│   ├── base.html
│   ├── auth/
│   ├── posts/
│   └── admin/
├── static/
│   ├── css/
│   └── js/
├── tests/
│   ├── conftest.py
│   ├── test_models.py
│   ├── test_services.py
│   └── test_routes.py
├── requirements.txt
├── .env.example
└── README.md
```

---

## Key Implementation Notes

### Models

```python
# models/post.py
from app import db
from datetime import datetime
import re

post_tags = db.Table("post_tags",
    db.Column("post_id", db.Integer, db.ForeignKey("posts.id")),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"))
)

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False)
    body_markdown = db.Column(db.Text, nullable=False)
    published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    author = db.relationship("User", backref="posts")
    comments = db.relationship("Comment", backref="post",
                               cascade="all, delete-orphan")
    tags = db.relationship("Tag", secondary=post_tags, backref="posts")

    @property
    def body_html(self) -> str:
        """Render Markdown to HTML."""
        import markdown
        return markdown.markdown(self.body_markdown, extensions=["fenced_code"])

    @staticmethod
    def generate_slug(title: str) -> str:
        slug = re.sub(r"[^\w\s-]", "", title.lower())
        slug = re.sub(r"[-\s]+", "-", slug).strip("-")
        return slug[:100]
```

### Services

```python
# services/post_service.py
class PostService:
    def create(self, author_id: int, title: str, body: str,
               tag_names: list[str] = None) -> Post:
        slug = Post.generate_slug(title)
        # Handle slug collisions:
        base_slug = slug
        counter = 1
        while Post.query.filter_by(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        post = Post(
            title=title, slug=slug,
            body_markdown=body, author_id=author_id
        )
        if tag_names:
            post.tags = [Tag.get_or_create(name) for name in tag_names]

        db.session.add(post)
        db.session.commit()
        return post
```

### REST API

```python
# routes/api.py
@api.get("/posts")
def list_posts():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 50)
    posts = Post.query.filter_by(published=True)\
        .order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=per_page)
    return jsonify({
        "items": [post_to_dict(p) for p in posts.items],
        "total": posts.total,
        "page": posts.page,
        "pages": posts.pages,
    })
```

---

## Testing Requirements

Minimum test coverage for this capstone:
- All model methods (slug generation, HTML rendering, relationships)
- All service methods (with mocked database for unit tests)
- All API endpoints (with Flask test client)
- Authentication flow (register, login, access protected route)

---

## Evaluation Criteria

- [ ] All 7 features implemented
- [ ] Tests written with 70%+ coverage
- [ ] Type hints on all service functions
- [ ] Docstrings on all models and services
- [ ] No hardcoded secrets
- [ ] README with setup instructions
- [ ] Runs with `flask run` after `pip install -r requirements.txt && .env setup`

---

[← Previous](./lesson-06-performance-optimization.md) | [Back to Course](./README.md) | [Next →](./lesson-08-capstone-analytics-pipeline.md)

# Lesson 12: Course 5 Review & Mini Project - Contact Database

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Review all Course 5 data structures
- Build a complete contact database with search and filter
- Apply appropriate data structures for each requirement

---

## Prerequisites

- All 11 lessons of Course 5

---

## Course 5 Review

```python
# LIST - ordered, mutable
grades = [85, 90, 78]
grades.append(92)
passing = [g for g in grades if g >= 60]

# TUPLE - ordered, immutable
point = (3, 4)
x, y = point

# DICT - key-value
user = {"name": "Alice", "age": 28}
user.get("phone", "N/A")

# SET - unique, O(1) lookup
tags = {"python", "web", "data"}
"python" in tags   # True

# COLLECTIONS
from collections import Counter, defaultdict, deque
word_freq = Counter(text.split())
grouped = defaultdict(list)
recent = deque(maxlen=10)
```

---

## Mini Project: Contact Database

```python
"""
Contact Database
================
A searchable contact management system demonstrating
Course 5 data structures.
"""

from collections import defaultdict, Counter
from typing import Optional

# ===========================
# DATA STORAGE
# ===========================

# Primary storage: list of dicts (ordered records)
contacts = []

# Index for fast lookup: dict mapping name/email to contact index
name_index = {}
email_index = {}

# Tag system: defaultdict mapping tag → list of contact IDs
tag_index = defaultdict(set)

# Recent searches: bounded deque
recent_searches = deque(maxlen=5)

# ===========================
# CONTACT MANAGEMENT
# ===========================

def add_contact(name: str, email: str = None, phone: str = None,
                company: str = None, tags: list = None) -> dict:
    """Add a new contact to the database."""
    contact = {
        "id": len(contacts) + 1,
        "name": name.strip().title(),
        "email": email.strip().lower() if email else None,
        "phone": phone.strip() if phone else None,
        "company": company.strip() if company else None,
        "tags": set(tags) if tags else set(),
    }

    contacts.append(contact)
    idx = len(contacts) - 1

    # Update indexes
    name_index[contact["name"].lower()] = idx
    if contact["email"]:
        email_index[contact["email"]] = idx
    for tag in contact["tags"]:
        tag_index[tag.lower()].add(idx)

    return contact


def find_by_name(query: str) -> list:
    """Find contacts by partial name match."""
    recent_searches.append(f"name:{query}")
    query_lower = query.lower()
    return [c for c in contacts if query_lower in c["name"].lower()]


def find_by_tag(tag: str) -> list:
    """Find all contacts with given tag."""
    recent_searches.append(f"tag:{tag}")
    indices = tag_index.get(tag.lower(), set())
    return [contacts[i] for i in indices]


def find_by_company(company: str) -> list:
    """Find contacts at a company."""
    return [c for c in contacts if c["company"] and
            company.lower() in c["company"].lower()]


# ===========================
# ANALYTICS
# ===========================

def get_stats() -> dict:
    """Return database statistics."""
    all_tags = Counter(tag for c in contacts for tag in c["tags"])
    companies = Counter(c["company"] for c in contacts if c["company"])

    return {
        "total_contacts": len(contacts),
        "with_email": sum(1 for c in contacts if c["email"]),
        "with_phone": sum(1 for c in contacts if c["phone"]),
        "unique_companies": len(companies),
        "unique_tags": len(all_tags),
        "top_tags": all_tags.most_common(5),
        "top_companies": companies.most_common(3),
    }


# ===========================
# DISPLAY
# ===========================

def display_contact(contact: dict) -> None:
    """Display a single contact card."""
    print(f"\n  Contact #{contact['id']}")
    print(f"  {'─' * 35}")
    print(f"  Name:    {contact['name']}")
    if contact["email"]:    print(f"  Email:   {contact['email']}")
    if contact["phone"]:    print(f"  Phone:   {contact['phone']}")
    if contact["company"]:  print(f"  Company: {contact['company']}")
    if contact["tags"]:     print(f"  Tags:    {', '.join(sorted(contact['tags']))}")


def display_all() -> None:
    """Display all contacts in table format."""
    if not contacts:
        print("No contacts found.")
        return
    print(f"\n{'#':<4} {'Name':<20} {'Email':<25} {'Company':<20}")
    print("─" * 70)
    for c in contacts:
        print(f"{c['id']:<4} {c['name']:<20} {(c['email'] or 'N/A'):<25} {(c['company'] or 'N/A'):<20}")


# ===========================
# DEMO
# ===========================

if __name__ == "__main__":
    # Add sample contacts
    add_contact("Alice Johnson", "alice@techco.com", "555-1001",
                "TechCo Inc", ["python", "developer", "remote"])
    add_contact("Bob Smith", "bob@startup.io", "555-1002",
                "Startup.io", ["javascript", "developer"])
    add_contact("Carol Williams", "carol@techco.com", None,
                "TechCo Inc", ["python", "data-science", "remote"])
    add_contact("David Brown", "david@freelance.net",
                tags=["python", "freelance", "designer"])
    add_contact("Eve Davis", "eve@university.edu", "555-1005",
                "State University", ["python", "researcher", "remote"])

    # Display all
    print("=== CONTACT DATABASE ===")
    display_all()

    # Search demos
    print("\n=== Search: 'techco' ===")
    for c in find_by_company("techco"):
        display_contact(c)

    print("\n=== Tag: 'python' ===")
    python_devs = find_by_tag("python")
    print(f"Found {len(python_devs)} Python contacts:")
    for c in python_devs:
        print(f"  - {c['name']}")

    print("\n=== Set Operations: remote Python devs ===")
    python_ids = tag_index["python"]
    remote_ids = tag_index["remote"]
    both = python_ids & remote_ids
    for i in both:
        print(f"  - {contacts[i]['name']}")

    # Stats
    print("\n=== Database Stats ===")
    stats = get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")

    print(f"\nRecent searches: {list(recent_searches)}")
```

---

## Course 5 Completion Checklist

- [ ] List: create, index, slice, modify, sort, comprehension
- [ ] Tuple: create, unpack, use as dict key, named tuple
- [ ] Dict: create, access, modify, iterate, comprehension
- [ ] Set: create, operations (union/intersection/difference), membership
- [ ] Nested structures: list of dicts, dict of lists
- [ ] Choose right structure for each problem
- [ ] Generator: write with yield, use generator expression
- [ ] Collections: Counter, defaultdict, deque

**Next: [Course 6 - Object-Oriented Programming](../06-oop/README.md)**

---

[← Previous](./lesson-11-collections-module.md) | [Back to Course](./README.md) | [Next Course →](../06-oop/README.md)

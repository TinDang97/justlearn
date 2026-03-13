# Lesson 10: Course 2 Review & Mini Project

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Review all Course 2 concepts: types, variables, None, scope, naming, formatting
- Build a complete contact management system
- Apply proper naming, constants, type handling, and formatting

---

## Prerequisites

- All 9 lessons of Course 2

---

## Course 2 Review

### Quick Reference

```python
# ===== DATA TYPES =====
integer_val = 42               # int - whole numbers
float_val = 3.14               # float - decimals
string_val = "Hello"           # str - text
bool_val = True                # bool - True/False
none_val = None                # NoneType - no value

# ===== TYPE CHECKING =====
print(type(42))                # <class 'int'>
print(isinstance(42, int))     # True

# ===== TYPE CONVERSION =====
int("42")          # 42
float("3.14")      # 3.14
str(42)            # "42"
bool(0)            # False

# ===== NAMING =====
student_name = "Alice"         # snake_case variables
MAX_STUDENTS = 300             # ALL_CAPS constants

# ===== F-STRING FORMATTING =====
name = "Alice"
salary = 85432.50
print(f"{name:<20} ${salary:>12,.2f}")

# ===== BOOLEANS =====
is_valid = 18 <= age <= 65     # comparison chain
has_data = value is not None   # None check

# ===== NONE =====
middle_name = None
display = middle_name or "N/A" # None-safe display
```

---

## Mini Project: Contact Management System

### Requirements

Build a program that manages a list of contacts (using what you know so far - no loops or complex structures yet). The program will:

1. Collect data for 3 contacts
2. Validate and clean all inputs
3. Handle optional fields with None
4. Display a formatted contact directory

```python
"""
Contact Management System
=========================
Stores and displays contact information professionally.
Handles optional fields and validates input.

Course 2 Mini Project - Data Types & Variables
"""

# ========================
# CONSTANTS
# ========================
MAX_NAME_LENGTH = 50
MIN_NAME_LENGTH = 2
PHONE_PLACEHOLDER = "Not provided"
EMAIL_PLACEHOLDER = "Not provided"
SEPARATOR = "=" * 55

# ========================
# UTILITY FUNCTIONS (preview of Course 4)
# ========================
def clean_name(raw_name):
    """Remove extra whitespace and apply title case."""
    return raw_name.strip().title()

def clean_phone(raw_phone):
    """Clean phone number, return None if empty."""
    cleaned = raw_phone.strip().replace(" ", "").replace("-", "")
    return cleaned if cleaned else None

def format_contact_card(contact_num, name, email, phone, company, notes):
    """Format a contact as a display card."""
    phone_display = phone if phone is not None else PHONE_PLACEHOLDER
    email_display = email if email else EMAIL_PLACEHOLDER
    company_display = company if company else "Independent"
    notes_display = notes if notes else "No notes"

    return f"""
Contact #{contact_num}
{SEPARATOR}
  Name:    {name}
  Email:   {email_display}
  Phone:   {phone_display}
  Company: {company_display}
  Notes:   {notes_display}
"""

# ========================
# MAIN PROGRAM
# ========================
print(SEPARATOR)
print("    CONTACT MANAGEMENT SYSTEM")
print(SEPARATOR)
print("Enter information for 3 contacts.")
print("(Press Enter to skip optional fields)\n")

# --- Contact 1 ---
print("--- Contact 1 ---")
name1 = clean_name(input("Full name (required): "))
email1 = input("Email (optional): ").strip().lower() or None
phone1 = clean_phone(input("Phone (optional): "))
company1 = input("Company (optional): ").strip() or None
notes1 = input("Notes (optional): ").strip() or None

# --- Contact 2 ---
print("\n--- Contact 2 ---")
name2 = clean_name(input("Full name (required): "))
email2 = input("Email (optional): ").strip().lower() or None
phone2 = clean_phone(input("Phone (optional): "))
company2 = input("Company (optional): ").strip() or None
notes2 = input("Notes (optional): ").strip() or None

# --- Contact 3 ---
print("\n--- Contact 3 ---")
name3 = clean_name(input("Full name (required): "))
email3 = input("Email (optional): ").strip().lower() or None
phone3 = clean_phone(input("Phone (optional): "))
company3 = input("Company (optional): ").strip() or None
notes3 = input("Notes (optional): ").strip() or None

# ========================
# DISPLAY DIRECTORY
# ========================
print("\n\n")
print(SEPARATOR)
print("         CONTACT DIRECTORY")
print(SEPARATOR)

print(format_contact_card(1, name1, email1, phone1, company1, notes1))
print(format_contact_card(2, name2, email2, phone2, company2, notes2))
print(format_contact_card(3, name3, email3, phone3, company3, notes3))

# ========================
# SUMMARY STATS
# ========================
total_contacts = 3
contacts_with_email = sum([
    email1 is not None,
    email2 is not None,
    email3 is not None
])
contacts_with_phone = sum([
    phone1 is not None,
    phone2 is not None,
    phone3 is not None
])

print(SEPARATOR)
print(f"  Directory Summary")
print(SEPARATOR)
print(f"  Total contacts:   {total_contacts}")
print(f"  Have email:       {contacts_with_email}/{total_contacts}")
print(f"  Have phone:       {contacts_with_phone}/{total_contacts}")
print(SEPARATOR)
```

---

## Course 2 Completion Checklist

Before moving to Course 3, verify you can:
- [ ] Explain the difference between int, float, str, bool, and None
- [ ] Convert between types: `int()`, `float()`, `str()`, `bool()`
- [ ] Use f-strings with format specifiers for alignment and precision
- [ ] Use comparison operators and understand truthy/falsy
- [ ] Check for None correctly with `is` and `is not`
- [ ] Apply PEP 8 naming: `snake_case` variables, `ALL_CAPS` constants, `PascalCase` classes
- [ ] Explain variable scope (local vs global) at a basic level

---

## Key Takeaways

Python's type system is the foundation of all programming. Every piece of data has a type, and understanding what type you're working with prevents bugs before they happen.

**Next: [Course 3 - Control Flow & Logic](../03-control-flow-logic/README.md)**

---

[← Previous Lesson](./lesson-09-variable-scope-introduction.md) | [Back to Course](./README.md) | [Next Course →](../03-control-flow-logic/README.md)

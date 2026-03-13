# Lesson 3: Nested Conditions

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Write if statements inside other if statements (nesting)
- Limit nesting depth to maintain readable code
- Convert deep nesting to flat elif chains
- Build decision trees for complex multi-factor decisions

---

## Prerequisites

- Lessons 1-2: if, elif, else

---

## Lesson Outline

### Part 1: Nested if Statements (30 minutes)

#### Explanation

**Nested conditions** are if statements inside other if statements. Use them when a second decision depends on the first:

```python
# "If you're logged in AND you're an admin, show admin panel"
if is_logged_in:
    if is_admin:
        print("Welcome, Administrator")
    else:
        print("Welcome, User")
else:
    print("Please log in")
```

The inner if only runs if the outer if's condition is True.

**Indentation shows nesting level:**
```python
if condition1:          # Level 1 (4 spaces)
    if condition2:      # Level 2 (8 spaces)
        if condition3:  # Level 3 (12 spaces) - getting deep!
            pass
```

#### Examples

```python
# Login system with role checking
username = input("Username: ")
password = input("Password: ")

if username == "admin":
    if password == "secret123":
        print("Admin login successful")
        print("Full system access granted")
    else:
        print("Wrong password for admin account")
elif username == "alice":
    if password == "alicepass":
        print("User login successful - Welcome, Alice!")
    else:
        print("Wrong password")
else:
    print("Unknown username")

# Age and discount nested check
age = int(input("Age: "))
is_member = input("Member? (yes/no): ").lower() == "yes"

if age >= 60:
    if is_member:
        discount = 0.30   # 30% for senior members
        label = "Senior Member"
    else:
        discount = 0.20   # 20% for seniors
        label = "Senior"
else:
    if is_member:
        discount = 0.15   # 15% for regular members
        label = "Member"
    else:
        discount = 0.00
        label = "Regular"

print(f"Status: {label} - Discount: {discount:.0%}")
```

#### Practice

Build a "game character creation" system with nested conditions: choose class (warrior/mage/rogue), then choose specialty within each class.

---

### Part 2: The Danger of Deep Nesting (30 minutes)

#### Explanation

More than 2-3 levels of nesting becomes hard to read. There's a concept called "arrow anti-pattern":

```python
# BAD: The "arrow of doom" (nesting keeps going right)
if user_exists:
    if is_logged_in:
        if has_permission:
            if not is_banned:
                if account_active:
                    process_request()
```

**Refactoring strategies:**

**1. Early return / guard clauses:**
```python
# BETTER: fail fast
if not user_exists:
    print("User not found")
    # In a function, you'd return here

if not is_logged_in:
    print("Please log in")

if not has_permission:
    print("Access denied")

# If we get here, all checks passed
process_request()
```

**2. Combine conditions with and:**
```python
# Instead of nested ifs:
if user_exists:
    if is_logged_in:
        if has_permission:
            process_request()

# Use combined condition:
if user_exists and is_logged_in and has_permission:
    process_request()
```

#### Examples

```python
# Flattened version of the login+role system:
username = input("Username: ")
password = input("Password: ")

USERS = {
    "admin": "secret123",
    "alice": "alicepass",
}

if username not in USERS:
    print("Unknown username")
elif USERS[username] != password:
    print("Incorrect password")
elif username == "admin":
    print("Admin access granted")
else:
    print(f"Welcome, {username}!")
```

#### Practice

Take a deeply nested program and refactor it using guard clauses or combined conditions.

---

### Part 3: Decision Trees (30 minutes)

#### Explanation

Complex real-world decisions naturally form trees. Before coding, sketch the decision tree:

```
Is temperature above 30°C?
├── YES: Is it sunny?
│   ├── YES: "Go to beach!"
│   └── NO: "Stay inside with AC"
└── NO: Is it raining?
    ├── YES: "Take umbrella"
    └── NO: "Perfect weather for a walk!"
```

```python
temp = float(input("Temperature (°C): "))
weather = input("Weather (sunny/cloudy/rainy): ").lower()

if temp > 30:
    if weather == "sunny":
        recommendation = "Go to the beach!"
    else:
        recommendation = "Stay inside with AC"
elif temp < 10:
    if weather == "rainy":
        recommendation = "Stay home, it's cold and wet"
    else:
        recommendation = "Bundle up and enjoy the crisp air"
else:
    if weather == "rainy":
        recommendation = "Take an umbrella"
    elif weather == "sunny":
        recommendation = "Perfect weather for a walk!"
    else:
        recommendation = "Nice mild day, go for a stroll"

print(f"Recommendation: {recommendation}")
```

#### Practice

Design and implement a decision tree for: "What should I eat for lunch?" based on: hungry level (very/somewhat/not), dietary preference (vegetarian/meat-eater/vegan), budget (low/medium/high).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Credit Card Approval System

Build a simplified credit card approval with nested/combined conditions:
- Credit score check (primary condition)
- Income verification
- Debt-to-income ratio
- Employment status

Display approval/rejection with specific reason.

#### Exercise 2: Shipping Zone Calculator

Multiple factors: weight, destination (domestic zones 1-3 or international), express option, fragile flag. Build a complete shipping cost calculator with nested conditions.

#### Bonus Challenge

**Adventure game intro:** Build a text-based mini adventure where the player makes 3 decisions (each with 2-3 options), and the path branches at each point. All paths should lead to a different outcome. That's 6-8+ possible endings.

---

## Key Takeaways

- **Nested conditions**: if inside if - use when second decision depends on first
- Keep nesting to **2 levels max** for readability
- **Guard clauses**: check error conditions early and exit, keeping main logic unindented
- **Combine with `and`**: `if a and b:` instead of `if a: if b:`
- Draw decision trees on paper BEFORE coding complex nested logic

---

## Common Mistakes to Avoid

- **Pyramid of doom**: too many nesting levels - refactor with guard clauses
- **Forgetting else**: when nesting, ensure all paths are handled

---

## Homework

1. Build a "loan qualification calculator" with 5 nested conditions (income, credit, employment, down payment, debt ratio)
2. Research: what is "cyclomatic complexity" and why does deep nesting increase it?

---

[← Previous](./lesson-02-if-else-elif.md) | [Back to Course](./README.md) | [Next →](./lesson-04-logical-operators.md)

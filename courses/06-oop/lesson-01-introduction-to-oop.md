# Lesson 1: Introduction to OOP Concepts

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Explain what object-oriented programming is and why it exists
- Distinguish between a class (blueprint) and an object (instance)
- Identify real-world examples that map to OOP concepts
- Understand state (attributes) and behavior (methods)

---

## Prerequisites

- Courses 1-5: All Python fundamentals and data structures

---

## Lesson Outline

### Part 1: Why OOP? (30 minutes)

#### Explanation

Before OOP, programs were written procedurally: a sequence of functions operating on data. For small programs, this works great. For large programs, it becomes a mess.

**The problem with procedural code at scale:**
```python
# Procedural approach - all data is separate:
student1_name = "Alice"
student1_gpa = 3.9
student1_courses = ["Python", "Math"]

student2_name = "Bob"
student2_gpa = 3.5
student2_courses = ["English"]

# Functions must know about all the separate variables:
def calculate_honor_roll(name, gpa):
    return gpa >= 3.7

def add_course(courses_list, course):
    courses_list.append(course)
```

**The OOP approach - bundle data + behavior:**
```python
# OOP approach - everything about a student lives together:
class Student:
    def __init__(self, name, gpa):
        self.name = name
        self.gpa = gpa
        self.courses = []

    def is_honor_roll(self):
        return self.gpa >= 3.7

    def add_course(self, course):
        self.courses.append(course)

# Now it's self-contained:
alice = Student("Alice", 3.9)
alice.add_course("Python")
print(alice.is_honor_roll())  # True
```

**Four pillars of OOP:**
1. **Encapsulation** - bundle data and methods, hide internal details
2. **Inheritance** - create new classes based on existing ones
3. **Polymorphism** - different objects respond differently to same message
4. **Abstraction** - expose only what's needed, hide complexity

#### Examples

```python
# Everything in Python is already an OOP:
name = "Alice"           # name is a str object
print(name.upper())      # .upper() is a method of the str class

grades = [92, 85, 78]    # grades is a list object
grades.append(90)        # .append() is a method of the list class

# You've been using OOP all along!
# Now you'll learn to CREATE new types of objects.
```

#### Practice

Think about these real-world entities and identify their attributes (data) and behaviors (methods):
1. A bank account
2. A car
3. A library book
4. A social media post

---

### Part 2: Classes as Blueprints (30 minutes)

#### Explanation

**Analogy:** A class is like an architectural blueprint. The blueprint describes what a house looks like, but the blueprint itself isn't a house. You use the blueprint to build actual houses (objects/instances). Multiple houses can be built from the same blueprint.

- **Class** = blueprint, template, type definition
- **Object/Instance** = actual thing built from the blueprint

```python
# Class definition (blueprint):
class Dog:
    # Attributes: what a dog HAS
    # Methods: what a dog DOES
    pass   # Empty class for now

# Creating instances (building from blueprint):
dog1 = Dog()   # First dog object
dog2 = Dog()   # Second dog object - completely separate!

print(type(dog1))   # <class '__main__.Dog'>
print(isinstance(dog1, Dog))   # True
```

**Multiple instances, independent from each other:**
```python
# Like houses built from same blueprint - separate physical entities
fido = Dog()
rex = Dog()
spot = Dog()

# Each is a separate object, independent from others
print(fido is rex)    # False - different objects
print(type(fido) == type(rex))   # True - same type/class
```

#### Examples

```python
# Real-world class definitions (just structure, no implementation yet):
class BankAccount:
    """Represents a bank account."""
    pass

class Book:
    """Represents a book in a library."""
    pass

class Recipe:
    """Represents a cooking recipe."""
    pass

# These are valid, empty classes. We'll add attributes and methods soon.
account = BankAccount()
book = Book()
```

#### Practice

Identify which is a class and which is an object:
- "Toyota Camry" model, "Your specific car with VIN #1234"
- "Dog species", "Fido"
- "User account type", "alice@example.com's account"

---

### Part 3: State and Behavior (30 minutes)

#### Explanation

- **State** (attributes): The data the object holds (what it "knows")
- **Behavior** (methods): The actions the object can perform (what it "does")

```python
# A simple bank account:
class BankAccount:
    # State: balance (what the account knows about itself)
    # Behavior: deposit, withdraw, get_balance (what it can do)
    pass

# A traffic light:
class TrafficLight:
    # State: current_color ("red", "yellow", "green")
    # Behavior: change_color(), is_safe_to_go()
    pass

# A shopping cart:
class ShoppingCart:
    # State: items (list of products), total (current sum)
    # Behavior: add_item(), remove_item(), calculate_total()
    pass
```

> **Teacher's Note:** Emphasize that this mental model (state + behavior) is the most important OOP concept. Before writing any class, students should ask: "What does this object KNOW?" and "What can this object DO?"

#### Examples

```python
# Designing before coding:

# Temperature class:
# STATE: value (float), unit ("C", "F", "K")
# BEHAVIOR: convert_to(), is_above_freezing(), is_above_boiling()

# Student class:
# STATE: name, student_id, courses (list), grades (dict)
# BEHAVIOR: enroll(), add_grade(), calculate_gpa(), is_honor_roll()

# Timer class:
# STATE: duration, start_time, is_running
# BEHAVIOR: start(), stop(), reset(), get_elapsed()
```

#### Practice

Design (on paper) 3 classes with their states and behaviors before we learn to code them.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: OOP Design Exercise

For each of these problems, design a class:
1. A simple to-do task (attributes: title, description, due_date, completed; methods: mark_done, is_overdue, to_string)
2. A playing card (attributes: suit, rank; methods: is_face_card, display, compare)
3. A simple text file manager (attributes: filename, content; methods: read, write, append, word_count)

Design = list all attributes and methods with descriptions. NO code yet.

#### Exercise 2: Before and After

Convert this procedural code design to OOP design:
```python
# Procedural:
student_names = []
student_grades = {}
def add_student(name): ...
def record_grade(name, subject, grade): ...
def get_student_gpa(name): ...
def is_honor_roll(name): ...
def format_report(name): ...
```

What would a `Student` class look like?

#### Bonus Challenge

**OOP in the real world:** Open the Python documentation for `datetime.datetime` or `pathlib.Path`. List 5 attributes and 5 methods. Can you identify the object's state and behaviors?

---

## Key Takeaways

- **OOP** bundles related data (attributes) and actions (methods) into **objects**
- **Class** = blueprint/template; **Object/Instance** = specific thing built from class
- Everything in Python is already an object (strings, lists, ints...)
- **State** = what the object knows (its data); **Behavior** = what it can do (its methods)
- Four pillars: Encapsulation, Inheritance, Polymorphism, Abstraction

---

## Homework

1. Find 5 objects in your daily life. For each: list 3 attributes and 3 behaviors they'd have as Python classes.
2. Read about the history of OOP - who invented it? (Alan Kay, Simula, Smalltalk)

---

[Back to Course](./README.md) | [Next →](./lesson-02-classes-and-objects.md)

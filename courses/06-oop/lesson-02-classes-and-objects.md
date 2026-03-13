# Lesson 2: Classes & Objects

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Define a class using the `class` keyword
- Create instances (objects) from a class
- Add attributes to objects
- Understand the difference between the class and its instances

---

## Prerequisites

- Lesson 1: OOP concepts
- Courses 1-5: all Python fundamentals

---

## Lesson Outline

### Part 1: Defining Your First Class (30 minutes)

#### Explanation

```python
# class keyword + PascalCase name + colon
class Dog:
    """A class representing a dog."""
    # Class body is indented
    species = "Canis lupus familiaris"   # Class attribute (shared by all dogs)

# Create instances:
fido = Dog()    # Call the class like a function → creates instance
rex = Dog()

# Both are Dogs:
print(type(fido))         # <class '__main__.Dog'>
print(isinstance(fido, Dog))   # True

# Access class attribute from instance or class:
print(fido.species)   # Canis lupus familiaris
print(Dog.species)    # Canis lupus familiaris
```

**Adding attributes to instances (quick preview):**
```python
class Dog:
    species = "Canis lupus familiaris"

fido = Dog()
fido.name = "Fido"   # Add attribute directly (works, but not the right way)
fido.age = 3

rex = Dog()
rex.name = "Rex"
rex.age = 5

print(fido.name)  # Fido
print(rex.name)   # Rex
# But this is messy - we'll do it properly with __init__ in Lesson 3
```

#### Examples

```python
class Car:
    """A class representing a car."""
    # Class-level attributes (shared by all cars):
    fuel_type = "gasoline"
    wheels = 4

# Create different car instances:
toyota = Car()
honda = Car()

toyota.model = "Camry"  # Instance-level (specific to this car)
toyota.year = 2022

honda.model = "Civic"
honda.year = 2021

print(f"{toyota.model}: {toyota.wheels} wheels, {toyota.fuel_type}")
print(f"{honda.model}: {honda.wheels} wheels, {honda.fuel_type}")
```

#### Practice

Create a `Rectangle` class with class attribute `shape_type = "rectangle"`. Create 3 instances with different width and height attributes.

---

### Part 2: Class Attributes (30 minutes)

#### Explanation

**Class attributes** belong to the class itself - all instances share them:

```python
class Student:
    school = "Python Academy"         # Class attribute - shared by all
    student_count = 0                 # Track total students

class BankAccount:
    interest_rate = 0.05              # Same rate for all accounts
    currency = "USD"

# Access via class or instance:
print(Student.school)                # Python Academy
alice = Student()
print(alice.school)                  # Python Academy (inherits from class)

# Modifying class attribute:
Student.school = "Python University"  # Changes for ALL instances

# Instance attribute can shadow class attribute:
bob = Student()
bob.school = "Bob's School"          # Creates INSTANCE attribute
print(bob.school)                    # Bob's School (instance shadows class)
print(alice.school)                  # Python University (class attribute, unchanged)
```

**Counting instances (common pattern):**
```python
class Student:
    count = 0   # Class attribute - track total

    def __init__(self, name):   # We'll learn this fully in Lesson 3
        self.name = name
        Student.count += 1      # Increment class attribute

alice = Student("Alice")
bob = Student("Bob")
carol = Student("Carol")
print(Student.count)   # 3
```

#### Practice

Create a `Product` class with class attributes for currency and tax_rate. Create instances with instance attributes for name and price. Calculate after-tax price.

---

### Part 3: Object Identity and Equality (30 minutes)

#### Explanation

```python
# Two variables can point to same object or different objects:
fido = Dog()
rex = Dog()
buddy = fido   # buddy is an ALIAS for fido (same object)

print(fido is rex)    # False - different objects
print(fido is buddy)  # True  - same object!

# Identity vs equality:
class Circle:
    radius = 5.0

c1 = Circle()
c2 = Circle()

print(c1 is c2)    # False - different objects
print(c1 == c2)    # False by default (compares identity)
# We'll make == check radius in Lesson 9 (__eq__ method)
```

**Python's object model:**
```python
# Every object has:
x = 42
print(id(x))      # Unique memory address
print(type(x))    # Its type/class
print(x)          # Its value

# Same for your custom objects:
dog = Dog()
print(id(dog))    # Memory address
print(type(dog))  # <class '__main__.Dog'>
```

#### Practice

Create 3 variables: two pointing to new instances, one aliasing an existing instance. Use `is` and `==` to verify identity relationships.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Color System

```python
class Color:
    """Represents an RGB color."""
    # Class attributes:
    white = None   # We'll set these after class definition
    black = None

# After definition:
Color.white = Color()
Color.white.r, Color.white.g, Color.white.b = 255, 255, 255

# Create your own colors:
red = Color()
red.r, red.g, red.b = 255, 0, 0

# Build a function to display color info
```

#### Exercise 2: Animal Hierarchy Start

```python
class Animal:
    kingdom = "Animalia"
    # Add class attributes for: can_fly, is_domestic, legs

# Create instances for:
# cat, dog, eagle, dolphin, snake
# Set appropriate attributes for each
```

#### Bonus Challenge

Implement a `class Student` with a class variable `all_students = []` that keeps a list of every student ever created. Each new student is automatically added to this list.

---

## Key Takeaways

- `class ClassName:` defines a new type
- **Class attributes**: shared by all instances; defined at class level
- **Instance attributes**: specific to one instance; added with `instance.attr = value`
- Instance attribute **shadows** class attribute if same name
- `is` tests identity (same object); `==` tests equality (same value)
- `isinstance(obj, Class)` checks if obj is an instance of Class

---

## Homework

1. Design and create 3 classes with meaningful class attributes
2. Create instances and experiment with the attribute shadowing behavior

---

[← Previous](./lesson-01-introduction-to-oop.md) | [Back to Course](./README.md) | [Next →](./lesson-03-init-method-and-self.md)

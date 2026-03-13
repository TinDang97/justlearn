# Lesson 7: Inheritance

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Create subclasses that inherit from parent classes
- Override methods in subclasses
- Use `super()` to call parent class methods
- Understand when to use inheritance vs composition

---

## Prerequisites

- Lessons 1-6 of this course

---

## Lesson Outline

### Part 1: Basic Inheritance (30 minutes)

#### Explanation

Inheritance lets a new class (subclass/child) **acquire all attributes and methods** of an existing class (superclass/parent), then add or change behavior:

```python
class Animal:
    """Base class for all animals."""

    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def eat(self, food: str):
        print(f"{self.name} eats {food}")

    def sleep(self):
        print(f"{self.name} is sleeping")

    def describe(self):
        return f"{self.name} (age {self.age})"


class Dog(Animal):    # Dog inherits from Animal
    """A dog - inherits Animal, adds dog-specific behavior."""

    def bark(self):
        print(f"{self.name} says: Woof!")

    def fetch(self, item: str):
        print(f"{self.name} fetches the {item}!")


class Cat(Animal):
    """A cat - also inherits Animal."""

    def meow(self):
        print(f"{self.name} says: Meow!")

    def purr(self):
        print(f"{self.name} purrs contentedly")


# Using inherited classes:
dog = Dog("Rex", 3)
cat = Cat("Whiskers", 5)

dog.eat("kibble")      # Inherited from Animal
dog.bark()             # Dog-specific
dog.fetch("ball")      # Dog-specific

cat.sleep()            # Inherited from Animal
cat.meow()             # Cat-specific

print(dog.describe())  # Rex (age 3) - inherited method
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True! Dog IS an Animal
```

**Key concept: IS-A relationship**
- Dog IS-A Animal (inheritance makes sense)
- Car IS-A Vehicle (inheritance makes sense)
- Dog IS-A Car (no! don't use inheritance here)

#### Practice

Create a `Vehicle` base class with `make`, `year`, `speed` attributes and `accelerate()`, `brake()` methods. Create `Car` and `Motorcycle` subclasses.

---

### Part 2: `super()` and Extending `__init__` (30 minutes)

#### Explanation

When a subclass has `__init__`, use `super()` to call the parent's `__init__`:

```python
class Animal:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
        self.is_alive = True

    def describe(self):
        return f"{self.name} (age {self.age})"


class Dog(Animal):
    def __init__(self, name: str, age: int, breed: str):
        super().__init__(name, age)    # Call Animal.__init__ first!
        self.breed = breed             # Add Dog-specific attribute
        self.tricks = []               # Dog-specific attribute

    def learn_trick(self, trick: str):
        self.tricks.append(trick)
        print(f"{self.name} learned: {trick}!")

    def describe(self):
        base = super().describe()      # Call Animal.describe()!
        return f"{base}, Breed: {self.breed}"


class ServiceDog(Dog):
    def __init__(self, name: str, age: int, breed: str, job: str):
        super().__init__(name, age, breed)   # Call Dog.__init__!
        self.job = job

    def describe(self):
        base = super().describe()    # Call Dog.describe()
        return f"{base}, Job: {self.job}"


# Creating instances:
fido = Dog("Fido", 3, "Labrador")
fido.learn_trick("sit")
print(fido.describe())   # Fido (age 3), Breed: Labrador

helper = ServiceDog("Buddy", 4, "Golden Retriever", "Guide dog")
print(helper.describe())  # Buddy (age 4), Breed: Golden Retriever, Job: Guide dog
print(helper.is_alive)    # True - inherited through chain!
```

**`super()` is the key to the inheritance chain.** Always call it when you override `__init__` — otherwise parent initialization is skipped!

#### Practice

Extend your `Vehicle` hierarchy: add `ElectricCar(Car)` with `battery_capacity` and override `accelerate()` to print battery usage.

---

### Part 3: Multi-level and Multiple Inheritance (30 minutes)

#### Explanation

**Multi-level inheritance** (A → B → C):
```python
class Shape:
    def area(self) -> float:
        raise NotImplementedError("Subclass must implement area()")

    def perimeter(self) -> float:
        raise NotImplementedError("Subclass must implement perimeter()")


class Polygon(Shape):
    def __init__(self, sides: list[float]):
        self.sides = sides

    def perimeter(self) -> float:
        return sum(self.sides)


class Rectangle(Polygon):
    def __init__(self, width: float, height: float):
        super().__init__([width, height, width, height])
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height


class Square(Rectangle):
    def __init__(self, side: float):
        super().__init__(side, side)   # Rectangle handles everything

# Square inherits: area, perimeter from Rectangle/Polygon/Shape
s = Square(5)
print(s.area())       # 25
print(s.perimeter())  # 20
```

**Multiple inheritance** (use carefully):
```python
class Flyable:
    def fly(self):
        return f"{self.__class__.__name__} is flying!"

class Swimmable:
    def swim(self):
        return f"{self.__class__.__name__} is swimming!"

class Duck(Animal, Flyable, Swimmable):
    def __init__(self, name: str):
        Animal.__init__(self, name, 1)

    def quack(self):
        return f"{self.name}: Quack!"

donald = Duck("Donald")
print(donald.fly())   # Donald is flying!
print(donald.swim())  # Donald is swimming!
print(donald.quack()) # Donald: Quack!
```

> **Teacher's Note:** Multiple inheritance is powerful but complex. In Python, Method Resolution Order (MRO) determines which class's method is called. Use `Dog.__mro__` to see the order. In practice, prefer mixins (small classes with specific behaviors) over complex multiple inheritance.

#### Practice

Create `FlyingVehicle` and `WaterVehicle` mixin classes, then create a `SeaPlane` that inherits from both plus `Vehicle`.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Employee Hierarchy

```python
class Employee:
    company_name = "TechCorp"

    def __init__(self, name: str, employee_id: str, salary: float):
        ...

    def calculate_pay(self) -> float:
        """Monthly pay."""
        return self.salary / 12

    def get_info(self) -> str:
        ...


class Manager(Employee):
    def __init__(self, name, employee_id, salary, department: str):
        ...
        self.reports = []   # List of employees

    def add_report(self, employee: Employee):
        ...

    def calculate_pay(self) -> float:
        """Managers get 10% bonus."""
        base = super().calculate_pay()
        return base * 1.10


class Engineer(Employee):
    def __init__(self, name, employee_id, salary, tech_stack: list):
        ...

    def add_skill(self, skill: str):
        ...
```

#### Exercise 2: Shape Calculator

Implement the full `Shape` hierarchy:
- `Shape` (abstract base with `area()` and `perimeter()`)
- `Circle(Shape)`, `Rectangle(Shape)`, `Triangle(Shape)`
- `Square(Rectangle)` — using super() correctly
- Function `total_area(shapes: list[Shape])` that works with all types

#### Bonus Challenge

Research `abc.ABC` and `@abstractmethod`. Refactor your `Shape` class so that Python **enforces** that subclasses implement `area()` and `perimeter()`. What error do you get if you don't?

---

## Key Takeaways

- `class Child(Parent):` creates a subclass
- Child inherits ALL parent attributes and methods
- `super().__init__(...)` calls parent constructor — always use when overriding `__init__`
- `isinstance(obj, Parent)` returns `True` for subclass instances
- Use inheritance for IS-A relationships, not HAS-A relationships

---

## Common Questions

**Q: When should I use inheritance vs just creating a separate class?**
A: Use inheritance when you have a genuine IS-A relationship AND the subclass needs most of the parent's functionality. If you find yourself overriding most methods, composition might be better.

**Q: How deep should my inheritance hierarchy go?**
A: Generally 2-3 levels max. Deep hierarchies become hard to understand and maintain. Python stdlib itself rarely goes deeper than 3 levels.

---

## Homework

1. Build a `Media` hierarchy: `Media` → `Video`, `Audio`, `Podcast(Audio)` with appropriate attributes
2. Research: What is the Liskov Substitution Principle? How does it guide inheritance design?

---

[← Previous](./lesson-06-encapsulation-properties.md) | [Back to Course](./README.md) | [Next →](./lesson-08-method-overriding-super.md)

# Lesson 10: Course 1 Review & Mini Project

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Recall and explain all major concepts from Course 1
- Build a complete, polished personal calculator application
- Apply code style, comments, and best practices
- Demonstrate competency across all Course 1 topics

---

## Prerequisites

- Lessons 1-9: Complete Course 1

---

## Lesson Outline

### Part 1: Course 1 Review (30 minutes)

#### Explanation

Let's do a rapid review of everything in Course 1. This is your checklist - if anything feels fuzzy, that's your signal to revisit that lesson.

#### Key Concepts Review

**Python execution model:**
```python
# Python runs line by line, top to bottom
# Each line is one statement (usually)
# Order matters!
print("First")
print("Second")
print("Third")
```

**Print and f-strings:**
```python
name = "Alice"
age = 22
print(f"Hello, {name}! You are {age} years old.")
print(f"In 10 years you'll be {age + 10}.")
```

**Input and type conversion:**
```python
name = input("Name: ")              # Always returns string
age = int(input("Age: "))           # Convert to integer
price = float(input("Price: "))     # Convert to float
```

**Math operators:**
```python
# +  -  *  /  //  %  **
print(17 // 5)   # 3  (floor division)
print(17 % 5)    # 2  (remainder)
print(2 ** 8)    # 256 (power)
```

**Strings:**
```python
word = "Python"
print(len(word))         # 6
print(word[0])           # P
print(word[-1])          # n
print(word[0:3])         # Pyt
print(word[::-1])        # nohtyP
print(word.upper())      # PYTHON
print(word.replace("P", "J"))  # Jython
```

**Comments and style:**
```python
# Single-line comment
"""
Multi-line docstring
for program header
"""
CONSTANT_VALUE = 42      # ALL_CAPS for constants
variable_name = "hello"  # snake_case for variables
```

**Debugging:**
```python
# Three error types: Syntax, Runtime, Logic
# Debug with print statements:
print(f"DEBUG: variable = {variable}")  # Remove before final version
```

> **Teacher's Note:** Use a show-of-hands check on each concept. "Who feels confident about strings?" If fewer than 70% of hands go up, do a quick 5-minute review of that topic before moving to the project.

#### Quick Quiz

Test yourself - answers at the bottom of this section:
1. What does `len("Hello, World!")` return?
2. What does `17 % 5` equal?
3. What type does `input()` always return?
4. Fix this: `print("Hello " + 42)`
5. What does `"Python"[2:5]` return?
6. What's the PEP 8 style for a constant?

**Answers:** 1) 13, 2) 2, 3) string, 4) `print("Hello " + str(42))`, 5) "tho", 6) ALL_CAPS_WITH_UNDERSCORES

---

### Part 2: Project Planning (30 minutes)

#### Explanation

**Mini Project: Personal Multi-Function Calculator**

You'll build a calculator with 5 functions:
1. Basic arithmetic (add, subtract, multiply, divide)
2. Area calculator (rectangle, circle, triangle)
3. Unit converter (temperature, length, weight)
4. Tip and bill splitter
5. Grade average calculator

The calculator should:
- Display a main menu
- Ask the user which function they want
- Run that function with appropriate inputs
- Display results clearly
- Be fully commented and well-styled

> For now we'll implement "running a function based on choice" by checking what the user typed in simple if/else (even though we haven't formally covered conditions - we'll preview them here and learn them properly in Course 3).

#### Project Structure

```
personal_calculator.py
├── Program header (docstring)
├── Constants section
├── Main menu display
├── User choice input
├── Function 1: Basic Arithmetic
├── Function 2: Area Calculator
├── Function 3: Unit Converter
├── Function 4: Tip & Bill Splitter
└── Function 5: Grade Calculator
```

#### Examples

**The main menu (template):**
```python
"""
Personal Multi-Function Calculator
====================================
A comprehensive calculator for everyday use.

Functions:
    1. Basic Arithmetic
    2. Area Calculator
    3. Unit Converter
    4. Tip & Bill Splitter
    5. Grade Calculator

Author: [Your Name]
Date: [Today's Date]
"""

# ========================
# CONSTANTS
# ========================
PI = 3.14159265358979
CM_PER_INCH = 2.54
KM_PER_MILE = 1.60934

# ========================
# DISPLAY MAIN MENU
# ========================
print("╔══════════════════════════════════════╗")
print("║   PERSONAL MULTI-FUNCTION CALCULATOR ║")
print("╚══════════════════════════════════════╝")
print()
print("  What would you like to calculate?")
print()
print("  1. Basic Arithmetic (+ - × ÷)")
print("  2. Area Calculator (shapes)")
print("  3. Unit Converter")
print("  4. Tip & Bill Splitter")
print("  5. Grade Average Calculator")
print()

choice = input("Enter your choice (1-5): ")

# ========================
# ROUTE TO FUNCTION
# ========================
print()
print(f"{'─' * 40}")

if choice == "1":
    print("  BASIC ARITHMETIC")
    # ... arithmetic code ...

elif choice == "2":
    print("  AREA CALCULATOR")
    # ... area code ...

# etc.
```

---

### Part 3 & 4: Build the Project (60 minutes)

#### Full Project Solution

Here is a complete implementation. Students should write their own version - this is for reference only:

```python
"""
Personal Multi-Function Calculator
====================================
A comprehensive calculator for everyday mathematical needs.
Built as the Course 1 capstone project.

Features:
    1. Basic Arithmetic
    2. Area Calculator
    3. Unit Converter
    4. Tip & Bill Splitter
    5. Grade Average Calculator

Author: [Your Name]
Course: Python Fundamentals - Lesson 10
"""

# ========================
# CONSTANTS
# ========================
PI = 3.14159265358979    # Pi for circle calculations
CM_PER_INCH = 2.54       # Centimeters per inch
KM_PER_MILE = 1.60934    # Kilometers per mile
LBS_PER_KG = 2.20462     # Pounds per kilogram

# ========================
# HELPER: Display separator
# ========================
SEPARATOR = "─" * 42

# ========================
# MAIN MENU
# ========================
print("╔══════════════════════════════════════════╗")
print("║   PERSONAL MULTI-FUNCTION CALCULATOR     ║")
print("╚══════════════════════════════════════════╝")
print()
print("  What would you like to calculate?")
print()
print("  1 → Basic Arithmetic  (+  -  ×  ÷)")
print("  2 → Area Calculator   (rect, circle, triangle)")
print("  3 → Unit Converter    (temp, length, weight)")
print("  4 → Tip & Bill Split  (restaurant helper)")
print("  5 → Grade Calculator  (average & letter grade)")
print()
print(SEPARATOR)

choice = input("  Enter your choice (1-5): ").strip()
print(SEPARATOR)
print()

# ========================
# FUNCTION 1: Basic Arithmetic
# ========================
if choice == "1":
    print("  BASIC ARITHMETIC CALCULATOR")
    print()

    num1 = float(input("  Enter first number: "))
    num2 = float(input("  Enter second number: "))

    sum_result = num1 + num2
    diff_result = num1 - num2
    product_result = num1 * num2

    if num2 != 0:
        quotient_result = num1 / num2
        quotient_display = f"{quotient_result:.4f}"
    else:
        quotient_display = "undefined (cannot divide by zero)"

    print()
    print(f"  Results for {num1} and {num2}:")
    print(SEPARATOR)
    print(f"  Addition:       {num1} + {num2} = {sum_result}")
    print(f"  Subtraction:    {num1} - {num2} = {diff_result}")
    print(f"  Multiplication: {num1} × {num2} = {product_result}")
    print(f"  Division:       {num1} ÷ {num2} = {quotient_display}")

# ========================
# FUNCTION 2: Area Calculator
# ========================
elif choice == "2":
    print("  AREA CALCULATOR")
    print()
    print("  Shapes: 1=Rectangle  2=Circle  3=Triangle")
    shape_choice = input("  Choose shape (1-3): ").strip()

    print()

    if shape_choice == "1":
        length = float(input("  Rectangle length: "))
        width = float(input("  Rectangle width: "))
        area = length * width
        perimeter = 2 * (length + width)
        print(f"\n  Rectangle {length} × {width}:")
        print(f"  Area:      {area:.2f} square units")
        print(f"  Perimeter: {perimeter:.2f} units")

    elif shape_choice == "2":
        radius = float(input("  Circle radius: "))
        area = PI * radius ** 2
        circumference = 2 * PI * radius
        print(f"\n  Circle with radius {radius}:")
        print(f"  Area:          {area:.2f} square units")
        print(f"  Circumference: {circumference:.2f} units")

    elif shape_choice == "3":
        base = float(input("  Triangle base: "))
        height = float(input("  Triangle height: "))
        area = 0.5 * base * height
        print(f"\n  Triangle base={base}, height={height}:")
        print(f"  Area: {area:.2f} square units")

# ========================
# FUNCTION 3: Unit Converter
# ========================
elif choice == "3":
    print("  UNIT CONVERTER")
    print()
    print("  1=Temperature  2=Length  3=Weight")
    unit_choice = input("  Choose conversion (1-3): ").strip()

    print()

    if unit_choice == "1":
        celsius = float(input("  Temperature in Celsius: "))
        fahrenheit = (celsius * 9/5) + 32
        kelvin = celsius + 273.15
        print(f"\n  {celsius}°C converts to:")
        print(f"  Fahrenheit: {fahrenheit:.1f}°F")
        print(f"  Kelvin:     {kelvin:.2f}K")

    elif unit_choice == "2":
        km = float(input("  Distance in kilometers: "))
        miles = km / KM_PER_MILE
        meters = km * 1000
        cm = km * 100000
        inches = cm / CM_PER_INCH
        print(f"\n  {km} km converts to:")
        print(f"  Miles:   {miles:.3f} mi")
        print(f"  Meters:  {meters:.0f} m")
        print(f"  Inches:  {inches:.0f} in")

    elif unit_choice == "3":
        kg = float(input("  Weight in kilograms: "))
        lbs = kg * LBS_PER_KG
        grams = kg * 1000
        print(f"\n  {kg} kg converts to:")
        print(f"  Pounds: {lbs:.2f} lbs")
        print(f"  Grams:  {grams:.0f} g")

# ========================
# FUNCTION 4: Tip & Bill Splitter
# ========================
elif choice == "4":
    print("  TIP & BILL SPLITTER")
    print()

    bill_amount = float(input("  Total bill amount ($): "))
    tip_percent = float(input("  Tip percentage (e.g., 20): "))
    num_people = int(input("  Number of people splitting: "))

    tip_amount = bill_amount * (tip_percent / 100)
    total_bill = bill_amount + tip_amount
    per_person = total_bill / num_people

    print()
    print(f"  Bill Summary:")
    print(SEPARATOR)
    print(f"  Original bill:   ${bill_amount:.2f}")
    print(f"  Tip ({tip_percent}%):       ${tip_amount:.2f}")
    print(f"  Total:           ${total_bill:.2f}")
    print(f"  Per person:      ${per_person:.2f}")
    print(f"  (Splitting {num_people} ways)")

# ========================
# FUNCTION 5: Grade Calculator
# ========================
elif choice == "5":
    print("  GRADE AVERAGE CALCULATOR")
    print()

    num_grades = int(input("  How many grades? "))
    total = 0

    for i in range(1, num_grades + 1):
        grade = float(input(f"  Grade {i}: "))
        total += grade

    average = total / num_grades

    if average >= 90:
        letter = "A"
    elif average >= 80:
        letter = "B"
    elif average >= 70:
        letter = "C"
    elif average >= 60:
        letter = "D"
    else:
        letter = "F"

    print()
    print(f"  Grade Summary:")
    print(SEPARATOR)
    print(f"  Number of grades: {num_grades}")
    print(f"  Total points:     {total:.1f}")
    print(f"  Average:          {average:.1f}")
    print(f"  Letter grade:     {letter}")

else:
    print(f"  Invalid choice '{choice}'. Please run again and choose 1-5.")

# ========================
# FOOTER
# ========================
print()
print(SEPARATOR)
print("  Thank you for using Personal Calculator!")
print(SEPARATOR)
```

> **Teacher's Note:** This is a preview of some features (like `for` loops) that will be taught in Course 3. That's intentional - seeing them in context first makes learning them later easier. Don't explain them deeply now - just show they work.

---

## Key Takeaways

- **Course 1 complete!** You know: print, input, math, strings, variables, comments, style, debugging
- A real program combines many concepts - planning before coding is essential
- **Mini project skills**: menu-driven programs, section organization, formatted output
- Your foundation is solid for Course 2 (Data Types & Variables)

---

## Course 1 Completion Checklist

Before moving to Course 2, verify you can:
- [ ] Write and run a Python program in VS Code
- [ ] Use `print()` with f-strings for formatted output
- [ ] Collect user input with `input()` and convert it to int/float
- [ ] Perform all arithmetic operations: + - * / // % **
- [ ] Work with strings: indexing, slicing, methods (upper, lower, strip, replace)
- [ ] Write comments and follow PEP 8 style basics
- [ ] Read error messages and find bugs with print debugging

If any of those feel shaky, review that lesson before Course 2!

---

## Homework / Self-Study

1. **Complete the project:** If you didn't finish the calculator in class, complete it at home. All 5 functions must work.

2. **Extend it:** Add a 6th function of your own design to the calculator. What would be useful to you personally?

3. **Reflect:** Write 3-4 sentences: What was the hardest concept in Course 1? What clicked easily? What are you most excited to learn next?

---

## You've Completed Course 1!

Congratulations! You started knowing nothing about programming and you can now:
- Write real Python programs
- Build interactive applications
- Handle numbers, text, and user input
- Write clean, well-styled, commented code
- Find and fix bugs

**Next: [Course 2 - Data Types & Variables](../02-data-types-variables/README.md)**

---

[← Previous Lesson](./lesson-09-debugging-basics.md) | [Back to Course Overview](./README.md) | [Next Course →](../02-data-types-variables/README.md)

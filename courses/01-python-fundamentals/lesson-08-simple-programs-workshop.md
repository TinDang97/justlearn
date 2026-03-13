# Lesson 8: Simple Programs Workshop

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

By the end of this lesson, students will be able to:
- Build complete, polished programs from scratch
- Apply the full development process: plan → code → test → improve
- Combine print(), input(), math, strings, and code style in one project
- Give and receive constructive code feedback
- Debug programs systematically when they don't work

---

## Prerequisites

- Lessons 1-7: All Python fundamentals completed

---

## Lesson Outline

### Part 1: The Development Process (30 minutes)

#### Explanation

So far you've learned the building blocks of Python. Now let's talk about how to actually build something from a blank screen.

**The 4-step development process:**

**Step 1: Understand the problem**
- What should the program do?
- What inputs does it need?
- What outputs should it produce?
- What calculations are needed?

**Step 2: Plan with pseudocode**
- Write the steps in plain English first
- No Python syntax - just logic
- This is your roadmap

**Step 3: Write the code**
- Translate each pseudocode step to Python
- Start simple, add complexity gradually
- Test as you go (don't write 50 lines then test)

**Step 4: Test and improve**
- Run with different inputs
- Find edge cases (what if input is 0? Very large? Decimal?)
- Refactor: make it cleaner, better-named, better-commented

#### Explanation

**Let's walk through the process together.**

**Problem:** Build a fitness tracker that calculates daily calories burned.

**Step 1 - Understand:**
- Input: weight, exercise type, duration
- Process: Calculate calories based on MET values
- Output: Calories burned, summary

**Step 2 - Pseudocode:**
```
GET user's name
GET user's weight in kg
GET exercise type (walking, running, cycling)
GET exercise duration in minutes

CALCULATE calories using formula:
   Calories = MET * weight_kg * (duration_minutes / 60)

WHERE MET values are:
   Walking = 3.5
   Running = 8.0
   Cycling = 6.0

DISPLAY formatted summary with all information
```

**Step 3 - Code it:**

```python
"""
Fitness Tracker - Calorie Calculator
Calculates calories burned during exercise.
"""

# MET (Metabolic Equivalent of Task) values
MET_WALKING = 3.5
MET_RUNNING = 8.0
MET_CYCLING = 6.0

# Get user information
print("=== Fitness Calorie Tracker ===\n")
user_name = input("Your name: ")
weight_kg = float(input("Your weight (kg): "))
exercise_type = input("Exercise type (walking/running/cycling): ")
duration_minutes = float(input("Duration (minutes): "))

# Select MET value based on exercise type
if exercise_type.lower() == "walking":
    met_value = MET_WALKING
elif exercise_type.lower() == "running":
    met_value = MET_RUNNING
else:
    met_value = MET_CYCLING  # Default to cycling

# Calculate calories
calories_burned = met_value * weight_kg * (duration_minutes / 60)

# Display results
print(f"\n{'=' * 40}")
print(f"  WORKOUT SUMMARY FOR {user_name.upper()}")
print(f"{'=' * 40}")
print(f"Exercise:    {exercise_type.title()}")
print(f"Duration:    {duration_minutes:.0f} minutes")
print(f"Weight:      {weight_kg} kg")
print(f"Calories:    {calories_burned:.0f} kcal")
print(f"{'=' * 40}")
```

> **Teacher's Note:** Walk through this live with the class. Code it together, step by step, with students directing you. This collaborative coding session is valuable.

#### Practice

**Identify the steps:**
For the following problem, write out the 4 steps before coding anything:
"Build a program that calculates how long it takes to drive somewhere, given the distance and speed."

---

### Part 2: Program 1 - Trip Planner (30 minutes)

#### Explanation

Now you'll build a complete program. This is a guided build with explanations.

**Program: Road Trip Planner**

Takes distance, speed, fuel efficiency, and fuel price. Outputs trip time and fuel cost.

#### Examples

```python
"""
Road Trip Planner
Calculates trip time and fuel cost for a road trip.

Inputs:
    - Distance in kilometers
    - Average speed in km/h
    - Car's fuel efficiency in km/liter
    - Fuel price per liter

Outputs:
    - Travel time (hours and minutes)
    - Fuel needed (liters)
    - Fuel cost (total price)
    - Average speed summary

Author: [Your name]
"""

# ==============================
# USER INPUT
# ==============================
print("╔══════════════════════════════╗")
print("║      ROAD TRIP PLANNER       ║")
print("╚══════════════════════════════╝")
print()

destination = input("Where are you going? ")
distance_km = float(input("Distance to destination (km): "))
avg_speed_kmh = float(input("Average driving speed (km/h): "))
fuel_efficiency = float(input("Car fuel efficiency (km/liter): "))
fuel_price = float(input("Fuel price per liter ($): "))

# ==============================
# CALCULATIONS
# ==============================

# Time calculation
total_hours = distance_km / avg_speed_kmh
full_hours = int(total_hours)
remaining_minutes = int((total_hours - full_hours) * 60)

# Fuel calculation
liters_needed = distance_km / fuel_efficiency
total_fuel_cost = liters_needed * fuel_price

# ==============================
# DISPLAY RESULTS
# ==============================
print()
print(f"┌{'─' * 38}┐")
print(f"│  TRIP SUMMARY: {destination.upper():<22}│")
print(f"├{'─' * 38}┤")
print(f"│  Distance:      {distance_km:>10.0f} km         │")
print(f"│  Travel time:   {full_hours} hr {remaining_minutes} min              │")
print(f"│  Fuel needed:   {liters_needed:>10.1f} liters      │")
print(f"│  Fuel cost:     ${total_fuel_cost:>9.2f}           │")
print(f"└{'─' * 38}┘")
print()
print(f"Have a safe trip to {destination}!")
```

#### Practice

**Extend the program:** Add a rest stop calculator - if the trip is more than 4 hours, the program should suggest one 30-minute stop.

---

### Part 3: Program 2 - Student Report Card (30 minutes)

#### Explanation

A more complex program that processes multiple grades and generates a report.

#### Examples

```python
"""
Student Report Card Generator
Creates a formatted report card from grade inputs.
"""

# Number of subjects
NUM_SUBJECTS = 5

print("=================================")
print("   STUDENT REPORT CARD SYSTEM   ")
print("=================================\n")

# Student information
student_name = input("Student name: ")
student_id = input("Student ID: ")
semester = input("Semester (e.g., Fall 2024): ")

print("\nEnter grades for each subject:")
print("-" * 30)

# Collect grades
math_grade = float(input("Mathematics: "))
english_grade = float(input("English: "))
science_grade = float(input("Science: "))
history_grade = float(input("History: "))
python_grade = float(input("Python Programming: "))

# Calculations
total_points = math_grade + english_grade + science_grade + history_grade + python_grade
average = total_points / NUM_SUBJECTS
highest = max(math_grade, english_grade, science_grade, history_grade, python_grade)
lowest = min(math_grade, english_grade, science_grade, history_grade, python_grade)

# Determine letter grade
if average >= 90:
    letter_grade = "A"
    remark = "Excellent!"
elif average >= 80:
    letter_grade = "B"
    remark = "Good work!"
elif average >= 70:
    letter_grade = "C"
    remark = "Satisfactory"
elif average >= 60:
    letter_grade = "D"
    remark = "Needs improvement"
else:
    letter_grade = "F"
    remark = "Please see instructor"

# Display report card
print()
print("=" * 45)
print(f"           STUDENT REPORT CARD")
print("=" * 45)
print(f"  Name:     {student_name}")
print(f"  ID:       {student_id}")
print(f"  Semester: {semester}")
print("-" * 45)
print(f"  {'Subject':<22} {'Grade':>8}")
print("-" * 45)
print(f"  {'Mathematics':<22} {math_grade:>8.1f}")
print(f"  {'English':<22} {english_grade:>8.1f}")
print(f"  {'Science':<22} {science_grade:>8.1f}")
print(f"  {'History':<22} {history_grade:>8.1f}")
print(f"  {'Python Programming':<22} {python_grade:>8.1f}")
print("-" * 45)
print(f"  {'Average':<22} {average:>8.1f}")
print(f"  {'Letter Grade':<22} {letter_grade:>8}")
print("=" * 45)
print(f"  Remark: {remark}")
print("=" * 45)
```

---

### Part 4: Program 3 - Build Your Own (30 minutes)

#### Exercise 1: Peer Code Review

Swap your code from Part 2 or Part 3 with a classmate. Review their code:
- Does it run without errors?
- Are variable names descriptive?
- Are there helpful comments?
- Does it produce correct output?
- What one improvement would you suggest?

Give feedback in writing (a 3-4 sentence review).

#### Exercise 2: Your Own Complete Program

Choose ONE of these and build it from scratch, following the 4-step process:

**Option A: Recipe Cost Calculator**
- Input: recipe name, number of servings, ingredients (name and cost each)
- Output: total recipe cost, cost per serving, formatted ingredient list

**Option B: Subscription Manager**
- Input: 3-5 subscription names and monthly costs
- Output: list of subscriptions, monthly total, annual total, ranked by cost

**Option C: Workout Tracker**
- Input: 3 exercises with sets, reps, and weight
- Output: formatted workout summary, total volume per exercise, total volume overall

#### Bonus Challenge

**Build a "Life Stats" generator:**
Inputs: name, birthdate (year only), hours slept per night, coffees per day
Calculate and display:
- Age in years, months, days (approximate)
- Total nights slept in their life (age × 365)
- Total hours slept in their life
- Total coffees consumed in their life (age × 365 × coffees_per_day)
- Fun equivalents: "That's enough coffee to fill X swimming pools" (1 pool ≈ 2,500,000 ml, coffee cup ≈ 250ml)

---

## Key Takeaways

- The **4-step development process**: understand → pseudocode → code → test & improve
- Write pseudocode first - it prevents wasted effort on the wrong approach
- Build programs **section by section** and test each section before adding more
- **Peer review** makes code better - learning to give and receive feedback is a professional skill
- Real programs combine many concepts: input, math, strings, formatting
- A polished program with clean formatting, descriptive names, and comments is something to be proud of

---

## Common Mistakes to Avoid

- **Coding before planning:** Starting to type before understanding the problem leads to wasted work
- **Not testing incrementally:** Write 5 lines, test. Write 5 more, test. Don't write 50 lines then test.
- **Perfectionism paralysis:** Get it working first, make it beautiful second
- **Ignoring edge cases:** What if the user enters 0 for speed? Negative numbers? Test unusual inputs.

---

## Homework / Self-Study

1. **Finish:** Complete whichever Exercise 2 option you chose in class. Polish it to professional quality.

2. **Write about:** In a few sentences, describe the program you most want to build by the end of this course. What would it do? Who would use it?

3. **Preview:** Look up "Python if statement" - we'll use this in Lesson 9 for debugging. Don't need to learn it, just get curious.

---

## Next Lesson Preview

In **Lesson 9: Debugging Basics**, we'll:
- Learn the 3 types of errors in Python: syntax, runtime, and logic
- Practice reading error messages like a detective
- Learn print-based debugging (the most powerful beginner tool)
- Build a systematic approach to fixing broken code

---

[← Previous Lesson](./lesson-07-comments-and-code-style.md) | [Back to Course Overview](./README.md) | [Next Lesson →](./lesson-09-debugging-basics.md)

# Lesson 5: While Loops

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Write while loops with correct termination conditions
- Identify and prevent infinite loops
- Use while loops for input validation
- Implement counters and accumulators with while loops
- Apply the "do...while" pattern in Python

---

## Prerequisites

- Lessons 1-4: All conditionals

---

## Lesson Outline

### Part 1: The while Loop (30 minutes)

#### Explanation

A `while` loop repeats a block of code as long as a condition remains True. It's Python's way of saying "keep doing this UNTIL something changes."

```python
while condition:
    # Body: runs repeatedly while condition is True
    # You MUST modify something to eventually make condition False
    # Otherwise: infinite loop!
```

**Analogy:** While loops are like a washing machine. It keeps spinning while there's still dirt (condition = `is_dirty`). When the clothes are clean (condition becomes False), it stops.

```python
count = 1

while count <= 5:
    print(f"Count: {count}")
    count += 1   # This MUST happen or we loop forever!

print("Loop finished")
```

**The three required parts of a safe while loop:**
1. **Initialize** the loop variable before the loop
2. **Condition** that will eventually become False
3. **Update** the variable inside the loop to make condition False eventually

#### Examples

```python
# Countdown timer
seconds = 10

while seconds > 0:
    print(f"Countdown: {seconds}...")
    seconds -= 1

print("Blast off! 🚀")

# Sum of numbers
total = 0
num = 1

while num <= 100:
    total += num
    num += 1

print(f"Sum of 1 to 100: {total}")   # 5050
```

> **Teacher's Note:** The sum of 1 to 100 = 5050 is a famous result (Gauss calculated this as a child). Good talking point about how computers handle repetition effortlessly.

#### Practice

Write while loops to:
1. Print all even numbers from 2 to 20
2. Calculate 2^n until it exceeds 1000
3. Count down from 100 to 0 by 5s

---

### Part 2: Input Validation with while (30 minutes)

#### Explanation

The most practical use of while loops for beginners: keep asking until the user provides valid input.

```python
# "Keep asking until we get a valid age"
age = -1   # Initialize to invalid value to enter loop

while age < 0 or age > 150:
    age = int(input("Enter your age (0-150): "))
    if age < 0 or age > 150:
        print("Invalid age! Try again.")

print(f"Your age is: {age}")
```

**Standard input validation pattern:**
```python
while True:   # Loop forever until we break out
    user_input = input("Enter a positive number: ")

    if user_input.isdigit() and int(user_input) > 0:
        number = int(user_input)
        break   # Exit the loop (we'll cover break properly in Lesson 7)
    else:
        print("Invalid! Please enter a positive whole number.")

print(f"You entered: {number}")
```

#### Examples

```python
# Menu-driven program (the classic while loop use case!)
print("Simple Calculator")

while True:
    print("\nChoose operation:")
    print("  1. Addition")
    print("  2. Subtraction")
    print("  3. Multiplication")
    print("  4. Division")
    print("  5. Quit")

    choice = input("Enter choice (1-5): ")

    if choice == "5":
        print("Goodbye!")
        break

    if choice not in ["1", "2", "3", "4"]:
        print("Invalid choice!")
        continue   # Skip rest of loop, go back to top

    num1 = float(input("First number: "))
    num2 = float(input("Second number: "))

    if choice == "1":
        print(f"Result: {num1 + num2}")
    elif choice == "2":
        print(f"Result: {num1 - num2}")
    elif choice == "3":
        print(f"Result: {num1 * num2}")
    elif choice == "4":
        if num2 != 0:
            print(f"Result: {num1 / num2:.4f}")
        else:
            print("Error: Cannot divide by zero!")
```

#### Practice

Build a "quiz game" using a while loop: ask 5 questions, keep score, display result at the end. After each wrong answer, show the correct answer.

---

### Part 3: Common while Loop Patterns (30 minutes)

#### Explanation

Learn to recognize these standard patterns:

**Counter pattern:**
```python
count = 0
while condition:
    count += 1
    # ... body ...
```

**Accumulator pattern:**
```python
total = 0
while condition:
    total += new_value
```

**Search pattern:**
```python
found = False
while not found and more_to_check:
    if current_item_matches:
        found = True
    # else: advance to next item
```

**Sentinel pattern (special "quit" value):**
```python
while True:
    value = input("Enter number (or 'done'): ")
    if value == 'done':
        break
    total += float(value)
```

#### Examples

```python
# Number guessing game! (First real interactive game)
import random

secret = random.randint(1, 100)
attempts = 0
max_attempts = 7

print("I'm thinking of a number between 1 and 100!")
print(f"You have {max_attempts} attempts.")

while attempts < max_attempts:
    attempts += 1
    guess = int(input(f"Attempt {attempts}: "))

    if guess == secret:
        print(f"Correct! You got it in {attempts} attempts!")
        break
    elif guess < secret:
        print(f"Too low! {max_attempts - attempts} attempts remaining.")
    else:
        print(f"Too high! {max_attempts - attempts} attempts remaining.")
else:
    # This runs if while condition becomes False (not if break was used)
    print(f"Out of attempts! The number was {secret}.")
```

#### Practice

Build a "grade collector" using the sentinel pattern: keep collecting grades until user enters -1, then display the average.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Number Guessing Game Enhanced

Extend the guessing game:
- Give hints: "Getting warmer/colder" based on proximity
- Track best score (fewest attempts ever)
- Ask "Play again?" after each game

#### Exercise 2: Bank Account Simulator

```python
balance = 1000.00

# Menu options: deposit, withdraw, check balance, quit
# Validation: can't withdraw more than balance
# Show running balance after each transaction
# Show transaction history at the end
```

#### Bonus Challenge

**Collatz Conjecture:** Starting from any positive integer:
- If even: divide by 2
- If odd: multiply by 3 and add 1
- Repeat until reaching 1

Build a program that runs this process, displays each step, and counts how many steps until reaching 1. Try starting numbers 27, 97, 871.

---

## Key Takeaways

- `while condition:` loops WHILE condition is True
- Three parts: **initialize** → **condition** → **update**
- Always ensure the loop will eventually terminate
- **Input validation pattern**: `while True: ... break` when valid
- **Menu pattern**: while loop + if/elif for choices
- `while...else`: else block runs when condition becomes False (not on break)

---

## Common Mistakes to Avoid

- **Forgetting to update**: `while count <= 10:` without `count += 1` = infinite loop
- **Wrong condition direction**: `while count > 0:` but starting at 0 never enters
- **Using = instead of ==**: `while x = 5:` is a SyntaxError

---

## Homework

1. Build a "temperature converter menu" that keeps running until user quits
2. Implement a "20 questions" game using a while loop (you have 20 yes/no questions to guess a number 1-1000)

---

[← Previous](./lesson-04-logical-operators.md) | [Back to Course](./README.md) | [Next →](./lesson-06-for-loops-range.md)

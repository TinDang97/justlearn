# Lesson 7: Loop Control (break/continue/pass)

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use `break` to exit a loop early
- Use `continue` to skip the current iteration
- Use `pass` as a placeholder
- Use the `else` clause on loops
- Apply loop control in search, validation, and filtering patterns

---

## Prerequisites

- Lessons 5-6: while and for loops

---

## Lesson Outline

### Part 1: break - Exit Early (30 minutes)

#### Explanation

`break` immediately exits the innermost loop. When Python hits `break`, it stops the loop and continues with whatever code comes after the loop.

```python
# Without break:
for i in range(10):
    print(i)   # Prints 0 through 9

# With break:
for i in range(10):
    if i == 5:
        break   # Stop when we reach 5
    print(i)   # Prints 0 through 4
```

**When to use break:**
- When you've found what you're looking for
- When an error condition is met
- When the user requests to quit

#### Examples

```python
# Search: find first multiple of 7 after 50
for n in range(51, 200):
    if n % 7 == 0:
        print(f"Found: {n}")
        break   # Stop looking once found

# Login attempt limiter
MAX_ATTEMPTS = 3
correct_password = "python123"

for attempt in range(1, MAX_ATTEMPTS + 1):
    password = input(f"Password (attempt {attempt}/{MAX_ATTEMPTS}): ")
    if password == correct_password:
        print("Access granted!")
        break
    if attempt < MAX_ATTEMPTS:
        print("Wrong password. Try again.")
else:
    print("Too many failed attempts. Account locked.")
```

#### Practice

Write a search program: look for the first even perfect square between 50 and 500.

---

### Part 2: continue - Skip Iteration (30 minutes)

#### Explanation

`continue` skips the rest of the current iteration and goes back to the loop condition/next item. It doesn't exit the loop - just skips this one step.

```python
# Skip odd numbers
for i in range(1, 11):
    if i % 2 != 0:
        continue   # Skip odd numbers
    print(i)       # Only prints 2, 4, 6, 8, 10
```

**Analogy:** You're reading a book. `break` = close the book and stop reading. `continue` = skip this chapter, go to next.

#### Examples

```python
# Process only valid grades (skip invalid inputs)
grades = [85, -5, 92, 101, 78, 0, 95, 88]
valid_grades = []
total = 0

for grade in grades:
    if grade < 0 or grade > 100:
        print(f"Skipping invalid grade: {grade}")
        continue
    valid_grades.append(grade)
    total += grade

print(f"Valid grades: {valid_grades}")
print(f"Average: {total / len(valid_grades):.1f}")

# Skip empty strings
names = ["Alice", "", "Bob", "  ", "Carol", "", "David"]
for name in names:
    if not name.strip():
        continue
    print(f"Hello, {name.strip()}!")
```

#### Practice

Filter a list: print only items that are positive, between 10 and 100, and even.

---

### Part 3: pass and Loop else (30 minutes)

#### Explanation

**pass - do nothing:**
`pass` is a placeholder - it does nothing. Use it when Python requires a statement but you don't want to do anything.

```python
# Placeholder while building:
for item in collection:
    pass   # TODO: implement later

if condition:
    handle_true()
else:
    pass   # Nothing to do in false case (or omit else entirely)
```

**The loop else clause:**
An `else` block on a loop runs ONLY if the loop completes normally (without `break`):

```python
for i in range(5):
    if i == 10:   # Never true
        break
    print(i)
else:
    print("Loop finished without break!")   # This runs

for i in range(10):
    if i == 5:
        break   # Loop broken at 5
    print(i)
else:
    print("This does NOT run")   # Skipped because break was used
```

**Practical use of loop else:**
```python
# Search pattern with loop else:
target = 42
numbers = [10, 25, 37, 42, 55, 68]

for num in numbers:
    if num == target:
        print(f"Found {target}!")
        break
else:
    print(f"{target} not found in the list")
```

#### Examples

```python
# Prime checker using loop else (classic example)
n = int(input("Check if prime: "))

if n < 2:
    print(f"{n} is not prime")
else:
    for divisor in range(2, int(n**0.5) + 1):
        if n % divisor == 0:
            print(f"{n} is NOT prime (divisible by {divisor})")
            break
    else:
        print(f"{n} IS prime!")
```

#### Practice

Use loop else to implement a "unique word finder" - check if a word appears in a sentence.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Word Filter

Given a paragraph of text:
- Skip words shorter than 3 characters
- Skip words containing numbers
- Stop after finding 10 valid words
- Display the filtered words

#### Exercise 2: Enhanced Number Guessing Game

Add to the guessing game:
- Use break when correct answer is found
- Use continue to skip invalid inputs (non-numbers)
- Use loop else to handle "no more attempts"

#### Bonus Challenge

**Sieve of Eratosthenes:** Find all primes up to N using the ancient Greek algorithm. Use break and continue appropriately for efficiency.

---

## Key Takeaways

- `break`: immediately exits the loop
- `continue`: skips rest of current iteration, goes to next
- `pass`: does nothing - placeholder
- `for/while ... else:` - else runs only if loop completed without break
- Common use: `break` when found, `else` when not found

---

## Common Mistakes to Avoid

- **break in nested loops**: only exits the INNERMOST loop
- **Using break where continue is needed**: break exits loop entirely; continue skips only this iteration

---

## Homework

1. Build a "shopping list manager" using loop control: add items (continue past blanks), display when user types 'done' (break)
2. Implement a spell-checker that skips proper nouns (capitalized words) using continue

---

[← Previous](./lesson-06-for-loops-range.md) | [Back to Course](./README.md) | [Next →](./lesson-08-nested-loops.md)

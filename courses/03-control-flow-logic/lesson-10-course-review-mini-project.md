# Lesson 10: Course 3 Review & Mini Project - ATM Simulator

**Course:** Control Flow & Logic | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Review all control flow concepts from Course 3
- Build a complete ATM simulator using all concepts
- Practice menu loops, conditionals, and input validation

---

## Prerequisites

- All 9 lessons of Course 3

---

## Course 3 Review

```python
# if/elif/else - decisions
if score >= 90: grade = "A"
elif score >= 80: grade = "B"
else: grade = "F"

# Logical operators
if age >= 18 and is_citizen:
    can_vote = True

# while loop - input validation
while True:
    value = int(input("Enter 1-10: "))
    if 1 <= value <= 10:
        break

# for loop with range
for i in range(1, 11):
    print(i * i)

# break, continue
for item in items:
    if invalid(item): continue
    if done(item): break
    process(item)
```

---

## Mini Project: ATM Simulator

```python
"""
ATM Simulator
=============
A realistic ATM simulation with all Course 3 concepts:
- while loop for menu
- if/elif/else for operations
- input validation
- break/continue for flow control
"""

import random

# Constants
PIN = "1234"
INITIAL_BALANCE = 1000.00
MAX_WITHDRAWAL = 500.00
TRANSACTION_FEE = 2.50

# State
balance = INITIAL_BALANCE
transaction_history = []

def display_header():
    print("\n" + "=" * 40)
    print("        PYTHON NATIONAL BANK")
    print("=" * 40)

def get_valid_amount(prompt, max_amount=None):
    while True:
        try:
            amount = float(input(prompt))
            if amount <= 0:
                print("Amount must be positive!")
                continue
            if max_amount and amount > max_amount:
                print(f"Maximum allowed: ${max_amount:.2f}")
                continue
            return amount
        except ValueError:
            print("Please enter a valid number!")

# PIN verification
display_header()
print("\nWelcome to Python National Bank ATM")
print()

for attempt in range(3):
    entered_pin = input(f"Enter PIN (attempt {attempt+1}/3): ")
    if entered_pin == PIN:
        print("✓ PIN accepted!")
        break
    if attempt < 2:
        print("✗ Wrong PIN. Try again.")
else:
    print("Too many attempts. Card blocked.")
    exit()

# Main ATM loop
while True:
    print(f"\nBalance: ${balance:,.2f}")
    print("\nWhat would you like to do?")
    print("  1. Check Balance")
    print("  2. Deposit")
    print("  3. Withdraw")
    print("  4. Transfer")
    print("  5. Transaction History")
    print("  6. Exit")

    choice = input("\nChoice (1-6): ").strip()

    if choice == "1":
        print(f"\n💳 Current Balance: ${balance:,.2f}")

    elif choice == "2":
        amount = get_valid_amount("Deposit amount: $")
        balance += amount
        transaction_history.append(f"DEPOSIT: +${amount:.2f}")
        print(f"✓ Deposited ${amount:.2f}. New balance: ${balance:.2f}")

    elif choice == "3":
        if balance < TRANSACTION_FEE:
            print("Insufficient funds for withdrawal (including fee)")
            continue
        amount = get_valid_amount(f"Withdraw amount (max ${MAX_WITHDRAWAL:.0f}): $",
                                    max_amount=min(MAX_WITHDRAWAL, balance - TRANSACTION_FEE))
        balance -= (amount + TRANSACTION_FEE)
        transaction_history.append(f"WITHDRAW: -${amount:.2f} (fee: ${TRANSACTION_FEE:.2f})")
        print(f"✓ Dispensing ${amount:.2f}. Fee: ${TRANSACTION_FEE:.2f}. Balance: ${balance:.2f}")

    elif choice == "4":
        recipient = input("Recipient account number: ")
        amount = get_valid_amount("Transfer amount: $", max_amount=balance)
        balance -= amount
        transaction_history.append(f"TRANSFER to {recipient}: -${amount:.2f}")
        print(f"✓ Transferred ${amount:.2f} to account {recipient}")

    elif choice == "5":
        if not transaction_history:
            print("No transactions yet.")
        else:
            print("\n--- Transaction History ---")
            for i, tx in enumerate(transaction_history, 1):
                print(f"  {i}. {tx}")
            print(f"Final balance: ${balance:.2f}")

    elif choice == "6":
        print("\nThank you for banking with Python National Bank!")
        print("Please take your card.")
        break

    else:
        print("Invalid option. Please choose 1-6.")
```

---

## Course 3 Completion Checklist

- [ ] Write if/elif/else chains for multi-way decisions
- [ ] Use logical operators (and/or/not) in conditions
- [ ] Write while loops with proper termination
- [ ] Use for loops with range() and sequences
- [ ] Apply break, continue appropriately
- [ ] Write nested loops for 2D problems
- [ ] Build menu-driven programs with loop+switch pattern

**Next: [Course 4 - Functions & Modules](../04-functions-modules/README.md)**

---

[← Previous Lesson](./lesson-09-pattern-printing-workshop.md) | [Back to Course](./README.md) | [Next Course →](../04-functions-modules/README.md)

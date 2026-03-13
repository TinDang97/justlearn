# Lesson 5: Date & Time

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Work with dates and times using the `datetime` module
- Format and parse date strings
- Handle timezones correctly
- Calculate time differences

---

## Lesson Outline

### Part 1: datetime Module (30 minutes)

#### Explanation

```python
from datetime import datetime, date, time, timedelta

# Current date and time:
now = datetime.now()           # Local time
utc = datetime.utcnow()        # UTC time (naive)

today = date.today()           # Just the date

# Create specific dates:
birthday = date(1990, 6, 15)
meeting = datetime(2024, 3, 20, 14, 30, 0)

# Access components:
print(now.year, now.month, now.day)
print(now.hour, now.minute, now.second)
print(now.weekday())     # 0=Monday, 6=Sunday

# Format (strftime):
print(now.strftime("%Y-%m-%d"))          # 2024-03-20
print(now.strftime("%d/%m/%Y %H:%M"))    # 20/03/2024 14:30
print(now.strftime("%B %d, %Y"))         # March 20, 2024

# Parse string to datetime (strptime):
dt = datetime.strptime("2024-01-15 14:30", "%Y-%m-%d %H:%M")
```

**Common format codes:**
```
%Y = 4-digit year    %m = month (01-12)    %d = day (01-31)
%H = hour (00-23)    %M = minute (00-59)   %S = second (00-59)
%A = weekday name    %B = month name       %f = microseconds
```

#### Practice

Write a function `format_date(dt, style)` that formats a datetime in "US" (Month Day, Year), "EU" (DD/MM/YYYY), or "ISO" (YYYY-MM-DD) style.

---

### Part 2: timedelta and Calculations (30 minutes)

#### Explanation

```python
from datetime import datetime, timedelta

now = datetime.now()

# Arithmetic with dates:
tomorrow = now + timedelta(days=1)
last_week = now - timedelta(weeks=1)
deadline = now + timedelta(days=30, hours=6)

# Difference between dates:
start = datetime(2024, 1, 1)
end = datetime(2024, 3, 20)
diff = end - start   # Returns timedelta
print(diff.days)         # 79
print(diff.total_seconds())  # 6825600.0

# Age calculation:
from datetime import date

def calculate_age(birthdate: date) -> int:
    today = date.today()
    age = today.year - birthdate.year
    # Adjust if birthday hasn't occurred this year:
    if (today.month, today.day) < (birthdate.month, birthdate.day):
        age -= 1
    return age

# Days until event:
def days_until(event_date: date) -> int:
    return (event_date - date.today()).days
```

#### Practice

Write a function that calculates how many working days (Mon-Fri) are between two dates.

---

### Part 3: Timezones (30 minutes)

#### Explanation

```python
from datetime import datetime, timezone, timedelta

# Timezone-aware datetimes:
utc = datetime.now(timezone.utc)
print(utc)   # 2024-03-20 14:30:00+00:00

# Create timezone:
est = timezone(timedelta(hours=-5))    # UTC-5
ist = timezone(timedelta(hours=5, minutes=30))  # UTC+5:30

# Convert between timezones:
utc_time = datetime.now(timezone.utc)
est_time = utc_time.astimezone(est)

# With pytz (install separately):
import pytz
eastern = pytz.timezone("America/New_York")
tokyo = pytz.timezone("Asia/Tokyo")

now_utc = datetime.now(pytz.utc)
now_eastern = now_utc.astimezone(eastern)
now_tokyo = now_utc.astimezone(tokyo)

# ISO format (for APIs and storage):
print(now_utc.isoformat())     # 2024-03-20T14:30:00+00:00
parsed = datetime.fromisoformat("2024-03-20T14:30:00+00:00")
```

> **Teacher's Note:** Always store timestamps in UTC. Convert to local time only for display. "Naive" datetimes (without timezone) are a common source of bugs.

#### Practice

Build a `WorldClock` class that displays the current time in 5 major timezones.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Event Scheduler

Create an `Event` class with:
- `name`, `start_time`, `end_time` (timezone-aware datetimes)
- `duration` property → timedelta
- `is_happening_now()` → bool
- `starts_in()` → timedelta until start
- `format_schedule()` → formatted string

#### Exercise 2: Meeting Time Finder

Given a list of people in different timezones and their availability (9am-5pm local), find overlapping times for a 1-hour meeting.

---

## Key Takeaways

- `datetime.now()` for local time; `datetime.now(timezone.utc)` for UTC
- `strftime()` formats datetime; `strptime()` parses strings
- `timedelta` represents a duration; supports arithmetic with datetimes
- Always store UTC; convert to local time for display only
- Timezone-aware datetimes have `+HH:MM` offset; naive datetimes do not

---

[← Previous](./lesson-04-sqlite-databases.md) | [Back to Course](./README.md) | [Next →](./lesson-06-regular-expressions.md)

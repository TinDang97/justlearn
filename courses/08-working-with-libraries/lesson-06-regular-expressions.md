# Lesson 6: Regular Expressions

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Write basic regex patterns
- Use `re` module functions: search, match, findall, sub
- Use groups to extract data
- Apply regex to real-world text processing

---

## Lesson Outline

### Part 1: Regex Patterns (30 minutes)

#### Explanation

```python
import re

# Basic patterns:
# .     = any character
# *     = 0 or more of previous
# +     = 1 or more of previous
# ?     = 0 or 1 of previous
# ^     = start of string
# $     = end of string
# \d    = digit [0-9]
# \w    = word character [a-zA-Z0-9_]
# \s    = whitespace
# [abc] = character class (a, b, or c)
# [^abc] = NOT a, b, or c

# re.search - find pattern anywhere in string:
text = "Hello World 2024"
match = re.search(r"\d+", text)   # Raw string (use r"..." always)
if match:
    print(match.group())   # "2024"
    print(match.start())   # 12 (position)

# re.match - match at START of string only:
match = re.match(r"\d+", "123 hello")
match = re.match(r"\d+", "hello 123")  # None - doesn't start with digit

# re.findall - return all matches as list:
text = "Phone: 555-1234, Fax: 555-5678"
numbers = re.findall(r"\d{3}-\d{4}", text)
print(numbers)   # ['555-1234', '555-5678']

# re.fullmatch - entire string must match:
valid = re.fullmatch(r"\d{4}-\d{2}-\d{2}", "2024-03-20")  # Match
```

#### Practice

Write patterns to match: ZIP codes (5 digits), US phone numbers, simple email addresses.

---

### Part 2: Groups and Substitution (30 minutes)

#### Explanation

```python
import re

# Groups () capture parts of the match:
pattern = r"(\d{4})-(\d{2})-(\d{2})"
match = re.search(pattern, "Date: 2024-03-20")
if match:
    year, month, day = match.groups()
    print(year, month, day)  # 2024 03 20
    print(match.group(0))    # Entire match: 2024-03-20
    print(match.group(1))    # First group: 2024

# Named groups:
pattern = r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"
match = re.search(pattern, "2024-03-20")
print(match.group("year"))   # 2024
print(match.groupdict())     # {'year': '2024', 'month': '03', 'day': '20'}

# re.sub - replace matches:
text = "Call me at 555-1234 or 555-5678"
cleaned = re.sub(r"\d{3}-\d{4}", "[REDACTED]", text)
print(cleaned)  # Call me at [REDACTED] or [REDACTED]

# Substitution with groups:
date_str = "20/03/2024"
iso_date = re.sub(r"(\d{2})/(\d{2})/(\d{4})", r"\3-\2-\1", date_str)
print(iso_date)  # 2024-03-20

# re.split:
parts = re.split(r"[,;|\s]+", "Alice,Bob; Carol | Dave")
print(parts)   # ['Alice', 'Bob', 'Carol', 'Dave']
```

#### Practice

Write a function `extract_emails(text)` that returns all email addresses found in a string.

---

### Part 3: Compiled Patterns and Flags (30 minutes)

#### Explanation

```python
import re

# Compile for reuse (performance optimization):
email_pattern = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
)

# Now use on multiple strings:
for text in texts:
    matches = email_pattern.findall(text)

# Flags:
# re.IGNORECASE (re.I) - case insensitive
# re.MULTILINE (re.M) - ^ and $ match line start/end
# re.DOTALL (re.S) - . matches newlines too

pattern = re.compile(r"^hello", re.IGNORECASE | re.MULTILINE)
matches = pattern.findall("Hello World\nhello python")
print(matches)  # ['Hello', 'hello']


# Practical: validate and extract from log lines:
LOG_PATTERN = re.compile(
    r"(?P<date>\d{4}-\d{2}-\d{2}) "
    r"(?P<time>\d{2}:\d{2}:\d{2}) "
    r"(?P<level>ERROR|WARNING|INFO|DEBUG) "
    r"(?P<message>.*)"
)

def parse_log_line(line: str) -> dict | None:
    match = LOG_PATTERN.match(line)
    if match:
        return match.groupdict()
    return None

line = "2024-03-20 14:30:00 ERROR Database connection failed"
print(parse_log_line(line))
# {'date': '2024-03-20', 'time': '14:30:00', 'level': 'ERROR',
#  'message': 'Database connection failed'}
```

#### Practice

Write a `LogParser` class that reads a log file and returns ERROR entries between two dates.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Cleaner

Given messy text data, use regex to:
- Normalize phone numbers to (XXX) XXX-XXXX format
- Extract all URLs
- Find all hashtags (#word)
- Remove HTML tags from a string

#### Exercise 2: Text Analyzer

Build a `TextAnalyzer` that:
- Counts sentences (ends with `.`, `!`, `?`)
- Extracts all unique email addresses
- Finds repeated words ("the the")
- Extracts all numbers (integers and floats)

---

## Key Takeaways

- Always use raw strings: `r"\d+"` not `"\d+"`
- `re.search()` → first match anywhere; `re.findall()` → all matches as list
- `()` groups capture parts; `(?P<name>...)` for named groups
- `re.compile()` for patterns used multiple times
- `re.IGNORECASE`, `re.MULTILINE`, `re.DOTALL` are common useful flags

---

[← Previous](./lesson-05-date-time.md) | [Back to Course](./README.md) | [Next →](./lesson-07-pillow-image-processing.md)

# Lesson 11: Collections Module Basics

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Use `Counter` for counting and frequency analysis
- Use `defaultdict` to avoid KeyError on missing keys
- Use `OrderedDict` (and understand Python 3.7+ dict ordering)
- Use `namedtuple` for readable record types
- Use `deque` for efficient queue operations

---

## Prerequisites

- Lessons 1-10: All data structures

---

## Lesson Outline

### Part 1: Counter (30 minutes)

#### Explanation

`Counter` is a dict subclass for counting hashable objects:

```python
from collections import Counter

# Counting elements:
letters = Counter("hello world")
print(letters)
# Counter({'l': 3, 'o': 2, 'h': 1, 'e': 1, ' ': 1, 'w': 1, 'r': 1, 'd': 1})

words = "the quick brown fox jumps over the lazy dog the fox".split()
word_count = Counter(words)
print(word_count.most_common(3))  # [('the', 3), ('fox', 2), ...]

# Arithmetic:
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2, c=4)
print(c1 + c2)   # Counter({'c': 4, 'a': 4, 'b': 3})
print(c1 - c2)   # Counter({'a': 2})  (removes non-positive)
print(c1 & c2)   # Counter({'a': 1, 'b': 1})  (min of each)
print(c1 | c2)   # Counter({'c': 4, 'a': 3, 'b': 2})  (max of each)

# Update (add more counts):
counter = Counter(["apple", "banana"])
counter.update(["apple", "cherry", "apple"])
print(counter)  # Counter({'apple': 3, 'banana': 1, 'cherry': 1})

# Missing keys return 0 (not KeyError):
print(counter["orange"])  # 0
```

#### Examples

```python
# Analyzing exam answers:
correct = Counter("ABCBD")
student = Counter("ABBCD")

# How many did they get right? (intersection)
right = sum((correct & student).values())
print(f"Correct: {right}/{sum(correct.values())}")

# Anagram checker:
def is_anagram(s1, s2):
    return Counter(s1.lower().replace(" ", "")) == Counter(s2.lower().replace(" ", ""))

print(is_anagram("listen", "silent"))  # True
print(is_anagram("hello", "world"))    # False
```

#### Practice

Analyze text: find 10 most common words, find words that appear exactly once, compare word distributions in two documents.

---

### Part 2: defaultdict (30 minutes)

#### Explanation

`defaultdict` creates missing keys automatically with a default value:

```python
from collections import defaultdict

# Without defaultdict (clunky):
word_list = {}
for word in text.split():
    if word not in word_list:
        word_list[word] = []
    word_list[word].append(page_number)

# With defaultdict:
word_list = defaultdict(list)
for word in text.split():
    word_list[word].append(page_number)   # No check needed!

# Other defaults:
dd_int = defaultdict(int)      # Missing keys default to 0
dd_str = defaultdict(str)      # Missing keys default to ""
dd_set = defaultdict(set)      # Missing keys default to set()
dd_list = defaultdict(list)    # Missing keys default to []

# Custom default:
dd_custom = defaultdict(lambda: "Unknown")
dd_custom["x"]   # "Unknown" (not KeyError)
```

#### Examples

```python
# Grouping students by department:
students = [
    ("Alice", "CS"), ("Bob", "Math"), ("Carol", "CS"),
    ("David", "Physics"), ("Eve", "Math"), ("Frank", "CS"),
]

by_dept = defaultdict(list)
for name, dept in students:
    by_dept[dept].append(name)

for dept, names in sorted(by_dept.items()):
    print(f"{dept}: {', '.join(sorted(names))}")
```

#### Practice

Use defaultdict to: group log messages by severity level, build an inverted index (word → list of documents containing it).

---

### Part 3: namedtuple and deque (30 minutes)

#### Explanation

**namedtuple** (covered in Lesson 4 - quick review):
```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y", "z"])
p = Point(1, 2, 3)
print(p.x, p.y)    # Readable access
print(p[0])        # Still works as tuple
```

**deque** (double-ended queue):
```python
from collections import deque

# Efficient at BOTH ends:
d = deque([1, 2, 3])
d.append(4)        # Add to right: O(1)
d.appendleft(0)    # Add to left: O(1) (list.insert(0,x) is O(n)!)
d.pop()            # Remove from right: O(1)
d.popleft()        # Remove from left: O(1) (list.pop(0) is O(n)!)

# Bounded deque (fixed max size):
recent = deque(maxlen=5)   # Automatically removes old items
for i in range(10):
    recent.append(i)
print(recent)  # deque([5, 6, 7, 8, 9], maxlen=5)

# Rotate:
d = deque([1, 2, 3, 4, 5])
d.rotate(2)    # [4, 5, 1, 2, 3] - rotate right by 2
d.rotate(-2)   # Back to [1, 2, 3, 4, 5]
```

#### Practice

Build a "recent items" tracker using deque with maxlen=10.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Text Analysis Suite

Using Counter, defaultdict, and regular dicts, build a comprehensive text analyzer:
- Character frequency (Counter)
- Word frequency (Counter)
- Sentences per paragraph (defaultdict grouping)
- Unique words per chapter
- Word co-occurrence matrix

#### Exercise 2: Log Analyzer

Process simulated server logs:
- Count by HTTP status code (Counter)
- Group endpoints by response time category (defaultdict)
- Track last N requests per user (defaultdict + deque with maxlen)

#### Bonus Challenge

**LRU Cache:** Implement a Least Recently Used cache using OrderedDict (or deque): fixed capacity, evicts least recently used item when full.

---

## Key Takeaways

- `Counter(iterable)` - counting dict; `.most_common(n)`, arithmetic operators
- `defaultdict(factory)` - dict that creates missing keys with factory(); no more `setdefault`
- `namedtuple("Name", fields)` - readable, immutable records
- `deque` - O(1) both ends; use instead of list for queues; `maxlen` for bounded buffer
- All in `from collections import Counter, defaultdict, deque, namedtuple`

---

## Homework

1. Redo the word frequency analysis from Lesson 7 using Counter - much cleaner!
2. Research: Python 3.7+ `dataclasses` module - how is `@dataclass` different from namedtuple?

---

[← Previous](./lesson-10-iterators-generators.md) | [Back to Course](./README.md) | [Next →](./lesson-12-course-review-mini-project.md)

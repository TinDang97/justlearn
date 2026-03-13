# Lesson 10: Course 4 Review & Mini Project - Text Processing Toolkit

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Review all Course 4 concepts
- Build a complete text processing toolkit module
- Apply functions, parameters, returns, scope, lambda, and imports

---

## Prerequisites

- All 9 lessons of Course 4

---

## Course 4 Review

```python
# FUNCTIONS
def calculate(a: float, b: float, op: str = "+") -> float:
    """Perform arithmetic operation."""
    operations = {"+": a+b, "-": a-b, "*": a*b, "/": a/b if b != 0 else None}
    return operations.get(op)

# DEFAULT ARGS + *ARGS + **KWARGS
def log(message, *tags, level="INFO", **metadata):
    tag_str = " ".join(f"[{t}]" for t in tags)
    print(f"[{level}] {tag_str} {message}")

# LAMBDA + SORTED
by_grade = sorted(students, key=lambda s: (-s["gpa"], s["name"]))

# CLOSURES
def make_validator(min_val, max_val):
    return lambda x: min_val <= x <= max_val

# MODULES
from math_utils import circle_area, factorial
import string_tools as st
```

---

## Mini Project: Text Processing Toolkit

```python
"""
text_toolkit.py
===============
A comprehensive text processing module.

Usage:
    import text_toolkit as tt
    stats = tt.analyze(text)
    cleaned = tt.clean(text)
"""

from typing import Dict, List, Tuple
import re

# ===========================
# CLEANING FUNCTIONS
# ===========================

def clean_whitespace(text: str) -> str:
    """Remove extra whitespace, normalize to single spaces."""
    return " ".join(text.split())

def remove_punctuation(text: str) -> str:
    """Remove all punctuation from text."""
    return re.sub(r'[^\w\s]', '', text)

def normalize_case(text: str, mode: str = "lower") -> str:
    """Normalize text case. Modes: lower, upper, title, sentence."""
    modes = {
        "lower": text.lower,
        "upper": text.upper,
        "title": text.title,
        "sentence": lambda: text[0].upper() + text[1:].lower() if text else text,
    }
    return modes.get(mode, text.lower)()

# ===========================
# ANALYSIS FUNCTIONS
# ===========================

def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())

def count_sentences(text: str) -> int:
    """Count sentences (approximate)."""
    return sum(1 for c in text if c in ".!?")

def word_frequency(text: str, top_n: int = None) -> List[Tuple[str, int]]:
    """Get word frequency sorted by count descending."""
    words = remove_punctuation(text.lower()).split()
    freq: Dict[str, int] = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    sorted_freq = sorted(freq.items(), key=lambda x: (-x[1], x[0]))
    return sorted_freq[:top_n] if top_n else sorted_freq

def avg_word_length(text: str) -> float:
    """Calculate average word length."""
    words = text.split()
    if not words:
        return 0.0
    return sum(len(w) for w in words) / len(words)

def reading_time_minutes(text: str, wpm: int = 200) -> float:
    """Estimate reading time in minutes at given words-per-minute."""
    return count_words(text) / wpm

def analyze(text: str) -> Dict:
    """Comprehensive text analysis."""
    return {
        "char_count": len(text),
        "char_no_spaces": len(text.replace(" ", "")),
        "word_count": count_words(text),
        "sentence_count": count_sentences(text),
        "paragraph_count": len([p for p in text.split("\n\n") if p.strip()]),
        "avg_word_length": round(avg_word_length(text), 2),
        "reading_time_min": round(reading_time_minutes(text), 1),
        "unique_words": len(set(text.lower().split())),
    }

# ===========================
# TRANSFORMATION FUNCTIONS
# ===========================

def truncate(text: str, max_length: int, suffix: str = "...") -> str:
    """Truncate text to max_length, adding suffix if truncated."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

def word_wrap(text: str, width: int = 80) -> str:
    """Wrap text at word boundaries to given width."""
    words = text.split()
    lines = []
    current_line = []
    current_length = 0

    for word in words:
        if current_length + len(word) + (1 if current_line else 0) <= width:
            current_line.append(word)
            current_length += len(word) + (1 if len(current_line) > 1 else 0)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
            current_length = len(word)

    if current_line:
        lines.append(" ".join(current_line))

    return "\n".join(lines)

def highlight_word(text: str, word: str, marker: str = "**") -> str:
    """Surround all occurrences of word with marker."""
    import re
    pattern = re.compile(re.escape(word), re.IGNORECASE)
    return pattern.sub(f"{marker}{word}{marker}", text)

# ===========================
# SELF-TEST
# ===========================

if __name__ == "__main__":
    sample = """Python is a versatile programming language. Python is used
    for web development, data science, AI, and automation.
    Many companies use Python for their core systems."""

    print("=== Text Toolkit Test ===\n")
    print(f"Sample text:\n{sample[:100]}...\n")

    stats = analyze(sample)
    for key, value in stats.items():
        print(f"  {key:<25}: {value}")

    print(f"\nTop 5 words: {word_frequency(sample, top_n=5)}")
    print(f"\nWrapped:\n{word_wrap(sample, 50)}")
    print(f"\nHighlighted: {highlight_word('I love Python!', 'Python')}")
    print("\nAll tests passed!")
```

---

## Course 4 Completion Checklist

- [ ] Write functions with parameters, defaults, type hints, docstrings
- [ ] Return single and multiple values
- [ ] Use `*args` and `**kwargs`
- [ ] Understand LEGB scope fully
- [ ] Write and use lambda functions
- [ ] Use built-in functions: enumerate, zip, sorted, any, all
- [ ] Create and import custom modules
- [ ] Use `if __name__ == "__main__"` pattern

**Next: [Course 5 - Data Structures](../05-data-structures/README.md)**

---

[← Previous](./lesson-09-creating-importing-modules.md) | [Back to Course](./README.md) | [Next Course →](../05-data-structures/README.md)

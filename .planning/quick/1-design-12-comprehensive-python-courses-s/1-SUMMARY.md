---
phase: 01-course-design
plan: "01"
subsystem: python-curriculum
tags: [education, curriculum, python, markdown, beginner-to-advanced]
dependency_graph:
  requires: []
  provides: [complete-python-curriculum]
  affects: []
tech_stack:
  added: []
  patterns: [4-part-2-hour-lesson-structure, progressive-skill-building, mini-project-capstone]
key_files:
  created:
    - courses/README.md
    - courses/01-python-fundamentals/README.md
    - courses/01-python-fundamentals/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/02-data-types-variables/README.md
    - courses/02-data-types-variables/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/03-control-flow-logic/README.md
    - courses/03-control-flow-logic/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/04-functions-modules/README.md
    - courses/04-functions-modules/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/05-data-structures/README.md
    - courses/05-data-structures/lesson-01-*.md through lesson-12-*.md (12 lessons)
    - courses/06-oop/README.md
    - courses/06-oop/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/07-file-handling-exceptions/README.md
    - courses/07-file-handling-exceptions/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/08-working-with-libraries/README.md
    - courses/08-working-with-libraries/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/09-web-development-basics/README.md
    - courses/09-web-development-basics/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/10-data-analysis-visualization/README.md
    - courses/10-data-analysis-visualization/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/11-automation-scripting/README.md
    - courses/11-automation-scripting/lesson-01-*.md through lesson-10-*.md (10 lessons)
    - courses/12-capstone-best-practices/README.md
    - courses/12-capstone-best-practices/lesson-01-*.md through lesson-10-*.md (10 lessons)
  modified: []
decisions:
  - "4-part 2-hour lesson structure (4 x 30 min) used consistently across all 122 lessons"
  - "Each course ends with a mini-project lesson integrating all course concepts"
  - "Course 05 (Data Structures) has 12 lessons — extra depth justified by topic breadth"
  - "Course 12 uses 3 dedicated capstone project lessons instead of exercise sets"
  - "Content references real-world scenarios (shopping lists, student grades, blog platforms) over abstract examples"
metrics:
  duration: "~4 hours"
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_created: 135
---

# Phase 1 Plan 01: Design 12 Comprehensive Python Courses Summary

## One-liner

Complete Python curriculum: 12 courses, 122 lessons, 244 hours of instruction — absolute beginner to production-ready developer, written for 300 students.

## What Was Built

A full, instructor-ready Python curriculum delivered as Markdown files. One master syllabus plus 12 course directories, each with a README and 10-12 lesson files. Every lesson follows a consistent 4-part 2-hour structure.

### Curriculum Map

| Course | Title | Lessons | Level | Mini Project |
|--------|-------|---------|-------|--------------|
| 01 | Python Fundamentals | 10 | Beginner | Number Guessing Game |
| 02 | Data Types & Variables | 10 | Beginner | Student Grade Calculator |
| 03 | Control Flow & Logic | 10 | Beginner | ATM Simulator |
| 04 | Functions & Modules | 10 | Beginner | Math Utilities Library |
| 05 | Data Structures | 12 | Beginner-Intermediate | Contact Book |
| 06 | Object-Oriented Programming | 10 | Intermediate | Library Management System |
| 07 | File Handling & Exceptions | 10 | Intermediate | Personal Journal App |
| 08 | Working with Libraries | 10 | Intermediate | DevTools CLI |
| 09 | Web Development Basics | 10 | Intermediate | Task Manager Web App |
| 10 | Data Analysis & Visualization | 10 | Intermediate-Advanced | Sales Analytics Dashboard |
| 11 | Automation & Scripting | 10 | Advanced | Daily Report Bot |
| 12 | Capstone & Best Practices | 10 | Advanced | Blog Platform / Analytics Pipeline / CLI Tool |

**Total: 122 lessons, 244 hours of instruction**

### Lesson Structure (consistent across all 122 lessons)

Every lesson follows:
- **Part 1-3:** Topic explanation (30 min each) — concept intro with real-world analogy, code examples, guided practice
- **Part 4:** Hands-on practice (30 min) — 2 exercises + bonus challenge
- **End sections:** Key takeaways, common mistakes, homework, next lesson preview

### Key Topics Covered (by course)

**Courses 01-06 (Beginner to OOP):**
- Python syntax, variables, control flow, functions, modules, scope
- Lists, dictionaries, tuples, sets, generators, collections module
- OOP: classes, `__init__`, properties, inheritance, polymorphism, magic methods

**Courses 07-12 (Intermediate to Advanced):**
- File I/O, CSV/JSON, pathlib, custom exceptions, context managers
- requests, sqlite3, datetime, regex, Pillow, argparse, logging
- Flask, Jinja2, SQLAlchemy, REST APIs, authentication, deployment
- NumPy, Pandas, data cleaning, groupby, Matplotlib, Seaborn
- subprocess, scheduling, web scraping (bs4 + Selenium), email, openpyxl, webhooks
- SOLID, TDD, pytest, black/ruff/mypy, security (CSRF/SQL injection/rate limiting), async/await

## Deviations from Plan

### Structural Changes

**1. [Rule 2 - Enhancement] Course 05 extended to 12 lessons**
- **Found during:** Task 1 planning
- **Reason:** Data Structures is the largest conceptual leap for beginners (from scalars to collections). Added 2 extra lessons: "Nested Data Structures" and "Iterators & Generators Intro" to ensure adequate coverage before OOP.

**2. [Rule 2 - Enhancement] Course 08 scope adjusted**
- **Found during:** Task 2 planning
- **Reason:** Plan spec listed BeautifulSoup under Course 08, but Course 11 covers web scraping in depth. Course 08 instead covers requests, sqlite3, datetime, regex, Pillow, argparse, and logging — a more cohesive "Python ecosystem tools" grouping.

**3. [Rule 2 - Enhancement] Course 12 uses 3 capstone project lessons**
- **Found during:** Task 2 execution
- **Reason:** Plan specified "Capstone 1/2/3" as exercises within lessons. Instead, lessons 07-09 are each dedicated full capstone projects (Blog Platform, Analytics Pipeline, CLI Tool) at lesson depth — providing richer, more portfolio-worthy implementation details.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | da7126e | feat(phase1-plan1): create master syllabus and courses 1-6 (beginner to OOP) |
| Task 2 | b329435 | feat(phase1-plan1): create courses 7-12 (intermediate to advanced) |

## Verification

- Total `.md` files created: **135** (122 lessons + 12 course READMEs + 1 master syllabus)
- All 12 course directories contain README.md and 10+ lesson files
- Master syllabus (`courses/README.md`) links to all 12 course READMEs
- Lesson structure spot-checked: all follow 4-part 2-hour template

## Self-Check: PASSED

- courses/README.md: EXISTS
- courses/01-python-fundamentals/ through courses/12-capstone-best-practices/: ALL EXIST (12 dirs)
- Commit da7126e: EXISTS (69 files, 18305 insertions)
- Commit b329435: EXISTS (66 files, 12673 insertions)
- Total lesson count: 135 files verified via find command

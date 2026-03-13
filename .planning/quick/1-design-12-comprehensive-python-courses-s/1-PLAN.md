---
phase: 01-course-design
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - courses/README.md
  - courses/01-python-fundamentals/README.md
  - courses/01-python-fundamentals/lesson-01-*.md through lesson-10-*.md
  - courses/02-data-types-variables/README.md
  - courses/02-data-types-variables/lesson-01-*.md through lesson-10-*.md
  - courses/03-control-flow-logic/README.md
  - courses/03-control-flow-logic/lesson-01-*.md through lesson-10-*.md
  - courses/04-functions-modules/README.md
  - courses/04-functions-modules/lesson-01-*.md through lesson-10-*.md
  - courses/05-data-structures/README.md
  - courses/05-data-structures/lesson-01-*.md through lesson-12-*.md
  - courses/06-oop/README.md
  - courses/06-oop/lesson-01-*.md through lesson-10-*.md
  - courses/07-file-handling-exceptions/README.md
  - courses/07-file-handling-exceptions/lesson-01-*.md through lesson-10-*.md
  - courses/08-working-with-libraries/README.md
  - courses/08-working-with-libraries/lesson-01-*.md through lesson-10-*.md
  - courses/09-web-development-basics/README.md
  - courses/09-web-development-basics/lesson-01-*.md through lesson-10-*.md
  - courses/10-data-analysis-visualization/README.md
  - courses/10-data-analysis-visualization/lesson-01-*.md through lesson-10-*.md
  - courses/11-automation-scripting/README.md
  - courses/11-automation-scripting/lesson-01-*.md through lesson-10-*.md
  - courses/12-capstone-best-practices/README.md
  - courses/12-capstone-best-practices/lesson-01-*.md through lesson-10-*.md
autonomous: true
must_haves:
  truths:
    - "Master syllabus lists all 12 courses with descriptions and lesson counts"
    - "Each course directory contains a README.md and 10+ lesson MD files"
    - "Lessons progress from absolute beginner (Course 1) to advanced (Course 12)"
    - "Each lesson is structured for a 2-hour teaching session"
    - "Content is clear, step-by-step, suitable for 300 beginner students"
  artifacts:
    - path: "courses/README.md"
      provides: "Master syllabus with all 12 courses listed"
    - path: "courses/01-python-fundamentals/"
      provides: "10+ lesson files for Python Fundamentals"
    - path: "courses/12-capstone-best-practices/"
      provides: "10+ lesson files for Capstone Projects"
  key_links:
    - from: "courses/README.md"
      to: "courses/*/README.md"
      via: "relative links to each course README"
      pattern: "\\./\\d{2}-"
---

<objective>
Design 12 comprehensive Python courses with 10+ lessons each (2 hours per lesson) as Markdown files, progressing from absolute beginner to advanced. Written from the perspective of an expert teacher with 15+ years of Python teaching experience, designed for a class of 300 students.

Purpose: Provide a complete, structured Python learning curriculum that any instructor can pick up and teach effectively.
Output: 1 master syllabus + 12 course directories, each with a README and 10+ lesson files.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

This is a greenfield content creation project. No existing code or course materials.

**Curriculum progression (beginner to advanced):**
1. Python Fundamentals - Getting Started
2. Data Types & Variables
3. Control Flow & Logic
4. Functions & Modules
5. Data Structures
6. Object-Oriented Programming
7. File Handling & Exceptions
8. Working with Libraries
9. Web Development Basics
10. Data Analysis & Visualization
11. Automation & Scripting
12. Capstone Projects & Best Practices
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create master syllabus and courses 1-6 (Beginner to Intermediate)</name>
  <files>
    courses/README.md,
    courses/01-python-fundamentals/README.md, courses/01-python-fundamentals/lesson-01-*.md through lesson-10-*.md,
    courses/02-data-types-variables/README.md, courses/02-data-types-variables/lesson-01-*.md through lesson-10-*.md,
    courses/03-control-flow-logic/README.md, courses/03-control-flow-logic/lesson-01-*.md through lesson-10-*.md,
    courses/04-functions-modules/README.md, courses/04-functions-modules/lesson-01-*.md through lesson-10-*.md,
    courses/05-data-structures/README.md, courses/05-data-structures/lesson-01-*.md through lesson-12-*.md,
    courses/06-oop/README.md, courses/06-oop/lesson-01-*.md through lesson-10-*.md
  </files>
  <action>
    Create the master syllabus and first 6 courses (beginner to intermediate).

    **Master Syllabus (courses/README.md):**
    - Title: "Python Programming - Complete Beginner to Advanced Curriculum"
    - Overview: 12 courses, 120+ lessons, 240+ hours of instruction
    - Target audience: Complete beginners, class of 300 students
    - Prerequisites: None (starts from zero)
    - Table listing all 12 courses with: course number, title, lesson count, estimated hours, brief description
    - Links to each course README
    - Recommended pace: 1 course per month (2 lessons/week)

    **Each course README (courses/NN-name/README.md):**
    - Course title, number, and position in curriculum
    - Course description (2-3 paragraphs explaining what students will learn and why it matters)
    - Prerequisites (which prior courses are needed)
    - Learning objectives (5-8 bullet points)
    - Lesson list with titles and brief descriptions
    - What students will be able to do after completing the course

    **Each lesson file (courses/NN-name/lesson-NN-title.md):**
    Use this consistent structure for every lesson:

    ```
    # Lesson N: [Title]
    **Course:** [Course Name] | **Duration:** 2 hours | **Level:** [Beginner/Intermediate/Advanced]

    ## Learning Objectives
    - (3-5 specific, measurable objectives)

    ## Prerequisites
    - (What students should know before this lesson)

    ## Lesson Outline

    ### Part 1: [Topic] (30 minutes)
    #### Explanation
    (Clear explanation with real-world analogies suitable for beginners)
    #### Examples
    (2-3 code examples with comments, progressing in complexity)
    #### Practice
    (1-2 guided exercises)

    ### Part 2: [Topic] (30 minutes)
    (Same structure as Part 1)

    ### Part 3: [Topic] (30 minutes)
    (Same structure as Part 1)

    ### Part 4: Hands-on Practice (30 minutes)
    #### Exercise 1: [Name]
    (Description, starter code, expected output)
    #### Exercise 2: [Name]
    (More challenging, builds on Exercise 1)
    #### Bonus Challenge
    (For fast learners)

    ## Key Takeaways
    - (3-5 bullet summary)

    ## Common Mistakes to Avoid
    - (2-3 common beginner pitfalls)

    ## Homework / Self-Study
    - (2-3 assignments to reinforce learning)

    ## Next Lesson Preview
    - (Brief teaser of what comes next)
    ```

    **Course 1: Python Fundamentals (10 lessons):**
    Lessons: What is Programming, Installing Python & IDE Setup, Your First Python Program, Print & Input, Basic Math Operations, Strings Basics, Comments & Code Style, Simple Programs Workshop, Debugging Basics, Course 1 Review & Mini Project

    **Course 2: Data Types & Variables (10 lessons):**
    Lessons: Variables & Assignment, Numbers (int, float), Strings Deep Dive, String Methods & Formatting, Booleans & Comparisons, Type Conversion, Constants & Naming, Working with None, Variable Scope Introduction, Course 2 Review & Mini Project

    **Course 3: Control Flow & Logic (10 lessons):**
    Lessons: If Statements, If-Else & Elif, Nested Conditions, Logical Operators (and/or/not), While Loops, For Loops & Range, Loop Control (break/continue/pass), Nested Loops, Pattern Printing Workshop, Course 3 Review & Mini Project

    **Course 4: Functions & Modules (10 lessons):**
    Lessons: What Are Functions, Defining & Calling Functions, Parameters & Arguments, Return Values, Default & Keyword Arguments, Variable Scope & LEGB, Lambda Functions, Built-in Functions Tour, Creating & Importing Modules, Course 4 Review & Mini Project

    **Course 5: Data Structures (12 lessons):**
    Lessons: Lists Introduction, List Methods & Operations, List Comprehensions, Tuples, Dictionaries Introduction, Dictionary Methods & Iteration, Sets, Nested Data Structures, Choosing the Right Structure, Iterators & Generators Intro, Collections Module Basics, Course 5 Review & Mini Project

    **Course 6: Object-Oriented Programming (10 lessons):**
    Lessons: Introduction to OOP Concepts, Classes & Objects, The __init__ Method & self, Instance Methods, Class vs Instance Attributes, Encapsulation & Properties, Inheritance, Method Overriding & super(), Polymorphism & Magic Methods, Course 6 Review & Mini Project

    **Writing style guidelines:**
    - Use simple, conversational language (imagine explaining to a friend)
    - Every concept gets a real-world analogy before the code
    - Code examples use relatable scenarios (shopping lists, student grades, recipes) not abstract foo/bar
    - Include "Teacher's Note" callouts for common questions in a large class
    - Include "Common Question" sections anticipating what 300 students will ask
    - Progressive difficulty within each lesson (easy start, challenging end)
    - Each lesson is self-contained enough that a student who missed class can catch up
  </action>
  <verify>
    <automated>find courses -name "*.md" | wc -l | awk '{if ($1 >= 67) print "PASS: " $1 " files"; else print "FAIL: only " $1 " files, expected 67+"}' && ls courses/README.md courses/01-python-fundamentals/README.md courses/06-oop/README.md 2>/dev/null | wc -l | awk '{if ($1 == 3) print "PASS: key files exist"; else print "FAIL: missing key files"}'</automated>
  </verify>
  <done>
    - courses/README.md exists with master syllabus listing all 12 courses
    - 6 course directories (01 through 06) each contain a README.md and 10+ lesson files
    - Every lesson follows the consistent 2-hour structure with 4 parts
    - Content progresses logically from absolute beginner concepts
    - Code examples use relatable, real-world scenarios
  </done>
</task>

<task type="auto">
  <name>Task 2: Create courses 7-12 (Intermediate to Advanced)</name>
  <files>
    courses/07-file-handling-exceptions/README.md, courses/07-file-handling-exceptions/lesson-01-*.md through lesson-10-*.md,
    courses/08-working-with-libraries/README.md, courses/08-working-with-libraries/lesson-01-*.md through lesson-10-*.md,
    courses/09-web-development-basics/README.md, courses/09-web-development-basics/lesson-01-*.md through lesson-10-*.md,
    courses/10-data-analysis-visualization/README.md, courses/10-data-analysis-visualization/lesson-01-*.md through lesson-10-*.md,
    courses/11-automation-scripting/README.md, courses/11-automation-scripting/lesson-01-*.md through lesson-10-*.md,
    courses/12-capstone-best-practices/README.md, courses/12-capstone-best-practices/lesson-01-*.md through lesson-10-*.md
  </files>
  <action>
    Create the remaining 6 courses (intermediate to advanced), using the EXACT same lesson template structure established in Task 1.

    **Course 7: File Handling & Exceptions (10 lessons):**
    Lessons: Reading Text Files, Writing Text Files, File Modes & Context Managers, Working with CSV Files, Working with JSON Files, Introduction to Exceptions, Try-Except-Finally, Raising & Custom Exceptions, Logging Basics, Course 7 Review & Mini Project

    **Course 8: Working with Libraries (10 lessons):**
    Lessons: Understanding pip & Virtual Environments, The Python Standard Library Tour, Working with datetime, Working with os & pathlib, Regular Expressions (re), Working with requests (HTTP), Introduction to APIs, Parsing HTML with BeautifulSoup, Working with Databases (sqlite3), Course 8 Review & Mini Project

    **Course 9: Web Development Basics (10 lessons):**
    Lessons: How the Web Works, Introduction to Flask, Routes & Templates, HTML Forms & User Input, Template Inheritance & Static Files, Database Integration, User Authentication Basics, RESTful API Design, Deploying a Simple App, Course 9 Review & Mini Project

    **Course 10: Data Analysis & Visualization (10 lessons):**
    Lessons: Introduction to NumPy, NumPy Arrays & Operations, Introduction to Pandas, DataFrames & Series, Data Cleaning & Preparation, Data Filtering & Grouping, Introduction to Matplotlib, Chart Types & Customization, Introduction to Seaborn, Course 10 Review & Mini Project

    **Course 11: Automation & Scripting (10 lessons):**
    Lessons: Command-Line Arguments, Automating File Operations, Web Scraping Project, Email Automation, Scheduling Tasks, Working with Excel Files (openpyxl), PDF Processing, Image Processing Basics (Pillow), Building CLI Tools (click/argparse), Course 11 Review & Mini Project

    **Course 12: Capstone Projects & Best Practices (10 lessons):**
    Lessons: Code Quality & PEP 8, Testing with pytest, Version Control with Git, Virtual Environments & Project Structure, Documentation & Docstrings, Capstone 1 - Personal Budget Tracker, Capstone 2 - Web Scraper & Data Dashboard, Capstone 3 - REST API with Database, Career Paths in Python & Continued Learning, Course 12 - Final Review & Graduation Project

    **Same writing style guidelines as Task 1.** Additionally for courses 7-12:
    - Reference concepts from earlier courses explicitly ("Remember in Course 3 when we learned about loops...")
    - Include more real-world professional scenarios
    - Exercises become more open-ended (less hand-holding)
    - Capstone projects (Course 12) should integrate skills from multiple courses
    - Include "Industry Insight" callouts explaining how professionals use these skills
  </action>
  <verify>
    <automated>find courses -name "*.md" | wc -l | awk '{if ($1 >= 133) print "PASS: " $1 " files total"; else print "FAIL: only " $1 " files, expected 133+"}' && for d in 07 08 09 10 11 12; do count=$(ls courses/${d}-*/lesson-*.md 2>/dev/null | wc -l); echo "Course ${d}: ${count} lessons"; done</automated>
  </verify>
  <done>
    - 6 course directories (07 through 12) each contain a README.md and 10+ lesson files
    - Every lesson follows the same consistent 2-hour structure from Task 1
    - Content builds on courses 1-6 with explicit cross-references
    - Capstone course (12) integrates skills from all previous courses
    - Total: 12 courses, 120+ lesson files, all following the same template
  </done>
</task>

</tasks>

<verification>
- `find courses -type f -name "*.md" | wc -l` returns 133+ (12 course READMEs + 120+ lessons + 1 master syllabus)
- `ls courses/*/README.md | wc -l` returns 12
- Each course directory has 10+ lesson files
- Master syllabus (courses/README.md) links to all 12 courses
- Spot check: lessons follow the 4-part 2-hour structure consistently
</verification>

<success_criteria>
- 12 course directories exist under courses/
- Each course has a README.md with description, objectives, and lesson list
- Each course has 10+ lesson Markdown files (120+ total lessons)
- Every lesson follows the consistent template: objectives, 4 parts (30 min each), takeaways, homework
- Content progresses from "What is programming?" to capstone projects
- Master syllabus provides complete overview with links
- Writing is clear, uses real-world analogies, suitable for 300 beginner students
</success_criteria>

<output>
After completion, create `.planning/quick/1-design-12-comprehensive-python-courses-s/1-SUMMARY.md`
</output>

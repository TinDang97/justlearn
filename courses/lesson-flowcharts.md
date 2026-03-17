# Python Beginner Course - Lesson Flowcharts

Complete mermaid charts showing the logical progression and concept dependencies for all 12 courses (122 lessons).

---

## Course 01: Python Fundamentals (11 lessons)

```mermaid
graph TD
    subgraph foundations["Phase 1: Foundations"]
        L01["<b>Lesson 1</b><br/>What is Programming?"]
        L01a("Programs as<br/>step-by-step instructions")
        L01b("Python overview &<br/>use cases")
        L01c("High-level vs<br/>machine language")
        L01d("Line-by-line<br/>execution model")

        L01 --- L01a
        L01 --- L01b
        L01 --- L01c
        L01 --- L01d
    end

    subgraph setup["Phase 2: Environment Setup"]
        L02["<b>Lesson 2</b><br/>Installing Python & IDE"]
        L02a("Python 3 installation<br/>& PATH setup")
        L02b("VS Code + Python<br/>extension")
        L02c("REPL interactive<br/>shell")
        L02d(".py files &<br/>running programs")

        L02 --- L02a
        L02 --- L02b
        L02 --- L02c
        L02 --- L02d

        L11["<b>Lesson 11</b><br/>Google Colab Setup"]
        L11a("Cloud-based Python<br/>no install needed")
        L11b("Code cells &<br/>text cells")
        L11c("Save to Google Drive<br/>& share")

        L11 --- L11a
        L11 --- L11b
        L11 --- L11c
    end

    subgraph core_io["Phase 3: Core I/O"]
        L03["<b>Lesson 3</b><br/>Your First Python Program"]
        L03a("Hello World &<br/>print function")
        L03b("Syntax rules &<br/>reading errors")
        L03c("Strings intro:<br/>quotes & text")

        L03 --- L03a
        L03 --- L03b
        L03 --- L03c

        L04["<b>Lesson 4</b><br/>Print & Input"]
        L04a("input function &<br/>user interaction")
        L04b("Variables intro:<br/>storing values")
        L04c("f-strings &<br/>string formatting")

        L04 --- L04a
        L04 --- L04b
        L04 --- L04c
    end

    subgraph data_skills["Phase 4: Data Skills"]
        L05["<b>Lesson 5</b><br/>Basic Math Operations"]
        L05a("Arithmetic operators<br/>+ - * / // % **")
        L05b("Operator precedence<br/>PEMDAS")
        L05c("int & float<br/>type conversion")
        L05d("Practical calculators<br/>& formulas")

        L05 --- L05a
        L05 --- L05b
        L05 --- L05c
        L05 --- L05d

        L06["<b>Lesson 6</b><br/>Strings Basics"]
        L06a("len, indexing<br/>& slicing")
        L06b("String methods:<br/>upper lower strip replace")
        L06c("Concatenation &<br/>repetition")
        L06d("Escape characters<br/>& triple quotes")

        L06 --- L06a
        L06 --- L06b
        L06 --- L06c
        L06 --- L06d
    end

    subgraph quality["Phase 5: Code Quality"]
        L07["<b>Lesson 7</b><br/>Comments & Code Style"]
        L07a("Comments: # and<br/>docstrings")
        L07b("PEP 8 style guide<br/>basics")
        L07c("snake_case naming &<br/>ALL_CAPS constants")
        L07d("Readable, self-<br/>documenting code")

        L07 --- L07a
        L07 --- L07b
        L07 --- L07c
        L07 --- L07d
    end

    subgraph integration["Phase 6: Integration & Mastery"]
        L08["<b>Lesson 8</b><br/>Simple Programs Workshop"]
        L08a("4-step dev process:<br/>plan-code-test-improve")
        L08b("Building 3 complete<br/>programs from scratch")
        L08c("Peer code review<br/>& feedback")

        L08 --- L08a
        L08 --- L08b
        L08 --- L08c

        L09["<b>Lesson 9</b><br/>Debugging Basics"]
        L09a("3 error types: syntax<br/>runtime & logic")
        L09b("Reading tracebacks<br/>& error messages")
        L09c("Print debugging<br/>technique")

        L09 --- L09a
        L09 --- L09b
        L09 --- L09c

        L10["<b>Lesson 10</b><br/>Review & Mini Project"]
        L10a("Full concept review<br/>& quiz")
        L10b("Multi-function<br/>calculator capstone")
        L10c("if/elif preview &<br/>menu-driven programs")

        L10 --- L10a
        L10 --- L10b
        L10 --- L10c
    end

    C02["<b>Course 2</b><br/>Data Types & Variables"]

    L01 -->|"Understand programming<br/>concepts"| L02
    L02 -->|"Environment ready<br/>to code"| L03
    L03 -->|"Can produce output<br/>needs interaction"| L04
    L04 -->|"Can get text input<br/>needs math"| L05
    L05 -->|"Numbers mastered<br/>deepen text skills"| L06
    L06 -->|"Know data types<br/>need clean style"| L07
    L07 -->|"Style mastered<br/>combine everything"| L08
    L08 -->|"Built programs<br/>need error skills"| L09
    L09 -->|"Can debug<br/>ready for capstone"| L10
    L10 -->|"Course 1 complete"| C02

    L02 -.->|"Alternative<br/>environment"| L11
    L11 -.->|"Cloud option<br/>for Course 2"| C02
    L03b -.->|"Error reading skills<br/>deepen in L9"| L09
    L05c -.->|"Type conversion<br/>reused in all programs"| L08

    classDef lessonNode fill:#4A90D9,stroke:#2C5F8A,color:#fff,font-weight:bold
    classDef conceptNode fill:#E8F4FD,stroke:#4A90D9,color:#333,font-size:11px
    classDef supplementNode fill:#7BC47F,stroke:#4A9050,color:#fff,font-weight:bold
    classDef nextCourse fill:#F5A623,stroke:#D4891A,color:#fff,font-weight:bold

    class L01,L02,L03,L04,L05,L06,L07,L08,L09,L10 lessonNode
    class L11 supplementNode
    class L01a,L01b,L01c,L01d,L02a,L02b,L02c,L02d,L03a,L03b,L03c,L04a,L04b,L04c,L05a,L05b,L05c,L05d,L06a,L06b,L06c,L06d,L07a,L07b,L07c,L07d,L08a,L08b,L08c,L09a,L09b,L09c,L10a,L10b,L10c,L11a,L11b,L11c conceptNode
    class C02 nextCourse
```

---

## Course 02: Data Types & Variables (10 lessons)

```mermaid
graph TD
    subgraph "Foundation"
        L01["<b>L01: Variables & Assignment</b><br/>= operator, naming rules,<br/>augmented assignment, type()"]
    end

    subgraph "Core Data Types"
        L02["<b>L02: Numbers (int & float)</b><br/>int precision, float issues,<br/>Decimal, math module"]
        L03["<b>L03: Strings Deep Dive</b><br/>Quote styles, escapes,<br/>raw strings, immutability, Unicode"]
        L04["<b>L04: String Methods & Formatting</b><br/>20+ methods, f-strings,<br/>alignment, .format(), % style"]
        L05["<b>L05: Booleans & Comparisons</b><br/>Comparison/logical operators,<br/>chaining, truthy/falsy"]
    end

    subgraph "Type Mastery"
        L06["<b>L06: Type Conversion</b><br/>int() float() str() bool(),<br/>implicit vs explicit, isinstance()"]
    end

    subgraph "Code Quality"
        L07["<b>L07: Constants & Naming</b><br/>ALL_CAPS, PEP 8 snake_case,<br/>magic numbers, shadowing"]
        L08["<b>L08: Working with None</b><br/>NoneType, is/is not,<br/>None vs falsy, optional values"]
    end

    subgraph "Program Structure"
        L09["<b>L09: Variable Scope</b><br/>Local vs global, LEGB rule,<br/>global keyword, isolation"]
    end

    subgraph "Integration"
        L10["<b>L10: Review & Mini Project</b><br/>Contact Management System<br/>(applies all concepts)"]
    end

    L01 --> L02
    L01 --> L03
    L02 --> L05
    L03 --> L04
    L04 --> L05
    L05 --> L06
    L02 --> L06
    L06 --> L07
    L06 --> L08
    L07 --> L09
    L08 --> L09
    L09 --> L10

    L01 -. "type() introduced" .-> L06
    L02 -. "float formatting" .-> L04
    L05 -. "truthy/falsy context" .-> L08

    VAR_REF["Variables as<br/>references"]
    FLOAT_PREC["Float precision<br/>& Decimal"]
    STR_IMMUT["String<br/>immutability"]
    FSTR["f-string<br/>format specs"]
    TRUTHY["Truthy &<br/>falsy values"]
    SAFE_CONV["Safe conversion<br/>try/except"]
    PEP8["PEP 8<br/>conventions"]
    NONE_ID["Identity: is<br/>vs equality: =="]
    LEGB["LEGB<br/>lookup rule"]

    L01 --- VAR_REF
    L02 --- FLOAT_PREC
    L03 --- STR_IMMUT
    L04 --- FSTR
    L05 --- TRUTHY
    L06 --- SAFE_CONV
    L07 --- PEP8
    L08 --- NONE_ID
    L09 --- LEGB

    classDef foundation fill:#4A90D9,color:#fff,stroke:#2C5F8A
    classDef coretype fill:#50B878,color:#fff,stroke:#2D8A4E
    classDef mastery fill:#E8A838,color:#fff,stroke:#B07D20
    classDef quality fill:#D85F8A,color:#fff,stroke:#A03A60
    classDef structure fill:#8B5CF6,color:#fff,stroke:#6B3FBF
    classDef integration fill:#E74C3C,color:#fff,stroke:#B03A2E
    classDef subtopic fill:#F0F0F0,color:#333,stroke:#999,stroke-dasharray: 5 5

    class L01 foundation
    class L02,L03,L04,L05 coretype
    class L06 mastery
    class L07,L08 quality
    class L09 structure
    class L10 integration
    class VAR_REF,FLOAT_PREC,STR_IMMUT,FSTR,TRUTHY,SAFE_CONV,PEP8,NONE_ID,LEGB subtopic
```

---

## Course 03: Control Flow & Logic (10 lessons)

```mermaid
graph TD
    subgraph Conditionals["CONDITIONALS (Decisions)"]
        L01["L01: If Statements<br/><i>if, indentation, truthy/falsy</i>"]
        L02["L02: If-Else & Elif<br/><i>two-way & multi-way decisions</i>"]
        L03["L03: Nested Conditions<br/><i>decision trees, guard clauses</i>"]
        L04["L04: Logical Operators<br/><i>and/or/not, short-circuit,<br/>De Morgan's Laws</i>"]
    end

    subgraph Loops["LOOPS (Repetition)"]
        L05["L05: While Loops<br/><i>condition-based repetition,<br/>input validation, sentinel</i>"]
        L06["L06: For Loops & Range<br/><i>sequence iteration, range(),<br/>for vs while</i>"]
        L07["L07: Loop Control<br/><i>break, continue, pass,<br/>loop else clause</i>"]
    end

    subgraph NestedAndApplied["NESTED LOOPS & APPLICATION"]
        L08["L08: Nested Loops<br/><i>grids, matrices, O(n*m),<br/>flag-based multi-break</i>"]
        L09["L09: Pattern Printing<br/>Workshop<br/><i>ASCII art, algorithmic<br/>thinking, 2D patterns</i>"]
    end

    subgraph Capstone["CAPSTONE"]
        L10["L10: Course Review &<br/>ATM Simulator<br/><i>integrates all concepts</i>"]
    end

    L01 -->|"overlapping-if problem<br/>motivates elif"| L02
    L02 -->|"branching depth<br/>motivates nesting"| L03
    L03 -->|"'if a: if b:' simplifies<br/>to 'if a and b:'"| L04
    L04 -->|"decisions complete,<br/>pivot to repetition"| L05
    L05 -->|"unknown count done,<br/>add known-count loops"| L06
    L06 -->|"basic loops done,<br/>add fine-grained control"| L07
    L07 -->|"single-loop control done,<br/>add loop nesting"| L08
    L08 -->|"nested loops enable<br/>2D pattern generation"| L09
    L09 -->|"all skills ready<br/>for integration"| L10

    L04 -.->|"conditions used<br/>inside loops"| L05
    L04 -.->|"conditions used<br/>in loop bodies"| L06
    L05 -.->|"while True + break<br/>pattern"| L07
    L07 -.->|"break in nested<br/>loops"| L08

    L01_a(["Indentation as<br/>block delimiter"])
    L01_b(["Truthy / Falsy<br/>values"])
    L02_a(["Mutual exclusivity<br/>vs independence"])
    L05_a(["Counter / Accumulator /<br/>Sentinel patterns"])
    L06_a(["range stop<br/>range start stop<br/>range start stop step"])
    L07_a(["Search pattern:<br/>break + loop else"])
    L08_a(["Grid traversal &<br/>iteration counting"])

    L01 --- L01_a
    L01 --- L01_b
    L02 --- L02_a
    L05 --- L05_a
    L06 --- L06_a
    L07 --- L07_a
    L08 --- L08_a

    NEXT["Course 04:<br/>Functions & Modules"]
    L10 -->|"prerequisite<br/>complete"| NEXT

    style Conditionals fill:#e8f4fd,stroke:#2196F3,stroke-width:2px
    style Loops fill:#e8f5e9,stroke:#4CAF50,stroke-width:2px
    style NestedAndApplied fill:#fff3e0,stroke:#FF9800,stroke-width:2px
    style Capstone fill:#fce4ec,stroke:#E91E63,stroke-width:2px
    style NEXT fill:#f3e5f5,stroke:#9C27B0,stroke-width:2px
```

---

## Course 04: Functions & Modules (10 lessons)

```mermaid
graph TD
    COURSE["<b>Course 04: Functions & Modules</b><br/>10 lessons | 20 hours"]
    COURSE --> L01

    L01["<b>L01: What Are Functions?</b><br/>DRY principle, anatomy, abstraction"]
    L01_sub1(("DRY Principle"))
    L01_sub2(("Function Anatomy:<br/>def, name, params, body, return"))
    L01_sub3(("Abstraction &<br/>Composition"))
    L01 --- L01_sub1
    L01 --- L01_sub2
    L01 --- L01_sub3

    L01 --> L02["<b>L02: Defining & Calling Functions</b><br/>def syntax, docstrings, void functions"]
    L02_sub1(("Docstrings &<br/>help()"))
    L02_sub2(("Void Functions<br/>vs Return Functions"))
    L02_sub3(("Call Stack &<br/>Decomposition"))
    L02 --- L02_sub1
    L02 --- L02_sub2
    L02 --- L02_sub3

    L02 --> L03["<b>L03: Parameters & Arguments</b><br/>positional, type hints, pass-by-assignment"]
    L03_sub1(("Positional Args"))
    L03_sub2(("Type Hints<br/>typing module"))
    L03_sub3(("Pass by Assignment:<br/>mutable vs immutable"))
    L03 --- L03_sub1
    L03 --- L03_sub2
    L03 --- L03_sub3

    L03 -->|"data in -> data out"| L04["<b>L04: Return Values</b><br/>return, multiple returns, guard clauses"]
    L04_sub1(("Single & Multiple<br/>Return Values"))
    L04_sub2(("Guard Clauses &<br/>Early Return"))
    L04_sub3(("None Return"))
    L04 --- L04_sub1
    L04 --- L04_sub2
    L04 --- L04_sub3

    L04 --> L05["<b>L05: Default & Keyword Arguments</b><br/>defaults, *args, **kwargs"]
    L05_sub1(("Default Values &<br/>Mutable Default Gotcha"))
    L05_sub2(("Keyword-Only Args<br/>using *"))
    L05_sub3(("*args & **kwargs<br/>+ Unpacking"))
    L05 --- L05_sub1
    L05 --- L05_sub2
    L05 --- L05_sub3

    L05 -->|"flexible signatures -> variable lifetime"| L06["<b>L06: Variable Scope & LEGB</b><br/>LEGB rule, closures, pure functions"]
    L06_sub1(("LEGB Rule:<br/>Local-Enclosing-Global-Built-in"))
    L06_sub2(("global & nonlocal<br/>keywords"))
    L06_sub3(("Closures &<br/>Function Factories"))
    L06 --- L06_sub1
    L06 --- L06_sub2
    L06 --- L06_sub3

    L06 -->|"closures -> anonymous functions"| L07["<b>L07: Lambda Functions</b><br/>lambda syntax, map/filter/sorted"]
    L07_sub1(("Lambda Syntax"))
    L07_sub2(("Lambda with<br/>sorted / map / filter"))
    L07_sub3(("Dispatch Tables"))
    L07 --- L07_sub1
    L07 --- L07_sub2
    L07 --- L07_sub3

    L07 -->|"lambdas pair with built-ins"| L08["<b>L08: Built-in Functions Tour</b><br/>enumerate, zip, any/all, sorted"]
    L08_sub1(("Iteration Helpers:<br/>enumerate, zip, reversed"))
    L08_sub2(("Aggregation:<br/>sum, min, max, any, all"))
    L08_sub3(("Type & Identity:<br/>isinstance, type, id"))
    L08 --- L08_sub1
    L08 --- L08_sub2
    L08 --- L08_sub3

    L08 -->|"organize your functions"| L09["<b>L09: Creating & Importing Modules</b><br/>.py modules, import, packages, pip"]
    L09_sub1(("Import Styles:<br/>import / from / as"))
    L09_sub2(("__name__ == __main__"))
    L09_sub3(("Packages &<br/>pip / venv"))
    L09 --- L09_sub1
    L09 --- L09_sub2
    L09 --- L09_sub3

    L09 --> L10["<b>L10: Course Review & Mini Project</b><br/>Text Processing Toolkit"]
    L10_sub1(("Cleaning Functions"))
    L10_sub2(("Analysis Functions"))
    L10_sub3(("Transformation Functions"))
    L10 --- L10_sub1
    L10 --- L10_sub2
    L10 --- L10_sub3

    L03_sub2 -.->|"type hints used in"| L04_sub1
    L04_sub1 -.->|"tuple return enables"| L05_sub3
    L05_sub3 -.->|"unpacking feeds"| L06_sub3
    L06_sub3 -.->|"closures underpin"| L07_sub1
    L07_sub2 -.->|"key= pattern shared"| L08_sub1
    L08_sub2 -.->|"reusable utilities -> modules"| L09_sub1

    L10 --> NEXT["Course 05: Data Structures"]

    classDef lesson fill:#4A90D9,stroke:#2C5F8A,color:#fff,font-weight:bold
    classDef subtopic fill:#F0F4F8,stroke:#8BB0D6,color:#333
    classDef course fill:#2C5F8A,stroke:#1A3A5C,color:#fff,font-weight:bold
    classDef next fill:#6BBF6B,stroke:#3D8B3D,color:#fff,font-weight:bold

    class COURSE course
    class L01,L02,L03,L04,L05,L06,L07,L08,L09,L10 lesson
    class L01_sub1,L01_sub2,L01_sub3 subtopic
    class L02_sub1,L02_sub2,L02_sub3 subtopic
    class L03_sub1,L03_sub2,L03_sub3 subtopic
    class L04_sub1,L04_sub2,L04_sub3 subtopic
    class L05_sub1,L05_sub2,L05_sub3 subtopic
    class L06_sub1,L06_sub2,L06_sub3 subtopic
    class L07_sub1,L07_sub2,L07_sub3 subtopic
    class L08_sub1,L08_sub2,L08_sub3 subtopic
    class L09_sub1,L09_sub2,L09_sub3 subtopic
    class L10_sub1,L10_sub2,L10_sub3 subtopic
    class NEXT next
```

---

## Course 05: Data Structures (12 lessons)

```mermaid
graph TD
    subgraph "Phase 1: Sequences"
        L01["<b>L01: Lists Introduction</b><br/>Create, index, slice, mutability"]
        L01a["Indexing & Slicing"]
        L01b["Mutability & Copying"]
        L01c["Iteration & enumerate"]
        L01 --- L01a
        L01 --- L01b
        L01 --- L01c

        L02["<b>L02: List Methods & Operations</b><br/>append, extend, insert, remove,<br/>pop, sort, reverse"]
        L02a["Stack & Queue patterns"]
        L02b["Sorting with key functions"]
        L02c["Shallow vs Deep copy"]
        L02 --- L02a
        L02 --- L02b
        L02 --- L02c

        L03["<b>L03: List Comprehensions</b><br/>Transform & filter in one line"]
        L03a["Basic & Conditional"]
        L03b["Nested & Flattening"]
        L03c["When NOT to use"]
        L03 --- L03a
        L03 --- L03b
        L03 --- L03c

        L04["<b>L04: Tuples</b><br/>Immutable sequences"]
        L04a["Unpacking & *extended"]
        L04b["namedtuple"]
        L04c["Hashability - dict keys"]
        L04 --- L04a
        L04 --- L04b
        L04 --- L04c
    end

    subgraph "Phase 2: Mappings & Sets"
        L05["<b>L05: Dictionaries Introduction</b><br/>Key-value pairs, .get, CRUD"]
        L05a["O(1) lookup"]
        L05b["Dict from sequences & zip"]
        L05 --- L05a
        L05 --- L05b

        L06["<b>L06: Dict Methods & Iteration</b><br/>.items, setdefault, update"]
        L06a["Dict comprehensions"]
        L06b["Grouping pattern"]
        L06 --- L06a
        L06 --- L06b

        L07["<b>L07: Sets</b><br/>Unique elements, set math"]
        L07a["Union, Intersection, Difference"]
        L07b["O(1) membership testing"]
        L07c["frozenset"]
        L07 --- L07a
        L07 --- L07b
        L07 --- L07c
    end

    subgraph "Phase 3: Combining & Choosing"
        L08["<b>L08: Nested Data Structures</b><br/>List of dicts, dict of dicts, JSON"]
        L08a["Chained access & safe .get"]
        L08b["json.loads / json.dumps"]
        L08 --- L08a
        L08 --- L08b

        L09["<b>L09: Choosing the Right Structure</b><br/>Decision guide & Big O"]
        L09a["Performance comparison"]
        L09b["Refactoring anti-patterns"]
        L09 --- L09a
        L09 --- L09b
    end

    subgraph "Phase 4: Advanced Tools"
        L10["<b>L10: Iterators & Generators</b><br/>iter/next, yield, lazy evaluation"]
        L10a["Generator functions"]
        L10b["Generator expressions"]
        L10c["Data pipelines"]
        L10 --- L10a
        L10 --- L10b
        L10 --- L10c

        L11["<b>L11: Collections Module</b><br/>Counter, defaultdict, deque"]
        L11a["Counter: frequency analysis"]
        L11b["defaultdict: auto-create keys"]
        L11c["deque: O(1) both ends"]
        L11 --- L11a
        L11 --- L11b
        L11 --- L11c
    end

    subgraph "Phase 5: Capstone"
        L12["<b>L12: Course Review & Mini Project</b><br/>Contact Database"]
    end

    L01 --> L02
    L02 --> L03
    L03 --> L04
    L04 -->|"tuples as dict keys"| L05
    L05 --> L06
    L06 --> L07
    L07 --> L08
    L08 --> L09
    L09 --> L10
    L10 --> L11
    L11 --> L12

    L03 -.->|"comprehension syntax reused"| L06a
    L03 -.->|"set comprehensions"| L07
    L04b -.->|"namedtuple revisited"| L11
    L02a -.->|"deque replaces list queue"| L11c
    L05a -.->|"O(1) concept"| L09a
    L07b -.->|"O(1) concept"| L09a

    classDef phase1 fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    classDef phase2 fill:#dcfce7,stroke:#22c55e,color:#14532d
    classDef phase3 fill:#fef3c7,stroke:#f59e0b,color:#78350f
    classDef phase4 fill:#f3e8ff,stroke:#a855f7,color:#581c87
    classDef phase5 fill:#fce7f3,stroke:#ec4899,color:#831843
    classDef subtopic fill:#f8fafc,stroke:#94a3b8,color:#475569,font-size:11px

    class L01,L02,L03,L04 phase1
    class L05,L06,L07 phase2
    class L08,L09 phase3
    class L10,L11 phase4
    class L12 phase5
    class L01a,L01b,L01c,L02a,L02b,L02c,L03a,L03b,L03c,L04a,L04b,L04c,L05a,L05b,L06a,L06b,L07a,L07b,L07c,L08a,L08b,L09a,L09b,L10a,L10b,L10c,L11a,L11b,L11c subtopic
```

---

## Course 06: Object-Oriented Programming (10 lessons)

```mermaid
graph TD
    CourseTitle["<b>Course 06: Object-Oriented Programming</b><br/>10 Lessons | 20 Hours | Intermediate"]
    style CourseTitle fill:#1a1a2e,color:#fff,stroke:#e94560

    L01["L01: Introduction to OOP<br/><i>Why OOP, 4 Pillars, State vs Behavior</i>"]
    L02["L02: Classes & Objects<br/><i>class keyword, Instances, Class Attributes</i>"]
    L03["L03: __init__ & self<br/><i>Constructor, Instance Attrs, Validation</i>"]
    L04["L04: Instance Methods<br/><i>Methods on self, Method Chaining</i>"]
    L05["L05: Class vs Instance Attrs<br/><i>@classmethod, @staticmethod, Patterns</i>"]
    L06["L06: Encapsulation & Properties<br/><i>_ / __ naming, @property, Getters/Setters</i>"]
    L07["L07: Inheritance<br/><i>Subclasses, super, IS-A, Multi-level</i>"]
    L08["L08: Method Overriding & super<br/><i>MRO, Diamond Problem, Template Method</i>"]
    L09["L09: Polymorphism & Magic Methods<br/><i>Duck Typing, Dunder Methods, Protocols</i>"]
    L10["L10: Review & Mini Project<br/><i>Library Management System</i>"]

    S01a(["Procedural vs OOP"])
    S01b(["4 Pillars:<br/>Encapsulation, Inheritance,<br/>Polymorphism, Abstraction"])
    S03a(["self parameter"])
    S05a(["@classmethod<br/>Factory constructors"])
    S05b(["@staticmethod<br/>Utility functions"])
    S06a(["_ protected convention"])
    S06c(["@property getter/setter"])
    S07a(["IS-A relationship"])
    S07c(["Multiple inheritance<br/>& Mixins"])
    S08a(["Method Resolution Order"])
    S09a(["Duck typing"])
    S09b(["__str__ / __repr__"])
    S09c(["__eq__ / __lt__ / __len__"])

    CourseTitle --> L01
    L01 --> L02
    L02 --> L03
    L03 --> L04
    L04 --> L05
    L05 --> L06
    L06 --> L07
    L07 --> L08
    L08 --> L09
    L09 --> L10

    L01 --- S01a
    L01 --- S01b
    L03 --- S03a
    L05 --- S05a
    L05 --- S05b
    L06 --- S06a
    L06 --- S06c
    L07 --- S07a
    L07 --- S07c
    L08 --- S08a
    L09 --- S09a
    L09 --- S09b
    L09 --- S09c

    S01b -.->|"All 4 pillars applied"| L10
    S03a -.->|"self used in methods"| L04
    S06c -.->|"Properties used in subclasses"| L07
    S08a -.->|"MRO enables polymorphism"| L09

    subgraph Foundation ["Foundation: What is OOP?"]
        L01
        S01a
        S01b
    end

    subgraph CoreMechanics ["Core Mechanics: Building Classes"]
        L02
        L03
        L04
        S03a
    end

    subgraph DataDesign ["Data Design: Attributes & Access"]
        L05
        L06
        S05a
        S05b
        S06a
        S06c
    end

    subgraph HierarchyPoly ["Hierarchy & Polymorphism"]
        L07
        L08
        L09
        S07a
        S07c
        S08a
        S09a
        S09b
        S09c
    end

    subgraph CapstoneOOP ["Capstone"]
        L10
    end

    style Foundation fill:#0f3460,color:#fff,stroke:#e94560
    style CoreMechanics fill:#16213e,color:#fff,stroke:#0f3460
    style DataDesign fill:#1a1a2e,color:#fff,stroke:#0f3460
    style HierarchyPoly fill:#533483,color:#fff,stroke:#e94560
    style CapstoneOOP fill:#e94560,color:#fff,stroke:#fff

    style L01 fill:#0f3460,color:#fff
    style L02 fill:#16213e,color:#fff
    style L03 fill:#16213e,color:#fff
    style L04 fill:#16213e,color:#fff
    style L05 fill:#1a1a2e,color:#fff
    style L06 fill:#1a1a2e,color:#fff
    style L07 fill:#533483,color:#fff
    style L08 fill:#533483,color:#fff
    style L09 fill:#533483,color:#fff
    style L10 fill:#e94560,color:#fff
```

---

## Course 07: File Handling & Exceptions (10 lessons)

```mermaid
graph TD
    subgraph "Phase 1: Core File I/O"
        L01["<b>L01: Reading Text Files</b><br/>open, read, readline, readlines<br/>encoding, pathlib basics"]
        L02["<b>L02: Writing Text Files</b><br/>write/append modes<br/>writelines, atomic writes"]
        L01 --> L02
    end

    subgraph "Phase 2: Safety & Robustness"
        L03["<b>L03: Context Managers</b><br/>with statement<br/>__enter__/__exit__<br/>@contextmanager, contextlib"]
        L04["<b>L04: Exception Basics</b><br/>try/except/else/finally<br/>exception hierarchy<br/>traceback"]
        L05["<b>L05: Exception Patterns</b><br/>raise, raise from<br/>custom exceptions<br/>LBYL vs EAFP"]
        L03 --> L04
        L04 --> L05
    end

    subgraph "Phase 3: Data Formats"
        L06["<b>L06: Working with CSV</b><br/>csv.reader / DictReader<br/>csv.writer / DictWriter<br/>processing pipelines"]
        L07["<b>L07: Working with JSON</b><br/>json.dump / json.load<br/>custom encoder/decoder<br/>JSONStore pattern"]
        L06 --> L07
    end

    subgraph "Phase 4: Advanced File Ops"
        L08["<b>L08: File System Operations</b><br/>pathlib deep dive<br/>glob/rglob, shutil<br/>directory management"]
        L09["<b>L09: Binary & Other Formats</b><br/>binary rb/wb, struct<br/>pickle, configparser<br/>gzip, zipfile"]
        L08 --> L09
    end

    subgraph "Phase 5: Integration"
        L10["<b>L10: Course Review<br/>& Mini Project</b><br/>Personal Journal App<br/>JSON + exceptions +<br/>context managers + file I/O"]
    end

    L02 -->|"read+write need<br/>resource cleanup"| L03
    L03 -->|"with uses try/finally<br/>internally"| L04
    L05 -->|"apply error handling<br/>to data formats"| L06
    L07 -->|"formats need<br/>filesystem mgmt"| L08
    L09 --> L10

    L05 -.->|"exception handling"| L10
    L07 -.->|"JSON storage"| L10
    L03 -.->|"resource management"| L10

    S1(["pathlib.Path"])
    S2(["encoding: utf-8"])
    S3(["newline handling"])

    L01 --- S1
    L01 --- S2
    L06 --- S3

    style L10 fill:#f9e79f,stroke:#f39c12,stroke-width:3px
    style S1 fill:#d5f5e3,stroke:#27ae60
    style S2 fill:#d5f5e3,stroke:#27ae60
    style S3 fill:#d5f5e3,stroke:#27ae60
```

---

## Course 08: Working with Libraries (10 lessons)

```mermaid
graph TD
    subgraph Foundation ["Foundation Layer"]
        L01["<b>L01: pip & Virtual Environments</b><br/>pip install, venv, requirements.txt"]
        L02["<b>L02: Reading Documentation</b><br/>help, dir, PyPI, signatures"]
    end

    L01 --> L02

    subgraph DomainLibs ["Domain-Specific Libraries"]
        L03["<b>L03: requests - HTTP</b><br/>GET/POST, JSON APIs, auth"]
        L04["<b>L04: SQLite & Databases</b><br/>sqlite3, CRUD, schemas"]
        L05["<b>L05: Date & Time</b><br/>datetime, timedelta, timezones"]
        L06["<b>L06: Regular Expressions</b><br/>re module, patterns, groups"]
        L07["<b>L07: Pillow - Image Processing</b><br/>resize, crop, filters, batch"]
    end

    L02 --> L03
    L02 --> L04
    L02 --> L05
    L02 --> L06
    L02 --> L07

    L03 --- L03a["Sessions & Retry"]
    L03 --- L03b["Error Handling & Timeouts"]
    L04 --- L04a["Parameterized Queries"]
    L04 --- L04b["Context Managers for DB"]
    L05 --- L05a["strftime / strptime"]
    L05 --- L05b["pytz & Timezone Conversion"]
    L06 --- L06a["Named Groups & Substitution"]
    L06 --- L06b["Compiled Patterns & Flags"]
    L07 --- L07a["ImageDraw & Text"]
    L07 --- L07b["ImageEnhance & Filters"]

    subgraph AppLayer ["Application Layer"]
        L08["<b>L08: argparse - CLI Tools</b><br/>positional/optional args, subcommands"]
        L09["<b>L09: logging Module</b><br/>levels, handlers, formatters, hierarchy"]
    end

    L03 --> L08
    L04 --> L08
    L06 --> L08
    L07 --> L08
    L08 --> L09

    L08 --- L08a["Type Validation & Choices"]
    L08 --- L08b["Subcommand Dispatch"]
    L09 --- L09a["RotatingFileHandler"]
    L09 --- L09b["dictConfig & Logger Hierarchy"]

    subgraph Capstone ["Capstone"]
        L10["<b>L10: Mini Project - devtools.py</b><br/>Multi-tool CLI integrating all skills"]
    end

    L03 --> L10
    L04 --> L10
    L06 --> L10
    L07 --> L10
    L08 --> L10
    L09 --> L10

    L10 --- L10a["github: API fetch<br/>(requests)"]
    L10 --- L10b["images: batch resize<br/>(Pillow)"]
    L10 --- L10c["search: regex grep<br/>(re)"]
    L10 --- L10d["kv: key-value store<br/>(sqlite3)"]

    classDef foundation fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef domain fill:#5CB85C,stroke:#3D7A3D,color:#fff
    classDef app fill:#F0AD4E,stroke:#C48B2F,color:#fff
    classDef capstone fill:#D9534F,stroke:#A83832,color:#fff
    classDef subtopic fill:#f9f9f9,stroke:#ccc,color:#333,font-size:11px

    class L01,L02 foundation
    class L03,L04,L05,L06,L07 domain
    class L08,L09 app
    class L10 capstone
    class L03a,L03b,L04a,L04b,L05a,L05b,L06a,L06b,L07a,L07b,L08a,L08b,L09a,L09b,L10a,L10b,L10c,L10d subtopic
```

---

## Course 09: Web Development Basics (10 lessons)

```mermaid
graph TD
    L1["<b>L1: How the Web Works</b><br/>Client-Server Model"]
    L1_HTTP["HTTP Methods & Status Codes"]
    L1_URL["URL Anatomy & Headers"]
    L1 --> L1_HTTP
    L1 --> L1_URL

    L2["<b>L2: Flask Introduction</b><br/>Routes & Views"]
    L2_ROUTE["URL Variables & Query Params"]
    L2_RESP["Response Objects & Error Handlers"]
    L2 --> L2_ROUTE
    L2 --> L2_RESP

    L3["<b>L3: HTML Templates</b><br/>Jinja2 Rendering"]
    L3_FILT["Filters & Expressions"]
    L3_INH["Template Inheritance & Includes"]
    L3 --> L3_FILT
    L3 --> L3_INH

    L4["<b>L4: Forms & User Input</b><br/>POST Handling & Validation"]
    L4_PRG["PRG Pattern & Flash Messages"]
    L4_FILE["File Uploads & WTForms"]
    L4 --> L4_PRG
    L4 --> L4_FILE

    L5["<b>L5: Database with Flask</b><br/>Flask-SQLAlchemy ORM"]
    L5_CRUD["CRUD Operations"]
    L5_REL["Relationships & Queries"]
    L5 --> L5_CRUD
    L5 --> L5_REL

    L6["<b>L6: REST APIs</b><br/>API Design & Implementation"]
    L6_PAGE["Pagination & Filtering"]
    L6_ERR["Error Handling & API Auth"]
    L6 --> L6_PAGE
    L6 --> L6_ERR

    L7["<b>L7: User Authentication</b><br/>Sessions & Security"]
    L7_HASH["Password Hashing (werkzeug)"]
    L7_DEC["login_required Decorator"]
    L7 --> L7_HASH
    L7 --> L7_DEC

    L8["<b>L8: Static Files & CSS</b><br/>Frontend Styling"]
    L8_BOOT["Bootstrap Integration"]
    L8_JS["JavaScript Fetch / AJAX"]
    L8 --> L8_BOOT
    L8 --> L8_JS

    L9["<b>L9: Deployment Basics</b><br/>Production Readiness"]
    L9_GUN["Gunicorn & Config Classes"]
    L9_DOCK["Docker & Env Variables"]
    L9 --> L9_GUN
    L9 --> L9_DOCK

    L10["<b>L10: Course Review & Mini Project</b><br/>Task Manager Web App"]

    L1 -->|"HTTP fundamentals"| L2
    L2 -->|"Routes serve HTML"| L3
    L3 -->|"Templates render forms"| L4
    L4 -->|"Form data needs persistence"| L5
    L5 -->|"DB-backed endpoints"| L6
    L2 -->|"JSON responses"| L6
    L6 -->|"Securing endpoints"| L7
    L5 -->|"User model in DB"| L7
    L4 -->|"Login/register forms"| L7
    L3 -->|"Templates link assets"| L8
    L6 -->|"Fetch calls API"| L8
    L7 -->|"App complete"| L9
    L8 -->|"Frontend ready"| L9
    L5 -->|"Models"| L10
    L6 -->|"API layer"| L10
    L7 -->|"Auth system"| L10
    L8 -->|"Styled UI"| L10
    L9 -->|"Deployed app"| L10

    classDef foundation fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef framework fill:#5BB85D,stroke:#3D7A3F,color:#fff
    classDef frontend fill:#F0AD4E,stroke:#C28E3E,color:#fff
    classDef data fill:#D9534F,stroke:#A94340,color:#fff
    classDef deploy fill:#9B59B6,stroke:#7D3F94,color:#fff
    classDef project fill:#1ABC9C,stroke:#148F77,color:#fff
    classDef sub fill:#f9f9f9,stroke:#ccc,color:#333

    class L1 foundation
    class L2 framework
    class L3 frontend
    class L4 frontend
    class L5 data
    class L6 data
    class L7 data
    class L8 frontend
    class L9 deploy
    class L10 project
    class L1_HTTP,L1_URL,L2_ROUTE,L2_RESP,L3_FILT,L3_INH,L4_PRG,L4_FILE,L5_CRUD,L5_REL,L6_PAGE,L6_ERR,L7_HASH,L7_DEC,L8_BOOT,L8_JS,L9_GUN,L9_DOCK sub
```

---

## Course 10: Data Analysis & Visualization (10 lessons)

```mermaid
graph TD
    subgraph Foundation["Phase 1: Data Foundations"]
        L01["<b>Lesson 1</b><br/>NumPy Fundamentals"]
        L01a["Arrays & Shapes"]
        L01b["Vectorized Ops"]
        L01c["Broadcasting &<br/>Boolean Indexing"]
        L01d["Statistical Functions<br/>mean, std, percentile"]
        L01 --- L01a
        L01 --- L01b
        L01 --- L01c
        L01 --- L01d

        L02["<b>Lesson 2</b><br/>Pandas Introduction"]
        L02a["Series & DataFrame"]
        L02b["Column/Row Access<br/>loc, iloc"]
        L02c["Basic Filtering &<br/>Sorting"]
        L02d["describe &<br/>value_counts"]
        L02 --- L02a
        L02 --- L02b
        L02 --- L02c
        L02 --- L02d
    end

    subgraph DataWork["Phase 2: Data Wrangling"]
        L03["<b>Lesson 3</b><br/>Loading & Inspecting Data"]
        L03a["read_csv, read_json<br/>read_excel, read_sql"]
        L03b["info, describe<br/>isnull, shape"]
        L03c["Data Quality<br/>Profiling"]
        L03 --- L03a
        L03 --- L03b
        L03 --- L03c

        L04["<b>Lesson 4</b><br/>Data Cleaning"]
        L04a["Handle Missing Values<br/>dropna, fillna, interpolate"]
        L04b["Type Conversion &<br/>String Cleaning"]
        L04c["Duplicates &<br/>Outlier Detection"]
        L04 --- L04a
        L04 --- L04b
        L04 --- L04c

        L05["<b>Lesson 5</b><br/>Filtering & Selecting"]
        L05a["Boolean Indexing<br/>&, |, ~"]
        L05b["loc vs iloc<br/>Label vs Position"]
        L05c["query & assign<br/>Method Chaining"]
        L05d["Datetime Filtering"]
        L05 --- L05a
        L05 --- L05b
        L05 --- L05c
        L05 --- L05d
    end

    subgraph Analysis["Phase 3: Analysis"]
        L06["<b>Lesson 6</b><br/>GroupBy & Aggregation"]
        L06a["groupby & agg<br/>sum, mean, count"]
        L06b["Pivot Tables &<br/>Crosstab"]
        L06c["Merge & Concat<br/>SQL-style Joins"]
        L06 --- L06a
        L06 --- L06b
        L06 --- L06c
    end

    subgraph Visualization["Phase 4: Visualization"]
        L07["<b>Lesson 7</b><br/>Matplotlib Basics"]
        L07a["Line, Bar, Scatter<br/>Pie Charts"]
        L07b["Styles, Colors<br/>Customization"]
        L07c["Subplots &<br/>GridSpec"]
        L07d["Saving Figures<br/>savefig, dpi"]
        L07 --- L07a
        L07 --- L07b
        L07 --- L07c
        L07 --- L07d

        L08["<b>Lesson 8</b><br/>Seaborn for Statistics"]
        L08a["Distributions<br/>hist, kde, box, violin"]
        L08b["Categorical &<br/>Relational Plots"]
        L08c["Heatmaps &<br/>Pairplots"]
        L08 --- L08a
        L08 --- L08b
        L08 --- L08c
    end

    subgraph Storytelling["Phase 5: Communication"]
        L09["<b>Lesson 9</b><br/>Data Storytelling"]
        L09a["Chart Design<br/>Principles"]
        L09b["Annotations &<br/>Reference Lines"]
        L09c["Multi-page PDF<br/>Reports"]
        L09 --- L09a
        L09 --- L09b
        L09 --- L09c
    end

    subgraph CapstoneDA["Phase 6: Capstone"]
        L10["<b>Lesson 10</b><br/>Sales Analytics Dashboard"]
        L10a["Data Generation<br/>& Quality Check"]
        L10b["Time Series &<br/>Product Analysis"]
        L10c["6-Panel Dashboard<br/>Trend + Bar + Heatmap<br/>+ Pie + Hist + Corr"]
        L10 --- L10a
        L10 --- L10b
        L10 --- L10c
    end

    L01 ==>|"NumPy arrays<br/>underpin Pandas"| L02
    L02 ==>|"DataFrame ready<br/>for real data"| L03
    L03 ==>|"Inspection reveals<br/>quality issues"| L04
    L04 ==>|"Clean data ready<br/>for selection"| L05
    L05 ==>|"Filtered subsets<br/>feed aggregation"| L06
    L06 ==>|"Aggregated results<br/>ready to visualize"| L07
    L07 ==>|"Matplotlib foundation<br/>for Seaborn"| L08
    L08 ==>|"Statistical charts<br/>inform storytelling"| L09
    L09 ==>|"All skills combine<br/>in capstone"| L10

    L01c -.->|"Boolean indexing<br/>reused"| L05a
    L01d -.->|"Stats functions<br/>reused"| L06a
    L02b -.->|"loc/iloc<br/>deepened"| L05b
    L06b -.->|"Pivot data feeds<br/>heatmaps"| L08c
    L07c -.->|"Subplots reused<br/>in Seaborn"| L08
    L07d -.->|"Saving extended<br/>to PDF reports"| L09c

    style Foundation fill:#E3F2FD,stroke:#1565C0,color:#000
    style DataWork fill:#E8F5E9,stroke:#2E7D32,color:#000
    style Analysis fill:#FFF3E0,stroke:#E65100,color:#000
    style Visualization fill:#F3E5F5,stroke:#6A1B9A,color:#000
    style Storytelling fill:#FFF8E1,stroke:#F57F17,color:#000
    style CapstoneDA fill:#FCE4EC,stroke:#C62828,color:#000
```

---

## Course 11: Automation & Scripting (10 lessons)

```mermaid
graph TD
    subgraph FoundationAS ["Foundation: System & Scheduling"]
        L1["<b>L1: Subprocess & OS Automation</b><br/>subprocess, os, shutil, pathlib"]
        L1a["Run shell commands"]
        L1b["File system operations"]
        L1c["Cross-platform scripts"]
        L1 --- L1a
        L1 --- L1b
        L1 --- L1c

        L2["<b>L2: Scheduled Tasks</b><br/>schedule, cron, APScheduler"]
        L2a["schedule library"]
        L2b["Cron syntax"]
        L2c["Error handling & retry"]
        L2 --- L2a
        L2 --- L2b
        L2 --- L2c
    end

    L1 -->|"scripts to schedule"| L2

    subgraph Acquisition ["Data Acquisition: Web & APIs"]
        L3["<b>L3: Web Scraping (BeautifulSoup)</b><br/>requests, bs4, lxml"]
        L3a["HTML parsing & CSS selectors"]
        L3b["Pagination & rate limiting"]
        L3c["Ethical scraping / robots.txt"]
        L3 --- L3a
        L3 --- L3b
        L3 --- L3c

        L4["<b>L4: Browser Automation (Selenium)</b><br/>WebDriver, explicit waits"]
        L4a["JS-rendered pages"]
        L4b["Form filling & interaction"]
        L4c["Screenshots on failure"]
        L4 --- L4a
        L4 --- L4b
        L4 --- L4c

        L7["<b>L7: API Integration & Webhooks</b><br/>REST, OAuth 2.0, Flask"]
        L7a["Slack / Telegram APIs"]
        L7b["OAuth 2.0 flow"]
        L7c["Webhook receivers"]
        L7 --- L7a
        L7 --- L7b
        L7 --- L7c
    end

    L3 -->|"static HTML -> dynamic JS"| L4
    L3 -->|"HTTP knowledge"| L7

    subgraph Output ["Output: Email, Spreadsheets, Notifications"]
        L5["<b>L5: Email Automation</b><br/>smtplib, MIME, Jinja2"]
        L5a["HTML email + attachments"]
        L5b["Email templates"]
        L5c["Bulk personalized email"]
        L5 --- L5a
        L5 --- L5b
        L5 --- L5c

        L6["<b>L6: Spreadsheet Automation</b><br/>openpyxl, pandas"]
        L6a["Read/write Excel"]
        L6b["Charts & styling"]
        L6c["Conditional formatting"]
        L6 --- L6a
        L6 --- L6b
        L6 --- L6c
    end

    L4 -->|"scraped data -> report"| L5
    L5 -->|"attach spreadsheet reports"| L6
    L7 -->|"notifications complement email"| L5

    subgraph Processing ["Processing: Files & ETL"]
        L8["<b>L8: File & Data Processing</b><br/>watchdog, ETL, concurrent.futures"]
        L8a["Batch & streaming processing"]
        L8b["Directory watching (watchdog)"]
        L8c["ETL pipeline pattern"]
        L8d["Concurrent processing"]
        L8 --- L8a
        L8 --- L8b
        L8 --- L8c
        L8 --- L8d
    end

    L1 -->|"file ops foundation"| L8
    L6 -->|"spreadsheet data feeds pipeline"| L8

    subgraph QualityAS ["Quality: Testing & CI"]
        L9["<b>L9: Testing Automation Scripts</b><br/>pytest, mocking, GitHub Actions"]
        L9a["pytest fixtures & tmp_path"]
        L9b["Mock HTTP, SMTP, datetime"]
        L9c["Integration tests"]
        L9d["GitHub Actions CI"]
        L9 --- L9a
        L9 --- L9b
        L9 --- L9c
        L9 --- L9d
    end

    L8 -->|"test pipelines & processors"| L9
    L5 -->|"mock email sending"| L9
    L3 -->|"mock HTTP requests"| L9

    L10["<b>L10: Course Review & Mini Project</b><br/>Daily Report Bot"]
    L10a["Scrape -> Process -> Chart -> Excel -> Email"]
    L10b["Scheduled at 9 AM daily"]
    L10c["Full test suite"]
    L10 --- L10a
    L10 --- L10b
    L10 --- L10c

    L2 -->|"scheduling"| L10
    L3 -->|"data fetching"| L10
    L6 -->|"Excel report"| L10
    L5 -->|"email delivery"| L10
    L8 -->|"data pipeline"| L10
    L9 -->|"test coverage"| L10

    classDef foundationAS fill:#1565C0,color:#fff,stroke:#0D47A1
    classDef acquisition fill:#2E7D32,color:#fff,stroke:#1B5E20
    classDef output fill:#E65100,color:#fff,stroke:#BF360C
    classDef processing fill:#6A1B9A,color:#fff,stroke:#4A148C
    classDef qualityAS fill:#00838F,color:#fff,stroke:#006064
    classDef capstoneAS fill:#C62828,color:#fff,stroke:#B71C1C
    classDef subtopic fill:#F5F5F5,color:#333,stroke:#BDBDBD,stroke-width:1px

    class L1,L2 foundationAS
    class L3,L4,L7 acquisition
    class L5,L6 output
    class L8 processing
    class L9 qualityAS
    class L10 capstoneAS
    class L1a,L1b,L1c,L2a,L2b,L2c,L3a,L3b,L3c,L4a,L4b,L4c,L5a,L5b,L5c,L6a,L6b,L6c,L7a,L7b,L7c,L8a,L8b,L8c,L8d,L9a,L9b,L9c,L9d,L10a,L10b,L10c subtopic
```

---

## Course 12: Capstone Projects & Best Practices (10 lessons)

```mermaid
graph TD
    subgraph foundations12["Phase 1: Professional Foundations"]
        L01["<b>L01: Software Architecture</b><br/>SOLID, Layers, Design Patterns"]
        L01_a["SRP, OCP, DIP"]
        L01_b["Repository / Factory / Observer"]
        L01_c["Layered Architecture<br/>Presentation -> Business -> Data"]
        L01 --- L01_a
        L01 --- L01_b
        L01 --- L01_c
    end

    subgraph quality12["Phase 2: Quality & Safety"]
        L02["<b>L02: Testing Strategies</b><br/>Pyramid, TDD, pytest"]
        L02_a["Unit / Integration / E2E"]
        L02_b["TDD: Red -> Green -> Refactor"]
        L02_c["Fixtures, Parametrize, Coverage"]
        L02 --- L02_a
        L02 --- L02_b
        L02 --- L02_c

        L03["<b>L03: Code Quality & Style</b><br/>PEP 8, Linting, Type Hints"]
        L03_a["black + ruff + mypy"]
        L03_b["Type Hints & Protocols"]
        L03_c["Pre-commit Hooks"]
        L03 --- L03_a
        L03 --- L03_b
        L03 --- L03_c

        L04["<b>L04: Documentation</b><br/>Docstrings, README, API Docs"]
        L04_a["Google-style Docstrings"]
        L04_b["OpenAPI / Swagger"]
        L04_c["MkDocs / Doctest"]
        L04 --- L04_a
        L04 --- L04_b
        L04 --- L04_c
    end

    subgraph production12["Phase 3: Production Readiness"]
        L05["<b>L05: Security</b><br/>Secrets, Injection, Validation"]
        L05_a["Env vars & .gitignore"]
        L05_b["SQL Injection / XSS Prevention"]
        L05_c["Auth: Hashing, CSRF, Rate Limiting"]
        L05 --- L05_a
        L05 --- L05_b
        L05 --- L05_c

        L06["<b>L06: Performance</b><br/>Profiling, Caching, Async"]
        L06_a["cProfile / line_profiler"]
        L06_b["lru_cache / Flask-Caching"]
        L06_c["asyncio / aiohttp"]
        L06_d["N+1 Query Fixes"]
        L06 --- L06_a
        L06 --- L06_b
        L06 --- L06_c
        L06 --- L06_d
    end

    subgraph capstones12["Phase 4: Capstone Projects (Choose 1)"]
        L07["<b>L07: Blog Platform</b><br/>Full-stack Flask App"]
        L07_a["Auth + CRUD + REST API"]
        L07_b["Markdown, Tags, Comments"]
        L07_c["Admin Panel + Email Digest"]
        L07 --- L07_a
        L07 --- L07_b
        L07 --- L07_c

        L08["<b>L08: Analytics Pipeline</b><br/>ETL + Dashboard"]
        L08_a["Extract -> Transform -> Load"]
        L08_b["Anomaly Detection & Trends"]
        L08_c["Scheduled Reports + Charts"]
        L08 --- L08_a
        L08 --- L08_b
        L08 --- L08_c

        L09["<b>L09: CLI Developer Tool</b><br/>devkit CLI"]
        L09_a["Plugin System + Config"]
        L09_b["Quality Gates Runner"]
        L09_c["Package Distribution"]
        L09 --- L09_a
        L09 --- L09_b
        L09 --- L09_c
    end

    subgraph completion12["Phase 5: Completion"]
        L10["<b>L10: Next Steps</b><br/>Portfolio, Career, Community"]
        L10_a["GitHub Portfolio"]
        L10_b["Career Paths:<br/>Web / Data / DevOps"]
        L10_c["Open Source & Community"]
        L10 --- L10_a
        L10 --- L10_b
        L10 --- L10_c
    end

    L01 -->|"Architecture enables<br/>testable design"| L02
    L02 -->|"Tests need consistent<br/>code style"| L03
    L03 -->|"Quality code needs<br/>documentation"| L04
    L04 -->|"Documented code<br/>must be secure"| L05
    L05 -->|"Secure code should<br/>be performant"| L06

    L06 -->|"Apply all<br/>best practices"| L07
    L06 -->|"Apply all<br/>best practices"| L08
    L06 -->|"Apply all<br/>best practices"| L09

    L07 --> L10
    L08 --> L10
    L09 --> L10

    L01_b -.->|"Repository pattern<br/>used in tests"| L02_a
    L03_c -.->|"Pre-commit runs<br/>quality gates"| L02_c
    L05_a -.->|"Secrets scanning<br/>in CLI tool"| L09_b
    L01_c -.->|"Layered arch in<br/>blog platform"| L07

    style foundations12 fill:#e8f4f8,stroke:#2196F3,stroke-width:2px
    style quality12 fill:#e8f8e8,stroke:#4CAF50,stroke-width:2px
    style production12 fill:#fff3e0,stroke:#FF9800,stroke-width:2px
    style capstones12 fill:#fce4ec,stroke:#E91E63,stroke-width:2px
    style completion12 fill:#f3e5f5,stroke:#9C27B0,stroke-width:2px
```

---

## Full Curriculum Overview

```mermaid
graph LR
    C01["<b>01: Python<br/>Fundamentals</b><br/>11 lessons"]
    C02["<b>02: Data Types<br/>& Variables</b><br/>10 lessons"]
    C03["<b>03: Control Flow<br/>& Logic</b><br/>10 lessons"]
    C04["<b>04: Functions<br/>& Modules</b><br/>10 lessons"]
    C05["<b>05: Data<br/>Structures</b><br/>12 lessons"]
    C06["<b>06: OOP</b><br/>10 lessons"]
    C07["<b>07: File Handling<br/>& Exceptions</b><br/>10 lessons"]
    C08["<b>08: Working with<br/>Libraries</b><br/>10 lessons"]
    C09["<b>09: Web Dev<br/>Basics</b><br/>10 lessons"]
    C10["<b>10: Data Analysis<br/>& Visualization</b><br/>10 lessons"]
    C11["<b>11: Automation<br/>& Scripting</b><br/>10 lessons"]
    C12["<b>12: Capstone &<br/>Best Practices</b><br/>10 lessons"]

    C01 ==> C02 ==> C03 ==> C04 ==> C05 ==> C06 ==> C07 ==> C08
    C08 ==> C09
    C08 ==> C10
    C08 ==> C11
    C09 ==> C12
    C10 ==> C12
    C11 ==> C12

    classDef beginner fill:#4CAF50,color:#fff,stroke:#2E7D32
    classDef intermediate fill:#2196F3,color:#fff,stroke:#1565C0
    classDef advanced fill:#9C27B0,color:#fff,stroke:#6A1B9A

    class C01,C02,C03,C04 beginner
    class C05,C06,C07,C08 intermediate
    class C09,C10,C11,C12 advanced
```

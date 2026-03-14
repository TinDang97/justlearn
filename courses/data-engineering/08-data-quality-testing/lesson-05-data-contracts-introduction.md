# Lesson 5: Data Contracts — Introduction

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain what a data contract is and why it exists in pipeline architecture
- Identify the three layers of a contract: schema, semantics, and SLA
- Describe the producer/consumer model and where contracts belong
- Map contract boundaries to real pipeline stages (ingestion, processing, reporting)
- Differentiate contract enforcement from schema validation

---

## Prerequisites

- Lesson 1: Why Data Quality Matters
- Lesson 2: Schema Validation with Pandera

---

## Lesson Outline

### Part 1: What Is a Data Contract? (30 minutes)

#### Explanation

A **data contract** is a formal, version-controlled agreement between the team that produces data (producer) and the team that consumes it (consumer). It defines exactly what the producer promises to deliver: the schema, the business rules, and the operational guarantees.

**The REST API analogy:**

When a mobile app calls a backend API, there is an OpenAPI specification that says:
- `GET /orders` returns a JSON array
- Each order has `id` (integer), `amount` (float, > 0), `status` (enum: pending/shipped/delivered)
- Response time: < 200ms p99

If the backend team renames `id` to `order_id`, they must bump the API version and the frontend team opts in. No silent breakage.

Data pipelines need the same discipline. Without a contract:

```
[CRM System]  ──── "user_id" (int) ──────────────────►  [Analytics DB]
                                                              ↑
                                                   Dashboard: works
CRM team renames field to "userId" (camelCase)
                                                              ↑
                                                   Dashboard: silently
                                                   returns NULL for 3 days
```

With a contract at the pipeline boundary, the rename is caught immediately.

**Contract layers:**

| Layer | What it defines | Example |
|-------|----------------|---------|
| **Schema** | Column names, data types, nullability | `order_id: int, not null` |
| **Semantics** | Business rules about values | `amount is always in USD, > 0` |
| **SLA** | Operational guarantees | `updated within 1 hour of source; min 1,000 rows per daily run` |

**Key distinction — contract vs schema validation:**

- **Schema validation** (Lesson 2): checks structure. Did the column arrive with the right type and no nulls?
- **Data contract**: checks structure *plus* semantics *plus* SLA. It also encodes *who* agreed to the guarantee and *when*.

A contract includes a schema but is not merely a schema.

```
Schema validation:   "The field 'amount' is float and non-null."
Data contract:       "The field 'amount' is float, non-null, in USD, > 0,
                      represents completed transaction value (not pending),
                      and is available by 08:00 UTC daily."
```

---

### Part 2: Why Contracts Prevent Pipeline Failures (30 minutes)

#### Explanation

Most pipeline failures are not caused by software bugs — they are caused by **implicit assumptions** between teams that break silently when upstream systems change.

**A real failure timeline (without contracts):**

```
Day 0:   CRM exports orders as CSV with column "user_id"
         Analytics pipeline reads "user_id" — works fine.

Day 17:  CRM team refactors to camelCase: "userId"
         No notification sent (it is "just a rename").

Day 17:  Analytics pipeline reads CSV. "user_id" column not found.
         pandas silently assigns NaN to all rows.

Day 17:  Dashboard shows "Active Users: 0" — but it loaded, so no alert.

Day 20:  Business analyst notices the 3-day drop in DAU metrics.
         Incident investigation takes 6 hours.
         Engineering time spent: ~10 person-hours.
         Business decision made on wrong data: 3 days of reports invalidated.
```

**The same scenario with a contract:**

```
Day 0:   Contract defined at CRM → Analytics boundary:
           schema: {user_id: int, ...}
           version: "1.0"

Day 17:  CRM team updates CSV output to "userId"
         Contract enforcement triggers immediately at pipeline boundary:
           ContractViolationError: "Column 'user_id' required but missing"

Day 17:  Alert fires. Engineer investigates. Root cause: CRM rename.
         Fix deployed in 2 hours.
         No bad data reaches the dashboard.
```

**ASCII pipeline diagram with contract boundaries:**

```
[Source System]
      |
      | raw data (CSV / API / DB)
      v
[Ingestion Layer]  ←── Contract A (raw contract)
      |               Schema + basic validity
      | validated raw data
      v
[Transformation Layer]  ←── Contract B (processed contract)
      |                     Schema + business rules + SLA row count
      | clean, enriched data
      v
[Load / Storage]  ←── Contract C (load contract)
      |               Schema + uniqueness + referential integrity
      v
[Reporting / BI]
```

Each arrow is a contract boundary. When data crosses a boundary, `contract.enforce(df)` is called. If it fails, the pipeline halts **at that boundary** and raises an alert.

---

### Part 3: Contract Layers as Code — Preview (30 minutes)

#### Explanation

In Lesson 6, you will implement a full contract as a Python dataclass. Here is a preview of the pattern so you understand the direction before writing the implementation.

A data contract as Python code captures all three layers:

```python
# PREVIEW — full implementation in Lesson 6
# This is a conceptual sketch, not runnable code.

from dataclasses import dataclass, field
import pandas as pd

@dataclass
class OrdersContractV1:
    """
    Contract between CRM team (producer) and Analytics team (consumer).
    Version 1.0 — agreed 2024-01-15.

    Schema layer:    captured in the DataFrameSchema below
    Semantics layer: amount in USD, > 0; status is one of 4 known values
    SLA layer:       min_row_count=1000 (daily run produces at least 1000 orders)
                     max_null_rate=0.02 (at most 2% nulls across all columns)
    """
    version: str = "1.0"

    # --- Schema layer (implemented in Lesson 6 using our manual DataFrameSchema) ---
    # schema = DataFrameSchema({
    #     'order_id': Column(dtype='int64', nullable=False),
    #     'amount':   Column(dtype='float64', nullable=False, checks=[Check.greater_than(0)]),
    #     'status':   Column(dtype='object', nullable=False,
    #                        checks=[Check.isin(['pending', 'shipped', 'delivered', 'cancelled'])]),
    # })

    # --- SLA layer ---
    min_row_count: int   = 1_000   # daily run must produce at least 1000 rows
    max_null_rate: float = 0.02    # at most 2% nulls across all columns

    def enforce(self, df: pd.DataFrame) -> None:
        """
        Validate df against all three contract layers.
        Raises ContractViolationError with details if any layer fails.
        """
        # Schema layer: self.schema.validate(df, lazy=True)
        # SLA layer:    len(df) >= self.min_row_count
        #               df.isnull().mean().max() <= self.max_null_rate
        pass  # full implementation in Lesson 6
```

The pattern: a contract is a **value object** — immutable, version-stamped, and testable in isolation. You instantiate it once, call `enforce()` at each boundary, and the contract raises `ContractViolationError` with enough detail to diagnose the problem.

---

### Part 4: Practice (30 minutes)

#### Explanation

This is a discussion exercise. No code required. Given three pipeline descriptions below, identify (a) where the contract boundary should be placed and (b) what each contract should assert.

**Pipeline 1: E-commerce order ingestion**
```
Shopify API  →  ETL script  →  PostgreSQL (orders table)  →  Tableau dashboard
```

**Pipeline 2: HR data warehouse**
```
CSV export from Workday (monthly)  →  Python cleaning script  →  Snowflake (hr_facts)  →  Headcount report
```

**Pipeline 3: IoT sensor data**
```
MQTT broker  →  Kafka consumer  →  Spark streaming  →  TimescaleDB  →  Grafana
```

For each pipeline:
- **Where** does each contract boundary belong? (List the arrow positions)
- **Schema layer**: what columns and types would you assert?
- **Semantics layer**: what business rules apply? (e.g., "price is always positive", "sensor reading is 0-100")
- **SLA layer**: what row count or freshness guarantee would you require?

Think through these questions before reading the answers below.

---

**Reference answers:**

**Pipeline 1 (E-commerce):**
- Boundary A: between Shopify API and ETL script. Assert: `order_id` (int, non-null), `amount` (float, > 0), `status` (isin), `created_at` (parseable datetime). SLA: freshness within 5 minutes.
- Boundary B: between ETL script and PostgreSQL. Assert: all schema checks plus `customer_id` not null (transformed/resolved), no negative amounts. SLA: min 10 rows per run (at least 1 order every 5 minutes during business hours).

**Pipeline 2 (HR):**
- Boundary A: between CSV export and cleaning script. Assert: `employee_id` (non-null, unique), `hire_date` (parseable, <= today), `department` (isin known departments). SLA: row count within ±5% of last month's count.
- Boundary B: between cleaning script and Snowflake. Assert: all schema checks plus no duplicates, age between 18 and 75. SLA: exactly 1 load per month.

**Pipeline 3 (IoT):**
- Boundary A: between Kafka consumer and Spark. Assert: `device_id` (non-null), `reading` (float, 0-100), `timestamp` (recent — within last 60 seconds). SLA: min 1000 events/second.
- Boundary B: between Spark and TimescaleDB. Assert: aggregated schema, reading stddev within expected range (no runaway sensors). SLA: < 5 second latency.

---

## Key Takeaways

- A data contract makes implicit pipeline assumptions **explicit** and **enforceable**
- Three layers: schema (structure), semantics (business rules), SLA (operational guarantees)
- The producer/consumer model: the producer commits to the contract, the consumer relies on it; when upstream changes, the contract version must bump
- Contracts live in version control alongside pipeline code — they are not documentation, they are tests
- Contract violations at boundaries are better than silent data corruption that travels 3 pipeline stages before anyone notices
- One contract per pipeline boundary — not one mega-contract for the entire pipeline

---

## Common Mistakes to Avoid

- **Treating contracts as documentation (PDF, Confluence page)**: documentation drifts; a contract must be code that runs and fails loudly
- **Defining one mega-contract for the whole pipeline**: each boundary has different guarantees; a single contract makes violations hard to diagnose and boundaries hard to update independently
- **Enforcing contracts in production but not in tests**: your test suite should exercise contract violations just as it exercises happy-path logic; if `ContractViolationError` is never tested, you don't know what message it produces

---

## Next Lesson Preview

- How to implement the full `OrdersContract` dataclass with an embedded schema
- How `enforce()` validates schema + SLA in a single call
- How to wire `contract.enforce()` into an ETL pipeline function

---

[← Previous: Detecting Anomalies and Outliers](./lesson-04-detecting-anomalies-and-outliers.md) | [Next: Implementing Data Contracts →](./lesson-06-implementing-data-contracts.md)

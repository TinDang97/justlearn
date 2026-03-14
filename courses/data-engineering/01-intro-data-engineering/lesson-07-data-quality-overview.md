# Lesson 7: Introduction to Data Quality

**Course:** Data Engineering | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain why data quality failures have real business and financial consequences
- Name and define the six dimensions of data quality
- Identify the four stages in a pipeline where quality most commonly breaks down
- Describe what data contracts, monitoring, and data lineage mean in a production context

---

## Prerequisites

- Lesson 4: Data Pipeline Concepts
- Lesson 6: Data Storage Fundamentals

---

## Part 1: Why Data Quality Matters

In the field of computer science, the principle is called "garbage in, garbage out." Every system that processes data produces output that is only as reliable as its input. In data engineering, this principle has direct financial, operational, and regulatory consequences.

**The business cost of bad data:**

A product team makes a feature rollout decision based on a dashboard showing a 15% increase in user engagement. The pipeline feeding that dashboard has a bug: it is double-counting events from mobile users. The actual engagement increase is 7%. The team over-invests in the feature, misattributes its success, and deprioritizes a genuinely higher-impact initiative.

A finance team reports quarterly revenue to the board using numbers from the data warehouse. The ETL pipeline has a silent failure: it is missing two days of transaction data due to a timezone handling bug. The reported revenue is $2.3M less than the actual figure. The board meeting proceeds with incorrect numbers.

A customer success team targets at-risk accounts using a churn prediction model. The model was trained on data from the data warehouse that has a column definition mismatch: "days since last login" was calculated differently in the old pipeline versus the new one. Predictions are systematically off for a large segment of accounts.

**Regulatory and compliance risk:**

In financial services, healthcare, and other regulated industries, data accuracy is not optional — it is mandated. GDPR requires that personal data be accurate. SOX compliance requires that financial data be complete and auditable. Data quality failures in these contexts create legal liability, not just operational inconvenience.

**The trust problem:**

The most insidious consequence of persistent data quality issues is organizational: people stop trusting the data. When analysts routinely find discrepancies, when numbers from different dashboards do not agree, when reports are regularly corrected after being shared — people stop using data to make decisions and revert to intuition and opinion. Rebuilding trust in data systems is much harder than building quality in from the start.

Data quality is not a nice-to-have. It is the foundation on which the entire value of a data engineering investment rests.

---

## Part 2: The Six Dimensions of Data Quality

Data quality is not a single property — it is a family of related properties that must each be evaluated and maintained. The six recognized dimensions of data quality provide a structured vocabulary for identifying and communicating quality problems.

### Completeness

Completeness means that all required data is present. A record is complete if none of its critical fields are missing.

Incompleteness manifests as NULL values in required columns, missing records for time periods that should be covered, or records that exist but are truncated (a JSON payload that was too large was silently cut off during ingestion).

Examples of completeness failures: a user record with no email address in a CRM; a pipeline that ingested 3 of 5 days' worth of data in a batch window; an order record where the shipping address fields are NULL because the address normalization step failed.

### Accuracy

Accuracy means that values correctly reflect the real-world entities they represent. A record is accurate if its values are true.

Accuracy failures are harder to detect than completeness failures because inaccurate values are still present — they are just wrong. Examples: a product price that was updated in the source system but not propagated to the warehouse; a customer's phone number that was entered with a transposition error; a GPS coordinate that is slightly off because of sensor noise.

Detecting accuracy issues often requires cross-referencing the data against a ground truth source, which may not always be available.

### Consistency

Consistency means that the same entity is described the same way across all systems. If the definition of "active user" is different in the product analytics system, the CRM, and the data warehouse, reports from each system will disagree — even if each is internally correct.

Consistency failures often arise from organizational rather than technical causes: different teams built different systems at different times, using different definitions. The data engineer's role in addressing consistency failures is to standardize definitions and ensure that the canonical definition is applied consistently in transformations.

### Timeliness

Timeliness means that data arrives when it is needed. A record can be complete, accurate, and consistent, but useless if it arrives too late for the decision it was supposed to inform.

Timeliness failures include: a daily report that covers data through yesterday but the pipeline is delayed and the report shows data through two days ago; a fraud detection signal that arrives after the transaction has already settled; a machine learning feature that reflects the user's state from last week rather than today.

### Validity

Validity means that values conform to expected formats, ranges, and business rules. A value is valid if it is both present and in the expected form.

Validity failures: a date column containing the string "N/A"; a percentage column containing values greater than 100; an order quantity column containing negative numbers; an email column containing values that fail basic email format validation; a product ID in a transactions table that does not match any product in the products table (referential integrity violation).

### Uniqueness

Uniqueness means that each entity appears in the data the correct number of times — typically once. Unintended duplicates are a common and damaging type of data quality failure.

Duplicates arise in data engineering from: overlapping extraction windows (extracting the same time period twice and appending both batches), failed deduplication logic, pipelines that do not handle re-runs idempotently (as discussed in Lesson 4), and joins that fan out (joining a one-to-many relationship in a way that multiplies rows unexpectedly).

A dashboard that shows double the correct revenue because orders are duplicated in the warehouse is one of the most common and most confidence-destroying data quality failures in practice.

---

## Part 3: Where Quality Breaks Down

Data quality problems do not originate randomly. They cluster at specific transition points in the data journey. Understanding these failure points helps you build defenses at the right places.

### At Ingestion: Source System Issues

The source system is outside your control. Applications change schema without notifying the data team. APIs start returning malformed data. Batch files from data vendors arrive with different column names or encoding than expected. The source database has data entry errors that were present before the pipeline was built.

Defenses at ingestion: schema validation (assert that the extracted data matches the expected schema before loading), row count checks (assert that the number of extracted records is within expected bounds), and null checks on critical fields immediately after extraction.

### During Transformation: Logic Errors

Transformation logic contains bugs. A filter condition is slightly wrong, silently dropping valid records. A date calculation uses the wrong timezone, shifting all timestamps by a fixed offset. A deduplication step uses the wrong key, either keeping duplicates or over-deduplicating.

These bugs are especially insidious because they produce valid-looking output — there is no error message, the pipeline completes successfully, but the numbers are wrong.

Defenses at transformation: unit tests for transformation functions, row count comparisons between input and expected output, assertions on key invariants (total revenue should not change after deduplication).

### At Joins: Fan-Out Multiplication

Many data quality bugs are caused by unexpected fan-out in join operations. When you join Table A (1 row per order) to Table B (1 row per order event, but some orders have multiple events), the result may have more rows than Table A — and if you then aggregate, your totals will be inflated.

This category of bug is a uniqueness failure introduced by the transformation layer itself.

Defenses: always verify the expected cardinality of join keys before running joins on large tables. Assert that the join key in the "one" side of a one-to-many relationship is indeed unique.

### Over Time: Schema Drift and Upstream Changes

A pipeline that is correct today can break silently next week because the upstream system changed. The source API adds a new field and changes the type of an existing field. The application team renames a column. A data vendor changes their export format.

These changes break assumptions built into the pipeline that were never explicitly documented or tested.

Defenses: schema change detection (compare the current schema of extracted data against the expected schema stored as metadata), automated alerting when unexpected changes are detected, and data contracts (formal agreements with upstream teams about schema stability).

<Warning>Data quality is not a one-time fix. It requires monitoring infrastructure — a pipeline that passes today can silently break next week due to upstream schema changes. Building quality checks into your pipeline is necessary, but not sufficient. You must also monitor those checks continuously and alert when they fail.</Warning>

---

## Part 4: Quality as an Ongoing Practice

Data quality is not a project that gets completed and marked done. It is an ongoing operational practice, similar to application performance monitoring in software engineering.

**Data contracts** are formal agreements between data producers (application teams, data vendors, upstream pipelines) and data consumers (analysts, ML pipelines, downstream pipelines). A data contract specifies: what fields are guaranteed to be present, what types they will have, what value ranges are valid, and what the update frequency will be. When the producer changes the data in a way that violates the contract, they notify downstream consumers in advance.

Data contracts are an organizational practice, not a technical one. Their value is in creating accountability and communication channels between teams.

**Data quality monitoring** means running quality checks automatically and continuously, not just when you think there might be a problem. Automated checks include: row counts compared to historical baselines, null rates for critical columns, distribution checks for numerical columns, freshness checks (when did this table last receive data?), and referential integrity checks between related tables.

**Data lineage** is the ability to trace where a piece of data came from — which source, which pipeline, which transformation — and to understand its downstream impact. When a data quality issue is detected in a final analytics table, data lineage tells you which raw source introduced the problem, which pipeline step propagated it, and which other downstream tables or reports are affected.

**Section 8 of this course** is dedicated to data quality and testing. You will write quality checks in Python using Great Expectations, build unit tests for transformation logic, and implement monitoring patterns for production pipelines. This lesson gives you the vocabulary to understand why that work matters.

---

## Key Takeaways

- Data quality failures have direct business consequences: wrong decisions, financial reporting errors, and loss of trust in data systems
- The six dimensions of data quality: Completeness (no missing critical fields), Accuracy (values are correct), Consistency (same definitions across systems), Timeliness (data arrives when needed), Validity (values conform to expected formats and ranges), Uniqueness (no unintended duplicates)
- Quality breaks down most commonly at ingestion (source system issues), during transformation (logic errors), at joins (fan-out multiplication), and over time (schema drift)
- Data quality requires ongoing monitoring infrastructure, not just one-time fixes
- Data contracts, quality monitoring, and data lineage are the three pillars of a production data quality practice

---

## Common Mistakes to Avoid

**Treating data quality as a cleanup task.** "We'll fix the data quality issues when we have time." This approach consistently results in dashboards that are never trusted and decisions that are never made with confidence. Quality checks must be built into the pipeline, not retrofitted after problems are discovered.

**No monitoring after deployment.** A pipeline that passes quality checks on day one will not necessarily pass them on day 100. Schema drift, upstream changes, and data volume anomalies will occur. Without monitoring, these failures are discovered by analysts (who find wrong numbers) rather than by engineers (who can fix them before they propagate).

**Conflating quality dimensions.** A record can be valid (properly formatted) but inaccurate (wrong value). A table can be complete (all rows present) but inconsistent with another table (different definition of the same metric). Understanding which dimension is failing helps you identify the correct root cause and fix.

---

## Next Lesson Preview

In **Lesson 8: Data Engineering Roles and the Tooling Landscape**, you will get a comprehensive map of the data team ecosystem — the different roles, how they overlap, and what separates them. You will also see the complete tooling landscape that data engineers operate within and understand exactly what this course covers and why it starts with raw Python rather than frameworks.

---

[Back to Course Overview](./README.md) | [Next Lesson: DE Roles and the Tooling Landscape →](./lesson-08-de-roles-and-tools.md)

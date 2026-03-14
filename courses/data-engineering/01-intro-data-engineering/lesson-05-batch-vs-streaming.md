# Lesson 5: Batch Processing vs Streaming

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Define batch processing and explain when it is the appropriate choice
- Define streaming processing and describe the problems it solves
- Compare the operational complexity of batch and streaming systems
- Identify micro-batching as a middle-ground pattern
- Apply the batch vs streaming decision framework to realistic use cases

---

## Prerequisites

- Lesson 4: Data Pipeline Concepts

---

## Part 1: Batch Processing

Batch processing is the practice of collecting data over a period of time and processing all of it together as a single unit of work — a "batch" — at a scheduled interval.

This is the oldest and most common paradigm in data engineering. End-of-day batch jobs were the norm in enterprise data warehousing for decades, and they remain the dominant pattern today even as streaming has matured.

In a batch pipeline, data accumulates in a source system throughout the day. At a scheduled time — midnight, or every hour, or every 15 minutes — the pipeline wakes up, extracts all the data that has accumulated since the last run, transforms it, and loads it into the destination. The pipeline then sleeps until the next scheduled run.

**Concrete examples of batch processing:**

A nightly sales report pipeline runs at 2 AM. It extracts all orders placed between midnight yesterday and midnight today from the order database, joins them with product and customer tables, calculates revenue and margin by category, and populates the `daily_sales` table in the data warehouse. By the time the VP of Sales opens their Looker dashboard at 8 AM, the data is there.

An hourly customer activity pipeline extracts new events from the event database every hour on the hour. It deduplicates events, enriches them with user profile data, and appends them to the `user_activity_facts` table. Analysts querying this table get data that is at most one hour stale.

A weekly financial reconciliation job runs every Sunday night. It pulls transaction data from the payment processor, compares it against the internal accounting system, flags discrepancies, and produces a report for the finance team.

**The key characteristic of batch processing is latency tolerance.** The pipeline does not need to react to data as it arrives — it is acceptable for data to be hours old when it reaches the destination. This tolerance is what makes batch processing operationally simple: you schedule a job, it runs, and you do not need to maintain persistent connection to data sources.

**Tools for batch processing:**

Python scripts scheduled with cron (the Unix scheduler) or Apache Airflow are the most common approach for custom batch pipelines. SQL transformations scheduled in dbt handle the transformation layer. For very large data volumes, Apache Spark batch jobs distribute the processing across a cluster.

<Info>90% of data engineering work is batch processing. The majority of business questions — daily revenue, weekly active users, monthly churn rate — are answered with batch pipelines. Learn batch well before diving into streaming.</Info>

---

## Part 2: Streaming (Real-Time) Processing

Streaming processing handles data events one at a time (or in very small groups) as they arrive, with the goal of producing a result within milliseconds to seconds of the event occurring.

Where batch processing is about scheduled bulk operations, streaming is about continuous, event-driven reactions. The pipeline does not sleep between runs — it is always running, always listening, always processing.

**What makes streaming necessary:**

Some business problems genuinely cannot tolerate data latency. If a customer's credit card is used fraudulently, detecting it 24 hours later (after the nightly batch) is too late. The fraud detection system needs to evaluate each transaction within milliseconds of its occurrence to intervene in real time.

Similarly, surge pricing for ride-sharing works by observing supply and demand in real time and adjusting prices within seconds. A batch pipeline that recalculates prices once an hour would be far too slow to track fast-moving local supply-demand imbalances.

Live dashboards for operational monitoring — how many orders are processing right now, how many errors are occurring this minute — require data that is seconds old, not hours old.

**How streaming works:**

Events are produced by source systems (user actions, application logs, IoT sensors, financial transactions) and published to a message bus — typically Apache Kafka. Kafka stores events in ordered logs called topics. A streaming processor subscribes to one or more topics and processes each event as it arrives.

The streaming processor applies transformation logic: filtering out irrelevant events, enriching events with reference data, aggregating over time windows (how many events occurred in the last 5 minutes?), detecting patterns across event sequences (three failed login attempts followed by a successful one).

The processed output is written to a destination: a real-time database, a cache, another Kafka topic for downstream processing, or a time-series database for operational monitoring.

**Key tools for streaming:**

Apache Kafka is the most widely used message bus. Nearly every streaming architecture is built on Kafka or a cloud-equivalent (AWS Kinesis, Google Pub/Sub, Azure Event Hubs). Kafka is designed for very high throughput (millions of events per second) and durable storage.

Apache Flink is the leading distributed stream processing engine. It supports stateful computation — maintaining state across millions of simultaneous event streams — and provides exactly-once processing guarantees. Flink is used at companies like Uber, Alibaba, and Netflix for large-scale streaming.

Apache Spark Structured Streaming extends the Spark batch API to streaming. It uses a micro-batch execution model internally but exposes a streaming API that feels similar to batch. It is easier to adopt for teams already using Spark for batch.

---

## Part 3: When to Choose Each

The decision between batch and streaming is driven by latency requirements, complexity tolerance, and cost.

### Choose batch when:

**Latency tolerance is measured in minutes or longer.** If the business question can be answered with data that is an hour old — or a day old — batch processing is the right choice. Most analytical questions fall into this category: daily sales, weekly active users, monthly cohort retention.

**The use case is historical analysis.** Any time you are processing data that has already happened (last quarter's revenue, year-over-year growth), batch is the appropriate paradigm. Streaming is for reacting to what is happening now.

**Infrastructure simplicity is a priority.** Batch pipelines are easier to build, test, debug, and operate. A Python script plus a cron schedule is infrastructure that any engineer can understand and maintain. Streaming infrastructure — Kafka clusters, Flink jobs, consumer group management, offset tracking — requires significant operational expertise.

**Budget is constrained.** Streaming infrastructure is more expensive to run continuously than batch jobs that run periodically. A Kafka cluster plus a Flink application running 24/7 costs significantly more than a batch pipeline that runs for 10 minutes per hour.

### Choose streaming when:

**Latency requirement is less than seconds.** Fraud detection, real-time recommendation serving, live alerting, operational monitoring — these use cases require data to be processed within milliseconds to seconds of an event occurring. No amount of batch optimization can achieve this.

**The system must react to individual events.** Personalization (show the user a recommendation based on what they just viewed), fraud detection (decline a transaction based on the last 30 seconds of behavior), and alerting (notify the on-call engineer the moment an error rate exceeds a threshold) all require event-by-event processing.

**Event ordering matters.** If you need to process events in the order they occurred, streaming processors can maintain ordering within partitions. Batch processing loses the ability to react to order at the individual event level.

### The operational reality:

Most companies do not need streaming for most of their data work. The engineering cost of building and operating streaming infrastructure is high. A team that invests heavily in streaming for use cases that could be served by 5-minute batch intervals has mis-allocated its engineering effort.

**The right approach is incremental adoption:** start with batch, measure whether latency is causing business problems, and introduce streaming only for the specific use cases where batch latency is demonstrably insufficient.

---

## Part 4: Micro-Batching as a Middle Ground

Micro-batching is a hybrid approach that processes small batches of events very frequently — every 30 seconds, every minute — to achieve near-real-time latency without the full complexity of true event-by-event streaming.

The distinction between micro-batching and streaming is architectural but important:

- True streaming processes each event individually as it arrives
- Micro-batching accumulates events over a short window and processes them together

In practice, many use cases that seem to require streaming can be served by micro-batching. If "real-time" for your use case means data is no more than 1 minute old (not 1 second old), micro-batching is a significantly simpler solution.

**Spark Structured Streaming** is the most widely used micro-batching system. You write code that looks like a streaming pipeline, but internally Spark processes micro-batches at a configurable interval. This makes it easy to develop and test (using Spark's batch tools) while achieving near-real-time results.

**AWS Kinesis Firehose** buffers streaming events for a configurable interval (minimum 60 seconds) before writing them to S3 or a data warehouse. For teams that need data fresher than hourly but do not need sub-second latency, Firehose is far simpler to operate than a full Flink deployment.

---

## Key Takeaways

- Batch processing collects data over time and processes it at scheduled intervals; it is the appropriate choice when latency tolerance is measured in minutes or longer
- Streaming processing handles events as they arrive, within milliseconds to seconds; it is necessary for fraud detection, real-time personalization, and operational monitoring
- Batch is operationally simpler, less expensive, and correct for most analytical use cases
- Streaming requires significant operational investment (Kafka, Flink/Spark Streaming) and is justified only when batch latency genuinely fails to meet business requirements
- Micro-batching (Spark Structured Streaming, Kinesis Firehose) provides a middle ground: near-real-time latency with lower operational complexity than true event-by-event streaming

---

## Common Mistakes to Avoid

**Streaming everything.** The engineering cost of streaming infrastructure is high. Teams that apply streaming to use cases where 15-minute batch intervals would suffice are spending engineering capacity on unnecessary complexity. Always ask: what is the actual latency requirement? Is streaming the only way to meet it?

**Ignoring cost.** Streaming infrastructure runs continuously and is typically billed by time (not by volume). A Kafka cluster plus a Flink application running 24/7 can cost tens of thousands of dollars per month. Evaluate whether the business value of real-time latency justifies this cost before committing to streaming.

**Under-estimating streaming complexity.** Streaming systems have failure modes that batch systems do not: consumer lag (the processor is falling behind the rate of incoming events), duplicate processing (what happens when a job restarts mid-stream?), late-arriving events (an event from 5 minutes ago arrives out of order). These are solvable problems, but they require deliberate design and add significant operational burden.

---

## Next Lesson Preview

In **Lesson 6: Data Storage Fundamentals**, you will learn about the main storage types in the modern data stack — relational databases, data warehouses, data lakes, and the emerging Lakehouse pattern — and understand when each is the right choice. You will also learn why file formats (CSV, JSON, Parquet) matter more than they appear to.

---

[Back to Course Overview](./README.md) | [Next Lesson: Data Storage Fundamentals →](./lesson-06-data-storage-fundamentals.md)

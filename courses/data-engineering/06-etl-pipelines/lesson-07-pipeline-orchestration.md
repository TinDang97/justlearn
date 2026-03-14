# Lesson 7: Orchestration — Running Pipelines in Order

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Build a `PipelineRunner` that executes stages in sequence with result tracking
- Handle stage dependencies and short-circuit execution on failure
- Add retry logic to recover from transient failures
- Understand how production orchestrators (Airflow, Prefect) extend these patterns

---

## Prerequisites

- Lesson 6: Logging
- Python classes, enums
- `time` standard library module

---

## Lesson Outline

### Part 1: Sequential Pipeline Runner (30 minutes)

#### Shared Context Pattern

When pipeline stages pass data to each other, a shared context dict is cleaner than threading global variables. Each stage reads what it needs and writes its output to the context.

```python
import pandas as pd
import io
import time

# Shared pipeline context
initial_context = {
    "raw_df": None,
    "clean_df": None,
    "rows_loaded": 0,
}

RAW_DATA = """order_id,amount,product
1001,250.0,laptop
1002,45.5,keyboard
1003,-10.0,invalid
1004,89.9,mouse
"""


# Stages: each reads from context and writes back to it
def stage_extract(ctx: dict) -> dict:
    df = pd.read_csv(io.StringIO(RAW_DATA))
    ctx["raw_df"] = df
    print(f"  [extract] {len(df)} rows loaded")
    return ctx


def stage_transform(ctx: dict) -> dict:
    raw_df = ctx["raw_df"]
    clean_df = raw_df[raw_df["amount"] > 0].copy()
    clean_df["revenue"] = clean_df["amount"]
    ctx["clean_df"] = clean_df
    print(f"  [transform] {len(raw_df)} -> {len(clean_df)} rows")
    return ctx


def stage_load(ctx: dict) -> dict:
    clean_df = ctx["clean_df"]
    # Simulate write
    ctx["rows_loaded"] = len(clean_df)
    print(f"  [load] {len(clean_df)} rows written")
    return ctx


class PipelineRunner:
    """Runs a sequence of stage functions with a shared context."""

    def __init__(self, stages: list):
        """stages: list of (name, function) tuples"""
        self.stages = stages

    def run(self, context: dict) -> dict:
        """Execute all stages in order. Returns final context."""
        print(f"Pipeline starting ({len(self.stages)} stages)")
        start_time = time.time()

        for name, fn in self.stages:
            print(f"Running stage: {name}")
            context = fn(context)

        duration = round(time.time() - start_time, 3)
        print(f"Pipeline complete in {duration}s")
        return context


runner = PipelineRunner(stages=[
    ("extract",   stage_extract),
    ("transform", stage_transform),
    ("load",      stage_load),
])

ctx = runner.run(initial_context.copy())
print(f"\nRows loaded: {ctx['rows_loaded']}")
```

---

### Part 2: Stage Dependencies and Short-Circuit (30 minutes)

#### Stage Results and Short-Circuit on Failure

A production runner needs to track per-stage results and stop if a required stage fails.

```python
import pandas as pd
import io
import time
from enum import Enum

class StageResult(Enum):
    PASSED  = "PASSED"
    SKIPPED = "SKIPPED"
    FAILED  = "FAILED"


class PipelineRunner:
    """
    Runs stages sequentially.
    Short-circuits on first failure.
    Tracks per-stage results.
    """

    def __init__(self, stages: list):
        self.stages = stages

    def run(self, context: dict) -> list:
        """
        Returns a list of stage report dicts:
        [{"name": ..., "result": StageResult, "duration": ..., "error": ...}]
        """
        report = []
        failed = False

        for name, fn in self.stages:
            if failed:
                report.append({
                    "name": name,
                    "result": StageResult.SKIPPED,
                    "duration": 0,
                    "error": None,
                })
                continue

            t0 = time.time()
            try:
                context = fn(context)
                duration = round(time.time() - t0, 3)
                report.append({
                    "name": name,
                    "result": StageResult.PASSED,
                    "duration": duration,
                    "error": None,
                })
            except Exception as e:
                duration = round(time.time() - t0, 3)
                report.append({
                    "name": name,
                    "result": StageResult.FAILED,
                    "duration": duration,
                    "error": str(e),
                })
                failed = True

        return report


# Stages — second one is broken
def stage_ok_1(ctx: dict) -> dict:
    ctx["step1"] = True
    return ctx

def stage_broken(ctx: dict) -> dict:
    raise ValueError("Simulated failure in stage 2")

def stage_ok_3(ctx: dict) -> dict:
    ctx["step3"] = True
    return ctx


runner = PipelineRunner(stages=[
    ("stage_1", stage_ok_1),
    ("stage_2", stage_broken),
    ("stage_3", stage_ok_3),
])

report = runner.run({})

print("\nStage Report:")
print(f"{'Stage':<12} {'Result':<10} {'Duration':>10}  Error")
print("-" * 50)
for item in report:
    err = item["error"] or ""
    print(f"{item['name']:<12} {item['result'].value:<10} {item['duration']:>9.3f}s  {err}")

# Check if any stage failed
failed_stages = [r for r in report if r["result"] == StageResult.FAILED]
if failed_stages:
    print(f"\nPipeline failed at: {failed_stages[0]['name']}")
```

#### Dependency Check: Skip Transform if Extract is Empty

```python
import pandas as pd
import io

def stage_extract_empty(ctx: dict) -> dict:
    """Extracts 0 rows — simulates empty source."""
    ctx["raw_df"] = pd.DataFrame(columns=["id", "amount"])
    return ctx

def stage_transform_guarded(ctx: dict) -> dict:
    """Skip if upstream produced 0 rows."""
    raw_df = ctx.get("raw_df")
    if raw_df is None or len(raw_df) == 0:
        print("  [transform] skipped — no input rows")
        ctx["clean_df"] = pd.DataFrame()
        return ctx
    ctx["clean_df"] = raw_df[raw_df["amount"] > 0].copy()
    return ctx

ctx = {}
ctx = stage_extract_empty(ctx)
ctx = stage_transform_guarded(ctx)
print("clean_df rows:", len(ctx["clean_df"]))
```

---

### Part 3: Orchestrators Overview (30 minutes)

#### From PipelineRunner to Airflow

The `PipelineRunner` you built in this lesson is a simple in-process orchestrator. Production systems add: scheduling (run at 2am daily), dependency graphs (DAGs), retries with backoff, monitoring dashboards, and alerting.

**Our PipelineRunner vs Apache Airflow conceptual comparison:**

```python
# Our PipelineRunner approach
runner = PipelineRunner(stages=[
    ("extract",   stage_extract),
    ("transform", stage_transform),
    ("load",      stage_load),
])
runner.run(context)

# -------------------------------------------------------------------
# Conceptual Airflow DAG (pseudocode — no import needed)
# -------------------------------------------------------------------
# from airflow import DAG
# from airflow.operators.python import PythonOperator
#
# with DAG("sales_daily", schedule_interval="@daily") as dag:
#     extract_task = PythonOperator(
#         task_id="extract",
#         python_callable=stage_extract,
#     )
#     transform_task = PythonOperator(
#         task_id="transform",
#         python_callable=stage_transform,
#     )
#     load_task = PythonOperator(
#         task_id="load",
#         python_callable=stage_load,
#     )
#     extract_task >> transform_task >> load_task  # dependency graph

# -------------------------------------------------------------------
# Conceptual Prefect flow (pseudocode)
# -------------------------------------------------------------------
# from prefect import flow, task
#
# @task
# def extract_task(): return stage_extract({})
#
# @task
# def transform_task(ctx): return stage_transform(ctx)
#
# @flow
# def sales_pipeline():
#     ctx = extract_task()
#     ctx = transform_task(ctx)
```

The patterns are identical — extract, transform, load as functions. Orchestrators add the infrastructure around them. When you have more than 5 interdependent pipelines, a real orchestrator is worth the setup cost.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: PipelineRunner with Stage Report

<PracticeBlock
  prompt="Build a PipelineRunner class that accepts a list of (name, function) tuples. run(context) executes each stage. If a stage raises, mark it FAILED, stop remaining stages, and mark them SKIPPED. Return a report list with per-stage dicts containing name, status ('PASSED'/'FAILED'/'SKIPPED'), and error (None or string)."
  initialCode={`import time

def stage_a(ctx: dict) -> dict:
    ctx["a"] = 1
    return ctx

def stage_b_fails(ctx: dict) -> dict:
    raise RuntimeError("Intentional failure")

def stage_c(ctx: dict) -> dict:
    ctx["c"] = 3
    return ctx

# TODO: build PipelineRunner class with run(context) method
# runner = PipelineRunner([("a", stage_a), ("b", stage_b_fails), ("c", stage_c)])
# report = runner.run({})
# Expected: a=PASSED, b=FAILED, c=SKIPPED
`}
  hint="Loop over stages. If failed=True, append SKIPPED and continue. Else wrap fn(context) in try/except: success -> PASSED, exception -> FAILED, set failed=True."
  solution={`import time

def stage_a(ctx: dict) -> dict:
    ctx["a"] = 1
    return ctx

def stage_b_fails(ctx: dict) -> dict:
    raise RuntimeError("Intentional failure")

def stage_c(ctx: dict) -> dict:
    ctx["c"] = 3
    return ctx

class PipelineRunner:
    def __init__(self, stages: list):
        self.stages = stages

    def run(self, context: dict) -> list:
        report = []
        failed = False
        for name, fn in self.stages:
            if failed:
                report.append({"name": name, "status": "SKIPPED", "error": None})
                continue
            try:
                context = fn(context)
                report.append({"name": name, "status": "PASSED", "error": None})
            except Exception as e:
                report.append({"name": name, "status": "FAILED", "error": str(e)})
                failed = True
        return report

runner = PipelineRunner([("a", stage_a), ("b", stage_b_fails), ("c", stage_c)])
report = runner.run({})
for item in report:
    print(f"{item['name']}: {item['status']}" +
          (f" ({item['error']})" if item['error'] else ""))`}
/>

#### Exercise 2: PipelineRunner with Retry Logic

<PracticeBlock
  prompt="Extend PipelineRunner to accept max_retries=2. When a stage fails, retry it up to max_retries times (track attempt count, log each retry). Use a counter instead of time.sleep for the delay simulation. If all retries fail, mark the stage FAILED."
  initialCode={`import time

attempt_log = []  # Track calls for verification

call_count = {"n": 0}

def flaky_stage(ctx: dict) -> dict:
    """Fails the first 2 times, succeeds on the 3rd."""
    call_count["n"] += 1
    attempt_log.append(call_count["n"])
    if call_count["n"] < 3:
        raise RuntimeError(f"Transient failure (attempt {call_count['n']})")
    ctx["done"] = True
    return ctx

# TODO: extend PipelineRunner to support max_retries=2
# With max_retries=2, flaky_stage should eventually PASS after 3 attempts
# Log each retry: "Retrying stage 'X' (attempt N/max_retries)"
`}
  hint="Inside the stage loop, use a for loop: for attempt in range(max_retries + 1). Break on success. If attempts exhausted, mark FAILED."
  solution={`import time

attempt_log = []
call_count = {"n": 0}

def flaky_stage(ctx: dict) -> dict:
    call_count["n"] += 1
    attempt_log.append(call_count["n"])
    if call_count["n"] < 3:
        raise RuntimeError(f"Transient failure (attempt {call_count['n']})")
    ctx["done"] = True
    return ctx

class PipelineRunner:
    def __init__(self, stages: list, max_retries: int = 0):
        self.stages = stages
        self.max_retries = max_retries

    def run(self, context: dict) -> list:
        report = []
        pipeline_failed = False
        for name, fn in self.stages:
            if pipeline_failed:
                report.append({"name": name, "status": "SKIPPED", "error": None})
                continue
            last_error = None
            succeeded = False
            for attempt in range(self.max_retries + 1):
                try:
                    context = fn(context)
                    succeeded = True
                    break
                except Exception as e:
                    last_error = e
                    if attempt < self.max_retries:
                        print(f"  Retrying '{name}' (attempt {attempt + 2}/{self.max_retries + 1})")
            if succeeded:
                report.append({"name": name, "status": "PASSED", "error": None})
            else:
                report.append({"name": name, "status": "FAILED", "error": str(last_error)})
                pipeline_failed = True
        return report

runner = PipelineRunner([("flaky", flaky_stage)], max_retries=2)
report = runner.run({})
for item in report:
    print(f"{item['name']}: {item['status']}" +
          (f" ({item['error']})" if item['error'] else ""))
print(f"Total attempts: {len(attempt_log)}")`}
/>

---

## Key Takeaways

- **Shared context dict** enables inter-stage communication without global state
- **Short-circuit on failure** — when a stage fails, mark remaining stages SKIPPED, not FAILED
- **Stage result tracking** (`PASSED` / `FAILED` / `SKIPPED`) provides a machine-readable pipeline report
- **Retry logic** handles transient failures (network timeouts, deadlocks) without human intervention
- **Production orchestrators** (Airflow, Prefect) add scheduling, DAG visualisation, monitoring — built on the same E-T-L function pattern

---

## Common Mistakes to Avoid

- Mutating the context dict inside a stage and losing data if the stage later fails — use `ctx.copy()` for expensive state
- Retrying indefinitely without a limit — always bound retries to prevent runaway pipelines
- Not distinguishing FAILED from SKIPPED in the report — downstream alerting needs to know the difference
- Starting transforms before checking that extract returned data — guard at the dependency boundary

---

[← Previous](./lesson-06-logging.md) | [Back to Course](./README.md) | [Next →](./lesson-08-idempotency-reruns.md)

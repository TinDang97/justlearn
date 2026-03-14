# Lesson 3: Project 2 — Log File Analyzer

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

A production microservices system generates structured log files with thousands of entries per day. Operations teams need to know which services are producing the most errors and what the most common error messages are. Build an analyzer that loads log data, normalizes the log levels, computes error rates per service, identifies the top-N most frequent error messages, and produces a formatted text report.

**Deliverable:** A formatted multi-line error rate report showing per-service error percentages and the top-10 most frequent error messages.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| Reading structured text data with `pd.read_csv()` | Section 3: Data Loading & File Formats |
| String normalization with `.str.upper()` and `.str.strip()` | Section 4: Data Cleaning |
| Aggregation with `groupby` and `value_counts` | Section 5: Data Transformation |
| Vectorized string operations | Section 9: Performance & Optimization |

---

## Architecture

```
load_logs('data/logs.csv')
        |
        v
normalize_log_levels(df)   <-- .str.upper().str.strip() on level column
        |
        v
parse_timestamps(df)        <-- pd.to_datetime on timestamp column
        |
        v
compute_error_rates(df)     <-- groupby service, compute error % per service
        |
        v
get_top_errors(df, n=10)    <-- filter ERROR rows, value_counts on message
        |
        v
format_report(rates, top_errors, df)  <-- build formatted text report
        |
        v
        STDOUT: error rate report
```

---

## Dataset

**File:** `data/logs.csv` | 5,000 rows | 4 columns

| Column | Type | Known Issues |
|--------|------|-------------|
| `timestamp` | string | ISO datetime format, some microseconds |
| `level` | string | Mixed casing: `INFO`, `info`, `Error`, `ERROR` |
| `service` | string | 5 microservices, consistent names |
| `message` | string | Free text; ERROR messages often repeat exactly |

**Services:** `auth-service`, `payment-service`, `inventory-service`, `notification-service`, `api-gateway`

**Log levels:** `INFO`, `WARNING`, `ERROR`, `DEBUG` (with casing variants in raw data)

---

## Starter Code

```python
import pandas as pd
import numpy as np
import io
from datetime import datetime

# --- Bundled dataset (simulates pd.read_csv('data/logs.csv')) ---
LOGS_CSV = """timestamp,level,service,message
2024-01-15 08:00:01,INFO,auth-service,User login successful
2024-01-15 08:00:03,ERROR,payment-service,Connection timeout to payment gateway
2024-01-15 08:00:05,info,inventory-service,Stock check completed
2024-01-15 08:00:07,ERROR,payment-service,Connection timeout to payment gateway
2024-01-15 08:00:09,WARNING,api-gateway,High latency detected: 2.3s
2024-01-15 08:00:11,Error,auth-service,Invalid token signature
2024-01-15 08:00:13,INFO,notification-service,Email queued for user C001
2024-01-15 08:00:15,ERROR,payment-service,Database connection refused
2024-01-15 08:00:17,DEBUG,auth-service,Token validation started
2024-01-15 08:00:19,ERROR,inventory-service,Failed to update stock count
2024-01-15 08:00:21,INFO,api-gateway,Request processed successfully
2024-01-15 08:00:23,ERROR,payment-service,Connection timeout to payment gateway
2024-01-15 08:00:25,WARNING,inventory-service,Low stock threshold reached for SKU-4821
2024-01-15 08:00:27,ERROR,auth-service,Invalid token signature
2024-01-15 08:00:29,INFO,notification-service,SMS sent successfully
2024-01-15 08:00:31,ERROR,api-gateway,Rate limit exceeded for client 192.168.1.45
2024-01-15 08:00:33,INFO,payment-service,Payment processed: $149.99
2024-01-15 08:00:35,ERROR,inventory-service,Failed to update stock count
2024-01-15 08:00:37,INFO,auth-service,User logout recorded
2024-01-15 08:00:39,ERROR,notification-service,SMTP connection refused
"""


def load_logs(csv_string: str) -> pd.DataFrame:
    """Load logs from a CSV string.

    Returns:
        Raw DataFrame with all columns as strings (before normalization).
    """
    return pd.read_csv(io.StringIO(csv_string))


def normalize_log_levels(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize the level column to uppercase.

    The raw data contains variants like 'info', 'Error', 'ERROR'.
    Normalize all to uppercase: 'INFO', 'WARNING', 'ERROR', 'DEBUG'.

    Returns:
        DataFrame with normalized level column (mutates a copy).
    """
    # TODO: normalize level column
    # df_norm = df.copy()
    # df_norm['level'] = df_norm['level'].str.upper().str.strip()
    # return df_norm
    return df.copy()


def parse_timestamps(df: pd.DataFrame) -> pd.DataFrame:
    """Parse the timestamp column to datetime.

    Returns:
        DataFrame with timestamp as datetime64 dtype.
    """
    # TODO: parse timestamp column
    # df_parsed = df.copy()
    # df_parsed['timestamp'] = pd.to_datetime(df_parsed['timestamp'], errors='coerce')
    # return df_parsed
    return df.copy()


def compute_error_rates(df: pd.DataFrame) -> pd.DataFrame:
    """Compute error rate per service.

    For each service, compute:
    - total_logs: total number of log entries
    - error_logs: number of entries with level == 'ERROR'
    - error_rate: error_logs / total_logs (float 0.0–1.0)
    - above_threshold: True if error_rate > 0.05

    Returns:
        DataFrame with columns [service, total_logs, error_logs, error_rate, above_threshold]
        sorted by error_rate descending.
    """
    # TODO: implement error rate computation
    # Step 1: compute total logs per service
    # total = df.groupby('service').size().rename('total_logs')

    # Step 2: compute error logs per service
    # errors = df[df['level'] == 'ERROR'].groupby('service').size().rename('error_logs')

    # Step 3: join and compute rate
    # rates = pd.concat([total, errors], axis=1).fillna(0)
    # rates['error_logs'] = rates['error_logs'].astype(int)
    # rates['error_rate'] = (rates['error_logs'] / rates['total_logs']).round(4)
    # rates['above_threshold'] = rates['error_rate'] > 0.05
    # return rates.reset_index().sort_values('error_rate', ascending=False)

    return pd.DataFrame(columns=['service', 'total_logs', 'error_logs', 'error_rate', 'above_threshold'])


def get_top_errors(df: pd.DataFrame, n: int = 10) -> pd.Series:
    """Get the top-N most frequent error messages.

    Filters to ERROR-level rows only, then returns the n most common messages
    using value_counts.

    Returns:
        Series with message as index and count as values, length <= n.
    """
    # TODO: implement top error messages
    # error_rows = df[df['level'] == 'ERROR']
    # return error_rows['message'].str.strip().value_counts().head(n)
    return pd.Series(dtype=int)


def format_report(rates: pd.DataFrame, top_errors: pd.Series, df: pd.DataFrame) -> str:
    """Format the analysis results into a readable text report.

    Report structure:
    1. Header with date, total services, total logs, total errors
    2. Per-service error rate table (sorted by error_rate desc)
    3. Top-10 error messages section

    Returns:
        Formatted report string (also prints to stdout).
    """
    total_logs = len(df)
    total_errors = (df['level'] == 'ERROR').sum()
    error_pct = total_errors / total_logs * 100 if total_logs > 0 else 0
    report_date = df['timestamp'].max() if hasattr(df['timestamp'].iloc[0], 'strftime') else '2024-01-15'

    lines = [
        f"ERROR RATE REPORT — {report_date}",
        f"Services: {rates['service'].nunique()} | Total logs: {total_logs} | "
        f"Error logs: {total_errors} ({error_pct:.1f}%)",
        "",
        "PER-SERVICE ERROR RATES:",
        f"{'Service':<25} {'Total':>7} {'Errors':>7} {'Rate':>7} {'Alert':>6}",
        "-" * 56,
    ]
    for _, row in rates.iterrows():
        alert = "WARN" if row['above_threshold'] else "ok"
        lines.append(
            f"{row['service']:<25} {int(row['total_logs']):>7} "
            f"{int(row['error_logs']):>7} {row['error_rate']:>7.1%} {alert:>6}"
        )

    lines += ["", "TOP ERROR MESSAGES:", "-" * 56]
    for i, (msg, count) in enumerate(top_errors.items(), 1):
        lines.append(f"  {i:>2}. [{count:>3}x] {msg[:60]}")

    report = "\n".join(lines)
    print(report)
    return report


def main():
    """Orchestrate the full log analysis pipeline."""
    raw_df = load_logs(LOGS_CSV)
    df = normalize_log_levels(raw_df)
    df = parse_timestamps(df)

    rates = compute_error_rates(df)
    top_errors = get_top_errors(df, n=10)
    format_report(rates, top_errors, df)


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Load and Normalize (15 minutes)

Load the CSV, then immediately normalize the `level` column. Raw log data from real systems often has inconsistent casing — `INFO`, `info`, `Info` all mean the same thing. Normalize to uppercase before any filtering to avoid missed matches.

```python
def normalize_log_levels(df: pd.DataFrame) -> pd.DataFrame:
    df_norm = df.copy()
    df_norm['level'] = df_norm['level'].str.upper().str.strip()
    return df_norm
```

The `.str.strip()` removes any trailing whitespace. `.str.upper()` handles all casing variants. These are vectorized string operations — no loop needed.

```python
def parse_timestamps(df: pd.DataFrame) -> pd.DataFrame:
    df_parsed = df.copy()
    df_parsed['timestamp'] = pd.to_datetime(df_parsed['timestamp'], errors='coerce')
    return df_parsed
```

After normalization, verify the level cardinality dropped to exactly 4: `df['level'].nunique()` should return `4`.

---

### Step 2: Compute Error Rates by Service (25 minutes)

This is the core analysis step. Use `groupby` to compute total and error log counts per service, then join them:

```python
def compute_error_rates(df: pd.DataFrame) -> pd.DataFrame:
    # Total logs per service
    total = df.groupby('service').size().rename('total_logs')

    # Error logs per service (filter first, then count)
    errors = (df[df['level'] == 'ERROR']
              .groupby('service')
              .size()
              .rename('error_logs'))

    # Join on service index, fill 0 for services with no errors
    rates = pd.concat([total, errors], axis=1).fillna(0)
    rates['error_logs'] = rates['error_logs'].astype(int)
    rates['error_rate'] = (rates['error_logs'] / rates['total_logs']).round(4)
    rates['above_threshold'] = rates['error_rate'] > 0.05

    return rates.reset_index().sort_values('error_rate', ascending=False)
```

**Key patterns:**
- Filter rows first (`df[df['level'] == 'ERROR']`), then group — this is more efficient than groupby + apply
- `pd.concat([total, errors], axis=1)` joins two Series on their shared index (service name)
- `fillna(0)` handles services with no errors (they appear in `total` but not in `errors`)

---

### Step 3: Get Top Error Messages (15 minutes)

Filter to ERROR rows only, then use `value_counts()` to rank messages by frequency:

```python
def get_top_errors(df: pd.DataFrame, n: int = 10) -> pd.Series:
    error_rows = df[df['level'] == 'ERROR']
    return error_rows['message'].str.strip().value_counts().head(n)
```

`value_counts()` returns a Series with the message as the index and the count as the value, sorted descending by default. `.head(n)` limits to the top N.

The `.str.strip()` ensures that messages with trailing whitespace are grouped with their trimmed equivalents.

---

### Step 4: Format the Report (20 minutes)

Build the report as a list of lines, then join with `"\n"`. Use f-string width specifiers for alignment:

```python
f"{'Service':<25} {'Total':>7} {'Errors':>7} {'Rate':>7} {'Alert':>6}"
```

- `<25` means left-align in a field 25 characters wide
- `>7` means right-align in a field 7 characters wide
- `:>7.1%` formats a float as a percentage with 1 decimal place, right-aligned in 7 chars

<Info>
The `format_report()` function receives the analyzed DataFrames, not raw log data. This separation means you can unit-test the report formatting by passing fake `rates` and `top_errors` data without running the full analysis pipeline.
</Info>

---

## Expected Output

```
ERROR RATE REPORT — 2024-01-15 08:00:39
Services: 5 | Total logs: 20 | Error logs: 8 (40.0%)

PER-SERVICE ERROR RATES:
Service                    Total  Errors    Rate  Alert
--------------------------------------------------------
payment-service                4       3  75.0%   WARN
inventory-service              3       2  66.7%   WARN
auth-service                   4       2  50.0%   WARN
api-gateway                    3       1  33.3%   WARN
notification-service           3       1  33.3%   WARN

TOP ERROR MESSAGES:
--------------------------------------------------------
   1. [  3x] Connection timeout to payment gateway
   2. [  2x] Invalid token signature
   3. [  2x] Failed to update stock count
   4. [  1x] Database connection refused
   5. [  1x] Rate limit exceeded for client 192.168.1.45
   6. [  1x] SMTP connection refused
```

On the full 5,000-row logs dataset the numbers will differ — `error_rate` for `payment-service` will be around 8.2% (above the 5% threshold), with the top error messages appearing 40–60 times each.

---

## Practice Exercises

<PracticeBlock
  prompt="Implement `compute_error_rates(df)`. The function receives a normalized DataFrame (level column already uppercase). It should return a DataFrame with columns: service, total_logs, error_logs, error_rate (float), above_threshold (bool: error_rate > 0.05). Sort by error_rate descending."
  initialCode={`import pandas as pd
import io

LOGS_CSV = """timestamp,level,service,message
2024-01-15 08:00:01,INFO,auth-service,User login successful
2024-01-15 08:00:03,ERROR,payment-service,Connection timeout
2024-01-15 08:00:05,INFO,inventory-service,Stock check completed
2024-01-15 08:00:07,ERROR,payment-service,Connection timeout
2024-01-15 08:00:09,WARNING,api-gateway,High latency detected
2024-01-15 08:00:11,ERROR,auth-service,Invalid token signature
2024-01-15 08:00:13,INFO,notification-service,Email queued
2024-01-15 08:00:15,ERROR,payment-service,Database connection refused
2024-01-15 08:00:17,INFO,auth-service,Login successful
2024-01-15 08:00:19,ERROR,inventory-service,Failed to update stock
"""

def compute_error_rates(df: pd.DataFrame) -> pd.DataFrame:
    # TODO: implement error rate computation per service
    return pd.DataFrame(columns=['service', 'total_logs', 'error_logs', 'error_rate', 'above_threshold'])

df = pd.read_csv(io.StringIO(LOGS_CSV))
df['level'] = df['level'].str.upper().str.strip()
rates = compute_error_rates(df)
print(rates.to_string(index=False))`}
  hint="Use groupby('service').size() for totals. Filter df[df['level']=='ERROR'] then groupby for errors. Use pd.concat to join, fillna(0) to handle missing services. Compute error_rate = error_logs / total_logs."
  solution={`import pandas as pd
import io

LOGS_CSV = """timestamp,level,service,message
2024-01-15 08:00:01,INFO,auth-service,User login successful
2024-01-15 08:00:03,ERROR,payment-service,Connection timeout
2024-01-15 08:00:05,INFO,inventory-service,Stock check completed
2024-01-15 08:00:07,ERROR,payment-service,Connection timeout
2024-01-15 08:00:09,WARNING,api-gateway,High latency detected
2024-01-15 08:00:11,ERROR,auth-service,Invalid token signature
2024-01-15 08:00:13,INFO,notification-service,Email queued
2024-01-15 08:00:15,ERROR,payment-service,Database connection refused
2024-01-15 08:00:17,INFO,auth-service,Login successful
2024-01-15 08:00:19,ERROR,inventory-service,Failed to update stock
"""

def compute_error_rates(df: pd.DataFrame) -> pd.DataFrame:
    total = df.groupby('service').size().rename('total_logs')
    errors = (df[df['level'] == 'ERROR']
              .groupby('service')
              .size()
              .rename('error_logs'))
    rates = pd.concat([total, errors], axis=1).fillna(0)
    rates['error_logs'] = rates['error_logs'].astype(int)
    rates['error_rate'] = (rates['error_logs'] / rates['total_logs']).round(4)
    rates['above_threshold'] = rates['error_rate'] > 0.05
    return rates.reset_index().sort_values('error_rate', ascending=False)

df = pd.read_csv(io.StringIO(LOGS_CSV))
df['level'] = df['level'].str.upper().str.strip()
rates = compute_error_rates(df)
print(rates.to_string(index=False))`}
/>

---

## Extension Challenges

1. **Hour-of-day breakdown**: Add a function `error_rate_by_hour(df)` that extracts the hour from the timestamp and computes error rate per hour. Which hour has the most errors? Return a DataFrame sorted by error rate descending.

2. **Error burst detection**: Add a function `detect_error_bursts(df, service, window_minutes=1, threshold=3)` that identifies time windows where a single service logged 3 or more errors within 1 minute. Return a list of (service, window_start, error_count) tuples.

3. **Write to file**: Modify `format_report()` to accept an optional `output_path` parameter. When provided, write the report to a file in addition to printing to stdout. Use `with open(output_path, 'w') as f: f.write(report)`.

---

## Key Takeaways

- Normalize categorical string columns before any filtering — `df['level'].str.upper()` prevents missed matches from casing variants
- Filter before groupby when possible: `df[df['level'] == 'ERROR'].groupby('service').size()` is more readable and often faster than a groupby + apply
- `pd.concat([series1, series2], axis=1)` is the standard way to join two aggregation results on a shared index
- `value_counts().head(n)` is the idiomatic way to find the top-N most frequent values in a column
- f-string width specifiers (`<25`, `>7`, `>7.1%`) produce consistent column alignment without external formatting libraries

---

[← Lesson 2: Project 1 — Sales Data Cleaner](./lesson-02-project-1-sales-data-cleaner.md) | [Next Lesson: Project 3 — ETL Pipeline with Validation →](./lesson-04-project-3-etl-pipeline-with-validation.md)

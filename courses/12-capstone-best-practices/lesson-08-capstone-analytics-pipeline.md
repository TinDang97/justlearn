# Lesson 8: Capstone Project 2 — Analytics Pipeline

**Course:** Capstone Projects & Best Practices | **Duration:** 2 hours | **Level:** Advanced

---

## Project Overview

Build an automated analytics pipeline that extracts data, transforms it, generates visualizations, and delivers reports on a schedule.

**Features:**
- Automated data ingestion from CSV files and a public API
- Data cleaning and transformation with Pandas
- Statistical analysis and trend detection
- Chart generation with Matplotlib/Seaborn
- Scheduled daily report (email + Excel)
- CLI interface for manual runs and configuration
- SQLite data warehouse for historical data

---

## Architecture

```
analytics_pipeline/
├── pipeline/
│   ├── extractors/
│   │   ├── csv_extractor.py
│   │   └── api_extractor.py
│   ├── transformers/
│   │   ├── cleaner.py
│   │   └── aggregator.py
│   ├── loaders/
│   │   └── sqlite_loader.py
│   └── pipeline.py            # Orchestrator
├── analytics/
│   ├── statistics.py          # Trend detection, anomalies
│   └── forecasting.py         # Simple forecasting
├── reporting/
│   ├── charts.py              # Matplotlib chart generation
│   ├── excel_report.py        # openpyxl report
│   └── email_report.py        # HTML email
├── scheduler.py               # APScheduler setup
├── cli.py                     # argparse CLI
├── config.py                  # Settings
├── tests/
│   ├── test_extractors.py
│   ├── test_transformers.py
│   └── test_analytics.py
├── requirements.txt
└── README.md
```

---

## Key Implementation

### ETL Pipeline

```python
# pipeline/pipeline.py
from dataclasses import dataclass, field
from typing import Callable, Any
import logging
import time

@dataclass
class PipelineResult:
    step: str
    status: str   # "success" | "failed"
    duration_s: float
    records_in: int = 0
    records_out: int = 0
    error: str = ""


class AnalyticsPipeline:
    def __init__(self, name: str):
        self.name = name
        self.steps: list[dict] = []
        self.results: list[PipelineResult] = []
        self.logger = logging.getLogger(name)

    def add_step(self, name: str, func: Callable, **kwargs):
        self.steps.append({"name": name, "func": func, "kwargs": kwargs})
        return self

    def run(self, initial_data=None) -> tuple[Any, list[PipelineResult]]:
        self.logger.info(f"Starting pipeline: {self.name}")
        data = initial_data
        self.results = []

        for step in self.steps:
            start = time.time()
            count_in = len(data) if hasattr(data, "__len__") else 0
            try:
                data = step["func"](data, **step["kwargs"])
                count_out = len(data) if hasattr(data, "__len__") else 0
                result = PipelineResult(
                    step=step["name"], status="success",
                    duration_s=time.time() - start,
                    records_in=count_in, records_out=count_out
                )
                self.logger.info(f"Step '{step['name']}': {count_in} → {count_out} records")
            except Exception as e:
                result = PipelineResult(
                    step=step["name"], status="failed",
                    duration_s=time.time() - start,
                    error=str(e)
                )
                self.logger.error(f"Step '{step['name']}' failed: {e}")
                self.results.append(result)
                raise

            self.results.append(result)

        return data, self.results
```

### Anomaly Detection

```python
# analytics/statistics.py
import pandas as pd
import numpy as np

def detect_anomalies(df: pd.DataFrame, column: str,
                     method: str = "iqr") -> pd.DataFrame:
    """Flag anomalous values in a column."""
    if method == "iqr":
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        df["is_anomaly"] = (
            (df[column] < Q1 - 1.5 * IQR) |
            (df[column] > Q3 + 1.5 * IQR)
        )
    elif method == "zscore":
        z_scores = np.abs((df[column] - df[column].mean()) / df[column].std())
        df["is_anomaly"] = z_scores > 3

    return df


def compute_trends(df: pd.DataFrame, date_col: str,
                   value_col: str) -> dict:
    """Compute trend statistics for a time series."""
    df = df.sort_values(date_col)
    n = len(df)

    # Linear trend:
    x = np.arange(n)
    slope, intercept = np.polyfit(x, df[value_col], 1)

    # Recent vs previous period:
    mid = n // 2
    first_half_mean = df[value_col].iloc[:mid].mean()
    second_half_mean = df[value_col].iloc[mid:].mean()
    growth_pct = (second_half_mean - first_half_mean) / first_half_mean * 100

    return {
        "slope": slope,
        "direction": "increasing" if slope > 0 else "decreasing",
        "growth_pct": growth_pct,
        "first_period_avg": first_half_mean,
        "second_period_avg": second_half_mean,
    }
```

### CLI

```python
# cli.py
import argparse
from pipeline import AnalyticsPipeline

def cmd_run(args):
    print(f"Running pipeline for date range: {args.start} to {args.end}")
    # ...

def cmd_status(args):
    print("Last 5 pipeline runs:")
    # Read from SQLite results table

def main():
    parser = argparse.ArgumentParser(description="Analytics Pipeline CLI")
    subs = parser.add_subparsers(dest="cmd", required=True)

    run_p = subs.add_parser("run", help="Execute the pipeline")
    run_p.add_argument("--start", default="30d", help="Start date or relative (30d)")
    run_p.add_argument("--end", default="today")
    run_p.add_argument("--dry-run", action="store_true")
    run_p.set_defaults(func=cmd_run)

    status_p = subs.add_parser("status", help="Show pipeline status")
    status_p.set_defaults(func=cmd_status)

    args = parser.parse_args()
    args.func(args)
```

---

## Evaluation Criteria

- [ ] Pipeline runs end-to-end without errors on sample data
- [ ] At least 5 distinct charts generated
- [ ] Excel report with formatted table and embedded chart
- [ ] Email report with HTML formatting
- [ ] Scheduled to run daily via APScheduler
- [ ] CLI with `run`, `status`, and `config` subcommands
- [ ] All transformation functions have unit tests
- [ ] 70%+ test coverage on the transformers and analytics modules

---

[← Previous](./lesson-07-capstone-blog-platform.md) | [Back to Course](./README.md) | [Next →](./lesson-09-capstone-cli-tool.md)

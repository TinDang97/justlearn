# Lesson 8: File & Data Processing

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Process large files efficiently
- Watch directories for new files
- Build ETL (Extract-Transform-Load) pipelines
- Handle concurrent file processing

---

## Lesson Outline

### Part 1: Efficient File Processing (30 minutes)

#### Explanation

```python
from pathlib import Path
import csv
import json
from typing import Iterator

# Process large CSV without loading all into memory:
def process_large_csv(filepath: str, batch_size: int = 1000) -> Iterator[list[dict]]:
    """Process CSV in batches. Yields lists of batch_size rows."""
    batch = []
    with open(filepath, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            batch.append(row)
            if len(batch) >= batch_size:
                yield batch
                batch = []
    if batch:
        yield batch   # Last partial batch

# Usage:
total_processed = 0
for batch in process_large_csv("huge_sales.csv"):
    # Process each batch (e.g., insert to DB, transform, etc.):
    process_batch(batch)
    total_processed += len(batch)
    print(f"Processed {total_processed} rows...", end="\r")


# Stream JSON array (for large JSON files):
import ijson   # pip install ijson

def stream_json_array(filepath: str) -> Iterator[dict]:
    with open(filepath, "rb") as f:
        for item in ijson.items(f, "item"):   # "item" = array elements
            yield item


# Memory-efficient file operations:
def count_lines(filepath: str) -> int:
    """Count lines without loading file into memory."""
    with open(filepath, "rb") as f:
        return sum(1 for _ in f)

def tail(filepath: str, n: int = 10) -> list[str]:
    """Get last N lines of a file."""
    from collections import deque
    with open(filepath, encoding="utf-8") as f:
        return list(deque(f, maxlen=n))
```

#### Practice

Write a function that processes a 1GB CSV file in batches, calculates revenue per category, and writes a summary CSV.

---

### Part 2: Directory Watching (30 minutes)

#### Explanation

```python
# pip install watchdog
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
import logging

class FileProcessorHandler(FileSystemEventHandler):
    def __init__(self, process_func, extensions=(".csv", ".json")):
        self.process_func = process_func
        self.extensions = extensions
        self.logger = logging.getLogger(__name__)

    def on_created(self, event):
        if event.is_directory:
            return
        path = event.src_path
        if not any(path.endswith(ext) for ext in self.extensions):
            return
        self.logger.info(f"New file detected: {path}")
        try:
            self.process_func(path)
        except Exception:
            self.logger.exception(f"Failed to process: {path}")

    def on_modified(self, event):
        # Handle file modifications (use carefully - fires multiple times)
        pass


def process_new_file(filepath: str):
    """Called when a new file is detected."""
    logging.info(f"Processing: {filepath}")
    # Read, transform, save to DB, etc.


def watch_directory(path: str):
    """Watch directory for new files."""
    observer = Observer()
    handler = FileProcessorHandler(process_new_file)
    observer.schedule(handler, path, recursive=False)
    observer.start()
    logging.info(f"Watching {path} for new files...")
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    watch_directory("incoming_data/")
```

#### Practice

Build a "hot folder" processor: any CSV dropped into `incoming/` is processed, results saved to `processed/`, and failures moved to `errors/`.

---

### Part 3: ETL Pipeline (30 minutes)

#### Explanation

```python
from pathlib import Path
from dataclasses import dataclass
from typing import Callable
import logging
import time

@dataclass
class PipelineStep:
    name: str
    func: Callable
    description: str = ""

class ETLPipeline:
    def __init__(self, name: str):
        self.name = name
        self.steps: list[PipelineStep] = []
        self.logger = logging.getLogger(name)

    def add_step(self, name: str, func: Callable, description: str = ""):
        self.steps.append(PipelineStep(name, func, description))
        return self   # Enable chaining

    def run(self, initial_data=None):
        self.logger.info(f"Starting pipeline: {self.name}")
        data = initial_data
        results = {}

        for step in self.steps:
            start = time.time()
            self.logger.info(f"Running step: {step.name}")
            try:
                data = step.func(data)
                duration = time.time() - start
                results[step.name] = {"status": "success", "duration": duration}
                self.logger.info(f"Step '{step.name}' completed in {duration:.2f}s")
            except Exception as e:
                results[step.name] = {"status": "failed", "error": str(e)}
                self.logger.error(f"Step '{step.name}' failed: {e}")
                raise

        return data, results


# Usage:
pipeline = (ETLPipeline("Daily Sales ETL")
    .add_step("extract", lambda _: pd.read_csv("incoming/sales.csv"))
    .add_step("clean", lambda df: df.dropna().drop_duplicates())
    .add_step("transform", lambda df: df.assign(revenue=df.price * df.qty))
    .add_step("aggregate", lambda df: df.groupby("region")["revenue"].sum())
    .add_step("load", lambda df: df.to_csv("output/regional_summary.csv"))
)

final_data, execution_results = pipeline.run()
```

#### Practice

Build a complete ETL pipeline that: extracts from 3 CSV files, cleans and merges them, computes aggregates, loads to SQLite, and emails a summary report.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: File Processor Service

Build a complete file processing service:
- `incoming/` → watched for new files
- Process based on extension: `.csv` → analyze, `.json` → validate, `.txt` → word count
- Move processed files to `archive/YYYY-MM-DD/`
- Move failed files to `errors/` with error description file
- Generate daily summary report

#### Exercise 2: Concurrent Processing

Process multiple files in parallel using `concurrent.futures`:
```python
from concurrent.futures import ProcessPoolExecutor, as_completed

def process_files_parallel(filepaths: list[str], max_workers: int = 4) -> dict:
    results = {}
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {executor.submit(process_file, fp): fp
                         for fp in filepaths}
        for future in as_completed(future_to_file):
            filepath = future_to_file[future]
            try:
                results[filepath] = future.result()
            except Exception as e:
                results[filepath] = {"error": str(e)}
    return results
```

---

## Key Takeaways

- Process large files in batches or streaming — never `f.read()` for huge files
- `watchdog` library watches directory changes in real time
- Move files between `incoming/` → `processing/` → `done/` for safe pipeline processing
- ETL pipelines are just chained functions: Extract → Transform → Load
- `ProcessPoolExecutor` for CPU-bound parallel file processing

---

[← Previous](./lesson-07-api-integration-webhooks.md) | [Back to Course](./README.md) | [Next →](./lesson-09-testing-automation-scripts.md)

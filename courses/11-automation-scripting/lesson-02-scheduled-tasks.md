# Lesson 2: Scheduled Tasks

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Schedule Python functions with the `schedule` library
- Understand cron syntax for system scheduling
- Build robust scheduled jobs with error handling
- Use APScheduler for advanced scheduling

---

## Lesson Outline

### Part 1: schedule Library (30 minutes)

#### Explanation

```python
import schedule
import time
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(message)s")
logger = logging.getLogger(__name__)

def send_daily_report():
    logger.info("Generating daily report...")
    # ... actual work here

def check_api_health():
    logger.info("Checking API health...")

def cleanup_old_files():
    logger.info("Cleaning up old files...")

# Schedule jobs:
schedule.every().day.at("09:00").do(send_daily_report)
schedule.every(15).minutes.do(check_api_health)
schedule.every().monday.at("08:00").do(cleanup_old_files)
schedule.every().hour.do(lambda: logger.info("Hourly heartbeat"))

# Run loop:
logger.info("Scheduler started")
while True:
    schedule.run_pending()
    time.sleep(60)   # Check every minute
```

**Schedule syntax:**
```python
schedule.every(10).seconds.do(job)
schedule.every(5).minutes.do(job)
schedule.every().hour.do(job)
schedule.every().day.at("14:30").do(job)
schedule.every().monday.do(job)
schedule.every().wednesday.at("09:00").do(job)
```

#### Practice

Create a scheduler that: checks a website every 5 minutes, sends a summary email daily at 8 AM, backs up files every Sunday at midnight.

---

### Part 2: Error Handling in Scheduled Jobs (30 minutes)

#### Explanation

```python
import schedule
import time
import logging
import functools
import traceback

def catch_exceptions(job_func, cancel_on_failure=False):
    """Decorator: catch exceptions so the scheduler keeps running."""
    @functools.wraps(job_func)
    def wrapper(*args, **kwargs):
        try:
            return job_func(*args, **kwargs)
        except Exception:
            logging.error(f"Job failed: {job_func.__name__}")
            logging.error(traceback.format_exc())
            if cancel_on_failure:
                return schedule.CancelJob   # Stop this recurring job
    return wrapper


@catch_exceptions
def fetch_stock_prices():
    import requests
    response = requests.get("https://api.example.com/stocks", timeout=10)
    response.raise_for_status()
    prices = response.json()
    # Process...
    logging.info(f"Fetched {len(prices)} stock prices")


# Job with retry logic:
def with_retry(job_func, max_retries=3, delay=5):
    @functools.wraps(job_func)
    def wrapper(*args, **kwargs):
        for attempt in range(max_retries):
            try:
                return job_func(*args, **kwargs)
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logging.warning(f"Attempt {attempt+1} failed: {e}. Retrying in {delay}s...")
                time.sleep(delay)
    return wrapper

schedule.every(5).minutes.do(with_retry(fetch_stock_prices))
```

#### Practice

Create a `JobMonitor` class that tracks: last run time, success/failure count, average duration for each scheduled job.

---

### Part 3: Cron and System Scheduling (30 minutes)

#### Explanation

**Cron syntax:**
```
* * * * * command
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0=Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

**Examples:**
```bash
# Edit crontab: crontab -e

# Daily at 9 AM:
0 9 * * * /usr/bin/python3 /home/user/daily_report.py

# Every 15 minutes:
*/15 * * * * python3 /path/to/check_health.py

# Every Monday at 8:30 AM:
30 8 * * 1 python3 /path/to/weekly_cleanup.py

# First day of month:
0 0 1 * * python3 /path/to/monthly_summary.py
```

**Making scripts cron-friendly:**
```python
#!/usr/bin/env python3
"""daily_report.py - Run via cron at 9 AM."""

import os
import sys
import logging
from pathlib import Path

# Absolute paths (cron doesn't have your shell PATH):
BASE_DIR = Path(__file__).parent
LOG_FILE = BASE_DIR / "logs" / "daily_report.log"
LOG_FILE.parent.mkdir(exist_ok=True)

logging.basicConfig(
    filename=str(LOG_FILE),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def main():
    logging.info("Starting daily report")
    try:
        # ... main work
        logging.info("Report completed successfully")
        return 0
    except Exception:
        logging.exception("Report failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

#### Practice

Write a cron job script that generates a daily summary of a directory's disk usage and emails it.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Website Monitor

Build a website monitoring script that:
- Checks 5 URLs every 5 minutes
- Records response time and status code
- Alerts (print/email) when a site is down
- Saves history to a CSV file
- Shows uptime statistics on demand

#### Exercise 2: APScheduler

Use `APScheduler` for advanced scheduling:
```python
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = BlockingScheduler()

@scheduler.scheduled_job(CronTrigger(hour=9, minute=0))
def morning_report():
    print("Good morning!")

@scheduler.scheduled_job("interval", minutes=30)
def health_check():
    print("Health check")

scheduler.start()
```

Implement a job that has dependencies (job B only runs after job A completes successfully).

---

## Key Takeaways

- `schedule` is simple but runs in the same process; good for simple scripts
- Always wrap scheduled jobs with exception catching — uncaught exceptions stop the loop
- Cron is the OS scheduler: reliable, no Python process needed to keep running
- Make scripts cron-friendly: use absolute paths, log to files, return exit codes
- `APScheduler` is more powerful: multiple backends, persistent jobs, async support

---

[← Previous](./lesson-01-subprocess-os-automation.md) | [Back to Course](./README.md) | [Next →](./lesson-03-web-scraping-beautifulsoup.md)

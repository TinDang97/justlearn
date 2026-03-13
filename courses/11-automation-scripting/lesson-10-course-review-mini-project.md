# Lesson 10: Course 11 Review & Mini Project

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Course Review

| Lesson | Topic | Key Library |
|--------|-------|-------------|
| 1 | OS & Subprocess | subprocess, pathlib, shutil |
| 2 | Scheduled Tasks | schedule, APScheduler |
| 3 | Web Scraping | requests, beautifulsoup4 |
| 4 | Browser Automation | selenium, webdriver |
| 5 | Email Automation | smtplib, MIME |
| 6 | Spreadsheets | openpyxl, pandas |
| 7 | API Integration | Slack, OAuth, webhooks |
| 8 | File Processing | watchdog, ETL pipeline |
| 9 | Testing | pytest, mocking, CI |

---

## Mini Project: Daily Report Bot

The bot runs daily at 9 AM and:
1. Scrapes latest data from a web source
2. Processes and aggregates the data with Pandas
3. Generates matplotlib charts
4. Creates an Excel report
5. Emails an HTML report to a recipient list

### Architecture

```
daily_report_bot/
├── bot.py              # Main entry point + scheduler
├── scraper.py          # Data fetching (web scraping or API)
├── processor.py        # Data cleaning and analysis
├── reporter.py         # Chart generation + Excel creation
├── emailer.py          # Email composition and sending
├── config.py           # Settings from environment
├── tests/
│   ├── test_scraper.py
│   ├── test_processor.py
│   └── test_reporter.py
├── templates/
│   └── report_email.html
├── requirements.txt
└── .env.example
```

### Key Code: bot.py

```python
#!/usr/bin/env python3
"""Daily Report Bot - runs on schedule."""

import logging
import schedule
import time
import traceback
from datetime import datetime
from pathlib import Path

from config import Config
from scraper import DataScraper
from processor import DataProcessor
from reporter import ReportGenerator
from emailer import ReportEmailer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("logs/bot.log"),
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger("bot")


def run_daily_report():
    """Execute the full daily report pipeline."""
    logger.info("=== Starting daily report pipeline ===")
    report_date = datetime.now().strftime("%Y-%m-%d")
    output_dir = Path(f"reports/{report_date}")
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Step 1: Fetch data
        logger.info("Step 1: Fetching data...")
        scraper = DataScraper(Config.DATA_SOURCE_URL)
        raw_data = scraper.fetch()
        logger.info(f"Fetched {len(raw_data)} records")

        # Step 2: Process data
        logger.info("Step 2: Processing data...")
        processor = DataProcessor()
        df = processor.clean(raw_data)
        summary = processor.compute_summary(df)
        logger.info(f"Summary: {summary}")

        # Step 3: Generate charts
        logger.info("Step 3: Generating charts...")
        reporter = ReportGenerator(output_dir)
        chart_paths = reporter.create_charts(df)
        excel_path = reporter.create_excel_report(df, summary)

        # Step 4: Send email
        logger.info("Step 4: Sending email...")
        emailer = ReportEmailer()
        emailer.send_report(
            recipients=Config.REPORT_RECIPIENTS,
            date=report_date,
            summary=summary,
            chart_paths=chart_paths,
            attachments=[excel_path]
        )

        logger.info(f"=== Daily report completed successfully for {report_date} ===")

    except Exception:
        logger.error("Daily report FAILED!")
        logger.error(traceback.format_exc())

        # Send failure alert:
        try:
            emailer = ReportEmailer()
            emailer.send_failure_alert(
                recipients=Config.ALERT_RECIPIENTS,
                error_details=traceback.format_exc()
            )
        except Exception:
            logger.error("Failed to send failure alert!")


if __name__ == "__main__":
    # Run once immediately for testing:
    if "--run-now" in __import__("sys").argv:
        run_daily_report()
    else:
        # Schedule for 9 AM daily:
        schedule.every().day.at("09:00").do(run_daily_report)
        logger.info("Bot scheduled. Waiting for 9 AM...")
        while True:
            schedule.run_pending()
            time.sleep(60)
```

### Extension Ideas

1. Slack notification alongside email
2. Multiple data sources (merge/compare)
3. Historical trend (this week vs last week)
4. Dashboard website showing past reports
5. Error alerting via PagerDuty or OpsGenie

---

## Next Course

**Course 12: Capstone Projects & Best Practices** — software architecture, testing strategies, code quality, documentation, and three complete capstone project options.

---

[← Previous](./lesson-09-testing-automation-scripts.md) | [Back to Course](./README.md)

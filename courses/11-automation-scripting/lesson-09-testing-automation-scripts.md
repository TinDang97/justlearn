# Lesson 9: Testing Automation Scripts

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Write tests for automation scripts with pytest
- Mock external dependencies (HTTP, files, email)
- Test scheduled jobs and file processing
- Set up basic CI with GitHub Actions

---

## Lesson Outline

### Part 1: pytest for Automation (30 minutes)

#### Explanation

```python
# pip install pytest pytest-mock responses freezegun
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock, call
import tempfile

# Test file processing:
def test_process_csv(tmp_path):
    """Use pytest's tmp_path fixture for temporary directories."""
    # Create test CSV:
    csv_file = tmp_path / "test.csv"
    csv_file.write_text("name,amount\nAlice,100\nBob,200\n")

    # Test your processing function:
    from my_processor import process_sales_csv
    result = process_sales_csv(str(csv_file))

    assert result["total"] == 300
    assert result["count"] == 2
    assert result["average"] == 150


# Parametrized tests:
@pytest.mark.parametrize("input_val,expected", [
    (100, "high"),
    (50, "medium"),
    (10, "low"),
])
def test_categorize_value(input_val, expected):
    from my_module import categorize_value
    assert categorize_value(input_val) == expected


# Fixtures for setup/teardown:
@pytest.fixture
def sample_dataframe():
    import pandas as pd
    return pd.DataFrame({
        "product": ["A", "B", "C"],
        "revenue": [1000, 2000, 1500],
        "region": ["North", "South", "North"]
    })

def test_regional_summary(sample_dataframe):
    from my_module import compute_regional_summary
    result = compute_regional_summary(sample_dataframe)
    assert result.loc["North", "revenue"] == 2500
    assert result.loc["South", "revenue"] == 2000
```

#### Practice

Write 5 tests for your CSV processor: valid file, empty file, missing columns, large file (1000 rows), malformed rows.

---

### Part 2: Mocking External Dependencies (30 minutes)

#### Explanation

```python
import pytest
from unittest.mock import patch, MagicMock
import responses

# Mock HTTP requests with 'responses':
@responses.activate
def test_fetch_stock_prices():
    responses.add(
        responses.GET,
        "https://api.example.com/stocks",
        json={"AAPL": 150.5, "GOOG": 2800.0},
        status=200
    )

    from my_scraper import fetch_stock_prices
    prices = fetch_stock_prices()
    assert prices["AAPL"] == 150.5
    assert len(responses.calls) == 1   # Verify exactly 1 HTTP call made


# Mock file operations:
def test_email_report_generated(tmp_path, monkeypatch):
    # Redirect file output to temp directory:
    monkeypatch.setenv("REPORT_DIR", str(tmp_path))

    # Mock the email sending:
    with patch("my_module.send_email") as mock_send:
        from my_module import generate_and_email_report
        generate_and_email_report(date="2024-01-15")

        # Verify email was called:
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert "2024-01-15" in call_args.kwargs.get("subject", "")

    # Verify report file was created:
    reports = list(tmp_path.glob("*.html"))
    assert len(reports) == 1


# Mock datetime for time-dependent code:
from freezegun import freeze_time

@freeze_time("2024-03-15 09:00:00")
def test_morning_report_sends_at_9am():
    from my_scheduler import should_send_report
    assert should_send_report() is True

@freeze_time("2024-03-15 14:00:00")
def test_report_not_sent_at_2pm():
    from my_scheduler import should_send_report
    assert should_send_report() is False
```

#### Practice

Mock the `requests.get` call in your web scraper. Test: successful scrape, 404 response, connection timeout, rate limit (429 response).

---

### Part 3: Integration and CI (30 minutes)

#### Explanation

```python
# Integration test (tests real integration, slower):
@pytest.mark.integration
def test_full_etl_pipeline(tmp_path):
    """End-to-end test of ETL pipeline."""
    # Setup: create input files
    input_dir = tmp_path / "input"
    output_dir = tmp_path / "output"
    input_dir.mkdir()
    output_dir.mkdir()

    # Create test data:
    import pandas as pd
    df = pd.DataFrame({
        "date": ["2024-01-01", "2024-01-02"],
        "revenue": [1000, 2000]
    })
    df.to_csv(input_dir / "sales.csv", index=False)

    # Run pipeline:
    from my_pipeline import ETLPipeline
    pipeline = ETLPipeline(input_dir=str(input_dir), output_dir=str(output_dir))
    result = pipeline.run()

    # Verify output:
    output_file = output_dir / "summary.csv"
    assert output_file.exists()
    summary = pd.read_csv(output_file)
    assert summary["total_revenue"].sum() == 3000
```

**GitHub Actions CI (.github/workflows/tests.yml):**
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.12"
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-mock responses freezegun
      - name: Run tests
        run: pytest tests/ -v --ignore=tests/integration
```

#### Practice

Set up a GitHub Actions workflow that runs your test suite on every push.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Test Suite for Report Bot

Write a complete test suite for your Daily Report Bot:
- `test_data_fetching.py`: mock HTTP, test scraping, CSV reading
- `test_processing.py`: test all transformation functions
- `test_email.py`: mock SMTP, verify email content and attachments
- `test_scheduling.py`: test job timing with freezegun

#### Exercise 2: Test Coverage

Add `pytest-cov` to measure test coverage:
```bash
pip install pytest-cov
pytest --cov=my_module --cov-report=html tests/
```
Aim for 80%+ coverage. Identify untested code paths and add tests.

---

## Key Takeaways

- Use `tmp_path` pytest fixture for temporary files — automatically cleaned up
- `responses` library intercepts HTTP calls for testing without real network
- `unittest.mock.patch` replaces any object during a test
- `freezegun.freeze_time()` makes `datetime.now()` return a fixed time
- Run `pytest -v --tb=short` for readable test output

---

[← Previous](./lesson-08-file-data-processing.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)

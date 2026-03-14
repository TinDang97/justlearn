# Lesson 9: Configuration and Environment Management

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Separate pipeline configuration from business logic
- Use environment variables for secrets and environment-specific settings
- Define typed pipeline configuration with Python `dataclasses`
- Implement a `dry_run` flag that makes pipelines safe to test without side effects

---

## Prerequisites

- Lesson 8: Idempotency
- Python `dataclasses` module
- `os.environ` for environment variables

---

## Lesson Outline

### Part 1: Configuration as Data (30 minutes)

#### The Problem with Magic Strings and Numbers

When pipeline configuration is embedded in function bodies, every environment change requires a code change:

```python
# BAD: magic strings and numbers scattered in business logic
def transform(df):
    df = df[df["amount"] > 50.0]          # why 50? what if this changes?
    df = df[df["region"].isin(["EU", "US"])]  # hardcoded regions
    return df.head(1000)                   # hardcoded batch size
```

The fix is to make configuration explicit, pass it to every function, and keep it in one place:

```python
import pandas as pd
import io

# All parameters in one dict — easy to change, easy to test different values
DEV_CONFIG = {
    "pipeline_name": "sales_etl",
    "min_amount": 0.0,
    "allowed_regions": ["EU", "US", "AP"],
    "batch_size": 100,
    "target_table": "sales_dev",
}

PROD_CONFIG = {
    "pipeline_name": "sales_etl",
    "min_amount": 50.0,
    "allowed_regions": ["EU", "US", "AP"],
    "batch_size": 5000,
    "target_table": "sales_prod",
}


RAW = """id,amount,region,product
1,25.0,EU,apple
2,100.0,US,laptop
3,200.0,AP,monitor
4,30.0,EU,keyboard
5,150.0,MX,headset
"""


def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))


def transform(df: pd.DataFrame, config: dict) -> pd.DataFrame:
    """Apply config-driven business rules."""
    df = df[df["amount"] >= config["min_amount"]].copy()
    df = df[df["region"].isin(config["allowed_regions"])].copy()
    return df.head(config["batch_size"])


def load(df: pd.DataFrame, config: dict) -> dict:
    """Simulate load; return metadata."""
    return {
        "rows_written": len(df),
        "target_table": config["target_table"],
    }


# Same pipeline code, different behavior for dev vs prod
raw_df = extract(RAW)

print("=== DEV RUN ===")
dev_result = load(transform(raw_df, DEV_CONFIG), DEV_CONFIG)
print(dev_result)

print("\n=== PROD RUN ===")
prod_result = load(transform(raw_df, PROD_CONFIG), PROD_CONFIG)
print(prod_result)
```

---

### Part 2: Environment Variables (30 minutes)

#### Reading Config from the Environment

Secrets (passwords, API keys) and deployment settings must never appear in source code. They belong in environment variables.

```python
import os

# ---------------------------------------------------------------
# Build config from environment variables with sensible defaults
# ---------------------------------------------------------------

config = {
    "db_url":      os.environ.get("DB_URL",      "sqlite:///:memory:"),
    "batch_size":  int(os.environ.get("BATCH_SIZE", "1000")),
    "log_level":   os.environ.get("LOG_LEVEL",   "INFO"),
    "dry_run":     os.environ.get("DRY_RUN",     "false").lower() == "true",
    "api_key":     os.environ.get("API_KEY",     ""),
}

# Never log secrets directly — redact them
def redacted_config(cfg: dict, secret_keys: list = None) -> dict:
    """Return config with secret values replaced by '***'."""
    secret_keys = secret_keys or ["api_key", "password", "token", "secret"]
    return {
        k: ("***" if k in secret_keys and v else v)
        for k, v in cfg.items()
    }

print("Effective config:")
for k, v in redacted_config(config).items():
    print(f"  {k}: {v}")
```

#### Simulating Environment Variables in Tests

Since Pyodide does not have shell environment variables, simulate them in tests by patching `os.environ`:

```python
import os

# Temporarily set env vars for testing
os.environ["BATCH_SIZE"] = "500"
os.environ["DRY_RUN"] = "true"

# Re-read config after setting
test_config = {
    "batch_size": int(os.environ.get("BATCH_SIZE", "1000")),
    "dry_run":    os.environ.get("DRY_RUN", "false").lower() == "true",
}

print(f"batch_size={test_config['batch_size']}, dry_run={test_config['dry_run']}")
assert test_config["batch_size"] == 500
assert test_config["dry_run"] is True

# Clean up
del os.environ["BATCH_SIZE"]
del os.environ["DRY_RUN"]
```

---

### Part 3: Typed Configuration with dataclasses (30 minutes)

#### PipelineConfig as a Dataclass

A `dataclass` is superior to a plain dict for configuration because: type annotations enforce correctness, default values are explicit, and `__post_init__` allows validation.

```python
import os
import pandas as pd
import io
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class PipelineConfig:
    """Typed configuration for a sales ETL pipeline."""
    # Required (no default)
    source_table: str
    target_table: str

    # Optional with defaults
    min_amount: float = 0.0
    batch_size: int = 1000
    log_level: str = "INFO"
    dry_run: bool = False
    allowed_regions: list = field(default_factory=lambda: ["EU", "US", "AP"])

    def __post_init__(self) -> None:
        """Validate config after construction."""
        if self.batch_size <= 0:
            raise ValueError(f"batch_size must be > 0, got {self.batch_size}")
        if self.min_amount < 0:
            raise ValueError(f"min_amount must be >= 0, got {self.min_amount}")
        if self.log_level not in ("DEBUG", "INFO", "WARNING", "ERROR"):
            raise ValueError(f"Invalid log_level: {self.log_level}")


RAW = """id,region,product,amount
1,EU,laptop,1200.0
2,US,keyboard,80.0
3,EU,mouse,25.0
4,AP,monitor,350.0
"""


def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))


def transform(df: pd.DataFrame, config: PipelineConfig) -> pd.DataFrame:
    df = df[df["amount"] >= config.min_amount].copy()
    df = df[df["region"].isin(config.allowed_regions)].copy()
    return df


def load(df: pd.DataFrame, config: PipelineConfig) -> dict:
    if config.dry_run:
        print(f"[DRY RUN] Would load {len(df)} rows to '{config.target_table}'")
        print(df.to_string(index=False))
        return {"rows_written": 0, "dry_run": True}

    # Real load would happen here
    # df.to_sql(config.target_table, conn, if_exists="replace", index=False)
    return {
        "rows_written": len(df),
        "target_table": config.target_table,
        "dry_run": False,
    }


# Normal run
config = PipelineConfig(
    source_table="raw_sales",
    target_table="sales_summary",
    min_amount=50.0,
)

raw_df = extract(RAW)
clean_df = transform(raw_df, config)
result = load(clean_df, config)
print("Normal run:", result)

# Dry run — safe to run without touching destination
dry_config = PipelineConfig(
    source_table="raw_sales",
    target_table="sales_summary",
    min_amount=50.0,
    dry_run=True,
)

print("\nDry run:")
dry_result = load(transform(raw_df, dry_config), dry_config)
print("Metadata:", dry_result)

# Validation catches bad config
try:
    bad_config = PipelineConfig(
        source_table="raw",
        target_table="out",
        batch_size=-100,  # invalid
    )
except ValueError as e:
    print(f"\nConfig validation caught: {e}")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: PipelineConfig with Validation

<PracticeBlock
  prompt="Create a PipelineConfig dataclass for a sales ETL with: source (str), target (str), min_amount (float, default 0.0), batch_size (int, default 500), dry_run (bool, default False). Add __post_init__ that validates batch_size > 0 and min_amount >= 0. Demonstrate construction, validation failure, and field access."
  initialCode={`from dataclasses import dataclass

# TODO: define PipelineConfig dataclass with:
# - source: str (required)
# - target: str (required)
# - min_amount: float = 0.0
# - batch_size: int = 500
# - dry_run: bool = False
# - __post_init__: validate batch_size > 0 and min_amount >= 0

# Test 1: valid config
# cfg = PipelineConfig(source="raw_orders", target="orders_clean")
# print(cfg)

# Test 2: invalid batch_size
# Should raise ValueError

# Test 3: invalid min_amount
# Should raise ValueError
`}
  hint="@dataclass decorator goes above the class. Use field type annotations. __post_init__(self) runs after __init__. Raise ValueError with a descriptive message."
  solution={`from dataclasses import dataclass

@dataclass
class PipelineConfig:
    source: str
    target: str
    min_amount: float = 0.0
    batch_size: int = 500
    dry_run: bool = False

    def __post_init__(self) -> None:
        if self.batch_size <= 0:
            raise ValueError(f"batch_size must be > 0, got {self.batch_size}")
        if self.min_amount < 0:
            raise ValueError(f"min_amount must be >= 0, got {self.min_amount}")

# Test 1: valid config
cfg = PipelineConfig(source="raw_orders", target="orders_clean")
print("Valid config:", cfg)
print(f"  source={cfg.source}, target={cfg.target}, "
      f"batch_size={cfg.batch_size}, dry_run={cfg.dry_run}")

# Test 2: invalid batch_size
try:
    bad = PipelineConfig(source="x", target="y", batch_size=0)
except ValueError as e:
    print(f"\\nCaught: {e}")

# Test 3: invalid min_amount
try:
    bad2 = PipelineConfig(source="x", target="y", min_amount=-5.0)
except ValueError as e:
    print(f"Caught: {e}")`}
/>

#### Exercise 2: dry_run Flag in a Full Pipeline

<PracticeBlock
  prompt="Refactor a hardcoded pipeline to use PipelineConfig throughout. Pass config as the first argument to extract, transform, and load. Verify that when dry_run=True, load prints what would be written but returns rows_written=0."
  initialCode={`import pandas as pd
import io
from dataclasses import dataclass

@dataclass
class PipelineConfig:
    source_table: str
    target_table: str
    min_amount: float = 0.0
    dry_run: bool = False

RAW = """id,product,amount
1,apple,100.0
2,bad,-50.0
3,orange,200.0
4,grape,150.0
"""

# TODO: refactor these functions to accept config as first argument
def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["amount"] > 0].copy()  # use config.min_amount

def load(df: pd.DataFrame) -> dict:
    print("Writing to hardcoded table")    # use config.target_table
    return {"rows_written": len(df)}       # if dry_run, return 0

# Run with dry_run=True and verify rows_written == 0
# Run with dry_run=False and verify rows_written == 3
`}
  hint="Change signatures to (config, raw) / (config, df). In transform: df[df['amount'] > config.min_amount]. In load: if config.dry_run, print and return {'rows_written': 0}."
  solution={`import pandas as pd
import io
from dataclasses import dataclass

@dataclass
class PipelineConfig:
    source_table: str
    target_table: str
    min_amount: float = 0.0
    dry_run: bool = False

RAW = """id,product,amount
1,apple,100.0
2,bad,-50.0
3,orange,200.0
4,grape,150.0
"""

def extract(config: PipelineConfig, raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def transform(config: PipelineConfig, df: pd.DataFrame) -> pd.DataFrame:
    return df[df["amount"] > config.min_amount].copy()

def load(config: PipelineConfig, df: pd.DataFrame) -> dict:
    if config.dry_run:
        print(f"[DRY RUN] Would write {len(df)} rows to '{config.target_table}'")
        return {"rows_written": 0, "dry_run": True}
    print(f"Writing {len(df)} rows to '{config.target_table}'")
    return {"rows_written": len(df), "dry_run": False}

def run(config: PipelineConfig, raw: str) -> dict:
    df = extract(config, raw)
    clean = transform(config, df)
    return load(config, clean)

# Dry run
dry_cfg = PipelineConfig("raw_sales", "sales_clean", min_amount=0.0, dry_run=True)
dry_result = run(dry_cfg, RAW)
print("Dry result:", dry_result)
assert dry_result["rows_written"] == 0

# Real run
real_cfg = PipelineConfig("raw_sales", "sales_clean", min_amount=0.0, dry_run=False)
real_result = run(real_cfg, RAW)
print("\\nReal result:", real_result)
assert real_result["rows_written"] == 3`}
/>

---

## Key Takeaways

- **Config as a `dataclass`** — typed, validated, self-documenting; superior to plain dicts
- **`__post_init__`** validates configuration at construction time — fails fast before any I/O
- **`os.environ.get(KEY, default)`** for all environment-specific settings and secrets
- **Never hardcode secrets** in source code — always read from environment variables
- **`dry_run=True`** flag makes any pipeline safely testable without writing to the destination

---

## Common Mistakes to Avoid

- Mixing config and business logic (hardcoded thresholds in `transform()`) — config must flow from the top
- Logging secrets in plain text — always redact API keys, passwords, tokens before logging
- Not providing defaults for `os.environ.get()` calls — pipelines should have sensible dev defaults
- Using a plain `dict` for config in a large project — type annotations prevent whole classes of bugs

---

[← Previous](./lesson-08-idempotency-reruns.md) | [Back to Course](./README.md) | [Next →](./lesson-10-etl-project.md)

# Lesson 7: Working with JSON

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Serialize Python objects to JSON
- Deserialize JSON to Python objects
- Handle JSON with custom types
- Build a JSON-based data store

---

## Lesson Outline

### Part 1: JSON Basics (30 minutes)

#### Explanation

```python
import json

# Python → JSON (serialize):
data = {
    "name": "Alice",
    "age": 30,
    "scores": [95, 87, 92],
    "active": True,
    "address": None
}

json_string = json.dumps(data)              # To string
json_pretty = json.dumps(data, indent=2)    # Pretty-printed

# JSON → Python (deserialize):
parsed = json.loads(json_string)

# Type mapping:
# Python → JSON:  dict→object, list→array, str→string,
#                 int/float→number, True/False→true/false, None→null

# File I/O:
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)    # Write to file

with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)           # Read from file
```

#### Practice

Save a list of student dictionaries to JSON, read it back, and verify the data is identical.

---

### Part 2: Custom JSON Serialization (30 minutes)

#### Explanation

```python
import json
from datetime import datetime, date

# Custom encoder for types JSON doesn't support:
class AppJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return {"__type": "datetime", "value": obj.isoformat()}
        if isinstance(obj, date):
            return {"__type": "date", "value": obj.isoformat()}
        if isinstance(obj, set):
            return {"__type": "set", "value": list(obj)}
        return super().default(obj)   # Let base class handle or raise


# Custom decoder:
def app_json_decoder(obj):
    if "__type" in obj:
        if obj["__type"] == "datetime":
            return datetime.fromisoformat(obj["value"])
        if obj["__type"] == "date":
            return date.fromisoformat(obj["value"])
        if obj["__type"] == "set":
            return set(obj["value"])
    return obj


# Usage:
data = {"created": datetime.now(), "tags": {"python", "tutorial"}}

json_str = json.dumps(data, cls=AppJSONEncoder, indent=2)
restored = json.loads(json_str, object_hook=app_json_decoder)
print(type(restored["created"]))  # <class 'datetime.datetime'>
```

#### Practice

Add JSON serialization/deserialization to your `BankAccount` class from Course 6.

---

### Part 3: JSON Data Store (30 minutes)

#### Explanation

```python
import json
from pathlib import Path
from typing import Any

class JSONStore:
    """Simple persistent key-value store backed by JSON."""

    def __init__(self, filepath: str):
        self.path = Path(filepath)
        self._data: dict = {}
        self._load()

    def _load(self):
        if self.path.exists():
            try:
                with open(self.path, encoding="utf-8") as f:
                    self._data = json.load(f)
            except json.JSONDecodeError:
                self._data = {}   # Start fresh on corrupt file

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2)

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def set(self, key: str, value: Any):
        self._data[key] = value
        self._save()

    def delete(self, key: str):
        self._data.pop(key, None)
        self._save()

    def all(self) -> dict:
        return dict(self._data)


# Usage:
store = JSONStore("app_data.json")
store.set("username", "alice")
store.set("preferences", {"theme": "dark", "language": "en"})
print(store.get("username"))     # alice
```

#### Practice

Build a `ContactBook` using `JSONStore` that can add, find, update, and delete contacts.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Personal Journal

Build a JSON-backed journal:
- Each entry has: `id`, `date`, `title`, `content`, `tags`
- Methods: `add_entry`, `get_entry`, `list_entries`, `search_by_tag`, `delete_entry`
- Persist to `journal.json`

#### Exercise 2: Config System

Create a `Config` class that:
- Reads from `config.json` (creates defaults if missing)
- Supports nested keys with dot notation: `config.get("database.host")`
- Validates values before saving
- Supports `config.reset()` to restore defaults

---

## Key Takeaways

- `json.dumps()` / `json.loads()` for strings; `json.dump()` / `json.load()` for files
- JSON supports: string, number, boolean, null, array, object — nothing else natively
- Custom `JSONEncoder` handles types like `datetime`, `set`, `Decimal`
- `object_hook` parameter for custom deserialization
- Always handle `json.JSONDecodeError` when reading JSON from untrusted sources

---

[← Previous](./lesson-06-working-with-csv.md) | [Back to Course](./README.md) | [Next →](./lesson-08-file-system-operations.md)

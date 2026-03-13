# Lesson 9: Binary Files & Other Formats

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Read and write binary files
- Use `pickle` for Python object serialization
- Read configuration with `configparser`
- Work with compressed files

---

## Lesson Outline

### Part 1: Binary Files (30 minutes)

#### Explanation

```python
# Binary mode: "rb", "wb", "ab"
# No encoding parameter; no newline translation

# Read binary file:
with open("image.jpg", "rb") as f:
    header = f.read(3)       # Read first 3 bytes
    print(header)            # b'\xff\xd8\xff' (JPEG magic bytes)
    data = f.read()          # Read rest

# Write binary file:
with open("output.bin", "wb") as f:
    f.write(b'\x00\x01\x02\x03')   # bytes literal
    f.write(bytes([65, 66, 67]))    # ABC in bytes

# Copy binary file efficiently:
def copy_binary(src: str, dst: str, chunk_size: int = 8192):
    with open(src, "rb") as fsrc, open(dst, "wb") as fdst:
        while chunk := fsrc.read(chunk_size):
            fdst.write(chunk)

# struct for binary data (packed structures):
import struct

# Pack: 4-byte int, 2-byte short, 4-byte float
packed = struct.pack(">iHf", 1000, 42, 3.14)
print(len(packed))    # 10 bytes

unpacked = struct.unpack(">iHf", packed)
print(unpacked)       # (1000, 42, 3.140000...)
```

#### Practice

Write a function `get_image_dimensions(filepath)` that reads the width/height from PNG or JPEG headers.

---

### Part 2: Pickle (30 minutes)

#### Explanation

```python
import pickle

# Serialize ANY Python object to bytes:
data = {
    "students": [{"name": "Alice", "grades": [95, 87, 92]}],
    "settings": {"max_students": 30}
}

# Save to file:
with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

# Load from file:
with open("data.pkl", "rb") as f:
    loaded = pickle.load(f)

print(loaded == data)   # True - identical


# Pickle custom objects:
class Student:
    def __init__(self, name, gpa):
        self.name = name
        self.gpa = gpa

alice = Student("Alice", 3.9)

with open("student.pkl", "wb") as f:
    pickle.dump(alice, f)

with open("student.pkl", "rb") as f:
    restored = pickle.load(f)

print(restored.name, restored.gpa)   # Alice 3.9
```

> **Security Warning:** NEVER unpickle data from untrusted sources. Pickle can execute arbitrary code. Use JSON for data exchange between systems.

#### Practice

Create a simple "save game" system using pickle for a text-based game.

---

### Part 3: Configuration Files (30 minutes)

#### Explanation

```python
import configparser

# Read .ini / .cfg files:
config = configparser.ConfigParser()
config.read("settings.cfg")

host = config["database"]["host"]           # String
port = config.getint("database", "port")    # Integer
debug = config.getboolean("app", "debug")   # Boolean

# Default values:
timeout = config.getfloat("network", "timeout", fallback=30.0)


# Write config files:
config = configparser.ConfigParser()
config["DEFAULT"] = {"encoding": "utf-8"}
config["database"] = {
    "host": "localhost",
    "port": "5432",
    "name": "myapp"
}
config["app"] = {
    "debug": "false",
    "log_level": "INFO"
}

with open("settings.cfg", "w") as f:
    config.write(f)

# settings.cfg looks like:
# [DEFAULT]
# encoding = utf-8
#
# [database]
# host = localhost
# port = 5432


# Compressed files:
import gzip
import zipfile

# gzip:
with gzip.open("data.json.gz", "wt", encoding="utf-8") as f:
    import json
    json.dump(data, f)

with gzip.open("data.json.gz", "rt", encoding="utf-8") as f:
    loaded = json.load(f)


# zipfile:
with zipfile.ZipFile("archive.zip", "w") as zf:
    zf.write("file1.txt")
    zf.write("file2.csv")

with zipfile.ZipFile("archive.zip", "r") as zf:
    zf.extractall("output_dir/")
    print(zf.namelist())   # ['file1.txt', 'file2.csv']
```

#### Practice

Build an `AppConfig` class that reads from a `.cfg` file with sections for database, app, and logging settings.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Archive

Build a `DataArchiver` that:
- Takes a list of JSON-serializable objects
- Saves them to a gzip-compressed JSON file
- Provides method to load and decompress
- Reports compressed vs uncompressed size

#### Exercise 2: File Format Detection

Write `detect_file_type(filepath)` that reads magic bytes to identify:
- JPEG: `FF D8 FF`
- PNG: `89 50 4E 47`
- PDF: `%PDF`
- ZIP: `PK\x03\x04`
- Return `"unknown"` otherwise

---

## Key Takeaways

- Binary files use `"rb"`/`"wb"` mode — no encoding, no newline translation
- `pickle` serializes any Python object but is NOT safe for untrusted data
- `configparser` reads standard `.ini` / `.cfg` configuration files
- `gzip` / `zipfile` handle compressed files in pure Python
- Use `struct` for parsing binary file formats

---

[← Previous](./lesson-08-file-system-operations.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)

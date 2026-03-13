# Lesson 1: Subprocess & OS Automation

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Run shell commands from Python using `subprocess`
- Automate file system operations with `os` and `shutil`
- Write cross-platform automation scripts
- Handle command output and errors

---

## Lesson Outline

### Part 1: subprocess Module (30 minutes)

#### Explanation

```python
import subprocess

# Run a command and capture output:
result = subprocess.run(
    ["git", "status"],      # Command as list (safer than string)
    capture_output=True,    # Capture stdout and stderr
    text=True,              # Return strings, not bytes
    check=True              # Raise CalledProcessError if non-zero exit
)
print(result.stdout)
print(result.returncode)  # 0 = success

# Handle errors:
try:
    result = subprocess.run(
        ["python", "myscript.py"],
        capture_output=True, text=True, check=True, timeout=30
    )
except subprocess.CalledProcessError as e:
    print(f"Command failed: {e.returncode}")
    print(f"stderr: {e.stderr}")
except subprocess.TimeoutExpired:
    print("Command timed out")

# Pipeline (like shell pipe |):
ps = subprocess.Popen(["ps", "aux"], stdout=subprocess.PIPE)
grep = subprocess.Popen(["grep", "python"],
                        stdin=ps.stdout, stdout=subprocess.PIPE, text=True)
ps.stdout.close()
output = grep.communicate()[0]
print(output)

# Shell command as string (use carefully - security risk with user input):
result = subprocess.run("ls -la | head -10", shell=True, text=True, capture_output=True)
```

#### Practice

Write a function `git_status(repo_path)` that returns the current git status of any directory.

---

### Part 2: OS Operations (30 minutes)

#### Explanation

```python
import os
import shutil
from pathlib import Path

# Environment variables:
home = os.environ["HOME"]
path = os.environ.get("PATH", "/usr/local/bin:/usr/bin")
os.environ["MY_VAR"] = "value"   # Set for current process

# Current directory:
os.getcwd()
os.chdir("/tmp")

# Create/remove directories:
os.makedirs("a/b/c", exist_ok=True)    # Create nested dirs
os.rmdir("empty_dir")                  # Remove empty dir

# File operations:
os.rename("old.txt", "new.txt")        # Rename/move
os.remove("file.txt")                  # Delete file

# Walk directory tree:
for root, dirs, files in os.walk("my_project"):
    print(f"Directory: {root}")
    for file in files:
        full_path = os.path.join(root, file)
        size = os.path.getsize(full_path)
        print(f"  {file} ({size} bytes)")

# shutil for complex operations:
shutil.copy2("src.txt", "dst.txt")           # Copy with metadata
shutil.copytree("src_dir", "dst_dir")        # Copy directory
shutil.move("old_path", "new_path")          # Move (works across disks)
shutil.disk_usage("/")                       # Disk space info
total, used, free = shutil.disk_usage("/")
```

#### Practice

Write a `cleanup_directory(path, days=30)` function that deletes files not accessed in N days.

---

### Part 3: Cross-Platform Scripts (30 minutes)

#### Explanation

```python
import sys
import platform
import subprocess
from pathlib import Path

# Detect operating system:
print(platform.system())   # "Darwin", "Windows", "Linux"
print(sys.platform)        # "darwin", "win32", "linux"

# Cross-platform command execution:
def run_command(cmd: list[str]) -> str:
    """Run command, return output. Raises on error."""
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return result.stdout.strip()


def get_cpu_usage() -> float:
    """Get CPU usage percentage (cross-platform)."""
    if sys.platform == "win32":
        output = run_command(["wmic", "cpu", "get", "loadpercentage"])
        return float(output.split("\n")[1].strip())
    else:
        try:
            import psutil
            return psutil.cpu_percent(interval=1)
        except ImportError:
            # Fallback: parse top on Unix
            output = run_command(["top", "-bn1"])
            for line in output.split("\n"):
                if "Cpu" in line or "cpu" in line:
                    return float(line.split("%")[0].split()[-1])
    return 0.0


# Find executables:
def find_python():
    """Find Python executable."""
    for cmd in ["python3", "python", "py"]:
        try:
            run_command([cmd, "--version"])
            return cmd
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    raise RuntimeError("Python not found")
```

#### Practice

Write a `system_info()` function that returns: OS, Python version, CPU cores, RAM (GB), disk free space.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Project Setup Script

Write a Python script that sets up a new project:
```
python setup_project.py my_project_name
```
Creates: directory, virtual environment, `requirements.txt`, `README.md`, `.gitignore`, runs `git init`.

#### Exercise 2: Log Monitor

Write a script that:
- Watches a log file for new ERROR lines
- Runs a given command when more than 5 errors occur in 60 seconds
- Works on Mac, Linux, and Windows (different `tail` equivalents)

---

## Key Takeaways

- Always use `subprocess.run(cmd_as_list, ...)` not `shell=True` (security)
- `capture_output=True, text=True, check=True` are the three essentials
- `pathlib.Path` is more Pythonic than `os.path` for file operations
- `platform.system()` detects the OS for cross-platform scripts
- `shutil.copytree()` / `shutil.rmtree()` for directory-level operations

---

[Back to Course](./README.md) | [Next →](./lesson-02-scheduled-tasks.md)

# Lesson 10: Course 8 Review & Mini Project

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Course Review

| Lesson | Topic | Key Library |
|--------|-------|-------------|
| 1 | pip & Virtual Environments | pip, venv |
| 2 | Reading Documentation | PyPI, help(), inspect |
| 3 | HTTP Requests | requests |
| 4 | SQLite | sqlite3 |
| 5 | Date & Time | datetime, pytz |
| 6 | Regular Expressions | re |
| 7 | Image Processing | Pillow |
| 8 | CLI Tools | argparse |
| 9 | Logging | logging |

---

## Mini Project: Multi-tool CLI Application

Build a CLI tool that integrates all this course's skills.

### Project: `devtools.py`

```bash
# Fetch GitHub user profile:
python devtools.py github alice --repos 5

# Process images in a directory:
python devtools.py images ./photos --resize 800 --format webp

# Search text files with regex:
python devtools.py search --pattern "\d{4}-\d{2}-\d{2}" --dir ./logs

# Store/retrieve key-value data (SQLite):
python devtools.py kv set project_name "My App"
python devtools.py kv get project_name
python devtools.py kv list
```

### Implementation

```python
#!/usr/bin/env python3
"""devtools.py - Multi-purpose developer CLI tool."""

import argparse
import logging
import sys
from pathlib import Path


def setup_logging(verbose: bool = False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        format="%(asctime)s [%(levelname)s] %(message)s",
        level=level
    )
    return logging.getLogger("devtools")


def github_command(args, logger):
    import requests

    logger.info(f"Fetching GitHub profile for: {args.username}")
    try:
        response = requests.get(
            f"https://api.github.com/users/{args.username}",
            timeout=10
        )
        response.raise_for_status()
        user = response.json()

        print(f"\nGitHub Profile: {user.get('name', args.username)}")
        print(f"Bio:      {user.get('bio', 'N/A')}")
        print(f"Repos:    {user.get('public_repos', 0)}")
        print(f"Followers:{user.get('followers', 0)}")

        if args.repos > 0:
            repos_resp = requests.get(
                f"https://api.github.com/users/{args.username}/repos",
                params={"sort": "stars", "per_page": args.repos},
                timeout=10
            )
            for repo in repos_resp.json():
                print(f"  ★ {repo['stargazers_count']:4d} {repo['name']}")

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch GitHub data: {e}")
        sys.exit(1)


def images_command(args, logger):
    from PIL import Image

    source = Path(args.directory)
    dest = Path(args.output) if args.output else source / "processed"
    dest.mkdir(exist_ok=True)

    image_files = list(source.glob("*.jpg")) + list(source.glob("*.png"))
    logger.info(f"Processing {len(image_files)} images → {dest}")

    for img_path in image_files:
        try:
            img = Image.open(img_path)
            if args.resize:
                img.thumbnail((args.resize, args.resize))
            out_path = dest / img_path.with_suffix(f".{args.format}").name
            img.save(out_path)
            logger.debug(f"Saved: {out_path}")
        except Exception as e:
            logger.error(f"Failed to process {img_path.name}: {e}")

    print(f"Processed {len(image_files)} images to {dest}")


def search_command(args, logger):
    import re

    pattern = re.compile(args.pattern, re.IGNORECASE if args.ignore_case else 0)
    search_dir = Path(args.dir)
    total_matches = 0

    for filepath in search_dir.rglob("*.txt" if not args.ext else f"*.{args.ext}"):
        try:
            with open(filepath, encoding="utf-8") as f:
                for line_num, line in enumerate(f, 1):
                    if pattern.search(line):
                        print(f"{filepath}:{line_num}: {line.rstrip()}")
                        total_matches += 1
        except (UnicodeDecodeError, PermissionError):
            pass

    print(f"\n{total_matches} matches found.")


def kv_command(args, logger):
    import sqlite3

    db_path = Path.home() / ".devtools_kv.db"
    conn = sqlite3.connect(db_path)
    conn.execute("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)")

    if args.kv_cmd == "set":
        conn.execute("INSERT OR REPLACE INTO kv VALUES (?, ?)", (args.key, args.value))
        conn.commit()
        print(f"Set: {args.key} = {args.value}")
    elif args.kv_cmd == "get":
        row = conn.execute("SELECT value FROM kv WHERE key = ?", (args.key,)).fetchone()
        print(row[0] if row else f"Key not found: {args.key}")
    elif args.kv_cmd == "list":
        for row in conn.execute("SELECT key, value FROM kv ORDER BY key"):
            print(f"  {row[0]:<30} {row[1]}")
    elif args.kv_cmd == "delete":
        conn.execute("DELETE FROM kv WHERE key = ?", (args.key,))
        conn.commit()
        print(f"Deleted: {args.key}")

    conn.close()


def main():
    parser = argparse.ArgumentParser(description="Developer multi-tool")
    parser.add_argument("--verbose", "-v", action="store_true")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # github subcommand:
    gh = subparsers.add_parser("github", help="GitHub profile info")
    gh.add_argument("username")
    gh.add_argument("--repos", type=int, default=3, help="Top N repos to show")

    # images subcommand:
    img = subparsers.add_parser("images", help="Process images")
    img.add_argument("directory")
    img.add_argument("--resize", type=int, help="Max dimension in pixels")
    img.add_argument("--format", default="jpg", choices=["jpg", "png", "webp"])
    img.add_argument("--output", help="Output directory")

    # search subcommand:
    srch = subparsers.add_parser("search", help="Search files with regex")
    srch.add_argument("--pattern", required=True, help="Regex pattern")
    srch.add_argument("--dir", default=".", help="Directory to search")
    srch.add_argument("--ext", help="File extension to filter")
    srch.add_argument("--ignore-case", "-i", action="store_true")

    # kv subcommand:
    kv = subparsers.add_parser("kv", help="Key-value store")
    kv_sub = kv.add_subparsers(dest="kv_cmd", required=True)
    kv_set = kv_sub.add_parser("set"); kv_set.add_argument("key"); kv_set.add_argument("value")
    kv_get = kv_sub.add_parser("get"); kv_get.add_argument("key")
    kv_list = kv_sub.add_parser("list")
    kv_del = kv_sub.add_parser("delete"); kv_del.add_argument("key")

    args = parser.parse_args()
    logger = setup_logging(args.verbose)

    commands = {
        "github": github_command,
        "images": images_command,
        "search": search_command,
        "kv": kv_command,
    }
    commands[args.command](args, logger)


if __name__ == "__main__":
    main()
```

---

## Next Course

**Course 9: Web Development Basics** — Flask, HTML templates, HTTP, REST APIs, and building your first web application.

---

[← Previous](./lesson-09-logging-module.md) | [Back to Course](./README.md)

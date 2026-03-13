# Lesson 10: Course 7 Review & Mini Project

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Apply file I/O, exception handling, and data formats together
- Build a complete file-backed application
- Handle real-world error scenarios gracefully

---

## Course Review

| Lesson | Topic | Key Skill |
|--------|-------|-----------|
| 1 | Reading Text Files | open(), read methods, pathlib |
| 2 | Writing Text Files | write modes, atomic writes |
| 3 | Context Managers | with statement, `@contextmanager` |
| 4 | Exception Basics | try/except/else/finally |
| 5 | Exception Patterns | Custom exceptions, raise from |
| 6 | CSV | DictReader/DictWriter |
| 7 | JSON | json.dump/load, custom encoder |
| 8 | File System Ops | pathlib, glob, shutil |
| 9 | Binary & Other | pickle, configparser, gzip |

---

## Mini Project: Personal Journal Application

### Requirements

Build a command-line journal that stores entries as JSON:

```
journal/
├── journal.py         # Main application
├── storage.py         # JSON storage layer
├── models.py          # JournalEntry dataclass
└── config.cfg         # Application settings
```

### models.py

```python
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional
import uuid


@dataclass
class JournalEntry:
    title: str
    content: str
    tags: list[str] = field(default_factory=list)
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    mood: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "JournalEntry":
        return cls(**data)

    def __str__(self) -> str:
        date = self.created_at[:10]
        tags = f" [{', '.join(self.tags)}]" if self.tags else ""
        return f"[{self.id}] {date} - {self.title}{tags}"
```

### storage.py

```python
import json
from pathlib import Path
from typing import Optional
from models import JournalEntry


class JournalStorage:
    def __init__(self, filepath: str = "journal.json"):
        self.path = Path(filepath)
        self._entries: dict[str, dict] = {}
        self._load()

    def _load(self):
        if not self.path.exists():
            return
        try:
            with open(self.path, encoding="utf-8") as f:
                data = json.load(f)
                self._entries = {e["id"]: e for e in data.get("entries", [])}
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Corrupted journal file: {e}") from e

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump({"entries": list(self._entries.values())}, f, indent=2)

    def add(self, entry: JournalEntry):
        self._entries[entry.id] = entry.to_dict()
        self._save()

    def get(self, entry_id: str) -> Optional[JournalEntry]:
        data = self._entries.get(entry_id)
        return JournalEntry.from_dict(data) if data else None

    def all(self) -> list[JournalEntry]:
        return [JournalEntry.from_dict(d) for d in self._entries.values()]

    def delete(self, entry_id: str) -> bool:
        if entry_id in self._entries:
            del self._entries[entry_id]
            self._save()
            return True
        return False

    def search(self, query: str = "", tag: str = "") -> list[JournalEntry]:
        results = self.all()
        if query:
            results = [e for e in results
                      if query.lower() in e.title.lower()
                      or query.lower() in e.content.lower()]
        if tag:
            results = [e for e in results if tag in e.tags]
        return sorted(results, key=lambda e: e.created_at, reverse=True)
```

### journal.py

```python
from storage import JournalStorage
from models import JournalEntry


def main():
    storage = JournalStorage("my_journal.json")

    while True:
        print("\n=== My Journal ===")
        print("1. New entry")
        print("2. List entries")
        print("3. Read entry")
        print("4. Search")
        print("5. Delete entry")
        print("6. Export to text")
        print("0. Quit")

        choice = input("\nChoice: ").strip()

        if choice == "1":
            title = input("Title: ").strip()
            if not title:
                print("Title cannot be empty")
                continue
            print("Content (press Enter twice when done):")
            lines = []
            while True:
                line = input()
                if not line and lines and not lines[-1]:
                    break
                lines.append(line)
            content = "\n".join(lines[:-1])  # Remove last empty line
            tags_input = input("Tags (comma-separated, optional): ").strip()
            tags = [t.strip() for t in tags_input.split(",") if t.strip()]
            mood = input("Mood (optional): ").strip() or None

            entry = JournalEntry(title=title, content=content, tags=tags, mood=mood)
            storage.add(entry)
            print(f"Entry saved! ID: {entry.id}")

        elif choice == "2":
            entries = storage.all()
            if not entries:
                print("No entries yet.")
            for e in sorted(entries, key=lambda x: x.created_at, reverse=True):
                print(f"  {e}")

        elif choice == "3":
            entry_id = input("Entry ID: ").strip()
            entry = storage.get(entry_id)
            if entry:
                print(f"\n{'=' * 50}")
                print(f"Title: {entry.title}")
                print(f"Date:  {entry.created_at[:10]}")
                if entry.mood:
                    print(f"Mood:  {entry.mood}")
                if entry.tags:
                    print(f"Tags:  {', '.join(entry.tags)}")
                print(f"{'─' * 50}")
                print(entry.content)
            else:
                print("Entry not found.")

        elif choice == "4":
            query = input("Search (press Enter to skip): ").strip()
            tag = input("Filter by tag (press Enter to skip): ").strip()
            results = storage.search(query=query, tag=tag)
            print(f"\nFound {len(results)} entries:")
            for e in results:
                print(f"  {e}")

        elif choice == "5":
            entry_id = input("Entry ID to delete: ").strip()
            if storage.delete(entry_id):
                print("Entry deleted.")
            else:
                print("Entry not found.")

        elif choice == "6":
            from pathlib import Path
            output = Path("journal_export.txt")
            entries = storage.all()
            with open(output, "w", encoding="utf-8") as f:
                for e in sorted(entries, key=lambda x: x.created_at):
                    f.write(f"{'=' * 60}\n")
                    f.write(f"{e.title}\n")
                    f.write(f"Date: {e.created_at[:10]}\n")
                    if e.tags:
                        f.write(f"Tags: {', '.join(e.tags)}\n")
                    f.write(f"{'─' * 60}\n")
                    f.write(f"{e.content}\n\n")
            print(f"Exported {len(entries)} entries to {output}")

        elif choice == "0":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")


if __name__ == "__main__":
    main()
```

### Extension Ideas

1. Add `import` from text file format
2. Add stats: total entries, most used tags, entries per month
3. Export to HTML with formatting
4. Add entry encryption using `cryptography` library
5. Add auto-backup when journal exceeds 100 entries

---

## Next Course

**Course 8: Working with Libraries** — pip, virtual environments, popular packages (requests, Pillow, SQLite), and reading documentation.

---

[← Previous](./lesson-09-binary-files-other-formats.md) | [Back to Course](./README.md)

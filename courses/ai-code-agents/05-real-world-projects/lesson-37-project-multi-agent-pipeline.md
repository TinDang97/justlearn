# Lesson 37: Project — Multi-Agent Pipeline

**Course:** AI Code Agents | **Duration:** 60 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Design a multi-agent pipeline with clear agent responsibilities and handoffs
- Implement an orchestrator that runs agents sequentially with state passing
- Integrate the pipeline into a GitHub Actions CI/CD workflow
- Handle partial failures gracefully (some agents fail, others continue)

---

## Prerequisites

- Lessons 33-36 of this section

---

## Part 1: Pipeline Architecture

The multi-agent pipeline coordinates four agents on a single event: a pull request being opened or updated.

```
PR Event Trigger
       │
       ▼
Code Review Agent ─── FAIL (major issues) ──► Block merge + comment
       │
      PASS
       │
       ▼
Test Generation Agent ─── Report missing tests ──► Suggest additions
       │
       ▼
Documentation Agent ─── Add missing docstrings ──► Commit to PR branch
       │
       ▼
Refactoring Agent ─── Minor safe refactors ──► Commit to PR branch
       │
       ▼
Summary Report ──────────────────────────────► Post as PR comment
```

Key design decisions:
1. **Code review gates the pipeline.** If code review finds MAJOR ISSUES, the pipeline stops and blocks the PR. Minor issues (NEEDS CHANGES) are reported but do not block the pipeline.
2. **Each agent is independent.** If the documentation agent fails, the refactoring agent still runs.
3. **All agents output to files.** The orchestrator reads the output files to pass context between agents and to compile the summary report.

---

## Part 2: The Pipeline Orchestrator

```python
#!/usr/bin/env python3
"""Multi-Agent Pipeline Orchestrator — coordinates all four agents on a PR."""

import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from datetime import datetime

@dataclass
class AgentResult:
    agent: str
    status: str  # "success" | "failed" | "skipped"
    output: str = ""
    error: str = ""
    files_modified: list[str] = field(default_factory=list)
    duration_seconds: float = 0.0


def run_agent(
    name: str,
    command: list[str],
    project_root: Path,
    timeout: int = 300
) -> AgentResult:
    """Run a single agent as a subprocess and collect the result."""
    start = datetime.now()
    print(f"\n[Pipeline] Starting: {name}...")

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=str(project_root),
            timeout=timeout,
            env={
                **__import__("os").environ,
                "PYTHONPATH": str(project_root),
            }
        )
        duration = (datetime.now() - start).total_seconds()

        if result.returncode == 0:
            print(f"[Pipeline] {name}: SUCCESS ({duration:.1f}s)")
            return AgentResult(
                agent=name,
                status="success",
                output=result.stdout,
                duration_seconds=duration
            )
        else:
            print(f"[Pipeline] {name}: FAILED (exit {result.returncode})")
            return AgentResult(
                agent=name,
                status="failed",
                error=result.stderr + result.stdout,
                duration_seconds=duration
            )

    except subprocess.TimeoutExpired:
        return AgentResult(
            agent=name,
            status="failed",
            error=f"Agent timed out after {timeout}s"
        )
    except Exception as e:
        return AgentResult(
            agent=name,
            status="failed",
            error=str(e)
        )


def get_pr_changed_files(project_root: Path, base_branch: str = "main") -> list[str]:
    """Get the list of Python files changed in the current branch vs base."""
    result = subprocess.run(
        ["git", "diff", "--name-only", f"{base_branch}...HEAD"],
        capture_output=True, text=True, cwd=str(project_root)
    )
    return [f for f in result.stdout.strip().split("\n") if f.endswith(".py") and f]


def extract_review_verdict(review_path: Path) -> str:
    """Extract the APPROVE/NEEDS CHANGES/MAJOR ISSUES verdict from a review file."""
    if not review_path.exists():
        return "UNKNOWN"
    content = review_path.read_text(encoding="utf-8")
    for verdict in ["MAJOR ISSUES", "NEEDS CHANGES", "APPROVE"]:
        if verdict in content:
            return verdict
    return "UNKNOWN"


def run_pipeline(project_root: str, base_branch: str = "main") -> int:
    root = Path(project_root).resolve()
    output_dir = root / ".pipeline-output"
    output_dir.mkdir(exist_ok=True)

    # Get changed files
    changed_files = get_pr_changed_files(root, base_branch)
    if not changed_files:
        print("[Pipeline] No Python files changed. Nothing to do.")
        return 0

    print(f"[Pipeline] Processing {len(changed_files)} changed files: {changed_files}")
    results: list[AgentResult] = []

    # Stage 1: Code Review (gates the pipeline)
    for source_file in changed_files:
        stem = Path(source_file).stem
        review_output = f".pipeline-output/review-{stem}.md"

        result = run_agent(
            f"Code Review: {source_file}",
            ["python", "agents/review_agent.py", source_file, review_output, str(root)],
            root
        )
        results.append(result)

        verdict = extract_review_verdict(root / review_output)
        print(f"[Pipeline] Review verdict for {source_file}: {verdict}")

        if verdict == "MAJOR ISSUES":
            print("[Pipeline] BLOCKED: Major issues found. Stopping pipeline.")
            write_summary(results, output_dir, status="blocked")
            return 1

    # Stage 2: Test Generation (report only, don't block)
    for source_file in changed_files:
        stem = Path(source_file).stem
        test_output = f"tests/generated/test_{stem}.py"

        result = run_agent(
            f"Test Generation: {source_file}",
            ["python", "agents/test_gen_agent.py", source_file, test_output, str(root)],
            root
        )
        results.append(result)

    # Stage 3: Documentation (commit additions to PR branch)
    for source_file in changed_files:
        result = run_agent(
            f"Documentation: {source_file}",
            ["python", "agents/doc_agent.py", source_file, str(root)],
            root
        )
        results.append(result)

    # Stage 4: Refactoring (commit safe improvements)
    for source_file in changed_files:
        result = run_agent(
            f"Refactoring: {source_file}",
            ["python", "agents/refactor_agent.py", source_file, str(root)],
            root
        )
        results.append(result)

    write_summary(results, output_dir, status="complete")
    return 0


def write_summary(results: list[AgentResult], output_dir: Path, status: str) -> None:
    summary_lines = [
        f"# Multi-Agent Pipeline Summary",
        f"**Status:** {status.upper()}",
        f"**Timestamp:** {datetime.now().isoformat()}",
        "",
        "## Agent Results",
        "",
    ]
    for r in results:
        icon = "OK" if r.status == "success" else "FAIL" if r.status == "failed" else "SKIP"
        summary_lines.append(f"- [{icon}] **{r.agent}** ({r.duration_seconds:.1f}s)")
        if r.error:
            summary_lines.append(f"  - Error: {r.error[:200]}")

    summary_path = output_dir / "pipeline-summary.md"
    summary_path.write_text("\n".join(summary_lines))
    print(f"\n[Pipeline] Summary written to {summary_path}")


if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    base = sys.argv[2] if len(sys.argv) > 2 else "main"
    sys.exit(run_pipeline(root, base))
```

---

## Part 3: GitHub Actions Integration

```yaml
# .github/workflows/ai-pipeline.yml
name: AI Code Agent Pipeline

on:
  pull_request:
    types: [opened, synchronize]
    branches: [main]

jobs:
  ai-pipeline:
    runs-on: ubuntu-latest
    permissions:
      contents: write       # To commit documentation/refactoring changes
      pull-requests: write  # To post review comments

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for git diff

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install anthropic ruff

      - name: Run AI pipeline
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python agents/pipeline.py . ${{ github.event.pull_request.base.ref }}

      - name: Post pipeline summary as PR comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const summary = fs.readFileSync('.pipeline-output/pipeline-summary.md', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: summary
            });

      - name: Commit any pipeline-generated changes
        run: |
          git config user.name "AI Pipeline Bot"
          git config user.email "ai-pipeline@noreply"
          git add tests/generated/ || true
          git diff --staged --quiet || git commit -m "chore: AI pipeline additions (docs, tests)"
          git push origin HEAD:${{ github.head_ref }} || true
```

---

## Key Takeaways

- Pipeline architecture: code review gates, then test generation, documentation, and refactoring run independently
- Each agent is a subprocess — simple orchestration, no shared state, clear error boundaries
- `extract_review_verdict` parses review output files to decide whether to block or continue
- GitHub Actions integration: ANTHROPIC_API_KEY as a repository secret, post results as PR comments, commit generated changes

---

Next Lesson: In **Lesson 38: Deployment and Monitoring**, we cover the operational aspects of running agents in production: cost management, observability, scaling, and incident response.

---

[Back to Section Overview](./README.md) | [Next Lesson: Deployment and Monitoring →](./lesson-38-deployment-and-monitoring.md)

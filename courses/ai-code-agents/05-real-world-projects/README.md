# Section 5: Real-World Projects

**Level:** Intermediate
**Duration:** 7 lessons x 50-60 minutes = ~7 hours total
**Prerequisites:** Sections 1-4 complete

---

## Section Overview

This section is integration. You apply everything from Sections 1-4 to build five complete, production-quality AI agent projects. Each project is immediately useful for real software development work — not a toy example.

The projects build in complexity:
- Projects 1-4 are standalone agents, each targeting a specific development workflow
- Project 5 orchestrates projects 1-4 into a unified multi-agent CI/CD pipeline

---

## Project List

| # | Project | Core Challenge | Duration |
|---|---------|---------------|----------|
| 33 | Code Review Agent | PR analysis, structured output, multi-file context | 55 min |
| 34 | Test Generation Agent | Interface discovery, test framework conventions, edge cases | 60 min |
| 35 | Documentation Agent | Docstring generation, README structure, Mermaid diagrams | 55 min |
| 36 | Refactoring Agent | Code smell detection, safe AST-aware editing | 55 min |
| 37 | Multi-Agent Pipeline | Orchestration, inter-agent communication, CI/CD integration | 60 min |
| 38 | Deployment and Monitoring | Production agents, cost tracking, observability | 55 min |
| 39 | Course Review and Next Steps | Capstone synthesis, advanced resources, community | 40 min |

---

## What You Will Build

By the end of this section, you will have a working multi-agent pipeline that can be triggered from CI/CD:

1. When a PR is opened, the **Code Review Agent** runs and posts its review as a PR comment
2. If the review passes, the **Test Generation Agent** identifies missing tests and suggests additions
3. The **Documentation Agent** checks that new code has proper docstrings and updates the README if needed
4. The **Refactoring Agent** identifies any new code smells introduced in the PR

All four agents are orchestrated by the **Multi-Agent Pipeline**, which runs as a GitHub Actions workflow.

---

[Back to Course Catalog](../README.md)

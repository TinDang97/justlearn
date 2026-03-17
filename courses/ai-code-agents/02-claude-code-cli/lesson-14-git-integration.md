# Lesson 14: Git Integration

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Use Claude Code to create well-formatted git commits with meaningful messages
- Create and manage feature branches through Claude Code
- Review changes using diffs and have Claude explain what changed and why
- Use Claude Code to help create pull request descriptions

---

## Prerequisites

- Lessons 9-13 of this section
- Basic git workflow familiarity (commit, branch, push)

---

## Part 1: Commits with Claude Code

Git commits are the natural checkpoints in an agentic development workflow. After Claude Code completes a task, creating a commit captures the work and provides a rollback point.

**Basic commit:**

```
Commit the current changes with an appropriate commit message.
```

Claude will:
1. Run `git status` to see what has changed
2. Run `git diff` to review the actual changes
3. Determine an appropriate commit type (feat, fix, refactor, etc.)
4. Write a meaningful commit message based on what changed
5. Stage and commit the files

**Commit with specific message guidance:**

```
Commit these changes. The commit is for: adding email validation to the user registration function.
Use conventional commit format: feat(auth): description.
```

**Commit with review step:**

```
Before committing, show me the diff of what will be committed and the commit message you plan to use. I will approve before you execute.
```

This is the recommended approach for significant changes — review both the diff and the message before the commit is created.

**Granular commits for multi-step tasks:**

When Claude Code completes a multi-step task (e.g., implementing a feature with model + service + API + tests), you can ask for separate commits per logical unit:

```
Create separate commits for these changes:
1. The model change in src/models/user.py
2. The repository change in src/repositories/user_repository.py
3. The API endpoint in src/api/users.py
4. The tests in tests/api/test_users.py

Use descriptive commit messages for each. Do not create one large commit.
```

---

## Part 2: Branching

Claude Code can manage branches as part of a development workflow:

**Creating a feature branch:**

```
Create a new branch named feature/email-validation for this work. Base it on the current main branch.
```

**Working on a branch throughout a session:**

A common pattern is to start a Claude Code session with branch creation and end with a commit:

```
We are going to implement the password reset feature.
First, create a branch named feature/password-reset from main.
Then proceed with the implementation.
```

**Checking the current branch state:**

```
What branch am I on? What commits have been made since branching from main?
```

Claude will run `git branch`, `git log`, and related commands to give you a current picture.

**Merging and cleanup:**

While complex merge scenarios should be handled by you directly, Claude can help with routine merges:

```
Merge the changes from feature/email-validation into main. Use a merge commit (not squash, not rebase). If there are conflicts, show them to me and I will resolve them manually.
```

The instruction to report conflicts rather than resolve them is important — conflict resolution involves judgment calls that benefit from human input.

---

## Part 3: Diff Review

One of Claude Code's most useful git capabilities is explaining diffs in plain language:

**Understanding a complex diff:**

```
Explain the diff of the last commit in plain English. What changed, why does it matter, and what might break if this change is wrong?
```

**Reviewing staged changes before commit:**

```
Review the currently staged changes. Are there any issues? Things that look wrong, missing tests, potential bugs introduced?
```

**Comparing branches:**

```
Compare the current branch to main. What has changed? Are there any changes that look unintentional or risky?
```

**Reviewing a specific commit:**

```
Explain what commit abc1234 changed and what the impact was.
```

This is particularly useful for code review: instead of reading raw diffs, you get plain-language summaries with analysis.

---

## Part 4: Pull Request Descriptions

Creating a good pull request description is a task that LLMs do well, because it requires understanding the code changes and explaining them clearly. Claude Code can generate PR descriptions from the actual diff:

**Generate a PR description:**

```
Generate a pull request description for the current branch. Compare to main and describe:
1. What problem this PR solves
2. What changes were made (summarize, not list every file)
3. How to test the changes
4. Any notes for the reviewer

Format in Markdown suitable for GitHub.
```

Claude reads the diff, understands the changes, and writes a description that a reviewer will find useful — much better than "implemented feature" or "fixed bug."

**Review feedback assistance:**

When you receive code review comments, Claude can help address them:

```
The reviewer left a comment on PR #42 that says:
"The email validation regex doesn't handle international domain names. Consider using the email-validator library instead."

How should I address this? Look at the current implementation and suggest the change.
```

---

## Part 5: Git Safety Rules

When using an agent with git access, maintain these safety rules:

**Never force-push main.** Add an explicit instruction in your CLAUDE.md: "Never run git push --force on the main or master branch." Claude Code respects explicit safety rules.

**Require confirmation for remote operations.** Claude can commit locally without your intervention, but should always confirm before pushing to a remote repository. Add this to your CLAUDE.md: "Always ask for confirmation before running git push."

**Keep commits atomic.** Each commit should represent one logical change. Multi-file features should still be committed as a single atomic unit (all changes for the feature together), not as one file per commit unless there is a specific reason.

**Preserve git history.** Avoid `--amend` on commits that have already been pushed. Use new commits to fix issues in pushed code.

---

## Key Takeaways

- Claude Code can create commits with meaningful messages — use the review-before-commit pattern for significant changes
- Feature branches work naturally with Claude Code — create them explicitly at the start of a task
- Diff explanation in plain language is a powerful tool for code review and understanding changes
- PR description generation from the actual diff produces consistently good output
- Explicit safety rules (no force-push main, confirm before push) belong in CLAUDE.md

---

## Common Mistakes to Avoid

**Letting Claude commit silently without review.** The default "commit" prompt is convenient but means you are trusting Claude's message and staging decisions. For any significant work, use the review-before-commit pattern.

**Not branching before long tasks.** Starting a multi-hour task on main without a branch means you cannot easily separate or roll back the work. Branch first.

**Asking Claude to resolve merge conflicts.** Conflict resolution requires human judgment about which version of the code is semantically correct. Ask Claude to show you the conflicts, then resolve them yourself.

---

Next Lesson: In **Lesson 15: Project Instructions (CLAUDE.md)**, we learn how to write effective CLAUDE.md project instructions that encode your team's conventions, tools, and workflows so every session starts with the right context.

---

[Back to Section Overview](./README.md) | [Next Lesson: Project Instructions (CLAUDE.md) →](./lesson-15-project-instructions-claude-md.md)

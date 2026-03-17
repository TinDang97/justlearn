# Lesson 16: Effective Prompting Patterns

**Course:** AI Code Agents | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Apply task decomposition to break complex requests into manageable units
- Write specific, constrained prompts that produce predictable outputs
- Recognize and avoid common prompting anti-patterns
- Use iterative refinement effectively to improve Claude's output

---

## Prerequisites

- Lessons 9-15 of this section (all of Section 2)

---

## Part 1: Task Decomposition

The single most effective prompting technique for agentic coding tasks is decomposition: breaking a complex task into a sequence of smaller, well-defined tasks.

**Why decomposition works:**

A complex task like "Implement the payment processing module" involves dozens of decisions: the library to use, the error handling approach, the database schema, the API design, the testing strategy, the security considerations. When Claude receives this as a single prompt, it makes all these decisions simultaneously, based on its priors — which may not align with your project's constraints.

When you decompose it:

1. "What payment processing library is appropriate for this project? Show me the options and their tradeoffs."
2. "Based on option X, what fields does the Payment model need? Review the existing Order model for naming patterns."
3. "Implement the Payment model with those fields. Do not implement the processing logic yet."
4. "Now implement create_payment() in PaymentRepository following the pattern in OrderRepository."
5. "Add the POST /payments endpoint following the pattern in order_endpoints.py."
6. "Write tests covering the happy path and the failure cases: card declined, invalid card, processing error."

Each step is small enough that Claude can succeed reliably. The human reviews and approves at each checkpoint. Mistakes are caught early and fixed before they affect subsequent steps.

Decomposition also makes the task easier to interrupt and resume. If step 4 goes wrong, you have solid checkpoints at steps 1-3 to roll back to.

---

## Part 2: Specificity and Constraints

Vague prompts produce vague results. Specific, constrained prompts produce specific, predictable results.

**The specificity ladder:**

| Vague | Specific |
|-------|----------|
| "Fix the bug" | "Fix the KeyError in src/api/users.py line 47 that occurs when the user has no profile object" |
| "Add tests" | "Add pytest tests for UserService.create_user() covering: valid creation, duplicate email, missing required field, email format invalid" |
| "Improve performance" | "The query in UserRepository.get_users_by_department() takes 3 seconds. Add an index or rewrite the query to bring it under 200ms" |
| "Refactor this function" | "Refactor parse_user_config() to use a Pydantic model instead of a dict. The model should have typed fields for each config key. Do not change the function's inputs or outputs" |

**Constraint types:**

- **Scope constraint:** "Only modify src/api/users.py — leave other files unchanged"
- **Approach constraint:** "Use the repository pattern, not direct SQLAlchemy queries in the endpoint"
- **Format constraint:** "Output the result as a Python dict, not a Pydantic model"
- **Negative constraint:** "Do not use async/await in this function — it is called from synchronous code"
- **Quality constraint:** "Every function must have a docstring describing its purpose and parameters"

Constraints reduce the space of valid responses and make Claude's output more predictable and useful.

---

## Part 3: Providing Context

Claude generates better output when it has relevant context. Providing the right context upfront — rather than having Claude discover it through tool calls — speeds up the session and reduces the chance of misalignment.

**Show the pattern to follow:**

```
Implement a delete_user() function in UserRepository. The existing create_user() and get_user_by_id() functions are shown below as a pattern to follow:

[paste the relevant code]

Follow the same error handling approach, return type conventions, and docstring format.
```

**Provide the error context:**

```
The following test is failing:

AssertionError: expected 404, got 200
test: test_get_nonexistent_user (tests/api/test_users.py:45)

The test: [paste test code]
The endpoint: [paste endpoint code]

What is wrong and how do I fix it?
```

**Provide the full context for a decision:**

```
I need to choose how to handle session management for this API. The relevant constraints are:
- We use stateless JWT tokens for authentication
- The API needs to support both web browser and mobile clients
- We have strict security requirements (finance domain)
- The team prefers simplicity over cleverness

Options I am considering:
1. Store sessions in Redis with 24-hour TTL
2. Short-lived JWT access tokens (15 min) + long-lived refresh tokens stored in HttpOnly cookies
3. Long-lived JWT tokens (7 days) with explicit revocation list

What are the tradeoffs and which do you recommend for these constraints?
```

Framing the question with the relevant constraints upfront produces a recommendation calibrated to your actual situation, not a generic "it depends" answer.

---

## Part 4: Iterative Refinement

Iterative refinement is the process of improving Claude's output through targeted follow-up prompts, rather than starting over with a better prompt.

**The refinement loop:**

1. Make a reasonable initial request
2. Review the output
3. Identify the specific gap between the output and what you needed
4. Write a targeted refinement prompt that addresses exactly that gap

**Example refinement sequence:**

Initial request:
```
Write a function to validate a user registration form.
```

Claude writes validation but only checks for empty fields.

Refinement 1:
```
Add email format validation using a regex that catches common mistakes (no @, no domain, etc.)
```

Claude adds email validation but the regex is too strict, rejecting valid addresses.

Refinement 2:
```
The current email regex rejects "user+tag@example.co.uk" which is a valid email. Loosen it to allow:
- Plus signs in the local part
- Multiple dots in the domain
- Country-code TLDs (e.g., .co.uk, .com.au)
```

This iterative approach is faster than trying to specify everything in the initial prompt and produces better results than throwing away the initial attempt.

---

## Part 5: Anti-Patterns to Avoid

**The kitchen sink request.** Asking for everything at once: "Implement the user management system with registration, login, password reset, profile update, admin panel, and comprehensive tests." This almost always produces a mediocre implementation of each part rather than a good implementation of any. Decompose.

**Ambiguous pronouns.** "Fix it so the function handles the case where it returns null." Which function? Which case? Which null? Pronoun ambiguity in technical prompts causes misalignment. Name things explicitly.

**Assuming Claude has context it does not have.** "Use the standard approach we discussed." What was discussed is not in the current context unless it is in CLAUDE.md or you have said it in the current session. Be explicit.

**Asking for verification without verification criteria.** "Make sure the code works" is unverifiable. "Run pytest tests/test_users.py and confirm all tests pass" is verifiable. Always specify what "correct" looks like.

**Re-explaining after a failure.** When Claude makes a mistake, explain the mistake directly:

Ineffective: "That is not right. The user should not be created if the email already exists."
Effective: "The create_user() function currently creates a duplicate user instead of raising an error. Fix it to raise DuplicateEmailError if the email already exists in the database. The DuplicateEmailError class is defined in src/exceptions.py."

The ineffective version tells Claude it is wrong but does not give enough information to fix it precisely.

---

## Key Takeaways

- Decomposition is the most effective technique: break complex tasks into small, specific, sequential requests with checkpoints
- Specificity produces predictability: scope constraints, approach constraints, format constraints, and negative constraints all narrow the solution space toward what you actually want
- Providing relevant context upfront (patterns to follow, error details, decision constraints) produces better output than having Claude discover it
- Iterative refinement — targeted follow-up on specific gaps — is faster than starting over and produces better results
- Key anti-patterns: kitchen-sink requests, ambiguous pronouns, undeclared context, unverifiable success criteria, vague error reporting

---

## Section 2 Complete

You have now covered the full Claude Code CLI skillset. You can install, authenticate, manage sessions, use file and git operations, write CLAUDE.md project instructions, and apply effective prompting patterns.

---

Next Lesson: In **Lesson 17: What is the Agent API?**, we move from using Claude Code to building agents from scratch. Section 3 starts by explaining the Anthropic Messages API — the programmatic interface that powers everything Claude Code does.

---

[Back to Section Overview](./README.md) | [Next Section: Agent API and SDK →](../03-agent-api-sdk/README.md)

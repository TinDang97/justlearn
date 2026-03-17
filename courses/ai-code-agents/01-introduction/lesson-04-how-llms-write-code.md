# Lesson 4: How LLMs Write Code

**Course:** AI Code Agents | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain tokenization and why it matters for code generation
- Describe next-token prediction at a conceptual level
- Explain why LLMs can generate correct code despite not "understanding" it in a human sense
- Identify specific failure modes that arise from LLMs' nature as token predictors

---

## Prerequisites

- Lessons 1-3 of this section
- No mathematical prerequisites — this lesson is conceptual

---

## Part 1: Tokenization — How Text Becomes Numbers

Language models do not work with characters or words as their fundamental unit — they work with tokens. A token is a chunk of text that the model's vocabulary maps to a single integer. Depending on the tokenizer, tokens might be:

- A whole common word: `function` → token 1234
- Part of a word: `config` → `con` + `fig` → tokens 567, 890
- A punctuation character: `{` → token 45
- A whitespace sequence: `    ` (four spaces, common in Python indentation) → token 99

For code specifically, tokenization has some non-obvious consequences:

**Indentation is expensive.** Python code uses whitespace for structure. Deep nesting requires many space tokens. This is not just a cost issue — it means the model "sees" deep nesting as a longer sequence, which affects how it handles indented code.

**Variable names get split.** A variable named `user_authentication_token` might tokenize as `user` + `_` + `authentication` + `_` + `token` — five tokens. The model must predict each token in sequence, which is why very long or unusual identifiers are harder for models to work with consistently.

**Numbers are awkward.** The number `1234567` might tokenize as `123` + `4567` or `12345` + `67` depending on the tokenizer. This is part of why LLMs are famously unreliable at arithmetic — the numerical meaning is distributed across multiple tokens in ways that do not align with the mathematical structure.

When you understand tokenization, some LLM behaviors that seem mysterious become clear. Models that "count characters wrong" are not hallucinating about counting — they are reasoning about tokens, not characters.

---

## Part 2: Next-Token Prediction

The core training objective of language models is deceptively simple: given a sequence of tokens, predict the next token. This is called **autoregressive language modeling**.

The model learns this by training on enormous amounts of text. During training, it sees billions of examples like: "given these 500 tokens, what is the 501st token?" The model adjusts its parameters to maximize the probability of predicting the correct next token.

At inference time (when you use the model), the process is:

1. Your prompt is tokenized into a sequence of integers.
2. The model processes the entire sequence through many layers of computation (the transformer architecture).
3. The model outputs a probability distribution over the entire vocabulary — how likely is each possible token to come next?
4. A token is sampled from this distribution (the temperature parameter controls how random this sampling is).
5. The sampled token is appended to the sequence.
6. The model processes the new, longer sequence and predicts the next token again.
7. This repeats until the model generates a stop token or reaches the length limit.

This is why LLM output is generated word-by-word (token by token): each token is generated from the probability distribution conditioned on everything that came before it.

---

## Part 3: Why LLMs Can Write Correct Code

Given that LLMs are "just" predicting the next token, why do they write surprisingly correct code? The answer is statistical patterns at an astonishing scale.

The training data for large models contains hundreds of billions of tokens, a significant fraction of which is code. That code is not random — it has deep structure: syntax rules, semantic constraints, design patterns, library APIs, testing conventions, error handling patterns. The model learns these patterns implicitly by learning to predict tokens in code.

When the model is asked to "write a Python function that parses JSON from a file and validates the schema," it is not reasoning from first principles about what valid Python looks like or how the `json` module works. It is drawing on a statistical model of how Python code looks — trained on millions of examples of similar code — and generating tokens that are consistent with that pattern.

This is why LLMs:

**Know library APIs.** They have seen thousands of examples of `json.load()`, `pandas.DataFrame()`, and `requests.get()` calls. The statistical pattern for how these functions are called is very strong.

**Follow language syntax.** Python has strict indentation and syntax rules. Code that violates these rules almost never appears in the training data, so the model's learned distribution strongly favors syntactically valid code.

**Implement common patterns.** CRUD operations, authentication flows, error handling patterns, pagination — these are so commonly implemented in similar ways that the model has a strong statistical prior for what correct implementation looks like.

The model is, in a meaningful sense, doing pattern matching at a scale and fidelity that produces outputs that look like genuine understanding. For code that closely matches common patterns, the results are excellent.

---

## Part 4: Limitations and Failure Modes

Understanding the token-prediction nature of LLMs also explains their characteristic failures:

**Hallucination of API calls.** If a library's API is relatively rare in the training data — perhaps because it is new, niche, or changed recently — the model's learned distribution may be based on incorrect or outdated examples. It will generate API calls that look plausible but are wrong. The model cannot distinguish "I saw this in the training data and it was correct" from "I am generating a token that fits the statistical pattern, even if the specific API does not exist."

**Counting and arithmetic errors.** As noted in Part 1, numbers are awkward tokens. The model has no explicit numerical reasoning capability — arithmetic is emergent from pattern matching, not built-in computation. For simple arithmetic, the patterns are strong and the model usually succeeds. For complex calculations, it fails unpredictably.

**Long-range dependency failures.** When a function refers to a variable defined many tokens earlier (especially in a very long file), the model needs to "remember" that definition across a long token sequence. Very deep attention structures can handle this, but it is harder than local patterns. You may see the model "forget" a type definition or convention it established earlier in a long context.

**Confident incorrectness.** The model's next-token prediction has no built-in uncertainty signal for code correctness — it generates tokens based on likelihood, not on having verified that the code runs. This is why LLMs can generate code that looks completely correct but contains a subtle logic bug. The tokens are all plausible; the logic is wrong.

**Security vulnerabilities.** If the training data contained insecure coding patterns (SQL string concatenation instead of parameterized queries, missing input validation, etc.), the model may replicate those patterns. Statistical learning reproduces what it sees, including bad practices.

These failure modes are the reason AI code agents include execution as a core capability: if the agent can run the code it writes and observe the result, it can detect and correct many of these failures automatically.

---

## Key Takeaways

- LLMs work by predicting the next token in a sequence, trained on massive amounts of text including code
- Tokenization means the model works with sub-word chunks, not characters or words — this explains some LLM behaviors around counting and arithmetic
- LLMs write correct code by learning statistical patterns from enormous training corpora, not by reasoning from first principles
- Failure modes include hallucinated APIs, arithmetic errors, long-range dependency failures, confident incorrectness, and replicated security vulnerabilities
- The execution-and-observation loop in AI agents compensates for these failures by letting the agent test and correct its own output

---

## Common Mistakes to Avoid

**Trusting LLM code without running it.** The model's output looks like correct code. The only way to verify it is to run it. Always run generated code before deploying it.

**Assuming the model "knows" the current version of a library.** If a library released a major version after the training cutoff, or if it is niche enough to be underrepresented in training data, the model's knowledge may be wrong or outdated.

**Using LLMs for critical arithmetic.** For any calculation that matters — financial calculations, security-critical comparisons, cryptographic operations — validate the result independently. Do not trust the model's arithmetic.

---

Next Lesson: In **Lesson 5: Agent vs Assistant**, we clarify the distinction between copilot-style autocomplete assistants and autonomous agents — not just technically, but in terms of how you think about the role of AI in your development workflow.

---

[Back to Section Overview](./README.md) | [Next Lesson: Agent vs Assistant →](./lesson-05-agent-vs-assistant.md)

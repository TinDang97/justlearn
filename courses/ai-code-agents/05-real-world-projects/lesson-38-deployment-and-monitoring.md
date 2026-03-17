# Lesson 38: Deployment and Monitoring

**Course:** AI Code Agents | **Duration:** 55 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Track and control AI agent costs in production
- Implement structured logging for agent observability
- Set up alerting for agent failures and cost spikes
- Plan scaling strategies for higher-volume agent workloads

---

## Prerequisites

- Lessons 33-37 of this section

---

## Part 1: Cost Management

AI agent costs can surprise you. Unlike a fixed-compute service, the cost of running an AI agent scales with the number of tokens processed — which scales with the size of the files read, the length of the conversation history, and the number of tool call iterations.

**Understanding your cost structure:**

For a single code review of a 500-line Python file using Claude Sonnet:
- System prompt: ~500 tokens
- File contents: ~5,000 tokens
- Tool definitions: ~1,000 tokens
- Conversation history (4-6 iterations): ~3,000 tokens
- Total input per request: ~9,500 tokens × 5 requests = ~47,500 input tokens
- Output tokens: ~2,000 total across all turns

At Sonnet pricing (~$3/M input, $15/M output):
- Input cost: 47,500 × $3/M = $0.14
- Output cost: 2,000 × $15/M = $0.03
- Total per review: ~$0.17

For a pipeline running 5 agents on 3 files per PR, and 20 PRs per day:
- 5 agents × 3 files × 20 PRs = 300 agent runs/day
- 300 × $0.17 = ~$51/day
- ~$1,500/month

This is a rough estimate but illustrates the calculation. Before deploying agents in production, work through this math for your specific usage pattern.

**Cost controls:**

```python
class CostTracker:
    def __init__(self, daily_limit_usd: float):
        self.daily_limit = daily_limit_usd
        self.today_cost = 0.0
        self.today_date = __import__("datetime").date.today()

    def record_call(self, input_tokens: int, output_tokens: int, model: str) -> float:
        # Approximate pricing (update with current rates)
        PRICING = {
            "claude-haiku-4-5": (0.00025, 0.00125),   # per 1K tokens
            "claude-sonnet-4-5": (0.003, 0.015),
            "claude-opus-4-5": (0.015, 0.075),
        }
        input_rate, output_rate = PRICING.get(model, (0.003, 0.015))
        cost = (input_tokens / 1000 * input_rate) + (output_tokens / 1000 * output_rate)

        today = __import__("datetime").date.today()
        if today != self.today_date:
            self.today_cost = 0.0
            self.today_date = today

        self.today_cost += cost
        return cost

    def check_limit(self) -> bool:
        """Returns True if under limit, False if at or over limit."""
        return self.today_cost < self.daily_limit

    def remaining_budget(self) -> float:
        return max(0.0, self.daily_limit - self.today_cost)
```

Integrate the cost tracker into your agent loop to stop processing when the daily budget is reached.

---

## Part 2: Structured Logging

Structured logs (JSON) are machine-parseable and can be queried, aggregated, and alerted on. Every agent run should emit structured events:

```python
import json
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, asdict

logger = logging.getLogger("agent")

@dataclass
class AgentEvent:
    timestamp: str
    run_id: str
    agent: str
    event_type: str  # "start" | "tool_call" | "tool_result" | "complete" | "error"
    # Optional fields
    tool_name: str = ""
    tool_args_keys: str = ""  # Just the argument names, not values (may contain secrets)
    input_tokens: int = 0
    output_tokens: int = 0
    duration_ms: int = 0
    error: str = ""

def log_event(event: AgentEvent) -> None:
    logger.info(json.dumps(asdict(event)))

# In your agent loop:
import uuid

def run_agent_with_logging(task: str, agent_name: str) -> str:
    run_id = str(uuid.uuid4())[:8]

    log_event(AgentEvent(
        timestamp=datetime.now(timezone.utc).isoformat(),
        run_id=run_id,
        agent=agent_name,
        event_type="start"
    ))

    messages = [{"role": "user", "content": task}]
    iteration = 0
    start_time = datetime.now()

    for iteration in range(30):
        call_start = datetime.now()
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=4096,
            messages=messages
        )
        call_ms = int((datetime.now() - call_start).total_seconds() * 1000)

        log_event(AgentEvent(
            timestamp=datetime.now(timezone.utc).isoformat(),
            run_id=run_id,
            agent=agent_name,
            event_type="api_call",
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            duration_ms=call_ms
        ))

        # ... handle response, log tool calls
        if response.stop_reason == "end_turn":
            total_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            log_event(AgentEvent(
                timestamp=datetime.now(timezone.utc).isoformat(),
                run_id=run_id,
                agent=agent_name,
                event_type="complete",
                duration_ms=total_ms
            ))
            break

    return ""
```

---

## Part 3: Alerting

With structured logs, set up alerts for:

**High error rate:** If more than 20% of agent runs fail in a 15-minute window.
```
alert: agent_error_rate_high
condition: count(event_type="error") / count(event_type="start") > 0.2
window: 15 minutes
```

**Cost spike:** If daily cost exceeds threshold.
```
alert: daily_cost_spike
condition: sum(cost_usd) for today > daily_limit * 0.8
when: daily_limit threshold reached at 80%
```

**High latency:** If average agent run time exceeds threshold.
```
alert: agent_latency_high
condition: p95(duration_ms where event_type="complete") > 120000 (2 minutes)
```

**Stuck agents:** Agents running for more than the timeout.
```
alert: agent_stuck
condition: any agent run with no events for > 5 minutes
```

---

## Part 4: Scaling Strategies

For higher-volume workloads, consider these scaling strategies:

**Parallelism within a pipeline:** Run independent agents in parallel using `asyncio` or `multiprocessing`. Code review, test generation, and documentation agents can run simultaneously on the same file.

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor

async def run_pipeline_parallel(changed_files: list[str]) -> list[AgentResult]:
    with ProcessPoolExecutor(max_workers=4) as executor:
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(executor, run_agent, name, command, root)
            for name, command in agent_tasks(changed_files)
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)
```

**Model tiering:** Use cheaper models for simpler subtasks. Documentation generation and test generation are less complex than code review. Haiku for documentation, Sonnet for review.

**Caching:** Cache agent results for files that have not changed. If a file's git hash matches the last run's hash, skip the agent run and use the cached result.

**Queue-based processing:** For high PR volume, use a job queue (Redis + Celery, or AWS SQS + Lambda) instead of synchronous GitHub Actions runs. PRs trigger queue messages; workers process the queue at their own rate.

---

## Key Takeaways

- Calculate cost before deploying: tokens × price × volume; have a daily budget limit and enforce it programmatically
- Structured JSON logging enables machine-parseable observability: alerts on error rate, cost, latency, stuck agents
- Scaling strategies: parallel agents for independent tasks, model tiering for cost optimization, caching for unchanged files, job queues for high volume

---

Next Lesson: In **Lesson 39: Course Review and Next Steps**, we review everything you have built, discuss advanced directions for continuing your AI agent journey, and share resources for the growing AI engineering community.

---

[Back to Section Overview](./README.md) | [Next Lesson: Course Review and Next Steps →](./lesson-39-course-review-and-next-steps.md)

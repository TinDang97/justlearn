# Lesson 7: API Integration & Webhooks

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Integrate with third-party APIs (Slack, Telegram, GitHub)
- Handle OAuth 2.0 authentication flow
- Build a webhook receiver with Flask
- Implement event-driven automation

---

## Lesson Outline

### Part 1: Third-Party API Integration (30 minutes)

#### Explanation

```python
import requests
import os

# Slack notification:
def send_slack_message(message: str, channel: str = "#general"):
    """Send message to Slack channel via Incoming Webhook."""
    webhook_url = os.environ["SLACK_WEBHOOK_URL"]
    payload = {
        "channel": channel,
        "text": message,
        "username": "PythonBot",
        "icon_emoji": ":robot_face:"
    }
    response = requests.post(webhook_url, json=payload, timeout=10)
    response.raise_for_status()
    return response.status_code == 200


# Rich Slack message with blocks:
def send_slack_alert(title: str, details: dict, color: str = "#FF0000"):
    payload = {
        "attachments": [{
            "color": color,
            "blocks": [
                {"type": "header", "text": {"type": "plain_text", "text": title}},
                {"type": "section",
                 "fields": [{"type": "mrkdwn", "text": f"*{k}:*\n{v}"}
                            for k, v in details.items()]},
                {"type": "context",
                 "elements": [{"type": "mrkdwn", "text": f"Sent at {datetime.now():%Y-%m-%d %H:%M}"}]}
            ]
        }]
    }
    requests.post(os.environ["SLACK_WEBHOOK_URL"], json=payload, timeout=10)


# Telegram bot:
def send_telegram(message: str):
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": message,
                              "parse_mode": "HTML"}, timeout=10)
```

#### Practice

Create a `NotificationService` that can send alerts via Slack or email depending on configuration.

---

### Part 2: OAuth 2.0 Basics (30 minutes)

#### Explanation

```python
# OAuth flow (simplified):
# 1. Your app redirects user to provider (Google, GitHub, etc.)
# 2. User logs in and authorizes your app
# 3. Provider redirects back with an authorization code
# 4. Your app exchanges code for access token
# 5. Use access token for API calls

# GitHub OAuth example:
import os
import requests

CLIENT_ID = os.environ["GITHUB_CLIENT_ID"]
CLIENT_SECRET = os.environ["GITHUB_CLIENT_SECRET"]

def get_github_token(auth_code: str) -> str:
    """Exchange authorization code for access token."""
    response = requests.post(
        "https://github.com/login/oauth/access_token",
        json={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": auth_code,
        },
        headers={"Accept": "application/json"},
        timeout=10
    )
    return response.json()["access_token"]

def get_user_info(token: str) -> dict:
    """Get authenticated user info."""
    return requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    ).json()

# Flask OAuth callback route:
from flask import Flask, request, redirect

@app.route("/oauth/callback")
def oauth_callback():
    code = request.args.get("code")
    if not code:
        return "Authorization failed", 400
    token = get_github_token(code)
    user = get_user_info(token)
    # Store token for the user, log them in...
    return f"Welcome, {user['login']}!"
```

#### Practice

Set up GitHub OAuth in a Flask app. After login, display the user's name and top repositories.

---

### Part 3: Webhooks (30 minutes)

#### Explanation

```python
# Webhook = URL that receives HTTP POST when an event happens
# Instead of polling API every minute, the API tells YOU when things change

from flask import Flask, request, jsonify
import hmac
import hashlib
import os

app = Flask(__name__)

def verify_github_signature(payload: bytes, signature: str) -> bool:
    """Verify webhook came from GitHub."""
    secret = os.environ["GITHUB_WEBHOOK_SECRET"].encode()
    expected = "sha256=" + hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.route("/webhooks/github", methods=["POST"])
def github_webhook():
    # Verify signature (ALWAYS do this in production):
    signature = request.headers.get("X-Hub-Signature-256", "")
    if not verify_github_signature(request.data, signature):
        return jsonify({"error": "Invalid signature"}), 403

    event = request.headers.get("X-GitHub-Event")
    payload = request.json

    if event == "push":
        branch = payload["ref"].split("/")[-1]
        commits = len(payload["commits"])
        pusher = payload["pusher"]["name"]
        send_slack_message(f"{pusher} pushed {commits} commit(s) to {branch}")

    elif event == "pull_request":
        action = payload["action"]
        pr_title = payload["pull_request"]["title"]
        if action == "opened":
            send_slack_message(f"New PR: {pr_title}")

    return jsonify({"status": "ok"})


# Stripe webhook (payment events):
@app.route("/webhooks/stripe", methods=["POST"])
def stripe_webhook():
    import stripe
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    event = stripe.Webhook.construct_event(
        payload, sig_header, os.environ["STRIPE_WEBHOOK_SECRET"]
    )
    if event["type"] == "payment_intent.succeeded":
        amount = event["data"]["object"]["amount"] / 100
        send_slack_message(f"Payment received: ${amount:.2f}")
    return jsonify({"status": "ok"})
```

#### Practice

Create a webhook receiver that listens for GitHub push events and automatically runs a test suite.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: CI/CD Bot

Build a GitHub webhook receiver that:
- Triggers on push to `main` branch
- Runs tests via subprocess
- Reports pass/fail to Slack
- Updates a status file with build history

#### Exercise 2: Alert Aggregator

Build a system where:
- Multiple scripts send alerts to a central `/webhook/alert` endpoint
- Alerts are grouped by severity and source
- A daily digest is emailed at 6 PM
- Slack gets immediate notification for CRITICAL alerts

---

## Key Takeaways

- Slack/Telegram webhooks: POST your message JSON to their URL — no SDK needed
- OAuth: redirect user → get code → exchange for token → use token for API calls
- Webhooks are event-driven: the service calls YOU, no polling needed
- Always verify webhook signatures before trusting payload
- `hmac.compare_digest()` for timing-safe signature comparison (prevents timing attacks)

---

[← Previous](./lesson-06-spreadsheet-automation.md) | [Back to Course](./README.md) | [Next →](./lesson-08-file-data-processing.md)

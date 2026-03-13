# Lesson 5: Email Automation

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Send emails with Python using smtplib
- Create rich HTML emails with attachments
- Build an email template system
- Handle Gmail and SMTP configuration

---

## Lesson Outline

### Part 1: Sending Emails (30 minutes)

#### Explanation

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_email(to: str | list[str], subject: str, body: str,
               from_email: str = None):
    """Send a plain text email via Gmail SMTP."""
    # Get credentials from environment (NEVER hardcode!):
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")   # your.email@gmail.com
    smtp_pass = os.environ.get("SMTP_PASS")   # App password from Google

    from_email = from_email or smtp_user
    to_list = [to] if isinstance(to, str) else to

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = ", ".join(to_list)
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.ehlo()
        server.starttls()   # Encrypt the connection
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, to_list, msg.as_string())

    print(f"Email sent to {', '.join(to_list)}")
```

> **Teacher's Note:** For Gmail, you need an "App Password" (not your regular password). Go to Google Account → Security → 2-Step Verification → App Passwords. Store credentials in `.env` file, never in code.

#### Practice

Send yourself a test email. Verify it arrives and check for spam folder issues.

---

### Part 2: HTML Emails with Attachments (30 minutes)

#### Explanation

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path

def send_html_email(to: list[str], subject: str,
                    html_body: str, attachments: list[str] = None):
    """Send HTML email with optional attachments."""
    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = os.environ["SMTP_USER"]
    msg["To"] = ", ".join(to)

    # HTML + plaintext alternative:
    alt = MIMEMultipart("alternative")
    plain_text = "Please view this email in an HTML-compatible client."
    alt.attach(MIMEText(plain_text, "plain"))
    alt.attach(MIMEText(html_body, "html"))
    msg.attach(alt)

    # Attach files:
    for filepath in (attachments or []):
        path = Path(filepath)
        with open(path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition",
                        f'attachment; filename="{path.name}"')
        msg.attach(part)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
        server.sendmail(msg["From"], to, msg.as_string())


# HTML email template:
html_report = """
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1976D2; color: white; padding: 20px;">
        <h1 style="margin: 0;">Daily Report</h1>
    </div>
    <div style="padding: 20px;">
        <h2>Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Metric</th>
                <th style="padding: 10px; text-align: right;">Value</th>
            </tr>
            <tr>
                <td style="padding: 10px;">Total Revenue</td>
                <td style="padding: 10px; text-align: right;"><strong>$45,230</strong></td>
            </tr>
        </table>
    </div>
</body>
</html>
"""
```

#### Practice

Create an HTML report email with a table, colored header, and an attached CSV file.

---

### Part 3: Email Templates (30 minutes)

#### Explanation

```python
from jinja2 import Environment, FileSystemLoader
from pathlib import Path

# Create Jinja2 environment for email templates:
env = Environment(loader=FileSystemLoader("email_templates"))

def render_email(template_name: str, **context) -> tuple[str, str]:
    """Render email template. Returns (subject, html_body)."""
    template = env.get_template(template_name)
    rendered = template.render(**context)
    subject_line = rendered.split("\n")[0].strip()  # First line = subject
    html_body = "\n".join(rendered.split("\n")[1:])
    return subject_line, html_body


# email_templates/daily_report.html.j2:
TEMPLATE = """Daily Sales Report - {{ date }}
<!DOCTYPE html>
<html>
<body>
    <h1>Sales Report for {{ date }}</h1>
    <p>Total revenue: <strong>{{ revenue | format_currency }}</strong></p>

    <h2>Top Products</h2>
    <ol>
    {% for product in top_products %}
        <li>{{ product.name }}: {{ product.revenue | format_currency }}</li>
    {% endfor %}
    </ol>
</body>
</html>
"""

# Bulk email (personalized):
def send_personalized_emails(recipients: list[dict]):
    """Send personalized email to each recipient."""
    for recipient in recipients:
        subject = f"Hi {recipient['name']}, your monthly summary"
        html = f"""
        <p>Dear {recipient['name']},</p>
        <p>Your account activity this month:</p>
        <ul>
            <li>Purchases: {recipient['purchases']}</li>
            <li>Total spent: ${recipient['total']:.2f}</li>
        </ul>
        """
        send_html_email([recipient["email"]], subject, html)
        time.sleep(0.5)   # Avoid spam filters
```

#### Practice

Build a `ReportEmailer` class that takes a Pandas DataFrame, generates an HTML table, and emails it as a formatted report.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Daily Report Bot

Create a script that:
- Reads today's sales data from a CSV
- Calculates key metrics (total, by region, top 5 products)
- Generates a matplotlib chart
- Creates an HTML email report
- Attaches the chart and raw CSV
- Sends to a configured recipient list

#### Exercise 2: Alert System

Build an alert emailer:
- `send_error_alert(error: Exception, context: str)` — formats error with traceback
- `send_threshold_alert(metric: str, value, threshold)` — business alert
- `send_daily_digest(alerts: list)` — batch all alerts into one daily email
- Include "Do Not Reply" header and unsubscribe note

---

## Key Takeaways

- Use App Passwords for Gmail (not your account password)
- Store SMTP credentials in environment variables, never hardcode
- `MIMEMultipart("alternative")` for text + HTML; `MIMEMultipart("mixed")` for attachments
- `server.starttls()` enables encryption before login
- Rate-limit bulk emails: 0.5s delay between each, or use a service like SendGrid

---

[← Previous](./lesson-04-selenium-browser-automation.md) | [Back to Course](./README.md) | [Next →](./lesson-06-spreadsheet-automation.md)

# Lesson 4: Selenium: Browser Automation

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Control a web browser programmatically with Selenium
- Interact with forms, buttons, and dynamic content
- Handle JavaScript-rendered pages
- Write reliable browser automation scripts

---

## Lesson Outline

### Part 1: Selenium Setup and Basics (30 minutes)

#### Explanation

```python
# pip install selenium webdriver-manager
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Setup (auto-downloads correct ChromeDriver version):
options = Options()
options.add_argument("--headless")   # Run without browser window
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

# Navigate:
driver.get("https://example.com")
print(driver.title)      # Page title
print(driver.current_url)

# Find elements:
elem = driver.find_element(By.ID, "search-input")
elem = driver.find_element(By.CLASS_NAME, "btn-primary")
elem = driver.find_element(By.CSS_SELECTOR, "div.container > p.lead")
elem = driver.find_element(By.XPATH, "//button[@type='submit']")
elems = driver.find_elements(By.TAG_NAME, "a")   # Returns list

# Interact:
elem.click()
elem.send_keys("Hello, Selenium!")
elem.clear()

# Get info:
print(elem.text)
print(elem.get_attribute("href"))
print(elem.is_displayed())
print(elem.is_enabled())

driver.quit()   # Always close the browser!
```

#### Practice

Use Selenium to open a search engine, search for "Python tutorial", and print the first 5 result titles.

---

### Part 2: Waits and Dynamic Content (30 minutes)

#### Explanation

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# NEVER use time.sleep() for waiting! Use explicit waits:

# Wait up to 10 seconds for element to appear:
wait = WebDriverWait(driver, 10)
elem = wait.until(EC.presence_of_element_located((By.ID, "dynamic-content")))

# Wait until clickable:
button = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "submit-btn")))
button.click()

# Wait until text appears:
wait.until(EC.text_to_be_present_in_element((By.ID, "status"), "Success"))

# Handle timeout:
try:
    elem = wait.until(EC.presence_of_element_located((By.ID, "result")))
except TimeoutException:
    print("Element didn't appear within 10 seconds")

# Execute JavaScript:
driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
driver.execute_script("arguments[0].click();", elem)  # Force click via JS
text = driver.execute_script("return arguments[0].textContent", elem)
```

#### Practice

Automate a login form on a test site: enter credentials, submit, wait for the dashboard to load, verify login succeeded.

---

### Part 3: Real Automation Patterns (30 minutes)

#### Explanation

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from contextlib import contextmanager

@contextmanager
def chrome_driver(headless=True):
    """Context manager for Chrome WebDriver."""
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager

    options = Options()
    if headless:
        options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    try:
        yield driver
    finally:
        driver.quit()


# Form automation:
def fill_form(driver, url: str, data: dict):
    driver.get(url)
    wait = WebDriverWait(driver, 10)

    for field_id, value in data.items():
        elem = wait.until(EC.presence_of_element_located((By.ID, field_id)))
        elem_type = elem.get_attribute("type")

        if elem_type in ("text", "email", "password", "number"):
            elem.clear()
            elem.send_keys(str(value))
        elif elem.tag_name == "select":
            Select(elem).select_by_visible_text(value)
        elif elem_type == "checkbox":
            if value and not elem.is_selected():
                elem.click()

    submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit.click()

# Screenshot on failure:
def take_screenshot(driver, name: str = "error"):
    path = f"screenshots/{name}.png"
    driver.save_screenshot(path)
    return path
```

#### Practice

Automate a multi-step form: page 1 (personal info), page 2 (address), page 3 (review and submit). Take a screenshot of the confirmation page.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Scraper for JS Sites

Many sites render content with JavaScript (BeautifulSoup can't see it). Use Selenium to scrape a site that requires JS, wait for data to load, and extract it.

#### Exercise 2: Form Filler

Build a `FormFiller` class that:
- Accepts field definitions (id/name → value)
- Handles text, select, radio, checkbox, file upload
- Takes screenshot before and after submission
- Returns extracted data from result page

---

## Key Takeaways

- Selenium controls a real browser — use it when JavaScript renders content
- NEVER use `time.sleep()` — use `WebDriverWait` with `expected_conditions`
- Always use `driver.quit()` in a `finally` block or context manager
- CSS selectors are generally more readable than XPath
- Screenshots on failure are invaluable for debugging automation

---

[← Previous](./lesson-03-web-scraping-beautifulsoup.md) | [Back to Course](./README.md) | [Next →](./lesson-05-email-automation.md)

# Lesson 3: Web Scraping with BeautifulSoup

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Fetch HTML pages with requests
- Parse HTML using BeautifulSoup
- Extract data with CSS selectors and tags
- Handle pagination and rate limiting

---

## Lesson Outline

### Part 1: BeautifulSoup Basics (30 minutes)

#### Explanation

```python
# pip install requests beautifulsoup4 lxml
import requests
from bs4 import BeautifulSoup

# Fetch a page:
response = requests.get("https://books.toscrape.com", timeout=10)
response.raise_for_status()
soup = BeautifulSoup(response.text, "lxml")   # lxml is faster than html.parser

# Find elements:
title = soup.title.text                        # Page title
h1 = soup.find("h1").text                     # First <h1>
all_h2 = soup.find_all("h2")                  # All <h2> elements
links = soup.find_all("a", href=True)         # All links

# CSS selectors (more powerful):
books = soup.select("article.product_pod")     # All matching elements
first_book = soup.select_one("article.product_pod")  # First match

# Extract attributes:
for link in links[:5]:
    href = link["href"]
    text = link.text.strip()
    print(f"{text}: {href}")

# Navigate the tree:
parent = soup.find("div", class_="container")
children = list(parent.children)
siblings = list(soup.find("h1").next_siblings)
```

#### Practice

Scrape the titles and prices of books from `https://books.toscrape.com` (a scraping practice site).

---

### Part 2: Extracting Structured Data (30 minutes)

#### Explanation

```python
from bs4 import BeautifulSoup
import requests
import re

def scrape_books(url: str) -> list[dict]:
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, "lxml")

    books = []
    for article in soup.select("article.product_pod"):
        # Get title from img alt:
        title = article.select_one("img")["alt"]

        # Get price and clean it:
        price_text = article.select_one("p.price_color").text.strip()
        price = float(re.sub(r"[^\d.]", "", price_text))

        # Get rating (class name = rating word):
        rating_elem = article.select_one("p.star-rating")
        rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
        rating = rating_map.get(rating_elem["class"][1], 0)

        # Get availability:
        available = "In stock" in article.select_one("p.availability").text

        books.append({
            "title": title,
            "price": price,
            "rating": rating,
            "available": available
        })

    return books

# Test:
books = scrape_books("https://books.toscrape.com")
print(f"Scraped {len(books)} books")
print(books[0])
```

#### Practice

Add the book URL and category to the scraped data by following links to each book's detail page.

---

### Part 3: Pagination and Politeness (30 minutes)

#### Explanation

```python
import requests
from bs4 import BeautifulSoup
import time
import random

def scrape_all_pages(base_url: str, max_pages: int = 5) -> list[dict]:
    """Scrape multiple pages with pagination."""
    all_books = []
    page = 1

    while page <= max_pages:
        url = f"{base_url}catalogue/page-{page}.html"
        print(f"Scraping page {page}...")

        try:
            response = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (Educational scraper)"
            })

            if response.status_code == 404:
                print("No more pages")
                break
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")
            books = scrape_books_from_soup(soup)
            all_books.extend(books)

            # Check for next page:
            next_btn = soup.select_one("li.next a")
            if not next_btn:
                break

        except Exception as e:
            print(f"Error on page {page}: {e}")
            break

        page += 1
        time.sleep(random.uniform(1, 3))   # Be polite - random delay!

    return all_books


# Respect robots.txt:
import urllib.robotparser

def can_scrape(url: str) -> bool:
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{url}/robots.txt")
    rp.read()
    return rp.can_fetch("*", url)
```

**Ethical scraping rules:**
1. Always check `robots.txt`
2. Add delays between requests (1-5 seconds)
3. Set a descriptive User-Agent
4. Don't overload servers (no parallel scraping)
5. Respect `Retry-After` headers

#### Practice

Scrape all 50 pages of books.toscrape.com, save to CSV, and add a delay between pages.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: News Scraper

Scrape headlines from a news aggregator (e.g., HN, Reddit public pages):
- Title, URL, vote count, comment count, posted date
- Filter by keyword
- Save to JSON

#### Exercise 2: Price Tracker

Build a price tracker:
- Takes a product URL, scrapes current price
- Saves price + timestamp to CSV
- Can be run daily via cron
- Alert when price drops below a threshold

---

## Key Takeaways

- `BeautifulSoup(html, "lxml")` parses HTML; use `lxml` parser for speed
- `.select("css.selector")` returns list; `.select_one()` returns first match or None
- `element["attribute"]` gets attribute; `element.text.strip()` gets text
- Always add delays between requests; check robots.txt; set User-Agent
- Use `re` to clean scraped text (prices, dates, etc.)

---

[← Previous](./lesson-02-scheduled-tasks.md) | [Back to Course](./README.md) | [Next →](./lesson-04-selenium-browser-automation.md)

# Lesson 7: Matplotlib Basics

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Create line, bar, scatter, and pie charts
- Customize titles, labels, colors, and styles
- Create multi-panel figures with subplots
- Save publication-quality figures

---

## Lesson Outline

### Part 1: Basic Chart Types (30 minutes)

#### Explanation

```python
import matplotlib.pyplot as plt
import numpy as np

# Line chart:
x = [1, 2, 3, 4, 5]
y = [2, 4, 1, 5, 3]
plt.figure(figsize=(10, 6))
plt.plot(x, y, color="blue", linewidth=2, marker="o", label="Series A")
plt.title("Line Chart Example")
plt.xlabel("X Axis")
plt.ylabel("Y Axis")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("line_chart.png", dpi=150)
plt.show()

# Bar chart:
categories = ["North", "South", "East", "West"]
values = [45000, 32000, 67000, 89000]
plt.figure(figsize=(8, 5))
bars = plt.bar(categories, values, color=["#2196F3", "#F44336", "#4CAF50", "#FF9800"])
plt.title("Revenue by Region")
plt.ylabel("Revenue ($)")
# Add value labels on bars:
for bar, val in zip(bars, values):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 500,
             f"${val:,}", ha="center", va="bottom")
plt.tight_layout()
plt.show()

# Scatter plot:
np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + np.random.randn(100)
plt.scatter(x, y, alpha=0.6, c="steelblue", edgecolors="white", linewidth=0.5)
plt.xlabel("X"); plt.ylabel("Y"); plt.title("Scatter Plot")
plt.show()
```

#### Practice

Create a line chart showing monthly sales for 2 products on the same chart with different colors and a legend.

---

### Part 2: Customization (30 minutes)

#### Explanation

```python
import matplotlib.pyplot as plt

# Styles:
plt.style.use("seaborn-v0_8-whitegrid")   # Clean white background with grid
# Other options: 'ggplot', 'fivethirtyeight', 'dark_background', 'bmh'

# Color options:
# Named: 'red', 'blue', 'green', 'orange', 'purple'
# Hex: '#2196F3', '#FF5722'
# RGBA: (0.2, 0.4, 0.8, 0.8)
# Colormap: plt.cm.Blues(0.7)

# Common parameters:
plt.plot(x, y,
    color="#2196F3",      # Line color
    linewidth=2,           # Line thickness
    linestyle="--",        # '-', '--', '-.', ':'
    marker="o",            # 'o', 's', '^', 'D', '*'
    markersize=8,
    label="Sales 2024",
    alpha=0.8              # Transparency
)

# Axis limits and ticks:
plt.xlim(0, 12)
plt.ylim(0, 100000)
plt.xticks(range(1, 13), ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
plt.yticks([0, 25000, 50000, 75000, 100000],
           ["$0", "$25K", "$50K", "$75K", "$100K"])

# Annotations:
plt.annotate("Peak!", xy=(8, 95000), xytext=(6, 80000),
             arrowprops={"arrowstyle": "->", "color": "red"}, color="red")
```

#### Practice

Recreate a bar chart comparing 2023 vs 2024 revenue by quarter using side-by-side bars with different colors.

---

### Part 3: Subplots (30 minutes)

#### Explanation

```python
# Multiple subplots:
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# Top-left:
axes[0, 0].plot(x, y1, color="blue")
axes[0, 0].set_title("Monthly Revenue")
axes[0, 0].set_xlabel("Month")

# Top-right:
axes[0, 1].bar(regions, revenues)
axes[0, 1].set_title("Revenue by Region")

# Bottom-left:
axes[1, 0].scatter(price, quantity, alpha=0.5)
axes[1, 0].set_title("Price vs Quantity")

# Bottom-right:
axes[1, 1].hist(daily_sales, bins=20, color="green", alpha=0.7)
axes[1, 1].set_title("Daily Sales Distribution")

plt.suptitle("Sales Dashboard", fontsize=16, fontweight="bold")
plt.tight_layout()
plt.savefig("dashboard.png", dpi=150, bbox_inches="tight")
plt.show()

# Unequal subplot sizes:
fig = plt.figure(figsize=(12, 8))
gs = fig.add_gridspec(2, 3)
ax_main = fig.add_subplot(gs[:, 0:2])  # Spans 2 columns
ax_top = fig.add_subplot(gs[0, 2])
ax_bottom = fig.add_subplot(gs[1, 2])
```

#### Practice

Create a 2×2 dashboard with: line chart (monthly trend), bar chart (by category), pie chart (market share), histogram (price distribution).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Sales Report Figures

Given a sales DataFrame, create:
1. Line chart: monthly revenue trend for 2024
2. Grouped bar chart: Q1-Q4 revenue for top 5 products
3. Scatter plot: quantity vs revenue colored by region
4. Horizontal bar chart: top 10 products by revenue

Save all in a single PDF with `matplotlib.backends.backend_pdf.PdfPages`.

#### Exercise 2: Comparison Dashboard

Create a 2×3 subplot grid comparing this year vs last year:
- Revenue trend
- Category breakdown (pie)
- Top products (bar)
- Regional performance (bar)
- Distribution (histogram)
- YoY growth rate (line with 0 reference line)

---

## Key Takeaways

- `plt.figure(figsize=(width, height))` sets the canvas size
- Always add `plt.tight_layout()` before saving to prevent label cutoff
- `plt.savefig("file.png", dpi=150)` saves at higher resolution
- `plt.subplots(rows, cols)` creates a grid of axes
- Use `plt.style.use("seaborn-v0_8-whitegrid")` for clean professional appearance

---

[← Previous](./lesson-06-groupby-aggregation.md) | [Back to Course](./README.md) | [Next →](./lesson-08-seaborn-statistics.md)

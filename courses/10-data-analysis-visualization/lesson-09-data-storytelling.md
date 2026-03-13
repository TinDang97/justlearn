# Lesson 9: Data Storytelling

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Design charts that communicate clearly
- Add annotations, reference lines, and context
- Build a cohesive multi-panel narrative
- Export publication-ready figures

---

## Lesson Outline

### Part 1: Chart Design Principles (30 minutes)

#### Explanation

**The five questions before making any chart:**
1. What is the key message I want to convey?
2. Who is the audience (technical vs non-technical)?
3. What type of comparison am I showing?
4. What data-to-ink ratio is appropriate?
5. Does this chart require a legend, or can I use direct labels?

**Chart type selection:**
```
Comparing categories → Bar chart (horizontal for long names)
Showing trends over time → Line chart
Part-to-whole → Stacked bar or pie (max 5 slices)
Distribution → Histogram, box plot, violin
Correlation → Scatter plot, heatmap
Geographic → Map (use geopandas)
```

```python
import matplotlib.pyplot as plt
import numpy as np

# Before: default chart
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Bad (default):
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
revenue = [45000, 52000, 49000, 67000, 72000, 85000]
ax1.plot(months, revenue)
ax1.set_title("Revenue")

# Good (storytelling):
ax2.plot(months, revenue, color="#1976D2", linewidth=2.5, marker="o",
         markersize=8, markerfacecolor="white", markeredgewidth=2)
ax2.fill_between(range(len(months)), revenue,
                 min(revenue) * 0.9, alpha=0.1, color="#1976D2")

# Reference line:
ax2.axhline(y=np.mean(revenue), color="#E53935", linestyle="--",
            linewidth=1.5, label=f"Average: ${np.mean(revenue):,.0f}")

# Annotate peak:
peak_idx = revenue.index(max(revenue))
ax2.annotate(f"Peak: ${max(revenue):,}", xy=(peak_idx, max(revenue)),
             xytext=(peak_idx - 1.5, max(revenue) + 3000),
             arrowprops={"arrowstyle": "->", "color": "#1976D2"},
             color="#1976D2", fontweight="bold")

ax2.set_title("Revenue Grew 89% in H1 2024", fontsize=13, fontweight="bold")
ax2.set_ylabel("Revenue ($)")
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"${x:,.0f}"))
ax2.legend()
ax2.spines["top"].set_visible(False)
ax2.spines["right"].set_visible(False)

plt.tight_layout()
plt.show()
```

#### Practice

Take a plain bar chart and transform it into a storytelling chart with a clear headline, annotations, and reduced chart junk.

---

### Part 2: Advanced Annotations (30 minutes)

#### Explanation

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

fig, ax = plt.subplots(figsize=(12, 6))

# Shade a region:
ax.axvspan(xmin=3, xmax=5, alpha=0.15, color="red", label="COVID Impact")

# Vertical reference line:
ax.axvline(x=7, color="green", linestyle="--", linewidth=1.5)
ax.text(7.1, ax.get_ylim()[1] * 0.95, "Policy Change",
        color="green", fontsize=9, va="top")

# Text box:
props = dict(boxstyle="round", facecolor="wheat", alpha=0.8)
ax.text(0.05, 0.95, "Key insight:\nRevenue grew\n89% in H2",
        transform=ax.transAxes,   # Axes coordinates (0-1)
        fontsize=10, verticalalignment="top", bbox=props)

# Arrow annotation:
ax.annotate("Unexpected drop",
    xy=(4, 32000),
    xytext=(5.5, 45000),
    fontsize=9,
    arrowprops=dict(
        arrowstyle="->",
        connectionstyle="arc3,rad=0.3",
        color="black"
    )
)

# Custom legend:
patches = [
    mpatches.Patch(facecolor="#1976D2", label="Revenue"),
    mpatches.Patch(facecolor="red", alpha=0.3, label="COVID Impact"),
]
ax.legend(handles=patches, loc="upper left")
```

#### Practice

Create an annotated chart showing a company's stock price with annotations for major events (earnings reports, product launches).

---

### Part 3: Building a Report (30 minutes)

#### Explanation

```python
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import pandas as pd

def create_sales_report(df: pd.DataFrame, output_path: str):
    """Generate a multi-page PDF sales report."""

    with PdfPages(output_path) as pdf:
        # Page 1: Executive Summary
        fig = plt.figure(figsize=(11, 8.5))  # Letter size
        fig.suptitle("Q4 2024 Sales Report", fontsize=20, fontweight="bold", y=0.98)

        gs = fig.add_gridspec(2, 3, hspace=0.4, wspace=0.3)

        # KPI cards:
        kpis = [
            ("Total Revenue", f"${df['revenue'].sum():,.0f}", "#4CAF50"),
            ("Orders", f"{len(df):,}", "#2196F3"),
            ("Avg Order", f"${df['revenue'].mean():,.0f}", "#FF9800"),
        ]
        for i, (label, value, color) in enumerate(kpis):
            ax = fig.add_subplot(gs[0, i])
            ax.text(0.5, 0.6, value, transform=ax.transAxes,
                   ha="center", va="center", fontsize=24,
                   fontweight="bold", color=color)
            ax.text(0.5, 0.2, label, transform=ax.transAxes,
                   ha="center", va="center", fontsize=11, color="gray")
            ax.axis("off")

        # Revenue trend:
        ax = fig.add_subplot(gs[1, :])
        monthly = df.groupby(df["date"].dt.to_period("M"))["revenue"].sum()
        ax.plot(range(len(monthly)), monthly.values, color="#2196F3", linewidth=2)
        ax.set_title("Monthly Revenue Trend")

        pdf.savefig(fig, bbox_inches="tight")
        plt.close()

        # Page 2: Regional Breakdown
        # ... (additional pages)

    print(f"Report saved to {output_path}")
```

#### Practice

Create a 3-page PDF report for a sales dataset: executive summary, product analysis, regional performance.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Before/After Transformation

Take 3 plain "before" charts and transform each into a polished "after" version:
- Bar chart: add data labels, sort bars, clear title with insight
- Line chart: add shading, reference line, key event annotations
- Scatter plot: add trend line, outlier labels, regression statistics

#### Exercise 2: Complete Data Story

Tell the story of "How our business changed from 2022 to 2024" in 5 charts:
1. Revenue growth (annotated line chart)
2. Product mix shift (stacked area chart)
3. Customer geography (if geographic data available)
4. New vs returning customers
5. Summary KPI dashboard

---

## Key Takeaways

- The chart title should state the insight, not just describe the data
- Remove chart junk: unnecessary borders, gridlines, tick marks
- Use direct labels instead of legends when possible
- Reference lines (avg, target, benchmark) add crucial context
- `PdfPages` lets you save a multi-page report from Python

---

[← Previous](./lesson-08-seaborn-statistics.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)

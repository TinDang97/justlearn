# Lesson 10: Course 10 Review & Mini Project

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Course Review

| Lesson | Topic | Key Skill |
|--------|-------|-----------|
| 1 | NumPy | Arrays, vectorized operations |
| 2 | Pandas Intro | Series, DataFrame, basic operations |
| 3 | Loading Data | read_csv, info, describe |
| 4 | Data Cleaning | Nulls, types, outliers |
| 5 | Filtering | Boolean index, loc/iloc, query |
| 6 | GroupBy | Aggregation, pivot tables, merge |
| 7 | Matplotlib | Line, bar, scatter, subplots |
| 8 | Seaborn | Distributions, heatmaps, pairplots |
| 9 | Data Storytelling | Annotations, report design |

---

## Mini Project: Sales Analytics Dashboard

### Dataset Setup

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta

# Generate realistic sample data:
np.random.seed(42)
n = 1000

products = ["Widget Pro", "Gadget X", "Tool Plus", "Device Max", "Kit Starter"]
regions = ["North", "South", "East", "West", "Central"]
channels = ["Online", "Retail", "Direct"]

dates = pd.date_range("2023-01-01", "2024-12-31", periods=n)
data = {
    "date": dates,
    "product": np.random.choice(products, n),
    "region": np.random.choice(regions, n),
    "channel": np.random.choice(channels, n),
    "quantity": np.random.randint(1, 50, n),
    "unit_price": np.random.uniform(10, 500, n).round(2),
    "discount": np.random.choice([0, 0.05, 0.10, 0.15, 0.20], n),
}
df = pd.DataFrame(data)
df["revenue"] = (df["quantity"] * df["unit_price"] * (1 - df["discount"])).round(2)
```

### Analysis Pipeline

```python
# 1. Data quality check:
print("Shape:", df.shape)
print("\nMissing values:", df.isnull().sum().sum())
print("\nRevenue stats:\n", df["revenue"].describe())

# 2. Time series analysis:
monthly = df.groupby(df["date"].dt.to_period("M"))["revenue"].sum()
yoy_growth = (monthly["2024"] / monthly["2023"] - 1) * 100

# 3. Product performance:
product_summary = (df.groupby("product")
    .agg(
        total_revenue=("revenue", "sum"),
        total_orders=("revenue", "count"),
        avg_order=("revenue", "mean"),
        units_sold=("quantity", "sum")
    )
    .sort_values("total_revenue", ascending=False)
)

# 4. Regional analysis:
regional = df.pivot_table(
    values="revenue",
    index="region",
    columns=df["date"].dt.year,
    aggfunc="sum"
)
regional["growth"] = (regional[2024] / regional[2023] - 1) * 100

# 5. Channel mix:
channel_mix = df.groupby(["date_year", "channel"])["revenue"].sum().unstack()
```

### Dashboard Figure

```python
fig = plt.figure(figsize=(16, 12))
fig.suptitle("2024 Sales Performance Dashboard", fontsize=18, fontweight="bold", y=0.98)

gs = fig.add_gridspec(3, 3, hspace=0.45, wspace=0.35)

# 1. Revenue trend (full width):
ax1 = fig.add_subplot(gs[0, :])
monthly_2024 = df[df["date"].dt.year == 2024].groupby(df["date"].dt.month)["revenue"].sum()
monthly_2023 = df[df["date"].dt.year == 2023].groupby(df["date"].dt.month)["revenue"].sum()
month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
ax1.plot(range(12), monthly_2024.values, color="#2196F3", linewidth=2.5, label="2024")
ax1.plot(range(12), monthly_2023.values, color="#B0BEC5", linewidth=1.5,
         linestyle="--", label="2023")
ax1.set_xticks(range(12))
ax1.set_xticklabels(month_labels)
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"${x/1000:.0f}K"))
ax1.legend()
ax1.set_title("Monthly Revenue: 2023 vs 2024")
ax1.spines["top"].set_visible(False)
ax1.spines["right"].set_visible(False)

# 2. Product performance (top-left):
ax2 = fig.add_subplot(gs[1, 0])
product_rev = df.groupby("product")["revenue"].sum().sort_values()
ax2.barh(product_rev.index, product_rev.values, color="#42A5F5")
ax2.set_title("Revenue by Product")
ax2.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"${x/1000:.0f}K"))
ax2.spines["top"].set_visible(False)
ax2.spines["right"].set_visible(False)

# 3. Regional heatmap (middle):
ax3 = fig.add_subplot(gs[1, 1])
region_month = df[df["date"].dt.year == 2024].pivot_table(
    values="revenue",
    index="region",
    columns=df["date"].dt.month,
    aggfunc="sum"
)
sns.heatmap(region_month, ax=ax3, cmap="Blues", fmt=".0f",
            cbar_kws={"label": "Revenue"})
ax3.set_title("Revenue: Region × Month (2024)")
ax3.set_xlabel("Month")

# 4. Channel distribution:
ax4 = fig.add_subplot(gs[1, 2])
channel_data = df.groupby("channel")["revenue"].sum()
colors = ["#42A5F5", "#EF5350", "#66BB6A"]
ax4.pie(channel_data, labels=channel_data.index, autopct="%1.1f%%",
        colors=colors, startangle=90)
ax4.set_title("Revenue by Channel")

# 5. Distribution:
ax5 = fig.add_subplot(gs[2, 0:2])
sns.histplot(data=df, x="revenue", hue="channel", element="step",
             fill=True, alpha=0.3, ax=ax5, binwidth=500)
ax5.set_title("Order Value Distribution by Channel")
ax5.set_xlabel("Order Revenue ($)")
ax5.spines["top"].set_visible(False)
ax5.spines["right"].set_visible(False)

# 6. Correlation:
ax6 = fig.add_subplot(gs[2, 2])
corr_data = df[["quantity", "unit_price", "discount", "revenue"]].corr()
sns.heatmap(corr_data, ax=ax6, annot=True, fmt=".2f", cmap="RdBu_r",
            center=0, square=True)
ax6.set_title("Variable Correlations")

plt.savefig("sales_dashboard.png", dpi=150, bbox_inches="tight")
plt.show()
print("Dashboard saved to sales_dashboard.png")
```

---

## Next Course

**Course 11: Automation & Scripting** — automate repetitive tasks, scheduled jobs, web scraping, email automation, and system administration.

---

[← Previous](./lesson-09-data-storytelling.md) | [Back to Course](./README.md)

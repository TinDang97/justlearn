# Lesson 8: Seaborn for Statistics

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Use Seaborn for statistical visualizations
- Create distribution plots, heatmaps, and pair plots
- Understand which chart type to use for what data
- Combine Seaborn with Matplotlib for customization

---

## Lesson Outline

### Part 1: Distribution Plots (30 minutes)

#### Explanation

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

sns.set_theme(style="whitegrid", palette="muted")

df = sns.load_dataset("tips")  # Built-in dataset

# Distribution of a single variable:
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

sns.histplot(df["total_bill"], kde=True, ax=axes[0])
axes[0].set_title("Histogram + KDE")

sns.kdeplot(df["total_bill"], fill=True, ax=axes[1])
axes[1].set_title("KDE Plot")

sns.boxplot(y=df["total_bill"], ax=axes[2])
axes[2].set_title("Box Plot")

plt.tight_layout()
plt.show()

# Violin plot (box + distribution):
sns.violinplot(data=df, x="day", y="total_bill", hue="sex", split=True)

# Comparing groups:
sns.histplot(data=df, x="total_bill", hue="sex", element="step")
sns.kdeplot(data=df, x="tip", hue="day", fill=True, alpha=0.3)
```

#### Practice

Create distribution plots comparing the salary distribution by department in the employee dataset.

---

### Part 2: Categorical and Relational Plots (30 minutes)

#### Explanation

```python
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

# Categorical plots:
sns.barplot(data=df, x="day", y="total_bill", hue="sex",
            estimator="mean", ci=95)  # With confidence intervals!

sns.stripplot(data=df, x="day", y="tip", jitter=True, alpha=0.5)  # Show all points
sns.swarmplot(data=df, x="day", y="tip")  # No overlapping

sns.boxplot(data=df, x="day", y="total_bill", hue="time")

# Relational plots:
sns.scatterplot(data=df, x="total_bill", y="tip",
                hue="sex", size="size", style="smoker",
                palette="deep")

# Add regression line:
sns.regplot(data=df, x="total_bill", y="tip", scatter_kws={"alpha": 0.4})

# Figure-level plots (automatically create legend, etc.):
g = sns.relplot(data=df, x="total_bill", y="tip",
                col="time", hue="sex", style="smoker",
                kind="scatter", height=4)
```

#### Practice

Create a chart showing the relationship between study hours and test scores, colored by whether the student passed.

---

### Part 3: Heatmaps and Pairplots (30 minutes)

#### Explanation

```python
import seaborn as sns
import matplotlib.pyplot as plt

# Correlation heatmap:
df = sns.load_dataset("titanic")
numeric_df = df.select_dtypes(include="number")
corr = numeric_df.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(corr,
    annot=True,      # Show values
    fmt=".2f",       # 2 decimal places
    cmap="RdBu_r",   # Red-Blue diverging colormap
    center=0,        # Center at 0
    square=True,     # Square cells
    vmin=-1, vmax=1  # Fixed scale
)
plt.title("Correlation Matrix")
plt.tight_layout()
plt.show()

# Clustermap (hierarchically clustered heatmap):
sns.clustermap(corr, cmap="coolwarm", figsize=(10, 8))

# Pairplot (scatter matrix):
sns.pairplot(df[["survived", "pclass", "age", "fare"]].dropna(),
             hue="survived",      # Color by survival
             diag_kind="kde",     # Diagonal: KDE instead of hist
             plot_kws={"alpha": 0.5})
plt.show()
```

#### Practice

Create a correlation heatmap for a sales dataset. Identify which variables are most correlated with revenue.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Titanic Analysis

Using the Titanic dataset (load with `sns.load_dataset("titanic")`):
1. Survival rate by passenger class (bar plot with confidence intervals)
2. Age distribution of survivors vs non-survivors (overlapping KDE)
3. Fare distribution by class (violin plot)
4. Correlation matrix of all numeric variables

#### Exercise 2: Custom Report

Create a 4-panel figure for a real estate dataset:
- Price distribution (histogram + KDE)
- Price vs. square footage (scatter + regression)
- Median price by neighborhood (horizontal bar)
- Price heatmap by bedroom count × bathroom count

---

## Key Takeaways

- `sns.histplot(data, kde=True)` — histogram with optional density curve
- `sns.boxplot(data, x="cat", y="num")` — distribution comparison by category
- `sns.heatmap(corr, annot=True, cmap="RdBu_r")` — correlation visualization
- `sns.pairplot(df, hue="target")` — scatter matrix for all variable pairs
- Seaborn works on top of Matplotlib: `ax=axes[i]` to place in subplots

---

[← Previous](./lesson-07-matplotlib-basics.md) | [Back to Course](./README.md) | [Next →](./lesson-09-data-storytelling.md)

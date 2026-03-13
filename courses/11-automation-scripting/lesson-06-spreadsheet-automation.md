# Lesson 6: Spreadsheet Automation

**Course:** Automation & Scripting | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

- Read and write Excel files with openpyxl
- Format cells, add charts, and apply styles
- Use Pandas with Excel efficiently
- Automate repetitive spreadsheet tasks

---

## Lesson Outline

### Part 1: openpyxl Basics (30 minutes)

#### Explanation

```python
# pip install openpyxl
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Create new workbook:
wb = Workbook()
ws = wb.active
ws.title = "Sales Data"

# Write data:
headers = ["Product", "Q1", "Q2", "Q3", "Q4", "Total"]
ws.append(headers)

data = [
    ["Widget Pro", 45000, 52000, 49000, 67000],
    ["Gadget X", 32000, 38000, 41000, 55000],
]

for row in data:
    total = sum(row[1:])
    ws.append(row + [total])

# Add formula:
ws.append(["Total", "=SUM(B2:B3)", "=SUM(C2:C3)", ...])

# Styling:
header_font = Font(bold=True, color="FFFFFF", size=12)
header_fill = PatternFill(start_color="1976D2", fill_type="solid")

for col_idx, _ in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col_idx)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")

# Column width:
for col in ws.columns:
    max_width = max(len(str(cell.value or "")) for cell in col)
    ws.column_dimensions[get_column_letter(col[0].column)].width = max_width + 2

wb.save("report.xlsx")
print("Saved report.xlsx")
```

#### Practice

Create an Excel workbook with 3 sheets: raw data, summary, and charts (placeholder).

---

### Part 2: Reading and Modifying Excel (30 minutes)

#### Explanation

```python
from openpyxl import load_workbook

# Read existing file:
wb = load_workbook("data.xlsx")
ws = wb["Sheet1"]

# Iterate rows:
for row in ws.iter_rows(min_row=2, values_only=True):
    product, q1, q2, q3, q4 = row
    print(f"{product}: total = {sum([q1, q2, q3, q4])}")

# Read by cell:
value = ws["B2"].value           # Single cell
value = ws.cell(row=2, col=2).value

# Find last row with data:
last_row = ws.max_row
last_col = ws.max_column

# Modify existing file:
wb = load_workbook("report.xlsx")
ws = wb.active

# Add new column:
ws["F1"] = "Status"
for row_idx in range(2, ws.max_row + 1):
    total = ws.cell(row=row_idx, column=5).value
    ws.cell(row=row_idx, column=6).value = "Above Target" if total > 50000 else "Below Target"

wb.save("report_updated.xlsx")


# Read with Pandas (easier for data):
import pandas as pd
df = pd.read_excel("data.xlsx", sheet_name="Sales")
# Modify...
df.to_excel("output.xlsx", index=False, sheet_name="Processed")
```

#### Practice

Read a sales Excel file, calculate totals and percentages, write results to a new sheet with formatting.

---

### Part 3: Charts and Advanced Formatting (30 minutes)

#### Explanation

```python
from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, Reference

wb = Workbook()
ws = wb.active

# Add data:
data = [["Month", "Revenue", "Expenses"],
        ["Jan", 45000, 32000], ["Feb", 52000, 35000],
        ["Mar", 48000, 31000], ["Apr", 67000, 41000]]
for row in data:
    ws.append(row)

# Create bar chart:
chart = BarChart()
chart.title = "Revenue vs Expenses"
chart.style = 10
chart.y_axis.title = "Amount ($)"
chart.x_axis.title = "Month"

# Data reference (rows 2-5, columns 2-3):
revenue_data = Reference(ws, min_col=2, min_row=1, max_row=5)
expense_data = Reference(ws, min_col=3, min_row=1, max_row=5)
cats = Reference(ws, min_col=1, min_row=2, max_row=5)

chart.add_data(revenue_data, titles_from_data=True)
chart.add_data(expense_data, titles_from_data=True)
chart.set_categories(cats)
chart.shape = 4   # 3D effect

ws.add_chart(chart, "E2")   # Place chart at cell E2
wb.save("chart_report.xlsx")


# Conditional formatting:
from openpyxl.formatting.rule import ColorScaleRule, DataBarRule

# Color scale (green-yellow-red):
rule = ColorScaleRule(
    start_type="min", start_color="F44336",    # Red for low
    mid_type="percentile", mid_value=50, mid_color="FFEB3B",  # Yellow mid
    end_type="max", end_color="4CAF50"          # Green for high
)
ws.conditional_formatting.add("B2:B10", rule)
```

#### Practice

Create a monthly sales report Excel file with: data table, bar chart comparing products, color-coded performance (green/yellow/red).

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Sales Report Generator

Build a function `generate_excel_report(data: pd.DataFrame, filename: str)`:
- Sheet 1: Raw data with auto-sized columns and header formatting
- Sheet 2: Summary pivot table (by category × region)
- Sheet 3: Chart (bar chart comparing categories)
- Apply company color scheme (blue headers, alternating row colors)

#### Exercise 2: Excel Template Filler

Given an Excel template with placeholder text like `{{date}}`, `{{total_revenue}}`, `{{top_product}}`:
- Load the template
- Replace all placeholders with real data
- Save as a new file with current date in filename

---

## Key Takeaways

- `openpyxl` for creating/editing `.xlsx` files; `pandas` for data analysis
- `ws.append(row)` adds a row; `ws.cell(row, col).value` reads/writes single cells
- Apply styles via `Font`, `PatternFill`, `Alignment` objects
- `Reference` and `BarChart`/`LineChart` create embedded charts
- `pd.read_excel()` → modify → `df.to_excel()` is the fastest workflow for data tasks

---

[← Previous](./lesson-05-email-automation.md) | [Back to Course](./README.md) | [Next →](./lesson-07-api-integration-webhooks.md)

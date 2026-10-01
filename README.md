# NGO Project Management – Resource & Budget module

React + TypeScript + Vite frontend with a small Flask + SQLite backend.
Only the **Resource & Budget** section (Dashboard, Budget Management, Resources, Expenses) uses the backend.
The Communication and Admin pages are unchanged and still use the sample data in `src/data.ts`.

**Both the backend and the frontend must be running** at the same time.

## Project structure

```text
backend/
  app.py              Flask routes (budgets, resources, expenses, dashboard)
  database.py         opens SQLite and creates tables
  schema.sql          CREATE TABLE statements
  seed.py             seed data is disabled; records are entered through the UI
  ngo_management.db   the SQLite database (created automatically)
  requirements.txt
src/
  api.ts              all fetch() calls to the backend
  pages/              ResourceDashboard, BudgetManagement, Resources, Expenses (+ unchanged pages)
  App.tsx, data.ts, types.ts
```

## 1. Run the backend (terminal 1)

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Then:

```bash
pip install -r requirements.txt
python app.py
```

The API runs at http://127.0.0.1:5000. On first start `ngo_management.db` is created inside `backend/`,
the three empty tables are created. No sample Resource & Budget records are inserted.

## 2. Run the frontend (terminal 2)

```bash
npm install
npm run dev
```

Open the URL that Vite prints. This project's `vite.config.ts` uses port **8443** unless you set `PORT`
(for example `PORT=5173 npm run dev` on macOS/Linux, or `$env:PORT=5173; npm run dev` in PowerShell).
Flask allows requests from any local port, so either works.

If the backend is not running, the pages show a "Backend connection failed" message instead of crashing.

## The database

* Location: `backend/ngo_management.db`
* Open it with [DB Browser for SQLite](https://sqlitebrowser.org/) (File > Open Database), the "SQLite Viewer" /
  "SQLite" extension in VS Code, or the command line:

```bash
cd backend
sqlite3 ngo_management.db
```

Useful commands:

```sql
.tables
.schema budgets
SELECT * FROM budgets;
SELECT * FROM resources;
SELECT * FROM expenses ORDER BY date;
```

* Tables: `budgets`, `resources`, `expenses` (see `backend/schema.sql`).
* **Reset the database:** stop Flask, delete `backend/ngo_management.db`, then start Flask again.
  The three empty tables are recreated.
* The database does not contain hardcoded Resource & Budget sample records. Add budgets, resources and expenses through the application UI.

## API

| Method | URL | What it does |
| --- | --- | --- |
| GET, POST | `/api/budgets` | list / create |
| PUT, DELETE | `/api/budgets/<id>` | update / delete |
| GET, POST | `/api/resources` | list / create |
| PUT, DELETE | `/api/resources/<id>` | update / delete |
| GET, POST | `/api/expenses` | list / create |
| PUT, DELETE | `/api/expenses/<id>` | update / delete |
| GET | `/api/dashboard` | totals, monthly expenses, project budgets, resource counts, recent activity |

## How the numbers are calculated

* `remaining = allocated - spent` is always calculated by the backend.
* Adding, editing or deleting an expense changes `spent` and `remaining` of that project's budget
  (if the project has more than one budget, the one with the same category is used first).
  **Rejected** expenses do not count. If `spent` goes above `allocated` the budget becomes *Over Budget*.
* Dashboard cards, the donut chart, the project table and the resource counts are calculated from SQLite on every load.
  *Total Budget* and *Allocated* are both the sum of all `allocated` values, because there is no separate yearly total in the database.
* The Monthly Expenses chart shows April to March of the financial year that contains the most recent expense.
* "This Month" on the Expenses page means the most recent month that has expenses.
* Recent activity is built from the newest rows in the three tables.

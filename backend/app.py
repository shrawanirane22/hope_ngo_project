from flask import Flask, jsonify, request, g
from flask_cors import CORS

from database import get_db, init_db
from communication import communication


app = Flask(__name__)
app.register_blueprint(communication)


CORS(app) 

BUDGET_STATUSES = ['On Track', 'At Risk', 'Over Budget']
RESOURCE_STATUSES = ['Available', 'Assigned', 'Maintenance']
EXPENSE_STATUSES = ['Approved', 'Pending', 'Rejected']


#helpers

def db():
    if 'db' not in g:
        g.db = get_db()
    return g.db


@app.teardown_appcontext
def close_db(error):
    conn = g.pop('db', None)
    if conn is not None:
        conn.close()


def error(message, code=400):
    return jsonify({'error': message}), code


def find_missing(data, fields):
    for field in fields:
        if data.get(field) in (None, ''):
            return f'{field} is required'
    return None


def to_whole_number(value):
    """Turn the value into a whole number >= 0, or return None if that is not possible."""
    try:
        number = int(float(value))
    except (TypeError, ValueError):
        return None
    return number if number >= 0 else None


def percent(part, total):
    return round(part / total * 100) if total > 0 else 0


def expense_counts(status, amount):
    return 0 if status == 'Rejected' else amount


def change_budget_spent(conn, project, category, change):
    """Add (or subtract) an amount from the budget that belongs to this project.
    If the project has several budgets, the one with the same category is preferred."""
    budget = conn.execute(
        'SELECT * FROM budgets WHERE project = ? ORDER BY (category = ?) DESC, id LIMIT 1',
        (project, category),
    ).fetchone()
    if budget is None or change == 0:
        return

    spent = max(0, budget['spent'] + change)
    remaining = budget['allocated'] - spent

    status = budget['status']
    if spent > budget['allocated']:
        status = 'Over Budget'
    elif status == 'Over Budget':
        status = 'At Risk' if percent(spent, budget['allocated']) >= 70 else 'On Track'

    conn.execute(
        'UPDATE budgets SET spent = ?, remaining = ?, status = ? WHERE id = ?',
        (spent, remaining, status, budget['id']),
    )


#budgets

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    rows = db().execute('SELECT * FROM budgets ORDER BY id').fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/budgets', methods=['POST'])
def add_budget():
    data = request.get_json(silent=True) or {}
    missing = find_missing(data, ['project', 'category', 'allocated', 'financial_year'])
    if missing:
        return error(missing)

    allocated = to_whole_number(data['allocated'])
    if allocated is None:
        return error('allocated must be a positive number')

    status = data.get('status', 'On Track')
    if status not in BUDGET_STATUSES:
        return error('invalid status')

    conn = db()
    cursor = conn.execute(
        'INSERT INTO budgets (project, category, allocated, spent, remaining, financial_year, description, status) '
        'VALUES (?, ?, ?, 0, ?, ?, ?, ?)',
        (data['project'], data['category'], allocated, allocated,
         data['financial_year'], data.get('description', ''), status),
    )
    conn.commit()
    row = conn.execute('SELECT * FROM budgets WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(dict(row)), 201


@app.route('/api/budgets/<int:id>', methods=['PUT'])
def update_budget(id):
    conn = db()
    budget = conn.execute('SELECT * FROM budgets WHERE id = ?', (id,)).fetchone()
    if budget is None:
        return error('Budget not found', 404)

    data = request.get_json(silent=True) or {}
    project = data.get('project', budget['project'])
    category = data.get('category', budget['category'])
    financial_year = data.get('financial_year', budget['financial_year'])
    description = data.get('description', budget['description'])
    status = data.get('status', budget['status'])

    allocated = to_whole_number(data.get('allocated', budget['allocated']))
    if allocated is None:
        return error('allocated must be a positive number')
    if status not in BUDGET_STATUSES:
        return error('invalid status')

    remaining = allocated - budget['spent']

    conn.execute(
        'UPDATE budgets SET project = ?, category = ?, allocated = ?, remaining = ?, '
        'financial_year = ?, description = ?, status = ? WHERE id = ?',
        (project, category, allocated, remaining, financial_year, description, status, id),
    )
    conn.commit()
    row = conn.execute('SELECT * FROM budgets WHERE id = ?', (id,)).fetchone()
    return jsonify(dict(row))


@app.route('/api/budgets/<int:id>', methods=['DELETE'])
def delete_budget(id):
    conn = db()
    cursor = conn.execute('DELETE FROM budgets WHERE id = ?', (id,))
    conn.commit()
    if cursor.rowcount == 0:
        return error('Budget not found', 404)
    return jsonify({'message': 'Budget deleted'})


#resources 

@app.route('/api/resources', methods=['GET'])
def get_resources():
    rows = db().execute('SELECT * FROM resources ORDER BY id').fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/resources', methods=['POST'])
def add_resource():
    data = request.get_json(silent=True) or {}
    missing = find_missing(data, ['name', 'category', 'quantity'])
    if missing:
        return error(missing)

    quantity = to_whole_number(data['quantity'])
    if quantity is None:
        return error('quantity must be a positive number')

    status = data.get('status', 'Available')
    if status not in RESOURCE_STATUSES:
        return error('invalid status')

    conn = db()
    cursor = conn.execute(
        'INSERT INTO resources (name, category, quantity, project, responsible_person, status) '
        'VALUES (?, ?, ?, ?, ?, ?)',
        (data['name'], data['category'], quantity,
         data.get('project') or 'Unassigned',
         data.get('responsible_person') or 'TBD',
         status),
    )
    conn.commit()
    row = conn.execute('SELECT * FROM resources WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(dict(row)), 201


@app.route('/api/resources/<int:id>', methods=['PUT'])
def update_resource(id):
    conn = db()
    resource = conn.execute('SELECT * FROM resources WHERE id = ?', (id,)).fetchone()
    if resource is None:
        return error('Resource not found', 404)

    data = request.get_json(silent=True) or {}
    name = data.get('name', resource['name'])
    category = data.get('category', resource['category'])
    project = data.get('project') or resource['project']
    responsible_person = data.get('responsible_person') or resource['responsible_person']
    status = data.get('status', resource['status'])

    quantity = to_whole_number(data.get('quantity', resource['quantity']))
    if quantity is None:
        return error('quantity must be a positive number')
    if status not in RESOURCE_STATUSES:
        return error('invalid status')

    conn.execute(
        'UPDATE resources SET name = ?, category = ?, quantity = ?, project = ?, '
        'responsible_person = ?, status = ? WHERE id = ?',
        (name, category, quantity, project, responsible_person, status, id),
    )
    conn.commit()
    row = conn.execute('SELECT * FROM resources WHERE id = ?', (id,)).fetchone()
    return jsonify(dict(row))


@app.route('/api/resources/<int:id>', methods=['DELETE'])
def delete_resource(id):
    conn = db()
    cursor = conn.execute('DELETE FROM resources WHERE id = ?', (id,))
    conn.commit()
    if cursor.rowcount == 0:
        return error('Resource not found', 404)
    return jsonify({'message': 'Resource deleted'})


#expenses 

def is_valid_date(text):
    try:
        datetime.strptime(text, '%Y-%m-%d')
        return True
    except (TypeError, ValueError):
        return False


@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    rows = db().execute('SELECT * FROM expenses ORDER BY id').fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json(silent=True) or {}
    missing = find_missing(data, ['date', 'project', 'category', 'amount'])
    if missing:
        return error(missing)

    if not is_valid_date(data['date']):
        return error('date must look like 2025-01-31')
    amount = to_whole_number(data['amount'])
    if amount is None:
        return error('amount must be a positive number')
    status = data.get('status', 'Pending')
    if status not in EXPENSE_STATUSES:
        return error('invalid status')

    conn = db()
    cursor = conn.execute(
        'INSERT INTO expenses (date, project, category, description, amount, payment_method, status) '
        'VALUES (?, ?, ?, ?, ?, ?, ?)',
        (data['date'], data['project'], data['category'], data.get('description', ''),
         amount, data.get('payment_method', 'Bank Transfer'), status),
    )
    change_budget_spent(conn, data['project'], data['category'], expense_counts(status, amount))
    conn.commit()

    row = conn.execute('SELECT * FROM expenses WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(dict(row)), 201


@app.route('/api/expenses/<int:id>', methods=['PUT'])
def update_expense(id):
    conn = db()
    old = conn.execute('SELECT * FROM expenses WHERE id = ?', (id,)).fetchone()
    if old is None:
        return error('Expense not found', 404)

    data = request.get_json(silent=True) or {}
    expense_date = data.get('date', old['date'])
    project = data.get('project', old['project'])
    category = data.get('category', old['category'])
    description = data.get('description', old['description'])
    payment_method = data.get('payment_method', old['payment_method'])
    status = data.get('status', old['status'])

    amount = to_whole_number(data.get('amount', old['amount']))
    if amount is None:
        return error('amount must be a positive number')
    if not is_valid_date(expense_date):
        return error('date must look like 2025-01-31')
    if status not in EXPENSE_STATUSES:
        return error('invalid status')

    change_budget_spent(conn, old['project'], old['category'], -expense_counts(old['status'], old['amount']))
    conn.execute(
        'UPDATE expenses SET date = ?, project = ?, category = ?, description = ?, '
        'amount = ?, payment_method = ?, status = ? WHERE id = ?',
        (expense_date, project, category, description, amount, payment_method, status, id),
    )
    change_budget_spent(conn, project, category, expense_counts(status, amount))
    conn.commit()

    row = conn.execute('SELECT * FROM expenses WHERE id = ?', (id,)).fetchone()
    return jsonify(dict(row))


@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    conn = db()
    expense = conn.execute('SELECT * FROM expenses WHERE id = ?', (id,)).fetchone()
    if expense is None:
        return error('Expense not found', 404)

    conn.execute('DELETE FROM expenses WHERE id = ?', (id,))
    change_budget_spent(conn, expense['project'], expense['category'],
                        -expense_counts(expense['status'], expense['amount']))
    conn.commit()
    return jsonify({'message': 'Expense deleted'})


#dashboard

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    conn = db()

    # budget totals
    budgets = conn.execute('SELECT * FROM budgets ORDER BY id').fetchall()
    total_allocated = sum(b['allocated'] for b in budgets)
    total_spent = sum(b['spent'] for b in budgets)
    total_remaining = total_allocated - total_spent
    years = sorted({b['financial_year'] for b in budgets})

    project_budgets = []
    for b in budgets:
        project_budgets.append({
            'id': b['id'],
            'project': b['project'],
            'allocated': b['allocated'],
            'spent': b['spent'],
            'remaining': b['remaining'],
            'percent': percent(b['spent'], b['allocated']),
            'status': b['status'],
        })

    latest = conn.execute('SELECT MAX(date) AS latest FROM expenses').fetchone()['latest']
    if latest:
        latest_date = datetime.strptime(latest, '%Y-%m-%d')
        start_year = latest_date.year if latest_date.month >= 4 else latest_date.year - 1
    elif years:
        start_year = int(years[-1][:4])
    else:
        today = date.today()
        start_year = today.year if today.month >= 4 else today.year - 1

    rows = conn.execute(
        "SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total "
        "FROM expenses WHERE status != 'Rejected' GROUP BY month"
    ).fetchall()
    month_totals = {r['month']: r['total'] for r in rows}

    monthly_expenses = []
    for i in range(12):
        month = (3 + i) % 12 + 1  # 4, 5, ... 12, 1, 2, 3
        year = start_year if month >= 4 else start_year + 1
        monthly_expenses.append({
            'month': calendar.month_abbr[month],
            'amount': month_totals.get(f'{year}-{month:02d}', 0),
        })

    # resource counts
    resources = conn.execute('SELECT status FROM resources').fetchall()
    resource_summary = {
        'total': len(resources),
        'available': sum(1 for r in resources if r['status'] == 'Available'),
        'assigned': sum(1 for r in resources if r['status'] == 'Assigned'),
        'maintenance': sum(1 for r in resources if r['status'] == 'Maintenance'),
    }

    # recent activity
    activity = []
    for e in conn.execute('SELECT * FROM expenses ORDER BY created_at DESC, id DESC LIMIT 4'):
        activity.append({'type': 'expense', 'label': f"Expense added – {e['project']}",
                         'amount': e['amount'], 'created_at': e['created_at']})
    for b in conn.execute('SELECT * FROM budgets ORDER BY created_at DESC, id DESC LIMIT 4'):
        activity.append({'type': 'budget', 'label': f"Budget added – {b['project']}",
                         'amount': b['allocated'], 'created_at': b['created_at']})
    for r in conn.execute('SELECT * FROM resources ORDER BY created_at DESC, id DESC LIMIT 4'):
        activity.append({'type': 'resource', 'label': f"Resource added – {r['name']}",
                         'amount': 0, 'created_at': r['created_at']})
    activity.sort(key=lambda a: a['created_at'], reverse=True)
    recent_activity = [
        {'type': a['type'], 'label': a['label'], 'amount': a['amount'], 'date': a['created_at'][:10]}
        for a in activity[:4]
    ]

    return jsonify({
        'financial_year': ', '.join(years),
        'total_budget': total_allocated,
        'total_allocated': total_allocated,
        'total_spent': total_spent,
        'total_remaining': total_remaining,
        'utilisation_percent': percent(total_spent, total_allocated),
        'monthly_label': f'Apr {start_year} – Mar {start_year + 1}',
        'monthly_expenses': monthly_expenses,
        'project_budgets': project_budgets,
        'resource_summary': resource_summary,
        'recent_activity': recent_activity,
    })


# create the database file and tables the first time the server starts
init_db()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

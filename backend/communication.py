from datetime import datetime, date, timedelta
from flask import Blueprint, jsonify, request, g
from database import get_db

communication = Blueprint('communication', __name__)
MESSAGE_FOLDERS = {'inbox', 'sent', 'drafts', 'archived'}
ANNOUNCEMENT_STATUSES = {'Published', 'Draft', 'Scheduled'}
CONTACT_CATEGORIES = {'Staff', 'Volunteer', 'Coordinator', 'Donor', 'Partner', 'External'}

def db():
    if 'db' not in g:
        g.db = get_db()
    return g.db

def error(message, code=400):
    return jsonify({'error': message}), code

def required(data, fields):
    for field in fields:
        if data.get(field) in (None, ''):
            return f'{field} is required'
    return None

def initials(name):
    words = (name or '').strip().split()
    return ''.join(word[0] for word in words[:2]).upper() if words else ''

def display_time(value):
    if not value:
        return ''
    try:
        return datetime.fromisoformat(value).strftime('%I:%M %p').lstrip('0')
    except ValueError:
        return value

def message_dict(row):
    d = dict(row)
    d['message_id'] = f"M{d['id']:03d}"
    d['id'] = d['message_id']
    d['initials'] = initials(d['sender'])
    d['preview'] = (d['body'] or '').replace('\n', ' ')[:100]
    d['time'] = display_time(d['created_at'])
    d['read'] = bool(d['read'])
    return d

def announcement_dict(row):
    d = dict(row)
    d['announcement_id'] = f"AN{d['id']:03d}"
    d['id'] = d['announcement_id']
    d['description'] = d.pop('message')
    return d

def contact_dict(row):
    d = dict(row)
    d['contact_id'] = f"C{d['id']:03d}"
    d['id'] = d['contact_id']
    d['initials'] = d.get('initials') or initials(d.get('name'))
    d['color'] = d.get('color') or 'bg-blue-500'
    return d

# ---------- Messages ----------

@communication.get('/api/messages')
def get_messages():
    conn = db()
    folder = request.args.get('folder')
    search = request.args.get('search', '').strip()
    query = 'SELECT * FROM messages'
    conditions, params = [], []
    if folder:
        if folder not in MESSAGE_FOLDERS:
            return error('invalid folder')
        conditions.append('folder = ?')
        params.append(folder)
    if search:
        conditions.append('(sender LIKE ? OR recipient LIKE ? OR subject LIKE ? OR body LIKE ?)')
        like = f'%{search}%'
        params.extend([like, like, like, like])
    if conditions:
        query += ' WHERE ' + ' AND '.join(conditions)
    query += ' ORDER BY created_at DESC, id DESC'
    return jsonify([message_dict(r) for r in conn.execute(query, params).fetchall()])

@communication.post('/api/messages')
def create_message():
    data = request.get_json(silent=True) or {}
    missing = required(data, ['recipient', 'subject', 'body'])
    if missing:
        return error(missing)
    folder = data.get('folder', 'sent')
    if folder not in {'sent', 'drafts'}:
        return error('new messages can only be sent or saved as drafts')
    conn = db()
    cursor = conn.execute(
        '''INSERT INTO messages (sender, recipient, subject, body, read, folder)
           VALUES (?, ?, ?, ?, ?, ?)''',
        (data.get('sender', 'Admin'), data['recipient'], data['subject'], data['body'],
         1 if folder == 'sent' else 0, folder))
    conn.commit()
    row = conn.execute('SELECT * FROM messages WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(message_dict(row)), 201

@communication.put('/api/messages/<message_id>')
def update_message(message_id):
    if not message_id.upper().startswith('M') or not message_id[1:].isdigit():
        return error('invalid message id')
    numeric_id = int(message_id[1:])
    conn = db()
    old = conn.execute('SELECT * FROM messages WHERE id = ?', (numeric_id,)).fetchone()
    if old is None:
        return error('Message not found', 404)
    data = request.get_json(silent=True) or {}
    folder = data.get('folder', old['folder'])
    if folder not in MESSAGE_FOLDERS:
        return error('invalid folder')
    conn.execute(
        '''UPDATE messages SET recipient = ?, subject = ?, body = ?, read = ?, folder = ?
           WHERE id = ?''',
        (data.get('recipient', old['recipient']), data.get('subject', old['subject']),
         data.get('body', old['body']), 1 if data.get('read', bool(old['read'])) else 0,
         folder, numeric_id))
    conn.commit()
    row = conn.execute('SELECT * FROM messages WHERE id = ?', (numeric_id,)).fetchone()
    return jsonify(message_dict(row))

@communication.post('/api/messages/<message_id>/read')
def mark_message_read(message_id):
    if not message_id.upper().startswith('M') or not message_id[1:].isdigit():
        return error('invalid message id')
    numeric_id = int(message_id[1:])
    conn = db()
    cursor = conn.execute('UPDATE messages SET read = 1 WHERE id = ?', (numeric_id,))
    conn.commit()
    if cursor.rowcount == 0:
        return error('Message not found', 404)
    row = conn.execute('SELECT * FROM messages WHERE id = ?', (numeric_id,)).fetchone()
    return jsonify(message_dict(row))

@communication.post('/api/messages/<message_id>/reply')
def reply_to_message(message_id):
    if not message_id.upper().startswith('M') or not message_id[1:].isdigit():
        return error('invalid message id')
    numeric_id = int(message_id[1:])
    data = request.get_json(silent=True) or {}
    missing = required(data, ['body'])
    if missing:
        return error(missing)
    conn = db()
    original = conn.execute('SELECT * FROM messages WHERE id = ?', (numeric_id,)).fetchone()
    if original is None:
        return error('Message not found', 404)
    subject = original['subject'] if original['subject'].lower().startswith('re:') else f"Re: {original['subject']}"
    cursor = conn.execute(
        '''INSERT INTO messages (sender, recipient, subject, body, read, folder)
           VALUES (?, ?, ?, ?, 1, 'sent')''',
        (data.get('sender', 'Admin'), original['sender'], subject, data['body']))
    conn.execute('UPDATE messages SET read = 1 WHERE id = ?', (numeric_id,))
    conn.commit()
    row = conn.execute('SELECT * FROM messages WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(message_dict(row)), 201

@communication.delete('/api/messages/<message_id>')
def delete_message(message_id):
    if not message_id.upper().startswith('M') or not message_id[1:].isdigit():
        return error('invalid message id')
    numeric_id = int(message_id[1:])
    conn = db()
    cursor = conn.execute('DELETE FROM messages WHERE id = ?', (numeric_id,))
    conn.commit()
    if cursor.rowcount == 0:
        return error('Message not found', 404)
    return jsonify({'message': 'Message deleted'})

# ---------- Announcements ----------

@communication.get('/api/announcements')
def get_announcements():
    conn = db()
    status = request.args.get('status')
    if status:
        if status not in ANNOUNCEMENT_STATUSES:
            return error('invalid status')
        rows = conn.execute('SELECT * FROM announcements WHERE status = ? ORDER BY date DESC, id DESC', (status,)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM announcements ORDER BY date DESC, id DESC').fetchall()
    return jsonify([announcement_dict(r) for r in rows])

@communication.post('/api/announcements')
def create_announcement():
    data = request.get_json(silent=True) or {}
    missing = required(data, ['title'])
    if missing:
        return error(missing)
    status = data.get('status', 'Draft')
    if status not in ANNOUNCEMENT_STATUSES:
        return error('invalid status')
    conn = db()
    cursor = conn.execute(
        '''INSERT INTO announcements (title, audience, date, status, message)
           VALUES (?, ?, ?, ?, ?)''',
        (data['title'], data.get('audience', 'All Staff'), data.get('date') or date.today().isoformat(),
         status, data.get('message', data.get('description', ''))))
    conn.commit()
    row = conn.execute('SELECT * FROM announcements WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(announcement_dict(row)), 201

@communication.put('/api/announcements/<announcement_id>')
def update_announcement(announcement_id):
    if not announcement_id.upper().startswith('AN') or not announcement_id[2:].isdigit():
        return error('invalid announcement id')
    numeric_id = int(announcement_id[2:])
    conn = db()
    old = conn.execute('SELECT * FROM announcements WHERE id = ?', (numeric_id,)).fetchone()
    if old is None:
        return error('Announcement not found', 404)
    data = request.get_json(silent=True) or {}
    status = data.get('status', old['status'])
    if status not in ANNOUNCEMENT_STATUSES:
        return error('invalid status')
    conn.execute(
        '''UPDATE announcements SET title = ?, audience = ?, date = ?, status = ?, message = ?
           WHERE id = ?''',
        (data.get('title', old['title']), data.get('audience', old['audience']),
         data.get('date', old['date']), status,
         data.get('message', data.get('description', old['message'])), numeric_id))
    conn.commit()
    row = conn.execute('SELECT * FROM announcements WHERE id = ?', (numeric_id,)).fetchone()
    return jsonify(announcement_dict(row))

@communication.delete('/api/announcements/<announcement_id>')
def delete_announcement(announcement_id):
    if not announcement_id.upper().startswith('AN') or not announcement_id[2:].isdigit():
        return error('invalid announcement id')
    numeric_id = int(announcement_id[2:])
    conn = db()
    cursor = conn.execute('DELETE FROM announcements WHERE id = ?', (numeric_id,))
    conn.commit()
    if cursor.rowcount == 0:
        return error('Announcement not found', 404)
    return jsonify({'message': 'Announcement deleted'})

# ---------- Contacts ----------

@communication.get('/api/contacts')
def get_contacts():
    conn = db()
    category = request.args.get('category')
    search = request.args.get('search', '').strip()
    query = 'SELECT * FROM contacts'
    conditions, params = [], []
    if category:
        if category not in CONTACT_CATEGORIES:
            return error('invalid category')
        conditions.append('category = ?')
        params.append(category)
    if search:
        conditions.append('(name LIKE ? OR email LIKE ? OR organization LIKE ? OR phone LIKE ?)')
        like = f'%{search}%'
        params.extend([like, like, like, like])
    if conditions:
        query += ' WHERE ' + ' AND '.join(conditions)
    query += ' ORDER BY name COLLATE NOCASE'
    return jsonify([contact_dict(r) for r in conn.execute(query, params).fetchall()])

@communication.post('/api/contacts')
def create_contact():
    data = request.get_json(silent=True) or {}
    missing = required(data, ['name', 'category', 'email'])
    if missing:
        return error(missing)
    if data['category'] not in CONTACT_CATEGORIES:
        return error('invalid category')
    conn = db()
    cursor = conn.execute(
        '''INSERT INTO contacts (name, category, email, phone, organization, initials, color)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (data['name'], data['category'], data['email'], data.get('phone', ''),
         data.get('organization', ''), data.get('initials') or initials(data['name']),
         data.get('color', 'bg-blue-500')))
    conn.commit()
    row = conn.execute('SELECT * FROM contacts WHERE id = ?', (cursor.lastrowid,)).fetchone()
    return jsonify(contact_dict(row)), 201

@communication.put('/api/contacts/<contact_id>')
def update_contact(contact_id):
    if not contact_id.upper().startswith('C') or not contact_id[1:].isdigit():
        return error('invalid contact id')
    numeric_id = int(contact_id[1:])
    conn = db()
    old = conn.execute('SELECT * FROM contacts WHERE id = ?', (numeric_id,)).fetchone()
    if old is None:
        return error('Contact not found', 404)
    data = request.get_json(silent=True) or {}
    category = data.get('category', old['category'])
    if category not in CONTACT_CATEGORIES:
        return error('invalid category')
    name = data.get('name', old['name'])
    conn.execute(
        '''UPDATE contacts SET name = ?, category = ?, email = ?, phone = ?, organization = ?, initials = ?, color = ?
           WHERE id = ?''',
        (name, category, data.get('email', old['email']), data.get('phone', old['phone']),
         data.get('organization', old['organization']), data.get('initials') or initials(name),
         data.get('color', old['color']), numeric_id))
    conn.commit()
    row = conn.execute('SELECT * FROM contacts WHERE id = ?', (numeric_id,)).fetchone()
    return jsonify(contact_dict(row))

@communication.delete('/api/contacts/<contact_id>')
def delete_contact(contact_id):
    if not contact_id.upper().startswith('C') or not contact_id[1:].isdigit():
        return error('invalid contact id')
    numeric_id = int(contact_id[1:])
    conn = db()
    cursor = conn.execute('DELETE FROM contacts WHERE id = ?', (numeric_id,))
    conn.commit()
    if cursor.rowcount == 0:
        return error('Contact not found', 404)
    return jsonify({'message': 'Contact deleted'})

# ---------- Communication dashboard ----------

@communication.get('/api/communication/dashboard')
def communication_dashboard():
    conn = db()
    inbox_count = conn.execute("SELECT COUNT(*) AS count FROM messages WHERE folder = 'inbox'").fetchone()['count']
    unread = conn.execute("SELECT COUNT(*) AS count FROM messages WHERE folder = 'inbox' AND read = 0").fetchone()['count']
    announcement_count = conn.execute('SELECT COUNT(*) AS count FROM announcements').fetchone()['count']
    published = conn.execute("SELECT COUNT(*) AS count FROM announcements WHERE status = 'Published'").fetchone()['count']
    contact_count = conn.execute('SELECT COUNT(*) AS count FROM contacts').fetchone()['count']

    today = date.today()
    start = today - timedelta(days=6)
    activity = []
    for i in range(7):
        day = start + timedelta(days=i)
        next_day = day + timedelta(days=1)
        messages = conn.execute(
            "SELECT COUNT(*) AS count FROM messages WHERE created_at >= ? AND created_at < ?",
            (day.isoformat(), next_day.isoformat())).fetchone()['count']
        announcements = conn.execute(
            "SELECT COUNT(*) AS count FROM announcements WHERE created_at >= ? AND created_at < ?",
            (day.isoformat(), next_day.isoformat())).fetchone()['count']
        activity.append({'date': day.isoformat(), 'day': day.strftime('%a'), 'messages': messages, 'announcements': announcements})

    recent_messages = conn.execute("SELECT * FROM messages WHERE folder = 'inbox' ORDER BY created_at DESC, id DESC LIMIT 5").fetchall()
    recent_announcements = conn.execute("SELECT * FROM announcements ORDER BY created_at DESC, id DESC LIMIT 5").fetchall()
    return jsonify({
        'total_messages': inbox_count,
        'unread_messages': unread,
        'announcements': announcement_count,
        'published_announcements': published,
        'contacts': contact_count,
        'activity': activity,
        'recent_messages': [message_dict(r) for r in recent_messages],
        'recent_announcements': [announcement_dict(r) for r in recent_announcements],
    })

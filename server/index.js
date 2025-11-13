const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const Database = require('sqlite3').Database;

const DB_PATH = path.join(__dirname, 'kasirku.db');

const db = new Database(DB_PATH);

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT,
    category TEXT,
    price INTEGER,
    stock INTEGER,
    imageUrl TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT,
    items TEXT,
    total INTEGER,
    paymentMethod TEXT,
    cashierName TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT,
    address TEXT,
    phone TEXT,
    logoUrl TEXT,
    receiptFooter TEXT
  )`);
});

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const p = req.body;
  db.run(
    `INSERT OR REPLACE INTO products (id, sku, name, category, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p.id, p.sku, p.name, p.category, p.price, p.stock, p.imageUrl],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Transactions
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    res.json(parsed);
  });
});

app.post('/api/transactions', (req, res) => {
  const t = req.body;
  db.run(
    `INSERT INTO transactions (id, date, items, total, paymentMethod, cashierName) VALUES (?, ?, ?, ?, ?, ?)`,
    [t.id, t.date, JSON.stringify(t.items), t.total, t.paymentMethod, t.cashierName],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      // reduce stock
      const updates = t.items.map(item => {
        return new Promise((resolve, reject) => {
          db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId], function (err) {
            if (err) return reject(err);
            resolve();
          });
        });
      });
      Promise.all(updates)
        .then(() => res.json({ success: true }))
        .catch(err => res.status(500).json({ error: err.message }));
    }
  );
});

// Settings
app.get('/api/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json(null);
    res.json(row);
  });
});

app.post('/api/settings', (req, res) => {
  const s = req.body;
  db.run(
    `INSERT INTO settings (id, name, address, phone, logoUrl, receiptFooter) VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name, address=excluded.address, phone=excluded.phone, logoUrl=excluded.logoUrl, receiptFooter=excluded.receiptFooter;`,
    [s.name, s.address, s.phone, s.logoUrl, s.receiptFooter],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

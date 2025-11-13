const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Determine storage mode
let db = null;
let useKV = false;

// Initialize storage
if (process.env.VERCEL || process.env.USE_KV) {
  // Production: Use Vercel KV
  const { kv } = require('@vercel/kv');
  db = kv;
  useKV = true;
  console.log('Using Vercel KV for storage');
} else {
  // Development: Use SQLite
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = path.join(__dirname, 'kasirku.db');
  db = new sqlite3.Database(DB_PATH);
  
  // Initialize SQLite tables
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
  
  console.log('Using SQLite for storage');
}

// Products - Remove /api prefix since Vercel routes handle it
app.get('/products', async (req, res) => {
  try {
    if (useKV) {
      const products = await db.get('products:list') || [];
      res.json(products);
    } else {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const p = req.body;
    
    if (useKV) {
      let products = await db.get('products:list') || [];
      const existingIndex = products.findIndex(prod => prod.id === p.id);
      if (existingIndex >= 0) {
        products[existingIndex] = p;
      } else {
        products.push(p);
      }
      await db.set('products:list', products);
      res.json({ success: true });
    } else {
      db.run(
        `INSERT OR REPLACE INTO products (id, sku, name, category, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.sku, p.name, p.category, p.price, p.stock, p.imageUrl],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    if (useKV) {
      let products = await db.get('products:list') || [];
      products = products.filter(p => p.id !== req.params.id);
      await db.set('products:list', products);
      res.json({ success: true });
    } else {
      db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions
app.get('/transactions', async (req, res) => {
  try {
    if (useKV) {
      const transactions = await db.get('transactions:list') || [];
      res.json(transactions);
    } else {
      db.all('SELECT * FROM transactions ORDER BY date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows) return res.json([]);
        const parsed = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
        res.json(parsed);
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/transactions', async (req, res) => {
  try {
    const t = req.body;
    
    if (useKV) {
      let transactions = await db.get('transactions:list') || [];
      transactions.unshift(t); // Add to beginning
      await db.set('transactions:list', transactions);
      
      // Update product stock
      let products = await db.get('products:list') || [];
      for (const item of t.items) {
        const prodIdx = products.findIndex(p => p.id === item.productId);
        if (prodIdx >= 0) {
          products[prodIdx].stock -= item.quantity;
        }
      }
      await db.set('products:list', products);
      res.json({ success: true });
    } else {
      db.run(
        `INSERT INTO transactions (id, date, items, total, paymentMethod, cashierName) VALUES (?, ?, ?, ?, ?, ?)`,
        [t.id, t.date, JSON.stringify(t.items), t.total, t.paymentMethod, t.cashierName],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          
          // Update product stock
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
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings
app.get('/settings', async (req, res) => {
  try {
    if (useKV) {
      const settings = await db.get('settings:store') || null;
      res.json(settings);
    } else {
      db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || null);
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/settings', async (req, res) => {
  try {
    const s = req.body;
    
    if (useKV) {
      await db.set('settings:store', s);
      res.json({ success: true });
    } else {
      db.run(
        `INSERT INTO settings (id, name, address, phone, logoUrl, receiptFooter) VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, address=excluded.address, phone=excluded.phone, logoUrl=excluded.logoUrl, receiptFooter=excluded.receiptFooter;`,
        [s.name, s.address, s.phone, s.logoUrl, s.receiptFooter],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
// Extracted express app and DB initialization so it can be used both
// as a local server (server/index.js) and as a Serverless Function (api/index.js)
try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Storage initialization
let db = null;
let useNeon = false;

// Initialize storage based on environment
if (process.env.DATABASE_URL) {
  const { neon } = require('@neondatabase/serverless');
  db = neon(process.env.DATABASE_URL);
  useNeon = true;
  console.log('Using Neon PostgreSQL for storage');
  db`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT,
    category TEXT,
    price INTEGER,
    stock INTEGER,
    imageUrl TEXT
  );`.catch(() => {});
  db`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT,
    items TEXT,
    total INTEGER,
    paymentMethod TEXT,
    cashierName TEXT
  );`.catch(() => {});
  db`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    logoUrl TEXT,
    receiptFooter TEXT
  );`.catch(() => {});
} else {
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = path.join(__dirname, 'kasirku.db');
  db = new sqlite3.Database(DB_PATH);
  useNeon = false;
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
      id INTEGER PRIMARY KEY,
      name TEXT,
      address TEXT,
      phone TEXT,
      logoUrl TEXT,
      receiptFooter TEXT
    )`);
  });
  console.log('Using SQLite for storage');
}

// expose db and useNeon for external modules
app.locals.db = db;
app.locals.useNeon = useNeon;

// Setup/Seed function for default data
async function setupDefaults() {
  try {
    // Set default store settings
    const defaultSettings = {
      id: 1,
      name: 'Moikafood',
      address: '',
      phone: '',
      logoUrl: '/publics/Logo.jpg',
      receiptFooter: ''
    };

    if (useNeon) {
      const existing = await db`SELECT id FROM settings WHERE id = 1`;
      if (existing && existing.length > 0) {
        await db`UPDATE settings SET name = ${defaultSettings.name}, logoUrl = ${defaultSettings.logoUrl} WHERE id = 1`;
      } else {
        await db`INSERT INTO settings (id, name, address, phone, logoUrl, receiptFooter) 
          VALUES (1, ${defaultSettings.name}, ${defaultSettings.address}, ${defaultSettings.phone}, ${defaultSettings.logoUrl}, ${defaultSettings.receiptFooter})`;
      }
      
      // Remove unwanted products
      await db`DELETE FROM products WHERE sku = 'MKN-002' OR sku = 'RKK-001'`;
      
      // Add BAM-001 product
      const bamProduct = {
        id: 'BAM-001',
        sku: 'BAM-001',
        name: 'Baso Aci Tulang Rangu',
        category: 'Snack',
        price: 25000,
        stock: 50,
        imageUrl: '/publics/Baso Aci Tulang Rangu.jpg'
      };
      
      const existing_bam = await db`SELECT id FROM products WHERE sku = 'BAM-001'`;
      if (!existing_bam || existing_bam.length === 0) {
        await db`INSERT INTO products (id, sku, name, category, price, stock, imageUrl) 
          VALUES (${bamProduct.id}, ${bamProduct.sku}, ${bamProduct.name}, ${bamProduct.category}, ${bamProduct.price}, ${bamProduct.stock}, ${bamProduct.imageUrl})`;
      }
    } else {
      // SQLite version
      db.run('INSERT OR REPLACE INTO settings (id, name, address, phone, logoUrl, receiptFooter) VALUES (1, ?, ?, ?, ?, ?)',
        [defaultSettings.name, defaultSettings.address, defaultSettings.phone, defaultSettings.logoUrl, defaultSettings.receiptFooter],
        (err) => {
          if (err) console.error('Settings setup error:', err.message);
        }
      );
      
      db.run('DELETE FROM products WHERE sku = ? OR sku = ?', ['MKN-002', 'RKK-001'], (err) => {
        if (err) console.error('Delete products error:', err.message);
      });
      
      const bamProduct = {
        id: 'BAM-001',
        sku: 'BAM-001',
        name: 'Baso Aci Tulang Rangu',
        category: 'Snack',
        price: 25000,
        stock: 50,
        imageUrl: '/publics/Baso Aci Tulang Rangu.jpg'
      };
      
      db.run('INSERT OR IGNORE INTO products (id, sku, name, category, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bamProduct.id, bamProduct.sku, bamProduct.name, bamProduct.category, bamProduct.price, bamProduct.stock, bamProduct.imageUrl],
        (err) => {
          if (err) console.error('Insert BAM-001 error:', err.message);
        }
      );
    }
    
    console.log('Default setup completed');
  } catch (err) {
    console.error('Setup error:', err.message);
  }
}

// Run setup on server start
setTimeout(() => setupDefaults(), 1000);

// Products - Remove /api prefix since Vercel routes handle it
app.get('/products', async (req, res) => {
  try {
    if (useNeon) {
      const products = await db`SELECT * FROM products ORDER BY id`;
      res.json(products || []);
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
    
    if (useNeon) {
      await db`INSERT INTO products (id, sku, name, category, price, stock, imageUrl)
        VALUES (${p.id}, ${p.sku}, ${p.name}, ${p.category}, ${p.price}, ${p.stock}, ${p.imageUrl})
        ON CONFLICT(id) DO UPDATE SET 
          sku = EXCLUDED.sku,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          imageUrl = EXCLUDED.imageUrl`;
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
    if (useNeon) {
      await db`DELETE FROM products WHERE id = ${req.params.id}`;
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
    if (useNeon) {
      const transactions = await db`SELECT * FROM transactions ORDER BY date DESC`;
      if (transactions && transactions.length > 0) {
        const parsed = transactions.map(r => ({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items }));
        res.json(parsed);
      } else {
        res.json([]);
      }
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
    
    if (useNeon) {
      await db`INSERT INTO transactions (id, date, items, total, paymentMethod, cashierName)
        VALUES (${t.id}, ${t.date}, ${JSON.stringify(t.items)}, ${t.total}, ${t.paymentMethod}, ${t.cashierName})`;
      
      // Update product stock for each item
      for (const item of t.items) {
        await db`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`;
      }
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
    if (useNeon) {
      const settings = await db`SELECT * FROM settings WHERE id = 1`;
      res.json(settings && settings.length > 0 ? settings[0] : null);
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
    
    if (useNeon) {
      // Check if settings exists
      const existing = await db`SELECT id FROM settings WHERE id = 1`;
      if (existing && existing.length > 0) {
        await db`UPDATE settings SET name = ${s.name}, address = ${s.address}, phone = ${s.phone}, logoUrl = ${s.logoUrl}, receiptFooter = ${s.receiptFooter} WHERE id = 1`;
      } else {
        await db`INSERT INTO settings (id, name, address, phone, logoUrl, receiptFooter) VALUES (1, ${s.name}, ${s.address}, ${s.phone}, ${s.logoUrl}, ${s.receiptFooter})`;
      }
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

// Setup endpoint - manually trigger default data setup
app.post('/setup', async (req, res) => {
  try {
    await setupDefaults();
    res.json({ success: true, message: 'Defaults configured' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { app, db, useNeon };

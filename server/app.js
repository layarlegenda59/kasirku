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

module.exports = { app, db, useNeon };

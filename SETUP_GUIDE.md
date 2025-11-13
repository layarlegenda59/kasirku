# KasirKu - Setup & Run Guide

Aplikasi kasir dengan integrasi SQLite untuk penyimpanan data persisten.

## Struktur Proyek

```
kasirku/
├── server/               # Backend Express + SQLite
│   ├── index.js
│   ├── kasirku.db       # SQLite database (dibuat otomatis)
│   ├── package.json
│   └── node_modules/
├── src/                  # Frontend React + TypeScript
│   ├── pages/
│   ├── components/
│   ├── context/
│   └── ...
└── package.json
```

## Cara Menjalankan

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 2. Start Backend Server

```bash
cd server
npm start
```

Server akan berjalan di: **http://localhost:4000**

### 3. Start Frontend (di terminal baru)

```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

## Fitur Integrasi SQLite

### Struktur Database

**Tabel: products**
- id (TEXT, PRIMARY KEY)
- sku, name, category
- price, stock
- imageUrl

**Tabel: transactions**
- id (TEXT, PRIMARY KEY)
- date, items (JSON), total
- paymentMethod, cashierName

**Tabel: settings**
- id (INTEGER, PRIMARY KEY)
- name, address, phone
- logoUrl, receiptFooter

### API Endpoints

#### Products
- `GET /api/products` - Ambil semua produk
- `POST /api/products` - Tambah/Update produk
- `DELETE /api/products/:id` - Hapus produk

#### Transactions
- `GET /api/transactions` - Ambil semua transaksi (desc by date)
- `POST /api/transactions` - Catat transaksi (auto kurangi stok)

#### Settings
- `GET /api/settings` - Ambil pengaturan toko
- `POST /api/settings` - Update pengaturan toko

## Persistence

✅ **Semua data tersimpan di SQLite:**
- Produk (add/edit/delete)
- Transaksi (setiap penjualan)
- Pengaturan toko
- Stok otomatis berkurang saat transaksi

Reload browser atau restart app → data tetap ada!

## Environment

Frontend mencari server di: `http://localhost:4000` (default)
Jika ingin custom, set environment variable: `VITE_API_URL`

## Build Production

```bash
npm run build
```

Hasilnya di folder `dist/`

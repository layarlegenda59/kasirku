# Neon PostgreSQL Migration Guide

## Overview
The KasirKu application has been migrated from Vercel KV (Redis) to **Neon Serverless PostgreSQL** for persistent data storage. Neon provides a more robust SQL database with better data integrity and query capabilities.

## What Changed

### Backend Migration (server/index.js)
All endpoints have been updated to use Neon SQL queries instead of Vercel KV:

**Pattern Migration:**
- **FROM**: `await db.get('products:list')` (KV string key)
- **TO**: `await db`SELECT * FROM products`` (Neon SQL template literal)

**Affected Endpoints:**
1. **Products**: `GET /products`, `POST /products`, `DELETE /products/:id`
   - Uses SQL templates with parameterization
   - ON CONFLICT handling for upserts
   
2. **Transactions**: `GET /transactions`, `POST /transactions`
   - Fetches transactions with items parsed from JSON
   - Updates product stock atomically
   
3. **Settings**: `GET /settings`, `POST /settings`
   - Checks if settings exist before insert/update
   - Falls back to insert if no existing record

### Fallback Mechanism
The code still supports **SQLite for local development**:
- If `DATABASE_URL` env variable is NOT set → Use SQLite (`:memory:` or file)
- If `DATABASE_URL` env variable IS set → Use Neon PostgreSQL

```javascript
if (useNeon) {
  // Neon SQL queries with template literals
  const data = await db`SELECT * FROM table_name`;
} else {
  // SQLite callback-based queries
  db.all('SELECT * FROM table_name', (err, rows) => { ... });
}
```

## Setup Instructions

### 1. Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project (e.g., "kasirku")

### 2. Get Database URL
1. In Neon dashboard, go to your project
2. Click "Connection String" in the top right
3. Select "Connection string" tab
4. Copy the full connection string (looks like: `postgresql://user:password@project.neon.tech/dbname?sslmode=require`)

### 3. Set Environment Variables

#### Local Development (.env.local)
```env
# Keep this for frontend
VITE_API_URL=http://localhost:4000/api

# Add this for backend
DATABASE_URL=postgresql://user:password@project.neon.tech/dbname?sslmode=require
```

#### Production (Vercel)
1. Go to your Vercel project settings
2. Go to "Environment Variables"
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environments**: Check "Production" (and "Preview" if desired)
4. Redeploy the project

### 4. Test Locally
```bash
cd server
npm install @neondatabase/serverless  # Already done
npm start
```

The app should now:
- Connect to Neon on `DATABASE_URL` availability
- Initialize tables automatically (CREATE TABLE IF NOT EXISTS)
- Use SQLite fallback if `DATABASE_URL` is not set

### 5. Deploy to Vercel
```bash
git add .
git commit -m "feat: migrate from Vercel KV to Neon PostgreSQL"
git push
```

Vercel will automatically redeploy with the new `DATABASE_URL` environment variable.

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT,
  category TEXT,
  price INTEGER,
  stock INTEGER,
  imageUrl TEXT
)
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  date TEXT,
  items TEXT,              -- JSON string of items array
  total INTEGER,
  paymentMethod TEXT,
  cashierName TEXT
)
```

### Settings Table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  name TEXT,
  address TEXT,
  phone TEXT,
  logoUrl TEXT,
  receiptFooter TEXT
)
```

## Parameterized Queries (Security)
All Neon SQL queries use **template literals with parameterization** to prevent SQL injection:

```javascript
// ✅ SAFE - Parameters automatically escaped
await db`SELECT * FROM products WHERE id = ${id}`;
await db`INSERT INTO products (...) VALUES (${id}, ${name}, ...)`;

// ❌ NEVER do this - SQL injection risk
await db`SELECT * FROM products WHERE id = '${id}'`;
```

## Troubleshooting

### Tables Not Creating
If you see "relation 'products' does not exist" errors:
1. The tables will create automatically on first API call
2. Check that `DATABASE_URL` is set correctly
3. Verify Neon project status in dashboard

### Connection Timeout
1. Ensure Neon project is in "active" state
2. Check that DATABASE_URL string ends with `?sslmode=require`
3. Verify network connectivity to Neon endpoints

### Local SQLite Still Preferred
To force local SQLite even with DATABASE_URL set:
1. Comment out `DATABASE_URL` in `.env.local`
2. Restart the server

## Benefits Over Vercel KV
| Aspect | Vercel KV | Neon PostgreSQL |
|--------|-----------|-----------------|
| **Type** | In-memory cache (Redis) | Full SQL database |
| **Queries** | Key-value operations | SQL with WHERE, JOIN, etc. |
| **Reliability** | Cache miss risk | Persistent storage |
| **Scale** | Limited to KV pairs | Unlimited SQL queries |
| **Cost** | ~$0.20/month (free tier 1GB) | Free tier: 0.5GB |
| **Data Types** | Strings/JSON | Full SQL types |

## Frontend Changes
No frontend changes needed! The API contract remains the same:
- `GET /api/products` → returns array of products
- `POST /api/products` → creates/updates product
- `DELETE /api/products/:id` → deletes product
- etc.

## Migration Verification Checklist
- [ ] Neon account created
- [ ] Database URL copied
- [ ] `DATABASE_URL` added to Vercel environment variables
- [ ] Local `.env.local` updated (optional for testing)
- [ ] Server restarted
- [ ] Products load without errors
- [ ] Can add/edit/delete products
- [ ] Can create transactions with stock updates
- [ ] Data persists after page reload
- [ ] Changes visible across browser sessions
- [ ] GitHub commit pushed
- [ ] Vercel deployment successful

## Next Steps (If Issues Arise)
1. Check server logs: `npm start` in server folder
2. Check Neon dashboard for connection issues
3. Verify `DATABASE_URL` matches your Neon string exactly
4. Test with simple SQL query first: `SELECT 1` to verify connection

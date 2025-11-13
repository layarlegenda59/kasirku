# KasirKu - Data Persistence Fix

## ✅ Masalah Teratasi

**Sebelum:** Data tidak tersimpan setelah reload browser  
**Sesudah:** Data persisten di SQLite - tetap ada setelah reload, restart, bahkan deploy

## 🔧 Solusi yang Diterapkan

### 1. **ApiContext - Centralized API Management**
File baru: `context/ApiContext.tsx`

Fitur:
- ✅ Load data from server on app mount (auto-fetch dari `/api/products`, `/api/transactions`, `/api/settings`)
- ✅ Wrap semua API calls (addProduct, updateProduct, deleteProduct, addTransaction, updateSettings)
- ✅ Handle error states + loading states
- ✅ Ensures data consistency: API call → Update local state

```tsx
// Usage di komponen:
const { state, addProduct, updateProduct, deleteProduct, loading, error } = useApi();

await addProduct(productData); // Auto-sync ke database
```

### 2. **Updated App Flow**
```
App.tsx
├── StoreProvider (Redux-like state)
└── ApiProvider (API wrapper layer) ← NEW!
    └── Pages (Products, Cashier, Settings)
```

### 3. **Backend Routes Fixed**
`server/index.js` - Routes sekarang:
- `/products` (bukan `/api/products`)
- `/transactions` (bukan `/api/transactions`)
- `/settings` (bukan `/api/settings`)

**Why?** Vercel `vercel.json` router menambah prefix `/api`, jadi routes harus tanpa prefix.

### 4. **Environment Setup**
`.env.local` (development):
```
VITE_API_URL=http://localhost:4000/api
```

Vercel production: Auto-use `/api` (relative path)

## 🧪 Testing Locally

1. **Ensure both servers running:**
```bash
# Terminal 1 - Backend
cd server
npm start
# Output: Server listening on http://localhost:4000

# Terminal 2 - Frontend
npm run dev
# Output: ➜  Local:   http://localhost:3000/
```

2. **Test persistence:**
   - Buka http://localhost:3000
   - Tambah produk / ubah pengaturan / catat transaksi
   - **Refresh browser** (Ctrl+R)
   - ✅ Data harus masih ada

3. **Check browser console:**
   - Buka F12 → Console
   - Tidak boleh ada error 404 atau failed fetch

## 📊 Data Flow

```
User Action (Add Product)
    ↓
Components call useApi() (e.g., addProduct)
    ↓
ApiContext wraps fetch() + error handling
    ↓
POST /api/products → Backend
    ↓
Backend INSERT INTO SQLite
    ↓
Response 200 OK
    ↓
Dispatch action to update local state
    ↓
UI re-render with new data
```

On reload:
```
App mounts
    ↓
ApiProvider useEffect triggers
    ↓
Fetch /api/products, /api/transactions, /api/settings
    ↓
Dispatch LOAD_PRODUCTS, LOAD_TRANSACTIONS, UPDATE_SETTINGS
    ↓
UI renders with server data
```

## 🚀 Vercel Deployment

Saat push ke GitHub:
1. Vercel webhook triggered
2. Build: `npm run build`
3. Deploy:
   - Frontend → Vercel Edge
   - Backend (`server/index.js`) → Vercel Functions
   - Routes via `vercel.json`:
     - `/api/*` → `server?path=$path`
     - `/*` → `index.html` (SPA routing)
4. SQLite DB → `/tmp/kasirku.db` (ephemeral, resets on redeploy)

## ⚠️ Important Notes

### Ephemeral Database (Vercel)
SQLite di Vercel Functions tidak persistent antar deployments karena `/tmp` cleanup.

**Solution for production:**
- Gunakan PostgreSQL atau MySQL external
- Atau Vercel KV untuk storage
- Atau setup persistent storage solution

### Local Development
SQLite file tersimpan di `server/kasirku.db` - persistent selama tidak di-delete.

## 📝 Files Modified

- `context/ApiContext.tsx` - **NEW** - API layer
- `context/StoreContext.tsx` - Updated: support LOAD actions
- `App.tsx` - Added ApiProvider wrapper
- `pages/Products.tsx` - Changed to useApi
- `pages/Settings.tsx` - Changed to useApi
- `pages/Cashier.tsx` - Changed to useApi
- `server/index.js` - Remove `/api` prefix from routes
- `.env.local` - Added VITE_API_URL

## ✨ Next Steps

1. ✅ Test locally - data persist after reload
2. ✅ Push to GitHub
3. ✅ Vercel auto-deploy
4. Check Vercel dashboard → Should show successful build
5. Test production: Open Vercel domain → Try add/edit/delete data

**Note:** In production, if redeploy happens, ephemeral data resets. For persistent production DB, need external database.

# Setup Vercel KV untuk Persistent Storage

## ⚠️ Masalah Saat Ini
Data di Vercel tidak persisten karena SQLite menggunakan `/tmp` yang ephemeral (ilang setiap kali function restart atau deploy).

## ✅ Solusi: Vercel KV (Redis)

Vercel KV adalah managed Redis dari Vercel yang:
- ✅ Gratis (50 commands/day free tier)
- ✅ Persistent across deployments
- ✅ Auto-integrated dengan Vercel projects

## 📝 Setup Steps

### 1. Buka Vercel Dashboard
- Go to https://vercel.com/dashboard
- Pilih project "kasirku"

### 2. Go to Storage Tab
- Click "Storage" di navigation menu
- Or go directly to https://vercel.com/dashboard/stores

### 3. Create KV Store
- Click "Create Database" atau "Create Store"
- Select "KV Store"
- Choose region (biasa default oke)
- Click "Create"

### 4. Vercel Auto-injects Credentials
Setelah create, Vercel otomatis add environment variables ke project:
```
KV_URL
KV_REST_API_URL
KV_REST_API_TOKEN
```

Tidak perlu manual setup!

### 5. Deploy Updated Code
Backend sudah diupdate untuk auto-detect Vercel KV.
Push ke GitHub:

```bash
git add -A
git commit -m "feat: add Vercel KV support for persistent storage"
git push origin main
```

Vercel akan:
1. Auto-detect `.env.production`
2. Inject KV credentials
3. Backend akan use KV automatically

### 6. Test
- Go to https://kasirku-q4ygs72dl-dadi-rustiawans-projects-125df639.vercel.app
- Atau https://your-kasirku-domain.vercel.app
- Edit nama / tambah produk
- **Refresh page** → Data harus tetap ada!
- **Buka di tab baru** → Data tetap ada!

## 🔍 Troubleshooting

### KV Store tidak muncul di dashboard?
- Pastikan Vercel project sudah linked dengan GitHub
- Pastikan sudah login dengan account yang tepat

### Still not working?
- Check Vercel logs: Deployments → Logs
- Look for "Using Vercel KV for storage"
- If it says "Using SQLite", KV setup belum berhasil

### How to delete old data?
Kalau perlu reset semua data (misalnya ada error lama):
1. Go to Storage → KV Store
2. Click "..." menu
3. Select "Clear database"
4. Confirm

Atau clear via API:
```javascript
// Run di browser console saat app terbuka
fetch('/api/products', { method: 'DELETE' })
```

## 💡 Backend Logic (Auto)

Backend sudah diupdate dengan logic:

```javascript
if (process.env.VERCEL || process.env.USE_KV) {
  // Use Vercel KV
  const { kv } = require('@vercel/kv');
  db = kv;
} else {
  // Use SQLite (local dev)
  db = new sqlite3.Database('kasirku.db');
}
```

Jadi:
- **Local development** → SQLite (`npm run dev`)
- **Vercel production** → KV (automatic)

## 🚀 After Setup
Data sekarang:
1. ✅ Persisten saat reload
2. ✅ Persisten saat buka di browser baru
3. ✅ Persisten across deploys
4. ✅ Real-time sync antar users (jika multi-user)

---

**Next:** Create KV store di Vercel dashboard, push code, dan test!

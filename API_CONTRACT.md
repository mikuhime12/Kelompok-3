# API Contract — Frontend Rent-Go

Dokumen ini adalah kontrak REST API dari sisi **klien** (React + Vite). Ditujukan untuk pengembang frontend: cara memanggil setiap endpoint, bentuk respons yang diharapkan, pemetaan elemen UI ke API, dan langkah migrasi dari data statis.

Untuk perspektif server (rute, aturan validasi, skema database), lihat [`backend/API_CONTRACT.md`](backend/API_CONTRACT.md).

Setiap endpoint ditandai **TERIMPLEMENTASI** (sudah dipanggil frontend) atau **RANCANGAN** (saat ini frontend memakai data statis di `src/data/` dan simulasi).

## Daftar isi

1. [Konfigurasi koneksi](#konfigurasi-koneksi)
2. [Bentuk respons yang diharapkan](#bentuk-respons-yang-diharapkan)
3. [Model data](#model-data)
4. [Autentikasi (TERIMPLEMENTASI)](#autentikasi-terimplementasi)
5. [Lokasi hub (RANCANGAN)](#lokasi-hub-rancangan)
6. [Armada kendaraan (RANCANGAN)](#armada-kendaraan-rancangan)
7. [Pemesanan (RANCANGAN)](#pemesanan-rancangan)
8. [Pemetaan UI ke API](#pemetaan-ui-ke-api)
9. [Catatan migrasi dari data statis](#catatan-migrasi-dari-data-statis)

## Konfigurasi koneksi

- Base URL backend: saat ini **di-hardcode** `http://localhost:3000` di `src/components/LoginScreen.jsx`.
- Pindahkan ke variabel environment: buat `.env` dengan `VITE_API_URL=http://localhost:3000`, lalu pakai `import.meta.env.VITE_API_URL` di seluruh kode.
- CORS backend mengizinkan origin frontend (default `http://localhost:5173`, dev server Vite). Untuk menghindari masalah CORS, alternatifnya tambahkan proxy di `vite.config.js` agar request `/api/*` diteruskan ke `http://localhost:3000`.
- Format: `application/json; charset=utf-8`. Selalu kirim header `Content-Type: application/json` pada `POST`/`PATCH`.

## Bentuk respons yang diharapkan

### Endpoint autentikasi (TERIMPLEMENTASI)

Mengembalikan objek langsung dengan field `message` dan (jika sukses) `user`:

```json
{ "message": "Login berhasil.", "user": { "id": 1, "nama": "Alexander Pratama", "email": "alex@example.com" } }
```

Error: `{ "message": "..." }` dengan kode HTTP `400`/`401`/`404`/`409`/`500`. Gunakan `response.ok` untuk menentukan sukses/gagal, lalu tampilkan `data.message`.

### Endpoint rancangan

Objek tunggal:

```json
{ "data": { } }
```

Daftar dengan pagination:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": [{ "field": "pickupAt", "message": "Waktu penjemputan wajib diisi." }]
  }
}
```

> Catatan: format autentikasi (`{message, user}`) dan rancangan (`{data}`/`{error}`) saat ini berbeda. Saat backend menerapkan endpoint rancangan, samakan formatnya. Pertimbangkan helper `apiFetch()` yang menangani kedua bentuk secara transisi.

## Model data

Bentuk ini persis sama dengan data statis di `src/data/`, agar cukup mengganti import dengan `fetch` tanpa mengubah struktur komponen.

### Vehicle (armada)

Sesuai `src/data/fleetData.js`:

```json
{
  "id": "zenix-hybrid",
  "name": "Toyota Innova Zenix Hybrid",
  "category": "MPV Premium",
  "type": "car",
  "year": "2024",
  "badge": "HYBRID",
  "badgeColor": "emerald",
  "description": "MPV nyaman untuk perjalanan keluarga & dinas bisnis",
  "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
  "fallbackImage": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
  "seats": "7 Kursi",
  "transmission": "Matic (CVT)",
  "fuel": "Hybrid",
  "price": 650000,
  "priceUnit": "/ hari",
  "rating": 4.9,
  "trips": 184
}
```

Aturan field penting:
- `type`: `car`, `motor`, atau `luxury`. Tab `Mobil` menampilkan `car` **dan** `luxury`; tab `Motor` hanya `motor`.
- `category`: `City Car`, `Family SUV`, `MPV Premium`, `Mobil Listrik (EV)`, `Sewa Motor`. `Semua` hanya filter UI.
- `priceUnit`: `"/ hari"` atau `"/ 12 Jam"`.
- `fuel`: bisa `Hybrid`, `Full Listrik`, `Bensin`, atau `Termasuk Supir`. Jika `Termasuk Supir`, jangan tambahkan biaya supir.

### Hub (lokasi)

Sesuai `src/data/hubsData.js`:

```json
{ "id": "jakarta", "code": "Jakarta", "name": "Area pusat kota", "status": "24 Jam Ready", "city": "Jakarta", "icon": "building", "color": "teal" }
```

ID hub: `jakarta`, `dps` (Bali), `sub` (Surabaya), `yia` (Yogyakarta), `bdo` (Bandung). `code` adalah nama tampilan kota.

### Booking (pemesanan)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending_confirmation",
  "vehicle": { "id": "zenix-hybrid", "name": "Toyota Innova Zenix Hybrid" },
  "customer": { "name": "Alexander Pratama", "phone": "+6281234567890" },
  "cityId": "jakarta",
  "rentalType": "driver",
  "pickupAt": "2026-10-15T09:00:00+07:00",
  "returnAt": "2026-10-17T09:00:00+07:00",
  "durationDays": 2,
  "priceBreakdown": {
    "vehicleSubtotal": 1300000,
    "driverSubtotal": 400000,
    "discount": 0,
    "total": 1700000,
    "currency": "IDR"
  },
  "createdAt": "2026-10-12T08:00:00+07:00"
}
```

Status: `pending_confirmation`, `confirmed`, `ongoing`, `completed`, `cancelled`, `rejected`.

## Autentikasi (TERIMPLEMENTASI)

Sudah dipanggil dari `src/components/LoginScreen.jsx`. Login hanya mengembalikan data user (tanpa token); state `isLoggedIn` disimpan di memori `App.jsx`.

### `POST /api/register` — pendaftaran

Request:

```json
{ "nama": "Alexander Pratama", "email": "alex@example.com", "password": "rahasia123" }
```

Sukses `201`:

```json
{ "message": "Registrasi berhasil. Silakan login.", "user": { "id": 1, "nama": "Alexander Pratama", "email": "alex@example.com" } }
```

Error yang mungkin (tampilkan `message` ke pengguna):
- `400` — `{ "message": "Nama, email, dan password wajib diisi." }` (atau format email / password terlalu panjang)
- `409` — `{ "message": "Email sudah terdaftar." }`

Implementasi saat ini: setelah registrasi sukses, tampilkan pesan lalu alihkan ke form login (`setIsRegistering(false)`).

### `POST /api/login` — masuk

Request:

```json
{ "email": "alex@example.com", "password": "rahasia123" }
```

Sukses `200`:

```json
{ "message": "Login berhasil.", "user": { "id": 1, "nama": "Alexander Pratama", "email": "alex@example.com" } }
```

Error yang mungkin:
- `400` — `{ "message": "Email dan password wajib diisi." }`
- `404` — `{ "message": "Akun belum terdaftar." }`
- `401` — `{ "message": "Email atau password salah." }`

Implementasi saat ini: saat sukses panggil `onLogin(data.user)` untuk set `isLoggedIn = true` di `App.jsx`.

## Lokasi hub (RANCANGAN)

### `GET /api/locations`

Menggantikan `src/data/hubsData.js`. Dipakai `src/components/LocationsSection.jsx`.

Respons `200`:

```json
{
  "data": [
    { "id": "jakarta", "code": "Jakarta", "name": "Area pusat kota", "status": "24 Jam Ready", "city": "Jakarta", "icon": "building", "color": "teal" },
    { "id": "dps", "code": "Bali", "name": "Kuta dan Denpasar", "status": "24 Jam Ready", "city": "Bali", "icon": "palmtree", "color": "purple" },
    { "id": "sub", "code": "Surabaya", "name": "Area pusat kota", "status": "06.00-23.00", "city": "Surabaya", "icon": "building", "color": "blue" },
    { "id": "yia", "code": "Yogyakarta", "name": "Malioboro dan sekitarnya", "status": "24 Jam Ready", "city": "Yogyakarta", "icon": "landmark", "color": "indigo" },
    { "id": "bdo", "code": "Bandung", "name": "Area pusat kota", "status": "24 Jam Ready", "city": "Bandung", "icon": "train", "color": "purple" }
  ]
}
```

Pemakaian: `data[i]` langsung menggantikan objek hub di `HUBS`. Field `icon`/`color` dipakai untuk styling; `id` dipakai sebagai `cityId` untuk query armada/pemesanan.

## Armada kendaraan (RANCANGAN)

### `GET /api/vehicles`

Menggantikan `src/data/fleetData.js` + logika filter `src/App.jsx`. Pilih query sesuai state UI:

| State UI (App.jsx) | Query API |
|---|---|
| Tab `Mobil` (`selectedVehicleType === 'car'`) | `type=car` (server kembalikan `car` + `luxury`) |
| Tab `Motor` (`selectedVehicleType === 'motor'`) | `type=motor` |
| Kategori aktif (mis. `MPV Premium`) | `category=MPV%20Premium` (jangan kirim `Semua`) |
| Input pencarian (`searchQuery`) | `q=<teks>` (cocok `name`/`description`/`category`/`fuel`, case-insensitive) |
| Kota terpilih (`activeLocation`, nama kota) | `cityId=<slug>` — perlu memetakan nama kota → slug hub (mis. `Jakarta` → `jakarta`, `Bali` → `dps`) |
| Mode sewa (`rentalType`) | `rentalType=self\|driver` |
| Widget tanggal (`pickupDate`/`returnDate`) | `pickupAt` & `returnAt` ISO 8601 — input teks saat ini harus diubah ke `datetime-local` |

Contoh: `GET /api/vehicles?type=car&cityId=jakarta&pickupAt=2026-10-15T09%3A00%3A00%2B07%3A00&returnAt=2026-10-17T09%3A00%3A00%2B07%3A00`.

Respons `200`: `{ "data": [Vehicle, ...], "meta": {...} }`. Ganti `VEHICLES` statis dengan `data`; paginasi via `meta`.

### `GET /api/vehicles/{vehicleId}`

Detail satu kendaraan. `200`: `{ "data": Vehicle }`. `404` jika ID tidak ada.

### `GET /api/vehicles/{vehicleId}/availability`

Query wajib: `cityId`, `pickupAt`, `returnAt`; opsional `rentalType`. Respons `200`:

```json
{ "data": { "available": true, "vehicleId": "zenix-hybrid", "cityId": "jakarta", "pickupAt": "2026-10-15T09:00:00+07:00", "returnAt": "2026-10-17T09:00:00+07:00" } }
```

## Pemesanan (RANCANGAN)

Menggantikan simulasi `setIsSuccess(true)` di `src/components/BookingModal.jsx`.

### `POST /api/bookings/quote` — cek harga sebelum konfirmasi

Request:

```json
{
  "vehicleId": "zenix-hybrid",
  "cityId": "jakarta",
  "rentalType": "driver",
  "pickupAt": "2026-10-15T09:00:00+07:00",
  "returnAt": "2026-10-17T09:00:00+07:00"
}
```

Respons `200`:

```json
{
  "data": {
    "available": true,
    "durationDays": 2,
    "priceBreakdown": {
      "vehicleSubtotal": 1300000,
      "driverSubtotal": 400000,
      "discount": 0,
      "total": 1700000,
      "currency": "IDR"
    },
    "expiresAt": "2026-10-12T08:10:00+07:00"
  }
}
```

Respons `409` jika tidak tersedia. Tampilkan `data.priceBreakdown` di ringkasan harga modal.

### `POST /api/bookings` — buat pemesanan

Header: `Idempotency-Key: <uuid>` agar pengulangan tidak membuat booking ganda.

Request:

```json
{
  "vehicleId": "zenix-hybrid",
  "cityId": "jakarta",
  "rentalType": "driver",
  "pickupAt": "2026-10-15T09:00:00+07:00",
  "returnAt": "2026-10-17T09:00:00+07:00",
  "customer": { "name": "Alexander Pratama", "phone": "+6281234567890" }
}
```

Respons `201`: Booking status `pending_confirmation`. `409` jika kendaraan baru saja dipesan orang lain. Saat sukses, ganti tampilan "Pemesanan Berhasil Disiapkan!" dengan status dari `data.status`; simpan `data.id` untuk cek status nanti.

Aturan tarif supir (sesuai `BookingModal.jsx` saat ini):
- Tarif supir Rp200.000/hari ditambahkan hanya bila `type !== 'motor'`, opsi supir dipilih, dan `fuel !== 'Termasuk Supir'`.
- Kendaraan dengan `fuel: 'Termasuk Supir'` atau `type: 'motor'`: tanpa biaya supir.
- Harga final selalu dari server — jangan kirim total dari klien.

### `GET /api/bookings/{bookingId}` — cek status

`200`: `{ "data": Booking }`. `404` jika booking/token tidak cocok.

### `POST /api/bookings/{bookingId}/cancel` — batalkan

Request opsional `{ "reason": "Perubahan jadwal" }`. `200`: booking terbaru. `409` jika tidak bisa dibatalkan (gratis pembatalan s/d 24 jam sesuai UI).

## Pemetaan UI ke API

| Elemen UI | File | API | Status |
|---|---|---|---|
| Form login/daftar | `src/components/LoginScreen.jsx` | `POST /api/login`, `POST /api/register` | Terimplementasi |
| Hub lokasi | `src/components/LocationsSection.jsx` → `src/data/hubsData.js` | `GET /api/locations` | Rancangan |
| Pencarian/kategori armada | `src/App.jsx`, `src/components/FleetSection.jsx` → `src/data/fleetData.js` | `GET /api/vehicles` | Rancangan |
| Pilih kendaraan | `src/components/FleetSection.jsx` | `GET /api/vehicles/{vehicleId}` | Rancangan |
| Widget pencarian (kota, tanggal, tipe, mode sewa) | `src/components/BookingWidget.jsx` | `GET /api/vehicles` dengan query | Rancangan |
| Form nama, WhatsApp, durasi, sopir | `src/components/BookingModal.jsx` | `POST /api/bookings/quote`, lalu `POST /api/bookings` | Rancangan |
| Pesan berhasil | `src/components/BookingModal.jsx` (simulasi `setIsSuccess`) | tampilkan respons `pending_confirmation`, simpan ID/token | Rancangan |
| Cek status pemesanan | — | `GET /api/bookings/{bookingId}` | Rancangan |
| Batalkan pemesanan | — | `POST /api/bookings/{bookingId}/cancel` | Rancangan |
| Bantuan WhatsApp | `src/components/Navbar.jsx` (`wa.me/6281234567890`) | — | Statis, bukan API |

## Catatan migrasi dari data statis

Pertahankan nama field persis seperti di `src/data/fleetData.js` dan `src/data/hubsData.js` agar cukup mengganti import statis dengan `fetch` tanpa mengubah struktur komponen.

Langkah konkret per file:

1. `src/components/LoginScreen.jsx`
   - Ganti `http://localhost:3000` dengan `import.meta.env.VITE_API_URL`.
   - (Opsional) tangani kedua bentuk respons saat format disamukan backend.

2. `src/data/hubsData.js`
   - Gantikan `export const HUBS` dengan fetch ke `GET /api/locations`; simpan hasil ke state. Bisa jadikan data statis sebagai fallback bila API gagal.

3. `src/data/fleetData.js`
   - Gantikan `export const VEHICLES` dengan fetch ke `GET /api/vehicles` (dengan query filter). Hapus filter manual `useMemo` di `App.jsx` karena server sudah memfilter; gunakan `meta` untuk paginasi.

4. `src/components/BookingWidget.jsx`
   - Ubah input tanggal teks (`pickupDate`/`returnDate`) menjadi `<input type="datetime-local">` dan kirim ISO 8601 ke `pickupAt`/`returnAt`.
   - Petakan nama kota (`location`) ke slug hub (`cityId`) — mis. `Jakarta` → `jakarta`, `Bali` → `dps`.

5. `src/components/BookingModal.jsx`
   - Ganti `setIsSuccess(true)` dengan `POST /api/bookings/quote` → tampilkan `priceBreakdown`, lalu `POST /api/bookings` saat konfirmasi.
   - Tampilkan `data.status` dari server; simpan `data.id` (dan token bila ada) untuk cek status.
   - Hapus perhitungan harga lokal; andalkan harga server (tetap boleh tampilkan estimasi dari quote).

6. `src/App.jsx`
   - Hapus `useMemo` filter karena server memfilter; simpan hasil `fetch` ke state dan gunakan `meta` untuk paginasi.
   - `activeLocation` (nama kota) perlu dipetakan ke `cityId` slug untuk dikirim ke API.

# API Contract — Backend Rent-Go

Dokumen ini adalah kontrak REST API dari sisi **server** (Express + PostgreSQL). Ditujukan untuk pengembang backend: rute, aturan validasi, skema database, bentuk respons yang dihasilkan, dan aturan keamanan.

Untuk perspektif pemakaian di sisi klien (pemetaan UI, langkah migrasi frontend), lihat [`../API_CONTRACT.md`](../API_CONTRACT.md).

Setiap endpoint ditandai **TERIMPLEMENTASI** (sudah ada kode di `backend/server.js`) atau **RANCANGAN** (belum dibangun).

## Daftar isi

1. [Konvensi server](#konvensi-server)
2. [Skema database](#skema-database)
3. [Bentuk respons](#bentuk-respons)
4. [Model resource](#model-resource)
5. [Autentikasi (TERIMPLEMENTASI)](#autentikasi-terimplementasi)
6. [Rancangan lanjutan autentikasi](#rancangan-lanjutan-autentikasi)
7. [Lokasi hub (RANCANGAN)](#lokasi-hub-rancangan)
8. [Armada kendaraan (RANCANGAN)](#armada-kendaraan-rancangan)
9. [Pemesanan (RANCANGAN)](#pemesanan-rancangan)
10. [Endpoint admin (RANCANGAN)](#endpoint-admin-rancangan)
11. [Keamanan dan aturan implementasi](#keamanan-dan-aturan-implementasi)
12. [Status implementasi](#status-implementasi)

## Konvensi server

- Base path: `/api`. Endpoint autentikasi sudah jalan memakai `/api/register` dan `/api/login` (tanpa versi). Endpoint rancangan memakai path yang sama.
- Port: `process.env.PORT || 3000`.
- Format: `application/json; charset=utf-8` (`express.json()`).
- CORS: origin frontend via `process.env.FRONTEND_ORIGIN` (default `http://localhost:5173`).
- Waktu: ISO 8601 dengan offset zona waktu, misalnya `2026-10-15T09:00:00+07:00`.
- Uang: bilangan bulat Rupiah (IDR), tanpa pemisah ribuan. Contoh `650000`.
- ID kendaraan dan kota: slug (mis. `zenix-hybrid`, `jakarta`). ID pemesanan: UUID.
- Pagination daftar: `page` (mulai 1) dan `limit` (default 20, maksimum 100).

> Catatan konsistensi: endpoint autentikasi yang sudah jalan mengembalikan `{ message, user }` tanpa pembungkus `data`. Endpoint rancangan memakai pembungkus `data`. Saat membangun endpoint rancangan, samakan format — idealnya seluruh API memakai satu bentuk respons konsisten (lihat [Bentuk respons](#bentuk-respons)).

## Skema database

Skema dibangun di PostgreSQL (lihat `db.js` dan migrasi `node-pg-migrate`). Tabel yang sudah ada ditandai **TERIMPLEMENTASI**; sisanya adalah rancangan yang dibuat saat membangun endpoint rancangan. Konvensi: tabel dan kolom memakai `snake_case`; kolom waktu memakai `timestamptz` (ISO 8601 dengan offset zona waktu); uang disimpan sebagai `integer` Rupiah tanpa desimal; id publik kendaraan/kota berupa `slug`.

### `daftar_akun` (TERIMPLEMENTASI)

Dibuat oleh migrasi `migrations/1792986649542_Tambah-table-daftar-akun.js`:

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `id` | serial (auto) | Primary key |
| `nama` | varchar(100) | Nama lengkap, wajib (`NOT NULL`) |
| `email` | varchar(100) | Unik, wajib (`UNIQUE`, `NOT NULL`) |
| `pw` | varchar(100) | Hash bcrypt, wajib (tidak pernah dikembalikan ke klien) |

#### Perluasan yang disarankan

Tabel di atas hanya menyimpan data login dasar. Untuk mendukung role admin, profil pelanggan, dan relasi ke `bookings`, tambahkan kolom berikut lewat migrasi baru (tidak mengubah kolom yang sudah ada):

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `role` | varchar(20) | `customer` (default) atau `admin`. Mengendalikan akses [endpoint admin](#endpoint-admin-rancangan). |
| `phone` | varchar(20) | Nomor telepon E.164, opsional |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Diperbarui saat akun diubah |

### `vehicles`

Armada kendaraan. Kolom mengikuti [model Vehicle](#vehicle-armada). `id` internal adalah `serial`; `slug` adalah identifier publik yang dikembalikan API sebagai `id`.

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `id` | serial (auto) | Primary key internal |
| `slug` | varchar(60) | Unik, wajib. Public id, mis. `zenix-hybrid` |
| `name` | varchar(120) | Wajib |
| `category` | varchar(40) | Wajib. `City Car`, `Family SUV`, `MPV Premium`, `Mobil Listrik (EV)`, `Sewa Motor` |
| `type` | varchar(10) | Wajib. `car`, `motor`, `luxury` |
| `year` | varchar(10) | Tahun (string, sesuai frontend) |
| `badge` | varchar(20) | Label UI, mis. `HYBRID` |
| `badge_color` | varchar(20) | `emerald`, `purple`, `amber`, `blue` |
| `description` | text | Deskripsi kendaraan |
| `image` | text | URL HTTPS gambar utama |
| `fallback_image` | text | URL HTTPS gambar cadangan |
| `seats` | varchar(20) | Mis. `7 Kursi` |
| `transmission` | varchar(40) | Mis. `Matic (CVT)` |
| `fuel` | varchar(40) | `Hybrid`, `Full Listrik`, `Bensin`, `Termasuk Supir` |
| `price` | integer | Tarif per unit waktu, wajib. Rupiah tanpa desimal |
| `price_unit` | varchar(20) | `"/ hari"` atau `"/ 12 Jam"` |
| `rating` | numeric(2,1) | Mis. `4.9` |
| `trips` | integer | Jumlah penyewaan, default `0` |
| `supports_self` | boolean | Mendukung mode `self`, default `true` |
| `supports_driver` | boolean | Mendukung mode `driver`, default `true` |
| `active` | boolean | `false` = diarsipkan admin. Default `true` |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Diperbarui saat data diubah |

Indeks: unik pada `slug`; biasa pada `(active)`, `(type)`, `(category)`.

### `locations`

Hub kota untuk pemilih lokasi. Kolom mengikuti [model Hub](#hub-lokasi). `id` adalah slug yang dipakai sebagai `cityId` di seluruh API.

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `id` | varchar(20) | Primary key. Slug, mis. `jakarta`, `dps`, `sub`, `yia`, `bdo` |
| `code` | varchar(40) | Nama tampilan, wajib. Mis. `Jakarta`, `Bali` |
| `name` | varchar(80) | Nama area, wajib. Mis. `Area pusat kota` |
| `status` | varchar(20) | Wajib. `24 Jam Ready` atau `06.00-23.00` |
| `city` | varchar(60) | Nama kota, wajib |
| `icon` | varchar(20) | `building`, `palmtree`, `landmark`, `train` |
| `color` | varchar(20) | `teal`, `purple`, `blue`, `indigo` |
| `active` | boolean | Default `true` |
| `created_at` | timestamptz | Default `now()` |

### `vehicle_locations`

Relasi banyak-ke-banyak antara kendaraan dan hub. Menentukan di kota mana sebuah kendaraan tersedia dan berapa unit (`stock`) di hub tersebut. Mendukung filter `cityId` pada `GET /api/vehicles` dan pemeriksaan ketersediaan.

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `vehicle_id` | integer | FK → `vehicles(id)`, `ON DELETE CASCADE` |
| `location_id` | varchar(20) | FK → `locations(id)`, `ON DELETE CASCADE` |
| `stock` | integer | Jumlah unit di hub, default `1` |

Primary key: `(vehicle_id, location_id)`.

### `bookings`

Pemesanan. Mengikuti [model Booking](#booking-pemesanan). `id` adalah UUID; booking tamu diizinkan sehingga `account_id` boleh `NULL`.

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `id` | uuid | Primary key, `DEFAULT gen_random_uuid()` |
| `account_id` | integer | FK → `daftar_akun(id)`. `NULL` untuk booking tamu |
| `vehicle_id` | integer | FK → `vehicles(id)`, wajib |
| `location_id` | varchar(20) | FK → `locations(id)`. `cityId`, wajib |
| `rental_type` | varchar(10) | Wajib. `self` atau `driver` |
| `pickup_at` | timestamptz | Wajib |
| `return_at` | timestamptz | Wajib. Harus setelah `pickup_at` |
| `duration_days` | integer | Wajib. Dihitung server |
| `status` | varchar(30) | Wajib, default `pending_confirmation`. Lihat daftar status di bawah |
| `customer_name` | varchar(100) | Wajib |
| `customer_phone` | varchar(20) | Wajib. Format E.164 |
| `vehicle_subtotal` | integer | Default `0`. `price × duration_days` |
| `driver_subtotal` | integer | Default `0`. `200000 × duration_days` bila berlaku |
| `discount` | integer | Default `0` |
| `total` | integer | Wajib. `vehicle_subtotal + driver_subtotal − discount` |
| `currency` | varchar(3) | Default `IDR` |
| `access_token` | varchar(64) | Token akses booking tamu, wajib, unik |
| `idempotency_key` | varchar(100) | Unik. Mencegah pembuatan booking ganda |
| `cancel_reason` | text | Diisi saat pembatalan |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Diperbarui saat status berubah |

Constraint:
- `CHECK (return_at > pickup_at)`
- `CHECK (total = vehicle_subtotal + driver_subtotal - discount)`
- `UNIQUE (idempotency_key)`
- `UNIQUE (access_token)`

Status booking: `pending_confirmation`, `confirmed`, `ongoing`, `completed`, `cancelled`, `rejected` (lihat [model Booking](#booking-pemesanan) untuk transisi).

Indeks: biasa pada `(status)`, `(vehicle_id, pickup_at, return_at)`, `(account_id)`, `(location_id)`.

### `vehicle_availability_locks`

Penguncian rentang waktu untuk mencegah double booking. Tiap baris aktif merepresentasikan satu unit kendaraan yang dipesan pada rentang tertentu di satu hub. Memakai constraint eksklusi GiST pada `tstzrange` agar dua lock aktif tidak boleh tumpang tindih untuk kendaraan + hub yang sama.

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `id` | serial (auto) | Primary key |
| `vehicle_id` | integer | FK → `vehicles(id)`, `ON DELETE CASCADE` |
| `location_id` | varchar(20) | FK → `locations(id)`. Hub tempat unit dipesan |
| `booking_id` | uuid | FK → `bookings(id)`, `ON DELETE CASCADE` |
| `pickup_at` | timestamptz | Wajib |
| `return_at` | timestamptz | Wajib |
| `status` | varchar(20) | `active` (mengunci) atau `released` (dilepas). Default `active` |
| `created_at` | timestamptz | Default `now()` |

Constraint eksklusi (mencegah overlap untuk lock aktif pada kendaraan + hub yang sama):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE vehicle_availability_locks
  ADD CONSTRAINT no_overlap_active_locks
  EXCLUDE USING gist (
    vehicle_id WITH =,
    location_id WITH =,
    tstzrange(pickup_at, return_at, '[)') WITH &&
  ) WHERE (status = 'active');
```

> Catatan: ekstensi `btree_gist` wajib karena `vehicle_id` dan `location_id` adalah kolom skalar yang ikut diperbandingkan dalam constraint GiST. Saat membatalkan/menyelesaikan booking, set `status = 'released'` agar lock tidak lagi memblokir rentang lain. Jika satu hub punya banyak unit (`stock > 1` pada `vehicle_locations`), batasi jumlah lock `active` tumpang tindih ≤ `stock` via pengecekan aplikasi atau trigger agar tidak melebihi unit fisik yang tersedia.

### `admin_audit_log`

Catatan aksi admin untuk seluruh perubahan via [endpoint admin](#endpoint-admin-rancangan). Setiap aksi mencatat actor, entitas, dan transisi status.

| Kolom | Tipe DB | Keterangan |
|---|---|---|
| `id` | bigserial (auto) | Primary key |
| `actor_id` | integer | FK → `daftar_akun(id)`. Admin pelaku aksi |
| `action` | varchar(40) | Wajib. `create`, `update`, `delete`, `status_change` |
| `entity` | varchar(40) | Wajib. `vehicle`, `booking`, `customer` |
| `entity_id` | varchar(80) | Id baris yang terdampak (slug/uuid/id) |
| `from_status` | varchar(40) | Status sebelum perubahan |
| `to_status` | varchar(40) | Status setelah perubahan |
| `metadata` | jsonb | Data tambahan (ringkasan perubahan), bebas |
| `created_at` | timestamptz | Default `now()` |

Indeks: biasa pada `(entity, entity_id)`, `(actor_id)`, `(created_at)`.

### Ringkasan relasi

```text
daftar_akun (id) ──┬──< bookings.account_id
                   └──< admin_audit_log.actor_id

vehicles (id) ──┬──< vehicle_locations.vehicle_id
                ├──< bookings.vehicle_id
                └──< vehicle_availability_locks.vehicle_id

locations (id) ──┬──< vehicle_locations.location_id
                 ├──< bookings.location_id
                 └──< vehicle_availability_locks.location_id

bookings (id) ──< vehicle_availability_locks.booking_id
```

## Bentuk respons

### Respons sukses (endpoint rancangan)

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

### Respons error (endpoint rancangan)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": [{ "field": "pickupAt", "message": "Waktu penjemputan wajib diisi." }]
  }
}
```

### Respons endpoint terimplementasi (autentikasi)

Endpoint `register` dan `login` yang sudah jalan **tidak** memakai format di atas. Lihat [Autentikasi](#autentikasi-terimplementasi) untuk bentuk persisnya (`{ "message": "...", "user": {...} }`).

### Kode HTTP umum

| Kode | Arti |
|---|---|
| `200` | Berhasil |
| `201` | Dibuat |
| `204` | Berhasil tanpa body |
| `400` | Format/parameter salah |
| `401` | Belum terautentikasi / kredensial salah |
| `403` | Tidak berwenang |
| `404` | Tidak ditemukan |
| `409` | Konflik (email terdaftar, kendaraan sudah dipesan) |
| `422` | Validasi gagal |
| `429` | Terlalu banyak permintaan |
| `500` | Kesalahan server |

## Model resource

### Akun (User)

Bentuk publik yang dikembalikan API (sesuai tabel `daftar_akun`):

```json
{ "id": 1, "nama": "Alexander Pratama", "email": "alex@example.com" }
```

### Vehicle (armada)

Berdasarkan data statis `../src/data/fleetData.js`. Field ditulis persis seperti yang dipakai frontend.

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

Aturan field:

- `type`: `car`, `motor`, atau `luxury`. Tipe `luxury` (mis. Toyota Alphard) ditampilkan bersama mobil; backend harus mengembalikan `car` **dan** `luxury` saat klien meminta `type=car`.
- `category`: salah satu dari `City Car`, `Family SUV`, `MPV Premium`, `Mobil Listrik (EV)`, `Sewa Motor`. `Semua` hanya filter UI, bukan kategori data.
- `priceUnit`: `"/ hari"` atau `"/ 12 Jam"`.
- `year`, `seats`, `transmission`: string (sesuai data frontend saat ini).
- `badgeColor`: `emerald`, `purple`, `amber`, `blue` (untuk styling UI).
- `fuel`: bebas string, mis. `Hybrid`, `Full Listrik`, `Bensin`, `Termasuk Supir`. Nilai `Termasuk Supir` berarti sopir sudah termasuk tarif — jangan tambahkan tarif supir.
- `image` / `fallbackImage`: URL HTTPS (CDN/object storage di produksi, bukan base64).

### Hub (lokasi)

Berdasarkan `../src/data/hubsData.js`:

```json
{
  "id": "jakarta",
  "code": "Jakarta",
  "name": "Area pusat kota",
  "status": "24 Jam Ready",
  "city": "Jakarta",
  "icon": "building",
  "color": "teal"
}
```

Aturan field:

- `id`: slug. Hub saat ini: `jakarta`, `dps` (Bali), `sub` (Surabaya), `yia` (Yogyakarta), `bdo` (Bandung).
- `code`: nama tampilan (mis. `Jakarta`, `Bali`, `Surabaya`, `Yogyakarta`, `Bandung`).
- `status`: `24 Jam Ready` atau `06.00-23.00`.
- `icon`: `building`, `palmtree`, `landmark`, `train` (UI).
- `color`: `teal`, `purple`, `blue`, `indigo` (UI).

### Booking (pemesanan)

Rancangan resource pemesanan.

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

Aturan tarif supir (sesuai logika `../src/components/BookingModal.jsx`):
- Tarif supir Rp200.000/hari hanya ditambahkan bila `type !== 'motor'`, opsi supir dipilih (`rentalType: 'driver'`), dan `fuel !== 'Termasuk Supir'`.
- Untuk kendaraan dengan `fuel: 'Termasuk Supir'` (mis. Alphard) atau `type: 'motor'`, tidak ada biaya supir tambahan.
- Tarif dan total final dihitung server; jangan percaya harga dari klien.

## Autentikasi (TERIMPLEMENTASI)

Endpoint ini sudah ada di `backend/server.js`. Belum ada token/sesi — login hanya mengembalikan data user; frontend menyimpan state `isLoggedIn` di memori.

### `POST /api/register`

Mendaftarkan akun baru ke tabel `daftar_akun`. Password di-hash dengan bcrypt (10 rounds).

Request:

```json
{ "nama": "Alexander Pratama", "email": "alex@example.com", "password": "rahasia123" }
```

Validasi server:
- `nama`, `email`, `password` wajib diisi (string, tidak kosong).
- `nama` dan `email` maksimal 100 karakter.
- `email` harus format email valid (`^[^\s@]+@[^\s@]+\.[^\s@]+$`), dinormalisasi ke huruf kecil.
- `password` maksimal 72 byte (batas input bcrypt).

Respons `201`:

```json
{
  "message": "Registrasi berhasil. Silakan login.",
  "user": { "id": 1, "nama": "Alexander Pratama", "email": "alex@example.com" }
}
```

Error:
- `400` — field kosong / format email salah / password terlalu panjang: `{ "message": "..." }`
- `409` — email sudah terdaftar: `{ "message": "Email sudah terdaftar." }`
- `500` — kesalahan server: `{ "message": "Terjadi kesalahan pada server." }`

### `POST /api/login`

Login dengan email dan password.

Request:

```json
{ "email": "alex@example.com", "password": "rahasia123" }
```

Validasi server:
- `email` dan `password` wajib diisi. Email dinormalisasi ke huruf kecil.

Respons `200`:

```json
{
  "message": "Login berhasil.",
  "user": { "id": 1, "nama": "Alexander Pratama", "email": "alex@example.com" }
}
```

Error:
- `400` — field kosong: `{ "message": "Email dan password wajib diisi." }`
- `404` — akun belum terdaftar: `{ "message": "Akun belum terdaftar." }`
- `401` — password salah: `{ "message": "Email atau password salah." }`
- `500` — kesalahan server: `{ "message": "Terjadi kesalahan pada server." }`

### `GET /` (health check)

Tes server dan koneksi database. Respons `200` teks `"Backend Rent-Go aktif dan PostgreSQL terhubung!"`; `500` teks jika database gagal.

## Rancangan lanjutan autentikasi

Saat ini tidak ada token. Jika autentikasi penuh diaktifkan, tambahkan:

- `POST /api/auth/refresh` — perbarui access token via refresh token (disarankan cookie `HttpOnly`, `Secure`, `SameSite`).
- `POST /api/auth/logout` — cabut sesi; respons `204`.
- Endpoint privat memakai header `Authorization: Bearer <accessToken>`.
- Login sebaiknya tidak membocorkan apakah email ada (gabungkan `404` dan `401` menjadi satu pesan `401` "Email atau password salah").

## Lokasi hub (RANCANGAN)

### `GET /api/locations`

Daftar hub kota untuk pemilih lokasi. Menggantikan data statis `../src/data/hubsData.js`.

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

## Armada kendaraan (RANCANGAN)

Menggantikan data statis `../src/data/fleetData.js` dan filter di `../src/App.jsx`.

### `GET /api/vehicles`

Daftar armada, pencarian, filter, dan ketersediaan. Query opsional:

| Parameter | Tipe | Keterangan |
|---|---|---|
| `q` | string | Cari `name`, `description`, `category`, `fuel` (sesuai logika filter `App.jsx`) |
| `type` | `car\|motor\|luxury` | Jenis kendaraan. Catatan: tab UI `Mobil` menampilkan `car` **dan** `luxury`; kembalikan keduanya saat `type=car`. |
| `category` | string | Kategori persis. `Semua` tidak dikirim. |
| `cityId` | string | Filter kota (slug hub) |
| `rentalType` | `self\|driver` | Mode sewa |
| `pickupAt`, `returnAt` | datetime | Jika keduanya ada, hanya unit yang tersedia pada rentang itu |
| `page`, `limit` | integer | Pagination |

Contoh: `GET /api/vehicles?type=car&cityId=jakarta&pickupAt=2026-10-15T09%3A00%3A00%2B07%3A00&returnAt=2026-10-17T09%3A00%3A00%2B07%3A00`.

Respons `200`: bentuk daftar standar dengan elemen `Vehicle`. `404` jika `cityId` tidak ditemukan.

### `GET /api/vehicles/{vehicleId}`

Detail kendaraan. `200` mengembalikan `{ "data": Vehicle }`; `404` jika ID tidak ada.

### `GET /api/vehicles/{vehicleId}/availability`

Query wajib: `cityId`, `pickupAt`, `returnAt`; opsional `rentalType`. Respons `200`:

```json
{
  "data": {
    "available": true,
    "vehicleId": "zenix-hybrid",
    "cityId": "jakarta",
    "pickupAt": "2026-10-15T09:00:00+07:00",
    "returnAt": "2026-10-17T09:00:00+07:00"
  }
}
```

## Pemesanan (RANCANGAN)

Menggantikan simulasi di `../src/components/BookingModal.jsx`. Saat ini login tidak wajib untuk pemesanan; backend boleh membuat booking tamu.

### `POST /api/bookings/quote`

Validasi ketersediaan dan hitung harga sebelum konfirmasi.

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

Respons `409` jika unit tidak tersedia. Quote berumur pendek; harga final dihitung ulang saat membuat booking.

### `POST /api/bookings`

Buat permintaan pemesanan. Gunakan header `Idempotency-Key` agar pengulangan permintaan tidak membuat booking ganda.

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

Validasi: semua field wajib; `returnAt` harus setelah `pickupAt`; kendaraan dan kota harus aktif; mode rental harus didukung kendaraan; telepon harus nomor yang dapat dihubungi (format E.164). Jangan menerima harga dari klien sebagai sumber kebenaran.

Respons `201` mengembalikan Booking status `pending_confirmation`; `409` jika kendaraan baru saja dipesan orang lain.

### `GET /api/bookings/{bookingId}`

Lihat status booking tamu dengan token akses booking (mis. token acak yang dikirim saat booking) atau autentikasi pemilik. `200` mengembalikan `{ "data": Booking }`; `404` untuk booking/token yang tidak cocok.

### `POST /api/bookings/{bookingId}/cancel`

Batalkan permintaan booking. Request opsional `{"reason":"Perubahan jadwal"}`. `200` mengembalikan booking terbaru. `409` jika status tidak bisa dibatalkan atau jangka gratis pembatalan (s/d 24 jam, sesuai UI) sudah lewat.

## Endpoint admin (RANCANGAN)

Memerlukan role `admin`; belum ada dashboard admin pada frontend. Sesuai README: admin mengelola data kendaraan, pelanggan, pemesanan, dan memantau statistik via dashboard.

- `GET /api/admin/dashboard?from=&to=` — ringkasan pemesanan, pendapatan, utilisasi, dan aktivitas.
- `GET /api/admin/vehicles` — daftar armada termasuk unit nonaktif.
- `POST /api/admin/vehicles` — tambah kendaraan; `201`.
- `PATCH /api/admin/vehicles/{vehicleId}` — ubah data/tarif/status kendaraan; `200`.
- `DELETE /api/admin/vehicles/{vehicleId}` — arsipkan kendaraan; `204`; jangan hapus kendaraan yang punya riwayat booking.
- `POST /api/admin/vehicles/{vehicleId}/image-upload` — buat URL upload bertanda tangan; setelah unggah, simpan metadata foto ke kendaraan.
- `GET /api/admin/bookings?status=&from=&to=&page=&limit=` — daftar pemesanan.
- `PATCH /api/admin/bookings/{bookingId}` — ubah status ke transisi yang diizinkan, mis. `pending_confirmation` → `confirmed` atau `rejected`.
- `GET /api/admin/customers?page=&limit=` — daftar pelanggan.

Semua aksi admin harus mencatat actor, waktu, dan perubahan status untuk audit (lihat [Skema database](#skema-database) — `admin_audit_log`).

## Keamanan dan aturan implementasi

- Validasi input dan otorisasi dilakukan server; jangan percaya tarif, total, role, atau status dari browser.
- Password disimpan sebagai hash bcrypt (sudah diterapkan di `/api/register`); gunakan HTTPS, rate limit login, dan pesan kredensial gagal yang tidak membocorkan akun.
- Lindungi endpoint admin dengan role-based access control. Batasi akses data pribadi dan jangan mencatat password/token/nomor telepon penuh ke log.
- Booking dan penguncian rentang ketersediaan dibuat atomik (transaksi DB) untuk mencegah double booking.
- Nomor telepon disimpan dalam format E.164; tanggal dikirim ISO 8601 dengan offset zona waktu.
- Gambar kendaraan dilayani via URL HTTPS CDN/object storage, bukan payload base64.

## Status implementasi

| Endpoint | Status |
|---|---|
| `GET /` (health check) | Terimplementasi |
| `POST /api/register` | Terimplementasi |
| `POST /api/login` | Terimplementasi |
| `POST /api/auth/refresh` | Rancangan |
| `POST /api/auth/logout` | Rancangan |
| `GET /api/locations` | Rancangan |
| `GET /api/vehicles` | Rancangan |
| `GET /api/vehicles/{id}` | Rancangan |
| `GET /api/vehicles/{id}/availability` | Rancangan |
| `POST /api/bookings/quote` | Rancangan |
| `POST /api/bookings` | Rancangan |
| `GET /api/bookings/{id}` | Rancangan |
| `POST /api/bookings/{id}/cancel` | Rancangan |
| `/api/admin/*` | Rancangan |

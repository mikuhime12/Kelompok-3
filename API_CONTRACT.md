# API Contract Rent-Go

Dokumen ini mendefinisikan kontrak REST API untuk menghubungkan frontend rental Rent-Go dengan backend. Frontend saat ini masih memakai data statis dan simulasi login/pemesanan; endpoint di bawah adalah rancangan backend yang diperlukan.

## Konvensi

- Base URL: `/api/v1`
- Format: `application/json; charset=utf-8`
- Waktu: ISO 8601 dengan zona waktu, misalnya `2026-10-12T09:00:00+07:00`.
- Uang: bilangan bulat Rupiah (IDR), tanpa pemisah ribuan.
- ID kendaraan/kota menggunakan slug; ID pemesanan berupa UUID.
- Daftar menggunakan pagination `page` (mulai 1) dan `limit` (default 20, maksimum 100).
- Endpoint privat memakai `Authorization: Bearer <accessToken>`.

## Bentuk respons

Respons sukses berupa resource atau daftar. Respons daftar:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Respons error konsisten:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": [{ "field": "pickupAt", "message": "Waktu penjemputan wajib diisi." }]
  }
}
```

Kode HTTP umum: `200` berhasil, `201` dibuat, `204` berhasil tanpa body, `400` format/parameter salah, `401` belum terautentikasi, `403` tidak berwenang, `404` tidak ditemukan, `409` konflik ketersediaan, `422` validasi gagal, `429` terlalu banyak permintaan, `500` kesalahan server.

## Model resource

### Vehicle

```json
{
  "id": "zenix-hybrid",
  "name": "Toyota Innova Zenix Hybrid",
  "category": "MPV Premium",
  "type": "car",
  "year": 2024,
  "description": "MPV nyaman untuk perjalanan keluarga & dinas bisnis",
  "imageUrl": "https://cdn.example.com/vehicles/zenix.jpg",
  "fallbackImageUrl": "https://cdn.example.com/vehicles/fallback.jpg",
  "seats": 7,
  "transmission": "CVT",
  "fuel": "Hybrid",
  "pricePerDay": 650000,
  "priceUnit": "day",
  "rating": 4.9,
  "tripCount": 184,
  "available": true,
  "supportedRentalTypes": ["self", "driver"]
}
```

`type`: `car` atau `motor`; `priceUnit`: `day` atau `12_hours`. Nilai `category` mengikuti kategori katalog (mis. `City Car`, `Family SUV`, `MPV Premium`, `Mobil Listrik (EV)`, `Sewa Motor`). Harga dan ketersediaan harus berasal dari backend.

### Booking

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

Status: `pending_confirmation`, `confirmed`, `ongoing`, `completed`, `cancelled`, `rejected`. Tarif supir (saat ini UI mengasumsikan Rp200.000/hari) ditentukan dan dikonfirmasi server. Untuk unit yang sudah termasuk sopir, backend tidak menambahkan tarif sopir lagi.

## Endpoint publik

### `GET /locations`

Daftar hub kota untuk pemilih lokasi.

Respons `200`:

```json
{ "data": [
  { "id": "jakarta", "city": "Jakarta", "name": "Area pusat kota", "status": "24 Jam Ready" },
  { "id": "bali", "city": "Bali", "name": "Kuta dan Denpasar", "status": "24 Jam Ready" }
] }
```

### `GET /vehicles`

Daftar armada, pencarian, filter, dan ketersediaan. Query opsional:

| Parameter | Tipe | Keterangan |
|---|---|---|
| `q` | string | Cari nama, deskripsi, kategori, bahan bakar |
| `type` | `car\|motor` | Jenis kendaraan |
| `category` | string | Kategori yang persis, kecuali `Semua` tidak dikirim |
| `cityId` | string | Filter kota |
| `rentalType` | `self\|driver` | Mode sewa |
| `pickupAt`, `returnAt` | datetime | Jika keduanya ada, hanya unit yang tersedia pada rentang itu |
| `page`, `limit` | integer | Pagination |

Contoh: `GET /vehicles?type=car&cityId=jakarta&pickupAt=2026-10-15T09%3A00%3A00%2B07%3A00&returnAt=2026-10-17T09%3A00%3A00%2B07%3A00`.

Respons `200`: bentuk daftar standar dengan elemen `Vehicle`.

### `GET /vehicles/{vehicleId}`

Detail kendaraan dan ketentuan sewanya. `200` mengembalikan `data: Vehicle`; `404` jika ID tidak ada.

### `GET /vehicles/{vehicleId}/availability`

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

### `POST /bookings/quote`

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

Respons `200`: `{ "data": { "available": true, "durationDays": 2, "priceBreakdown": { "vehicleSubtotal": 1300000, "driverSubtotal": 400000, "discount": 0, "total": 1700000, "currency": "IDR" }, "expiresAt": "2026-10-12T08:10:00+07:00" } }`. Respons `409` jika unit tidak tersedia. Quote berumur pendek dan harga final dihitung ulang saat membuat booking.

### `POST /bookings`

Buat permintaan pemesanan. Login tidak wajib untuk alur UI saat ini; backend boleh membuat booking tamu. Gunakan `Idempotency-Key` agar pengulangan permintaan tidak membuat booking ganda.

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

Validasi: semua field wajib; `returnAt` harus setelah `pickupAt`; kendaraan dan kota harus aktif; mode rental harus didukung kendaraan; telepon harus nomor yang dapat dihubungi. Respons `201` mengembalikan Booking status `pending_confirmation`; `409` jika kendaraan baru saja dipesan orang lain. Jangan menerima harga dari klien sebagai sumber kebenaran.

### `GET /bookings/{bookingId}`

Lihat status booking tamu dengan token akses booking (mis. token acak yang dikirim saat booking) atau autentikasi pemilik. Respons `200` mengembalikan Booking; `404` untuk booking/token yang tidak cocok.

### `POST /bookings/{bookingId}/cancel`

Batalkan permintaan booking. Request opsional `{"reason":"Perubahan jadwal"}`. `200` mengembalikan booking terbaru. `409` jika status tidak bisa dibatalkan atau jangka gratis pembatalan sudah lewat.

## Autentikasi dan pengguna

Form login yang ada belum terhubung ke akun. Jika autentikasi akun diaktifkan:

### `POST /auth/login`

Request `{"email":"user@example.com","password":"..."}`. Respons `200`: `{"data":{"accessToken":"...","tokenType":"Bearer","expiresIn":3600,"user":{"id":"...","name":"...","email":"...","role":"customer"}}}`. Gagal `401` untuk kredensial salah.

### `POST /auth/refresh` dan `POST /auth/logout`

Refresh memakai refresh token (disarankan cookie `HttpOnly`, `Secure`, `SameSite`) dan mengembalikan token baru. Logout mencabut sesi; respons `204`.

## Endpoint admin (cakupan README)

Endpoint berikut memerlukan role `admin`; belum ada dashboard admin pada frontend saat ini.

- `GET /admin/dashboard?from=&to=` — ringkasan pemesanan, pendapatan, utilisasi, dan aktivitas.
- `GET /admin/vehicles` — daftar armada termasuk unit nonaktif.
- `POST /admin/vehicles` — tambah kendaraan; `201`.
- `PATCH /admin/vehicles/{vehicleId}` — ubah data/tarif/status kendaraan; `200`.
- `DELETE /admin/vehicles/{vehicleId}` — arsipkan kendaraan; `204`; jangan hapus kendaraan yang punya riwayat booking.
- `POST /admin/vehicles/{vehicleId}/image-upload` — buat URL upload bertanda tangan; setelah unggah, simpan metadata foto ke kendaraan.
- `GET /admin/bookings?status=&from=&to=&page=&limit=` — daftar pemesanan.
- `PATCH /admin/bookings/{bookingId}` — ubah status ke transisi yang diizinkan, mis. `pending_confirmation` → `confirmed` atau `rejected`.
- `GET /admin/customers?page=&limit=` — daftar pelanggan.

Semua aksi admin harus mencatat actor, waktu, dan perubahan status untuk audit.

## Keamanan dan aturan implementasi

- Validasi input dan otorisasi dilakukan server; jangan percaya tarif, total, role, atau status dari browser.
- Password disimpan sebagai hash adaptif; gunakan HTTPS, rate limit login, dan pesan kredensial gagal yang tidak membocorkan akun.
- Lindungi endpoint admin dengan role-based access control. Batasi akses data pribadi dan jangan mencatat password/token/nomor telepon penuh ke log.
- Booking dan penguncian rentang ketersediaan dibuat atomik untuk mencegah double booking.
- Nomor telepon disimpan dalam format E.164; tanggal dikirim ISO 8601 dengan offset zona waktu.
- Gambar kendaraan dilayani melalui URL HTTPS CDN/object storage, bukan payload base64.

## Pemetaan UI saat ini

| Elemen UI | API |
|---|---|
| Hub lokasi | `GET /locations` |
| Pencarian/kategori armada | `GET /vehicles` |
| Pilih kendaraan | `GET /vehicles/{vehicleId}` |
| Form nama, WhatsApp, durasi, sopir | `POST /bookings/quote`, lalu `POST /bookings` |
| Pesan berhasil disiapkan | tampilkan respons `pending_confirmation`, simpan ID/token untuk cek status |
| Login demo | `POST /auth/login` setelah autentikasi benar-benar dibangun |

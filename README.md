SRK-Sistem Rental Kendaraan Project Matakuliah Soft-Dev

Nama Anggota 🫡:

Alfian Wahyu Di Saputra
Juan Stefan Giovani
Arya Fendy Anggriawan
Descriptions: SRK adalah aplikasi berbasis web yang digunakan untuk memudahkan pengguna dalam mencari dan melakukan penyewaan kendaraan secara online. Pengguna dapat melihat daftar kendaraan, mencari dan memfilter kendaraan, melakukan pemesanan, serta melihat riwayat dan status rental. Sementara itu, administrator dapat mengelola data kendaraan, pelanggan, pemesanan rental, serta memantau statistik dan aktivitas melalui dashboard.

Aplikasi ini dilengkapi dengan sistem autentikasi berbasis role, CRUD data kendaraan, pencarian dan filtering, validasi data, dashboard analitik, serta penyimpanan foto kendaraan menggunakan cloud storage.

## CI/CD

- Workflow **CI** menjalankan `npm ci`, ESLint, dan production build pada pull request menuju `main` serta setiap push ke `main`.
- Workflow **CD** membangun aplikasi dan menerbitkan folder `dist` ke GitHub Pages setelah push ke `main`. Workflow ini juga dapat dijalankan manual dari tab **Actions**.
- Untuk deployment pertama, buka **Settings → Pages** pada repository GitHub dan pilih **GitHub Actions** sebagai build and deployment source. Pastikan repository mengizinkan workflow Actions berjalan.
- Base path untuk aset Vite diatur otomatis dari konfigurasi GitHub Pages.

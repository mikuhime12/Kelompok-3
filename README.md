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

## Kredit Foto Armada

Foto kendaraan armada berasal dari Wikimedia Commons. Gambar berlisensi CC BY-SA 4.0/CC BY 4.0 digunakan sesuai ketentuan lisensinya; gambar CC0 didedikasikan ke domain publik.

| Kendaraan | Foto | Kontributor | Lisensi |
|---|---|---|---|
| Toyota Avanza | [2022 Toyota Avanza (PH)](https://commons.wikimedia.org/wiki/File:2022_Toyota_Avanza_%28PH%29.jpg) | Ethan Llamas | CC BY-SA 4.0 |
| Honda Brio Satya | [2023 Honda Brio Satya](https://commons.wikimedia.org/wiki/File:2023_Honda_Brio_Satya_1.2_E_in_Rallye_Red_%28Front%29.png) | MoCars | CC0 |
| Mitsubishi Xpander | [2021 Mitsubishi Xpander Ultimate Indonesia](https://commons.wikimedia.org/wiki/File:2021_Mitsubishi_Xpander_Ultimate_%28Indonesia%29_front_view.jpg) | Andra Febrian | CC BY-SA 4.0 |
| Toyota Innova Zenix | [Toyota Innova Zenix 2.0 V 2023](https://commons.wikimedia.org/wiki/File:Toyota_%28Innova%29_Zenix_2.0_V_2023_%281%29.jpg) | Ethan Llamas | CC BY-SA 4.0 |
| Toyota Rush | [2024 Toyota Rush GR Sport Indonesia](https://commons.wikimedia.org/wiki/File:2024_Toyota_Rush_GR_Sport_%28Indonesia%29_front_view.jpg) | Andra Febrian | CC0 |
| Honda BeAT | [2019 Honda BeAT eSP CBS 110](https://commons.wikimedia.org/wiki/File:2019_Honda_BeAT_eSP_CBS_110_%2820200623%29.jpg) | オーバードライブ83 | CC BY-SA 4.0 |
| Honda Vario 160 | [2022 Honda Vario 160 ABS](https://commons.wikimedia.org/wiki/File:2022_Honda_Vario_160_ABS_%2820221105%29.jpg) | オーバードライブ83 | CC BY-SA 4.0 |
| Honda PCX 160 | [Honda PCX 160 (Indonesia, 2025)](https://commons.wikimedia.org/wiki/File:Honda_PCX_160_%285th_model%29_%28Indonesian_%26_East_Timorese_specific-market%29_in_Indonesia_%28February_2025%29_00.jpg) | Firzafp | CC BY 4.0 |
| Yamaha NMAX 155 | [2025 Yamaha NMAX 155 Standard](https://commons.wikimedia.org/wiki/File:2025_Yamaha_NMAX_155_Standard.jpg) | Chanokchon | CC BY-SA 4.0 |
| Yamaha Aerox 155 | [2021 Yamaha Aerox 155 ABS](https://commons.wikimedia.org/wiki/File:2021_Yamaha_Aerox_155_ABS.jpg) | Chanokchon | CC BY-SA 4.0 |
| Wuling Air ev | [2022 Wuling Air EV, Central Surabaya](https://commons.wikimedia.org/wiki/File:2022_Wuling_Air_EV%2C_Central_Surabaya.jpg) | Alex Neman | CC BY-SA 4.0 |
| BYD Atto 3 | [BYD Atto 3](https://commons.wikimedia.org/wiki/File:BYD_Atto_3_1X7A6494.jpg) | Alexander Migl | CC BY-SA 4.0 |
| Hyundai IONIQ 5 | [Hyundai Ioniq 5](https://commons.wikimedia.org/wiki/File:Hyundai_Ioniq_5.jpg) | TTTNIS | CC0 |

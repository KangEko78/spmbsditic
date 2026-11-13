# SPMB SDIT Insan Cendikia Kalibaru

Frontend memakai React 19, TypeScript, dan Vite. Berkas `vercel.json` mengatur build Vite, hasil build `dist`, dan rute SPA. Desain dan aset visual situs dipertahankan.

## Arsitektur yang disiapkan

- Browser memakai API dengan alamat `/api/...` dan token sesi sementara di `sessionStorage`.
- Fungsi Vercel di `api/[...path].ts` meneruskan permintaan ke Web App Google Apps Script. Rahasia API hanya berada di environment server Vercel.
- `Code.gs` menyimpan data aplikasi pada tab `APP_DATA` di spreadsheet yang diberikan. Pendaftar juga disalin ke tab `DATA_PENDAFTAR_SPMB` untuk ekspor dan rekap.
- Login admin menggunakan kata sandi yang di-hash dengan salt acak. Tidak ada akun atau kata sandi bawaan di proyek. Admin awal dibuat sendiri melalui fungsi pemasangan Apps Script.
- Data contoh pendaftar dan file database yang berisi informasi pribadi/hash lama tidak disertakan.

Backend menangani alur utama seperti login admin, inisialisasi konten awal, pendaftaran baru, pemeriksaan status berdasarkan nomor pendaftaran dan tanggal lahir, perubahan status/penilaian/daftar ulang, daftar isi CMS, pengaturan, gelombang, tahapan, pengelolaan akun dasar, dan sinkronisasi spreadsheet. Pemulihan kata sandi otomatis belum disediakan; administrator utama dapat mereset kata sandi petugas. Reset data demo dinonaktifkan untuk melindungi data. Berkas unggahan disimpan bersama data aplikasi di spreadsheet, dengan batas ukuran payload sekitar 3,5 MB; belum ada penyimpanan file terpisah seperti Google Drive.

## Memasang Apps Script

1. Masuk ke spreadsheet dengan ID `1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM` menggunakan akun yang memiliki akses editor.
2. Pilih **Ekstensi → Apps Script**. Ganti isi `Code.gs` dengan file `Code.gs` dari proyek, lalu simpan.
3. Jalankan fungsi `setBackendSecret`. Buat rahasia acak minimal 32 karakter menggunakan password manager. Masukkan nilai yang sama nanti ke environment Vercel. Rahasia tidak ditanam di kode atau frontend.
4. Jalankan `initializeFirstAdmin`. Masukkan username dan kata sandi admin pilihan Anda (minimal 10 karakter) saat diminta. Kata sandi hanya disimpan sebagai hash bersalt.
5. Pilih **Deploy → New deployment → Web app**. Pilih **Execute as: Me** dan akses **Anyone**. Permintaan API harus melewati fungsi Vercel yang memeriksa rahasia backend; jangan membagikan URL Apps Script beserta rahasia API.
6. Deploy dan izinkan akses spreadsheet yang diminta Google. Salin URL Web App yang berakhiran `/exec`.

> Fungsi `initializeFirstAdmin` hanya membuat admin utama pertama. Jangan menghapus tab `APP_DATA` setelah sistem mulai dipakai karena tab tersebut menyimpan data utama aplikasi.

## Menyiapkan di Vercel

1. Unggah folder proyek ini ke repositori GitHub yang Anda miliki. Jangan memasukkan `.env.local`, kata sandi, atau rahasia API ke repositori.
2. Di Vercel pilih **Add New → Project**, lalu impor repositori tersebut. Pilih folder proyek yang berisi `package.json` dan `vercel.json` sebagai root.
3. Tambahkan dua environment variable server berikut pada **Settings → Environment Variables**:
   - `GAS_WEB_APP_URL`: URL Web App Apps Script berakhiran `/exec`.
   - `GAS_API_SECRET`: rahasia yang sama dengan yang dimasukkan melalui `setBackendSecret`.
4. Pilih Node.js 20.19+ atau 22.12+, build command `npm run build`, dan output `dist`. Deploy ulang setelah menambahkan environment variables.
5. Setelah admin masuk, buka **Pengaturan → Google Sheet (Apps Script)**, masukkan URL Web App, lalu simpan. Ini mengaktifkan tombol sinkronisasi pada panel; URL yang dipakai backend tetap berasal dari environment Vercel.
6. Uji situs publik, pendaftaran, cek status, login admin, lalu perubahan status dari admin. Pastikan baris muncul pada `APP_DATA` dan rekap pendaftar muncul pada `DATA_PENDAFTAR_SPMB`.

> Jangan menganggap build Vercel saja sebagai bukti integrasi berhasil. Periksa alur tulis dan baca data setelah memasang Apps Script dan mengisi environment Vercel.

## Menjalankan build lokal

Memerlukan Node.js 20.19+ atau 22.12+ dan npm:

```sh
npm install
npm run build
npm run preview
```

Frontend sudah berhasil dibangun dan diterbitkan Vercel dari branch `main` (commit `048684c`). Build Vercel juga mencatat diagnostik TypeScript `Cannot find type definition file for 'vite/client'`; periksa kembali konfigurasi tipe jika menjalankan pemeriksaan TypeScript terpisah.

> Apps Script belum berisi kode proyek atau deployment Web App, dan `GAS_WEB_APP_URL` serta `GAS_API_SECRET` belum diatur di Vercel. Karena itu, alur pendaftaran, pemeriksaan status, dan panel admin belum siap digunakan. Deployment Vercel juga masih memakai perlindungan SSO bawaan tim.

> Penyelesaian backend memerlukan pemasangan `Code.gs` ke Apps Script, penyetelan rahasia API dan akun admin, lalu deployment sebagai Web App. Setelah URL `/exec` tersedia, masukkan URL dan rahasia ke environment Vercel, lalu deploy ulang. Jangan kirim rahasia API lewat chat atau simpan di repositori.

## Pemeriksaan keamanan arsip

Arsip awal berisi konfigurasi browser Firebase, data contoh pendaftar, hash kata sandi, dan jalur login demo. Data pendaftar, database lokal, pintasan login, dan kata sandi bawaan sudah dihapus dari salinan proyek. Konfigurasi Firebase browser adalah pengenal klien, bukan kredensial akun layanan; aturan akses Firebase tetap harus dibatasi jika konfigurasi itu masih digunakan. ZIP awal tidak diubah.

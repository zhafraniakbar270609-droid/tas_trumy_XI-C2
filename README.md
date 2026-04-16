# Trumy Buita - Web App Mobile View

Prototipe web app mobile untuk Trumy Buita dengan menu navigasi bottom.

## Struktur File
- `index.html` - Halaman utama
- `CSS/style.css` - Styling
- `JS/app.js` - Logika interaksi
- `DATA/tabel produk_rows.json` - Data produk
- `DATA/tabel_mitra_rows.json` - Data mitra
- `DATA/IMAGES/` - Folder untuk gambar produk
- `download_images.js` - Script Node.js untuk download gambar
- `download_images.ps1` - Script PowerShell untuk download gambar

## Cara Menampilkan Gambar
Gambar produk sekarang menggunakan path lokal di folder `DATA/IMAGES/`. Script download sudah tersedia untuk mengunduh gambar dari Google Drive.

### Menggunakan Script Download:
1. Jalankan script download untuk mengunduh semua gambar:
   ```powershell
   powershell -ExecutionPolicy Bypass -File download_images.ps1
   ```
   atau
   ```bash
   node download_images.js
   ```

2. Script akan mengunduh gambar ke folder `DATA/IMAGES/` dengan nama file berdasarkan nama produk.

### Menambahkan Gambar Manual:
1. Unduh gambar produk dari Google Drive atau sumber lain
2. Simpan di folder `DATA/IMAGES/` dengan nama file sesuai pola: `nama_produk.jpg` (lowercase, spasi diganti underscore)
3. Pastikan nama file sesuai dengan yang diharapkan aplikasi

### Jika Gambar Tidak Ada:
Aplikasi akan otomatis menampilkan gambar dari Google Drive sebagai fallback.

## Menjalankan Aplikasi
Buka `index.html` di browser web. Untuk fetch data JSON, gunakan server lokal seperti:
- Live Server extension di VS Code
- `python -m http.server` di terminal
- Atau server web lainnya

## Fitur
- Home: Banner, search, list produk populer, tabel produk lengkap
- Keranjang: Sistem keranjang belanja dengan localStorage
- Riwayat: Halaman riwayat pemesanan (placeholder)
- Profil: Halaman profil pengguna
- Bottom navigation untuk berpindah halaman
- Modal untuk detail produk/mitra
- Tabel produk interaktif dengan gambar yang bisa diklik
- Sistem keranjang dengan badge notifikasi
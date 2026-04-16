# Trumy Buita - Web App Mobile View

Prototipe web app mobile untuk Trumy Buita dengan menu navigasi bottom.

## Struktur File
- `index.html` - Halaman utama
- `CSS/style.css` - Styling
- `JS/app.js` - Logika interaksi
- `DATA/tabel produk_rows.json` - Data produk
- `DATA/tabel_mitra_rows.json` - Data mitra
- `DATA/IMAGES/` - Folder untuk gambar produk (kosong untuk sekarang)

## Cara Menampilkan Gambar
Gambar produk sekarang menggunakan path lokal di folder `DATA/IMAGES/`.

### Menambahkan Gambar Produk:
1. Unduh gambar produk dari Google Drive atau sumber lain
2. Simpan di folder `DATA/IMAGES/` dengan nama file sesuai data JSON (misal `creamy_latte.jpg`)
3. Pastikan nama file sesuai dengan yang ada di `produk_image` di JSON

### Jika Gambar Tidak Ada:
Aplikasi akan otomatis menampilkan placeholder dengan nama produk menggunakan Via Placeholder.

## Menjalankan Aplikasi
Buka `index.html` di browser web. Untuk fetch data JSON, gunakan server lokal seperti:
- Live Server extension di VS Code
- `python -m http.server` di terminal
- Atau server web lainnya

## Fitur
- Home: Banner, search, list produk populer
- Mitra: List mitra dengan detail
- Produk: Grid/list view dengan filter kategori
- Akun: Login sederhana dengan penyimpanan localStorage
- Bottom navigation untuk berpindah halaman
- Modal untuk detail produk/mitra

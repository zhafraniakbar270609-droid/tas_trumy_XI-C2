const fs = require('fs');
const https = require('https');
const path = require('path');

// Baca data produk
const products = JSON.parse(fs.readFileSync('DATA/tabel produk_rows.json', 'utf8'));

// Fungsi untuk mendapatkan URL gambar langsung dari Google Drive sharing URL
function getDirectImageUrl(sharingUrl) {
  if (!sharingUrl) return null;

  const driveIdMatch = sharingUrl.match(/\/d\/([a-zA-Z0-9-_]+)/) || sharingUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (driveIdMatch) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return sharingUrl;
}

// Fungsi untuk download gambar
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Fungsi utama
async function downloadAllImages() {
  const imagesDir = 'DATA/IMAGES/';

  // Pastikan folder ada
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log('Memulai download gambar produk...');

  for (const product of products) {
    const imageUrl = getDirectImageUrl(product.produk_image);
    if (!imageUrl) {
      console.log(`Skip ${product.produk_name}: URL tidak valid`);
      continue;
    }

    // Buat nama file dari produk_name, ganti spasi dengan underscore dan lowercase
    const filename = product.produk_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.jpg';
    const filepath = path.join(imagesDir, filename);

    try {
      await downloadImage(imageUrl, filepath);
    } catch (error) {
      console.error(`Error downloading ${product.produk_name}: ${error.message}`);
    }

    // Delay kecil untuk menghindari rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Selesai download semua gambar!');
}

// Jalankan script
downloadAllImages().catch(console.error);
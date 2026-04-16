# Script PowerShell untuk mendownload gambar produk dari Google Drive

# Baca data produk
$jsonPath = "DATA\tabel produk_rows.json"
$products = Get-Content $jsonPath | ConvertFrom-Json

# Fungsi untuk mendapatkan URL gambar langsung
function Get-DirectImageUrl {
    param([string]$sharingUrl)

    if (-not $sharingUrl) { return $null }

    $driveIdMatch = $sharingUrl | Select-String -Pattern "/d/([a-zA-Z0-9-_]+)" -AllMatches
    if ($driveIdMatch.Matches.Count -gt 0) {
        $driveId = $driveIdMatch.Matches[0].Groups[1].Value
        return "https://lh3.googleusercontent.com/d/$driveId"
    }

    $idMatch = $sharingUrl | Select-String -Pattern "[?&]id=([a-zA-Z0-9-_]+)" -AllMatches
    if ($idMatch.Matches.Count -gt 0) {
        $driveId = $idMatch.Matches[0].Groups[1].Value
        return "https://lh3.googleusercontent.com/d/$driveId"
    }

    return $sharingUrl
}

# Fungsi untuk download gambar
function Download-Image {
    param([string]$url, [string]$filename)

    try {
        Invoke-WebRequest -Uri $url -OutFile $filename -TimeoutSec 30
        Write-Host "Downloaded: $filename"
    }
    catch {
        Write-Host "Error downloading $filename : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fungsi utama
function Download-AllImages {
    $imagesDir = "DATA\IMAGES\"

    # Pastikan folder ada
    if (-not (Test-Path $imagesDir)) {
        New-Item -ItemType Directory -Path $imagesDir -Force
    }

    Write-Host "Memulai download gambar produk..." -ForegroundColor Green

    foreach ($product in $products) {
        $imageUrl = Get-DirectImageUrl $product.produk_image
        if (-not $imageUrl) {
            Write-Host "Skip $($product.produk_name): URL tidak valid" -ForegroundColor Yellow
            continue
        }

        # Buat nama file dari produk_name
        $filename = $product.produk_name.ToLower().Replace(' ', '_').Replace('[^a-z0-9_]', '') + '.jpg'
        $filepath = Join-Path $imagesDir $filename

        Download-Image $imageUrl $filepath

        # Delay kecil
        Start-Sleep -Milliseconds 1000
    }

    Write-Host "Selesai download semua gambar!" -ForegroundColor Green
}

# Jalankan script
Download-AllImages
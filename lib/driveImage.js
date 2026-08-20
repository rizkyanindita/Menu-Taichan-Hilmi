// Semua gambar menu disimpan sebagai link Google Drive. Link "share" maupun
// endpoint drive.google.com/thumbnail bukan CDN gambar: keduanya menjawab
// dengan 302 ke lh3.googleusercontent.com, mengirim Cache-Control privat, dan
// dibatasi rate per-file — jadi puluhan kartu menu yang memuat serentak
// membayar redirect + koneksi baru satu per satu, dan sebagian kena 429.
//
// lh3.googleusercontent.com/d/<id> adalah host akhir yang sama, tapi dilayani
// langsung tanpa redirect dan dari edge CDN Google. Itulah URL yang kita pakai
// sebagai sumber, lalu next/image yang mengambilnya sekali dan menyajikan
// ulang hasil WebP/AVIF dari CDN Vercel ke semua pengunjung.
const DRIVE_ID_PATTERNS = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /drive\.google\.com\/thumbnail\?(?:[^#]*&)?id=([a-zA-Z0-9_-]{10,})/,
    /drive\.google\.com\/(?:uc|open)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]{10,})/,
    /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]{10,})/,
    /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/,
];

export function extractDriveId(url) {
    if (!url || typeof url !== "string") return null;
    for (const pattern of DRIVE_ID_PATTERNS) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Ubah link Drive apa pun jadi URL gambar langsung.
 * `width` diminta ke Google supaya byte yang dikirim sepadan dengan slot di
 * layar — thumbnail 88px tidak perlu mengunduh gambar 1000px.
 */
export function driveImageUrl(url, width = 800) {
    const id = extractDriveId(url);
    if (!id) return url;
    return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

export function isDriveUrl(url) {
    return extractDriveId(url) !== null;
}

// ── Ukuran tetap, bukan srcset responsif ─────────────────────────────────────
// Sebelumnya tiap gambar memakai `sizes` responsif, sehingga satu foto melahirkan
// 8 lebar berbeda (96/128/180/256/384/420/640/828/1080). Tiap lebar adalah entri
// cache tersendiri di Vercel: kartu grid memanaskan w=420, lalu modal meminta
// w=828 dari URL sumber yang lain lagi — nol reuse, jadi setiap klik pertama
// membayar fetch ke Google + transcode AVIF dari nol.
//
// Slot di UI sebenarnya sempit dan sudah diketahui persis, jadi kita pin satu
// lebar per konteks. Efeknya: 3 varian per foto (bukan 8+), dan placeholder
// modal dijamin memakai URL yang identik dengan yang sudah diunduh kartu —
// artinya cache hit, tampil seketika.
//
// Lebar w harus salah satu dari images.imageSizes/deviceSizes di next.config.js.
const TIERS = {
    // thumbnail daftar 88px CSS → 180px cukup sampai DPR 2
    list: { source: 360, w: 180, q: 70 },
    // kartu grid maksimal ~240px CSS
    grid: { source: 768, w: 384, q: 70 },
    // modal maksimal 520px CSS, rasio 16/9
    detail: { source: 1000, w: 828, q: 60 },
};

/**
 * URL final yang dipakai <img>: sumber Drive langsung, dilewatkan optimizer
 * Next supaya disajikan sebagai AVIF dari CDN Vercel.
 * Dibangun manual (bukan lewat komponen next/image) supaya URL-nya deterministik
 * — itu syarat agar prefetch dan placeholder benar-benar mengenai entri cache
 * yang sama, bukan sekadar mirip.
 */
export function menuImageSrc(url, tier = "grid") {
    if (!url) return null;
    const { source, w, q } = TIERS[tier] || TIERS.grid;
    const src = driveImageUrl(url, source);
    if (!src) return null;
    return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}`;
}

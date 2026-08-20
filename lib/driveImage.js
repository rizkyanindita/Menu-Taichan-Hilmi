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

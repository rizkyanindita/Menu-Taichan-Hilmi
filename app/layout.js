import "./globals.css";

export const metadata = {
    title: "QR Menu App",
    description: "Order food with ease",
    manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen flex flex-col">
                <div className="flex-1">{children}</div>
                <footer className="py-6 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-100">
                    {/* Menggunakan space-y-1 agar teks atas tetap rapat */}
                    <div className="space-y-1">
                        <p className="font-medium text-gray-600">Tertarik dengan aplikasi ini?</p>
                        <p>Klik tombol di bawah untuk bertanya:</p>
                    </div>

                    {/* mb-6 memberikan ruang yang cukup namun tidak berlebihan */}
                    <a
                        href="https://wa.me/6287766633400"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 mb-6 px-5 py-2 bg-[#25D366] text-white rounded-full font-bold text-xs shadow-sm hover:bg-[#128C7E] transition-colors"
                    >
                        Tanya Rizky di WhatsApp
                    </a>

                    {/* Kredit dibuat lebih kecil dan rapat */}
                    <p className="text-[10px] text-gray-400">
                        Powered by Rizky Anindita
                    </p>
                </footer>
            </body>
        </html>
    );
}

import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThemeToggle from "@/components/ThemeToggle";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-jakarta",
    display: "swap",
});

export const metadata = {
    title: "QR Menu App",
    description: "Order food with ease",
    manifest: "/manifest.json",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={jakarta.variable} suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
                    }}
                />
            </head>
            <body className={`antialiased min-h-screen flex flex-col font-jakarta bg-background text-foreground`}>
                <div
                    className="fixed right-4 z-50"
                    style={{ top: "max(1rem, calc(env(safe-area-inset-top) + 0.5rem))" }}
                >
                    <ThemeToggle />
                </div>

                <div className="flex-1">{children}</div>

                <footer className="relative animate-fadeIn border-t border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.03] overflow-hidden">
                    {/* Aksen warna memakai gradient CSS biasa, bukan blur filter —
                        blur besar mahal di HP low-end dan footer ikut ter-render di tiap halaman. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(ellipse 480px 220px at 50% 0%, rgba(255,87,34,0.10), transparent 70%)",
                        }}
                    />

                    {/* Padding bawah besar: tombol "Buka semua menu" melayang di
                        pojok kanan bawah dan tidak boleh menutupi CTA di sini. */}
                    <div
                        className="relative px-4 pt-10 text-center"
                        style={{ paddingBottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5rem))" }}
                    >
                        <div className="max-w-sm mx-auto">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200/70 dark:border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Menu Digital
                            </span>

                            <h2 className="mt-4 text-[19px] sm:text-[21px] font-black tracking-tight text-gray-900 dark:text-gray-100 leading-snug">
                                Mau menu digital seperti ini
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> untuk usahamu?</span>
                            </h2>
                            <p className="mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
                                Tanya langsung lewat WhatsApp, atau lihat karya lain developer-nya.
                            </p>

                            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-2.5">
                                <a
                                    href="https://wa.me/6287766633400"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center justify-center gap-2 h-12 px-5 bg-[#25D366] text-white rounded-2xl font-bold text-[13px] shadow-sm shadow-[#25D366]/25 hover:shadow-lg hover:shadow-[#25D366]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                                    >
                                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38c1.45.79 3.08 1.21 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91.01-5.46-4.44-9.92-9.91-9.92zm5.83 14.02c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.99.88 2.13.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.45.12.61-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z" />
                                    </svg>
                                    Tanya via WhatsApp
                                </a>

                                <a
                                    href="https://porto-beta-three.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center justify-center gap-2 h-12 px-5 rounded-2xl font-bold text-[13px] bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    Link Developer
                                    <span className="opacity-50 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                                </a>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-3">
                                <span className="h-px w-10 bg-gradient-to-r from-transparent to-gray-200 dark:to-white/10" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600">
                                    Powered by Rizky Anindita
                                </p>
                                <span className="h-px w-10 bg-gradient-to-l from-transparent to-gray-200 dark:to-white/10" />
                            </div>
                        </div>
                    </div>
                </footer>

                <Analytics />
            </body>
        </html>
    );
}

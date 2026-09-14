import { TrendingUp, ShoppingBag, Lock } from "lucide-react";

export default function Insights() {
  return (
    // self-start: cegah grid menyamakan tinggi kartu ini dengan MenuManager
    // di sebelahnya — tanpa ini, kartu (dan overlay "Not Available" di
    // dalamnya) ikut melar/menyusut tiap MenuManager berubah tinggi (buka
    // form tambah, ganti halaman, dst), jadi badge-nya kelihatan "loncat".
    <div className="relative self-start">
      {/* ── Disabled Content (greyed out) ── */}
      <section
        className="
                relative overflow-hidden
                rounded-3xl border border-gray-100 dark:border-white/10
                bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl
                p-4 sm:p-6
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                opacity-70 pointer-events-none select-none
            "
      >
        {/* Header */}
        <div className="mb-5 sm:mb-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            Daily Insights
          </h2>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Today</span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Revenue */}
          <div
            className="
                        group relative overflow-hidden
                        rounded-2xl border border-blue-100 dark:border-blue-500/20
                        bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-500/10 dark:to-blue-500/5
                        p-4 sm:p-5
                    "
          >
            <div className="absolute right-4 top-4 opacity-10">
              <TrendingUp className="h-12 w-12 text-blue-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Pendapatan
              </p>
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200">
              Rp 100.000.000
            </p>
          </div>

          {/* Orders */}
          <div
            className="
                        group relative overflow-hidden
                        rounded-2xl border border-purple-100 dark:border-purple-500/20
                        bg-gradient-to-br from-purple-50 to-purple-100/60 dark:from-purple-500/10 dark:to-purple-500/5
                        p-4 sm:p-5
                    "
          >
            <div className="absolute right-4 top-4 opacity-10">
              <ShoppingBag className="h-12 w-12 text-purple-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                Total Orders
              </p>
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-200">
              45
            </p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div
          className="
                    mt-6 flex h-44 sm:h-52 lg:h-60
                    items-center justify-center rounded-2xl
                    border border-dashed border-gray-200 dark:border-white/10
                    bg-gradient-to-br from-gray-50 to-gray-100/60 dark:from-white/[0.03] dark:to-white/[0.02]
                    text-sm sm:text-base text-gray-400 dark:text-gray-500
                "
        >
          Chart Visualization
        </div>
      </section>

      {/* ── "Not Available" Overlay ── */}
      <div
        className="
                absolute inset-0
                rounded-3xl
                flex flex-col items-center justify-center
                gap-3
                bg-white/10 dark:bg-black/20
                cursor-not-allowed
            "
      >
        {/* Lock Badge */}
        <div
          className="
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-gray-800/90
                    shadow-xl
                "
        >
          <Lock className="h-7 w-7 text-white" />
        </div>

        {/* Label */}
        <p className="text-2xl sm:text-3xl font-black tracking-widest text-gray-700 dark:text-gray-300 uppercase">
          Not Available
        </p>

        {/* Sub-label */}
        <a
          href="https://wa.me/6287766633400"
          target="_blank"
          rel="noopener noreferrer"
          className="
                    pointer-events-auto cursor-pointer
                    text-xs font-semibold tracking-widest uppercase
                    text-white bg-gray-500 hover:bg-gray-600
                    px-4 py-1.5 rounded-full
                    transition-colors
                "
        >
          Upgrade to Access
        </a>
      </div>
    </div>
  );
}

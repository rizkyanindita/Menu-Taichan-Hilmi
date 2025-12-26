import { TrendingUp, ShoppingBag } from "lucide-react";

export default function Insights() {
    return (
        <section className="
      relative overflow-hidden
      rounded-3xl border border-gray-100
      bg-white/80 backdrop-blur-xl
      p-4 sm:p-6
      shadow-[0_10px_30px_rgba(0,0,0,0.06)]
    ">
            {/* Header */}
            <div className="mb-5 sm:mb-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Daily Insights
                </h2>
                <span className="text-xs font-semibold text-gray-500">
                    Today
                </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Revenue */}
                <div className="
          group relative overflow-hidden
          rounded-2xl border border-blue-100
          bg-gradient-to-br from-blue-50 to-blue-100/60
          p-4 sm:p-5
          transition-all duration-300
          hover:-translate-y-0.5 hover:shadow-lg
        ">
                    <div className="absolute right-4 top-4 opacity-10">
                        <TrendingUp className="h-12 w-12 text-blue-500" />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-blue-500/10 text-blue-600
            ">
                            <TrendingUp className="h-5 w-5" />
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-blue-700">
                            Total Pendapatan
                        </p>
                    </div>

                    <p className="mt-3 text-xl sm:text-2xl font-bold text-blue-900">
                        Rp 100.000.000
                    </p>
                </div>

                {/* Orders */}
                <div className="
          group relative overflow-hidden
          rounded-2xl border border-purple-100
          bg-gradient-to-br from-purple-50 to-purple-100/60
          p-4 sm:p-5
          transition-all duration-300
          hover:-translate-y-0.5 hover:shadow-lg
        ">
                    <div className="absolute right-4 top-4 opacity-10">
                        <ShoppingBag className="h-12 w-12 text-purple-500" />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-purple-500/10 text-purple-600
            ">
                            <ShoppingBag className="h-5 w-5" />
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-purple-700">
                            Total Orders
                        </p>
                    </div>

                    <p className="mt-3 text-xl sm:text-2xl font-bold text-purple-900">
                        45
                    </p>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="
        mt-6
        flex h-44 sm:h-52 lg:h-60
        items-center justify-center
        rounded-2xl
        border border-dashed border-gray-200
        bg-gradient-to-br from-gray-50 to-gray-100/60
        text-sm sm:text-base text-gray-400
      ">
                Chart Visualization
            </div>
        </section>
    );
}

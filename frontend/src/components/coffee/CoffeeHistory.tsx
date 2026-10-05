import React from 'react';
import { useCoffee } from '../../context/CoffeeContext';

export const CoffeeHistory: React.FC = () => {
    const { orderHistory, reorder, clearHistory, stats } = useCoffee();

    const CAFFEINE_LIMIT_MG = 400;
    const caffeinePercentage = Math.min(
        Math.round((stats.caffeineTodayMg / CAFFEINE_LIMIT_MG) * 100),
        100
    );

    return (
        <div className="space-y-6">
            {/* Daily Energy & Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        ☕ Today&apos;s Fuel
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                        {stats.cupsToday} <span className="text-xs font-medium text-stone-500">cups</span>
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        All-time orders: {stats.totalOrdersAllTime}
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        ⚡ Caffeine Meter
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                        {stats.caffeineTodayMg}{' '}
                        <span className="text-xs font-medium text-stone-500">/ 400 mg</span>
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                caffeinePercentage > 85
                                    ? 'bg-red-500'
                                    : caffeinePercentage > 50
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                            }`}
                            style={{ width: `${caffeinePercentage}%` }}
                        />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        🎁 Team Kudos Given
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                        {stats.kudosSentCount}{' '}
                        <span className="text-xs font-medium text-stone-500">gifts</span>
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Team morale boosted 🚀
                    </p>
                </div>
            </div>

            {/* Past Orders List */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                        <span>📜 Recent Orders & Re-order</span>
                        <span className="text-xs font-normal text-stone-500">
                            ({orderHistory.length} recorded)
                        </span>
                    </h4>
                    {orderHistory.length > 0 && (
                        <button
                            type="button"
                            onClick={clearHistory}
                            className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium cursor-pointer"
                        >
                            Clear History
                        </button>
                    )}
                </div>

                {orderHistory.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 dark:text-stone-500">
                        <span className="text-4xl block mb-2">☕</span>
                        <p className="text-sm font-medium">No coffee orders yet today!</p>
                        <p className="text-xs mt-1">
                            Browse the menu above and brew your first cup to boost sprint velocity.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800 space-y-2">
                        {orderHistory.map((order) => {
                            const date = new Date(order.orderedAt);
                            const formattedTime = date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={order.id}
                                    className="pt-2 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 p-2 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/40">
                                            {order.item.icon}
                                        </span>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                                    {order.item.name}
                                                </p>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                                                    {order.customization.size}
                                                </span>
                                                {order.recipient && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                                                        To: {order.recipient}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                                {formattedTime} • {order.customization.milk} • {order.customization.sugar}
                                                {order.customization.extraShots !== 'None' && ` • ${order.customization.extraShots}`}
                                            </p>
                                            {order.kudosMessage && (
                                                <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                                                    &ldquo;{order.kudosMessage}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => reorder(order)}
                                        className="px-3 py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600 text-amber-700 hover:text-white dark:text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                                        title="Re-order same recipe"
                                    >
                                        <span>🔁 Re-order</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoffeeHistory;

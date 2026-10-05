import React, { useState, useMemo } from 'react';
import { useCoffee } from '../../context/CoffeeContext';
import type { CoffeeCategory } from '../../types/coffee';

type OrderCategoryFilter = CoffeeCategory | 'all' | 'gifts';
type OrderSortOption = 'newest' | 'oldest' | 'caffeine-desc' | 'name-asc';
type OrderTimeFilter = 'all' | 'today';

export const CoffeeHistory: React.FC = () => {
    const { orderHistory, reorder, clearHistory, stats } = useCoffee();

    // Filter & Sort state for orders
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<OrderCategoryFilter>('all');
    const [timeFilter, setTimeFilter] = useState<OrderTimeFilter>('all');
    const [sortBy, setSortBy] = useState<OrderSortOption>('newest');

    const CAFFEINE_LIMIT_MG = 400;
    const caffeinePercentage = Math.min(
        Math.round((stats.caffeineTodayMg / CAFFEINE_LIMIT_MG) * 100),
        100
    );

    const hasActiveFilters =
        Boolean(searchQuery.trim()) ||
        categoryFilter !== 'all' ||
        timeFilter !== 'all' ||
        sortBy !== 'newest';

    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setTimeFilter('all');
        setSortBy('newest');
    };

    // Filter and sort order history
    const filteredAndSortedOrders = useMemo(() => {
        return orderHistory
            .filter((order) => {
                // Category / Gifts filter
                if (categoryFilter === 'gifts') {
                    if (!order.recipient) return false;
                } else if (categoryFilter !== 'all') {
                    if (order.item.category !== categoryFilter) return false;
                }

                // Time filter
                if (timeFilter === 'today') {
                    const orderDate = new Date(order.orderedAt);
                    const today = new Date();
                    const isSameDay =
                        orderDate.getDate() === today.getDate() &&
                        orderDate.getMonth() === today.getMonth() &&
                        orderDate.getFullYear() === today.getFullYear();
                    if (!isSameDay) return false;
                }

                // Search query
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchName = order.item.name.toLowerCase().includes(q);
                    const matchArabic = order.item.arabicName?.toLowerCase().includes(q);
                    const matchRecipient = order.recipient?.toLowerCase().includes(q);
                    const matchKudos = order.kudosMessage?.toLowerCase().includes(q);
                    const matchMilk = order.customization.milk.toLowerCase().includes(q);
                    const matchSize = order.customization.size.toLowerCase().includes(q);
                    const matchNotes = order.customization.specialNotes?.toLowerCase().includes(q);

                    if (
                        !matchName &&
                        !matchArabic &&
                        !matchRecipient &&
                        !matchKudos &&
                        !matchMilk &&
                        !matchSize &&
                        !matchNotes
                    ) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
                }
                if (sortBy === 'oldest') {
                    return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime();
                }
                if (sortBy === 'caffeine-desc') {
                    return (b.caffeineMg || 0) - (a.caffeineMg || 0);
                }
                if (sortBy === 'name-asc') {
                    return a.item.name.localeCompare(b.item.name);
                }
                return 0;
            });
    }, [orderHistory, categoryFilter, timeFilter, searchQuery, sortBy]);

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

            {/* Past Orders Section */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                            <span>📜 Order History & Filtering</span>
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                            {filteredAndSortedOrders.length} of {orderHistory.length}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                        {orderHistory.length > 0 && (
                            <button
                                type="button"
                                onClick={clearHistory}
                                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium cursor-pointer ml-2"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Orders Filter Toolbar */}
                {orderHistory.length > 0 && (
                    <div className="space-y-3 pt-1 border-t border-stone-100 dark:border-stone-800">
                        {/* Search & Sort Controls */}
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="relative flex-1 w-full">
                                <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Filter orders by drink, recipient, notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs cursor-pointer"
                                        title="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Sort & Time Controls */}
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <select
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value as OrderTimeFilter)}
                                    className="text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                    title="Filter timeframe"
                                >
                                    <option value="all">📅 All Time</option>
                                    <option value="today">⚡ Today Only</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as OrderSortOption)}
                                    className="text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                    title="Sort orders"
                                >
                                    <option value="newest">🕒 Newest First</option>
                                    <option value="oldest">⏳ Oldest First</option>
                                    <option value="caffeine-desc">⚡ Most Caffeine</option>
                                    <option value="name-asc">🔤 Name (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                            {(
                                [
                                    { id: 'all', label: 'All Orders', icon: '☕' },
                                    { id: 'espresso', label: 'Espresso', icon: '⚡' },
                                    { id: 'iced', label: 'Iced & Cold', icon: '🧊' },
                                    { id: 'tea', label: 'Tea', icon: '🍵' },
                                    { id: 'snacks', label: 'Snacks', icon: '🥐' },
                                    { id: 'gifts', label: 'Sent Gifts', icon: '🎁' },
                                ] as const
                            ).map((tab) => {
                                const isSelected = categoryFilter === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setCategoryFilter(tab.id)}
                                        className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                                            isSelected
                                                ? 'bg-amber-700 text-white shadow-xs font-semibold'
                                                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
                                        }`}
                                    >
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Orders List / Empty States */}
                {orderHistory.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 dark:text-stone-500">
                        <span className="text-4xl block mb-2">☕</span>
                        <p className="text-sm font-medium">No coffee orders yet!</p>
                        <p className="text-xs mt-1">
                            Browse the menu above and brew your first cup to boost sprint velocity.
                        </p>
                    </div>
                ) : filteredAndSortedOrders.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800/40 rounded-xl p-4">
                        <span className="text-3xl block mb-1">🔍</span>
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            No orders match your filter criteria
                        </p>
                        <p className="text-xs mt-1 text-stone-500">
                            Try adjusting your search terms or clearing the active category filters.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800 space-y-2">
                        {filteredAndSortedOrders.map((order) => {
                            const date = new Date(order.orderedAt);
                            const formattedTime = date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            });
                            const formattedDate = date.toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                            });

                            return (
                                <div
                                    key={order.id}
                                    className="pt-2 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 p-2.5 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/40">
                                            {order.item.icon}
                                        </span>
                                        <div>
                                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                                    {order.item.name}
                                                </p>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                                                    {order.customization.size}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-medium">
                                                    ⚡ {order.caffeineMg}mg
                                                </span>
                                                {order.recipient && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                                                        To: {order.recipient}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                                {formattedDate} at {formattedTime} • {order.customization.milk} • {order.customization.sugar}
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
                                        className="px-3 py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600 text-amber-700 hover:text-white dark:text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 flex-shrink-0"
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


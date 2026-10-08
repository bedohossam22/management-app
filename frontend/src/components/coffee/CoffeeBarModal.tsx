import React, { useState, useMemo } from 'react';
import { useCoffee } from '../../context/CoffeeContext';
import { COFFEE_MENU_ITEMS, COFFEE_QUOTES, COFFEE_DISCOUNT_CODES } from '../../data/coffeeMenu';
import type { CoffeeCategory, CoffeeMenuItem } from '../../types/coffee';
import CoffeeCustomizerModal from './CoffeeCustomizerModal';
import CoffeeRoulette from './CoffeeRoulette';
import SendCoffeeModal from './SendCoffeeModal';
import CoffeeHistory from './CoffeeHistory';
import { coffeeSound } from '../../utils/coffeeSounds';

type TabType = 'menu' | 'roulette' | 'send' | 'history';

export const CoffeeBarModal: React.FC = () => {
    const {
        isModalOpen,
        closeCoffeeBar,
        startBrewing,
        favorites,
        toggleFavorite,
        isFavorite,
        isMuted,
        toggleMute,
        customizingItem,
        setCustomizingItem,
        stats,
    } = useCoffee();

    const [activeTab, setActiveTab] = useState<TabType>('menu');
    const [selectedCategory, setSelectedCategory] = useState<CoffeeCategory | 'all' | 'favorites'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Random quote
    const randomQuote = useMemo(() => {
        return COFFEE_QUOTES[Math.floor(Math.random() * COFFEE_QUOTES.length)];
    }, []);

    // Filter items
    const filteredItems = useMemo(() => {
        return COFFEE_MENU_ITEMS.filter((item) => {
            const matchesCategory =
                selectedCategory === 'all'
                    ? true
                    : selectedCategory === 'favorites'
                    ? favorites.includes(item.id)
                    : item.category === selectedCategory;

            const matchesSearch =
                !searchQuery.trim() ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.arabicName && item.arabicName.includes(searchQuery)) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, favorites]);

    if (!isModalOpen) return null;

    const handleQuickBrew = (item: CoffeeMenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
        coffeeSound.playClick();
        startBrewing(item, {
            size: 'Grande',
            milk: item.category === 'snacks' ? 'No Milk' : 'Oat Milk',
            sugar: '25% (Slight)',
            extraShots: 'None',
            temperature: item.category === 'iced' ? 'Iced' : 'Hot',
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
                <div
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-stone-900 dark:text-stone-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Warm Espresso Gradient & Animated Steam */}
                    <div className="bg-gradient-to-r from-amber-800 via-stone-900 to-amber-950 text-white p-5 sm:p-6 relative overflow-hidden flex-shrink-0">
                        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-9xl select-none pointer-events-none">
                            ☕
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-inner shadow-amber-900">
                                    ☕
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-amber-50">
                                            Manager&apos;s Coffee & Fuel Bar
                                        </h2>
                                        <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                                            Sprint Station ⚡
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-200/80 mt-1 italic line-clamp-1">
                                        &ldquo;{randomQuote}&rdquo;
                                    </p>
                                </div>
                            </div>

                            {/* Sound & Close Actions */}
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition-all cursor-pointer"
                                    title={isMuted ? 'Unmute Coffee Machine Sounds' : 'Mute Sounds'}
                                >
                                    {isMuted ? '🔇' : '🔊'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeCoffeeBar}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-amber-200 hover:text-white transition-all cursor-pointer"
                                    title="Close Menu"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Top navigation tabs */}
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-5 border-t border-amber-500/20 pt-4 overflow-x-auto scrollbar-none">
                            <button
                                type="button"
                                onClick={() => setActiveTab('menu')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                                    activeTab === 'menu'
                                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                                        : 'bg-white/10 text-amber-100 hover:bg-white/20'
                                }`}
                            >
                                <span>☕ Coffee & Snacks Menu</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('roulette')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                                    activeTab === 'roulette'
                                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                                        : 'bg-white/10 text-amber-100 hover:bg-white/20'
                                }`}
                            >
                                <span>🎲 Coffee Roulette</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('send')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                                    activeTab === 'send'
                                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                                        : 'bg-white/10 text-amber-100 hover:bg-white/20'
                                }`}
                            >
                                <span>🎁 Send to Teammate</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('history')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                                    activeTab === 'history'
                                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                                        : 'bg-white/10 text-amber-100 hover:bg-white/20'
                                }`}
                            >
                                <span>📊 Tracker & History ({stats.cupsToday} cups)</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
                        {activeTab === 'menu' && (
                            <>
                                {/* Promo & Sprint Perks Banner */}
                                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-emerald-500/10 dark:from-amber-950/40 dark:to-emerald-950/20 rounded-2xl border border-amber-300/40 dark:border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                                    <div className="flex items-center space-x-2.5">
                                        <span className="text-xl p-1.5 bg-amber-500/20 rounded-xl">🎟️</span>
                                        <div>
                                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-1.5">
                                                <span>Manager Sprint Fuel Perks</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-500/30">Active</span>
                                            </p>
                                            <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                                                Use promo code <span className="font-mono font-bold bg-amber-200/60 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 px-1.5 py-0.2 rounded">SPRINT100</span> for 100% free coffee or <span className="font-mono font-bold bg-amber-200/60 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 px-1.5 py-0.2 rounded">BEDO50</span> for 50% off in customizer!
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1.5 self-end sm:self-center">
                                        {COFFEE_DISCOUNT_CODES.slice(0, 3).map((code) => (
                                            <span
                                                key={code.code}
                                                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-amber-800 dark:text-amber-300 shadow-2xs"
                                            >
                                                {code.code}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Search & Category Pills */}
                                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                                    {/* Category selector */}
                                    <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                                        {[
                                            { id: 'all', label: 'All Items' },
                                            { id: 'espresso', label: '☕ Espresso' },
                                            { id: 'iced', label: '🧊 Cold Brew & Iced' },
                                            { id: 'tea', label: '🫖 Artisan Teas' },
                                            { id: 'snacks', label: '🥐 Brain Snacks' },
                                            { id: 'favorites', label: `⭐ Favorites (${favorites.length})` },
                                        ].map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setSelectedCategory(cat.id as any)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                                    selectedCategory === cat.id
                                                        ? 'bg-amber-600 text-white shadow-xs'
                                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-64 flex-shrink-0">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search coffee or snack..."
                                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                        />
                                        <svg
                                            className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Menu Cards Grid */}
                                {filteredItems.length === 0 ? (
                                    <div className="text-center py-12 text-stone-400 dark:text-stone-500">
                                        <span className="text-4xl block mb-2">🔍</span>
                                        <p className="text-sm font-semibold">No menu items found</p>
                                        <p className="text-xs mt-1">Try another search keyword or category tab.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredItems.map((item) => {
                                            const favorited = isFavorite(item.id);

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setCustomizingItem(item)}
                                                    className="group relative p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
                                                >
                                                    <div>
                                                        {/* Top row: Icon, Name, Price, Favorite */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-3">
                                                                <span className="text-3xl p-2 bg-white dark:bg-stone-700/60 rounded-xl border border-stone-200 dark:border-stone-600 shadow-2xs group-hover:scale-110 transition-transform">
                                                                    {item.icon}
                                                                </span>
                                                                <div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                                            {item.name}
                                                                        </h4>
                                                                        {item.isPopular && (
                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
                                                                                Hot 🔥
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-amber-700 dark:text-amber-300/90 font-medium mt-0.5">
                                                                        {item.arabicName}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-1">
                                                                <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-700 px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-600">
                                                                    {item.price}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleFavorite(item.id);
                                                                    }}
                                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                                        favorited
                                                                            ? 'text-rose-500 hover:text-rose-600'
                                                                            : 'text-stone-300 dark:text-stone-600 hover:text-rose-400'
                                                                    }`}
                                                                    title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4 fill-current"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2.5 line-clamp-2">
                                                            {item.description}
                                                        </p>

                                                        {/* Manager Perk pill */}
                                                        <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 font-medium flex items-center space-x-1.5">
                                                            <span>💡</span>
                                                            <span className="truncate">{item.managerPerk}</span>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Row: Tags & Actions */}
                                                    <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                                                        <div className="flex items-center space-x-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                                                            <span>⚡ {item.caffeineMg}mg</span>
                                                            <span>•</span>
                                                            <span>⏱️ {item.prepTimeSec}s</span>
                                                        </div>

                                                        <div className="flex items-center space-x-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleQuickBrew(item, e)}
                                                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-colors cursor-pointer"
                                                                title="Quick Brew standard recipe"
                                                            >
                                                                ⚡ Quick
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setCustomizingItem(item)}
                                                                className="px-3 py-1 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer flex items-center space-x-1"
                                                            >
                                                                <span>Customize ⚙️</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'roulette' && (
                            <CoffeeRoulette
                                onSelectItem={(item) => {
                                    setCustomizingItem(item);
                                }}
                            />
                        )}

                        {activeTab === 'send' && (
                            <SendCoffeeModal onClose={() => setActiveTab('history')} />
                        )}

                        {activeTab === 'history' && <CoffeeHistory />}
                    </div>
                </div>
            </div>

            {/* Customizer Sub-Modal */}
            <CoffeeCustomizerModal
                item={customizingItem}
                onClose={() => setCustomizingItem(null)}
                onBrew={(customization, kudos) => {
                    if (customizingItem) {
                        startBrewing(customizingItem, customization, kudos);
                    }
                }}
            />
        </>
    );
};

export default CoffeeBarModal;

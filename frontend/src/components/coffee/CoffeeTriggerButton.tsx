import React, { useState } from 'react';
import { useCoffee } from '../../context/CoffeeContext';
import { COFFEE_MENU_ITEMS, SUGAR_SPOONS_OPTIONS } from '../../data/coffeeMenu';
import type { SugarLevel } from '../../types/coffee';
import { coffeeSound } from '../../utils/coffeeSounds';

interface CoffeeTriggerButtonProps {
    variant?: 'navbar' | 'floating';
}

export const CoffeeTriggerButton: React.FC<CoffeeTriggerButtonProps> = ({
    variant = 'navbar',
}) => {
    const { openCoffeeBar, startBrewing, activeOrder, stats } = useCoffee();
    const [selectedCoffeeId, setSelectedCoffeeId] = useState<string>(COFFEE_MENU_ITEMS[0].id);
    const [sugarSpoons, setSugarSpoons] = useState<number>(2);

    const handleQuickBrew = (e: React.MouseEvent) => {
        e.stopPropagation();
        coffeeSound.playClick();
        const item = COFFEE_MENU_ITEMS.find((c) => c.id === selectedCoffeeId) || COFFEE_MENU_ITEMS[0];
        const matched = SUGAR_SPOONS_OPTIONS.find((s) => s.spoons === sugarSpoons);
        const sugarLevel: SugarLevel = (matched?.percentageEquiv as SugarLevel) || '50% (Standard)';

        startBrewing(item, {
            size: 'Grande',
            milk: item.category === 'snacks' ? 'No Milk' : 'Oat Milk',
            sugar: sugarLevel,
            sugarSpoons,
            coffeeType: item.name,
            extraShots: 'None',
            temperature: item.category === 'iced' ? 'Iced' : 'Hot',
        });
    };

    if (variant === 'floating') {
        return (
            <button
                type="button"
                onClick={openCoffeeBar}
                className="fixed bottom-6 left-6 z-30 group flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-amber-700 via-stone-800 to-amber-900 text-white rounded-2xl shadow-xl hover:shadow-amber-500/25 border border-amber-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
                title="Open Manager's Coffee & Break Bar"
            >
                <div className="relative">
                    <span className="text-xl group-hover:rotate-12 transition-transform inline-block">
                        ☕
                    </span>
                    {activeOrder ? (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                    ) : (
                        <span className="absolute -top-1.5 -right-1 text-[10px]">✨</span>
                    )}
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-amber-100 tracking-tight leading-none">
                        {activeOrder ? `Brewing ${activeOrder.progress}%` : 'Coffee Bar'}
                    </p>
                    <p className="text-[10px] text-amber-300/80 font-medium leading-tight mt-0.5">
                        {stats.cupsToday} cups today
                    </p>
                </div>
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-1.5 bg-amber-50/80 dark:bg-amber-950/40 p-1 rounded-xl border border-amber-200 dark:border-amber-800/80 shadow-2xs">
            {/* 1. Coffee Main Button */}
            <button
                type="button"
                onClick={openCoffeeBar}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border cursor-pointer ${
                    activeOrder
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
                        : 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                }`}
                title="Open Coffee Bar Menu (Press 'C')"
            >
                <span className="text-sm">☕</span>
                <span className="font-extrabold hidden sm:inline">
                    {activeOrder ? `Brewing ${activeOrder.progress}%` : 'Coffee'}
                </span>
                {stats.cupsToday > 0 && !activeOrder && (
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-extrabold">
                        {stats.cupsToday}
                    </span>
                )}
            </button>

            {/* 2. Next to Coffee: Types of Coffee selector & Number of Sugar Spoons */}
            <div className="hidden md:flex items-center space-x-1">
                {/* Types of Coffee Select */}
                <div className="relative">
                    <select
                        value={selectedCoffeeId}
                        onChange={(e) => setSelectedCoffeeId(e.target.value)}
                        className="text-xs font-semibold py-1.5 pl-2 pr-6 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none max-w-[145px] truncate"
                        title="Types of Coffee (أنواع القهوة)"
                    >
                        {COFFEE_MENU_ITEMS.filter((c) => c.category !== 'snacks').map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.icon} {item.name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-stone-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Number of Sugar Spoons Select */}
                <div className="relative">
                    <select
                        value={sugarSpoons}
                        onChange={(e) => setSugarSpoons(Number(e.target.value))}
                        className="text-xs font-semibold py-1.5 pl-2 pr-6 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none"
                        title="Number of Sugar Spoons (عدد معالق السكر)"
                    >
                        {SUGAR_SPOONS_OPTIONS.map((opt) => (
                            <option key={opt.spoons} value={opt.spoons}>
                                🥄 {opt.spoons} {opt.spoons === 1 ? 'Spoon' : 'Spoons'} ({opt.arabicLabel})
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-stone-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Quick Brew Button */}
                <button
                    type="button"
                    onClick={handleQuickBrew}
                    disabled={Boolean(activeOrder)}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                    title="Quick Brew selected coffee type and sugar spoons"
                >
                    <span>⚡</span>
                    <span className="hidden xl:inline">Brew</span>
                </button>
            </div>
        </div>
    );
};

export default CoffeeTriggerButton;


import React from 'react';
import { useCoffee } from '../../context/CoffeeContext';

interface CoffeeTriggerButtonProps {
    variant?: 'navbar' | 'floating';
}

export const CoffeeTriggerButton: React.FC<CoffeeTriggerButtonProps> = ({
    variant = 'navbar',
}) => {
    const { openCoffeeBar, activeOrder, stats } = useCoffee();

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
        <button
            type="button"
            onClick={openCoffeeBar}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border cursor-pointer ${
                activeOrder
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
            title="Open Manager's Coffee & Fuel Bar"
        >
            <span className="text-sm">☕</span>
            <span className="hidden md:inline">
                {activeOrder ? `Brewing ${activeOrder.progress}%` : 'Break Bar'}
            </span>
            {stats.cupsToday > 0 && !activeOrder && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-extrabold">
                    {stats.cupsToday}
                </span>
            )}
        </button>
    );
};

export default CoffeeTriggerButton;

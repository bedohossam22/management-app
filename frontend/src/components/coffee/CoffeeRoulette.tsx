import React, { useState } from 'react';
import { COFFEE_MENU_ITEMS } from '../../data/coffeeMenu';
import type { CoffeeMenuItem } from '../../types/coffee';
import { coffeeSound } from '../../utils/coffeeSounds';

interface CoffeeRouletteProps {
    onSelectItem: (item: CoffeeMenuItem) => void;
}

export const CoffeeRoulette: React.FC<CoffeeRouletteProps> = ({ onSelectItem }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CoffeeMenuItem | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const ROULETTE_REASONS = [
        'The algorithm detected a 4:00 PM standup ahead. You need serious espresso power!',
        'Your backlog contains 12 unestimated user stories. Smooth cappuccino diplomacy advised.',
        'High memory CPU usage detected on server. Steeper cold brew required immediately.',
        'Perfect match for deep architectural reviews and zero meeting interruptions.',
        'Because shipping clean code deserves a rich golden pastry treat!',
    ];

    const [reason, setReason] = useState(ROULETTE_REASONS[0]);

    const handleSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSelectedItem(null);

        let spinCount = 0;
        const totalSteps = 24 + Math.floor(Math.random() * 8);
        let speed = 60;

        const spinStep = () => {
            spinCount++;
            const nextIdx = Math.floor(Math.random() * COFFEE_MENU_ITEMS.length);
            setCurrentIndex(nextIdx);
            coffeeSound.playSpinTick();

            if (spinCount < totalSteps) {
                speed = 60 + Math.pow(spinCount / totalSteps, 2) * 200;
                setTimeout(spinStep, speed);
            } else {
                setIsSpinning(false);
                const picked = COFFEE_MENU_ITEMS[nextIdx];
                setSelectedItem(picked);
                setReason(ROULETTE_REASONS[Math.floor(Math.random() * ROULETTE_REASONS.length)]);
                coffeeSound.playReadyChime();
            }
        };

        spinStep();
    };

    const currentDisplayItem = selectedItem || COFFEE_MENU_ITEMS[currentIndex];

    return (
        <div className="p-6 bg-gradient-to-b from-amber-500/10 via-amber-950/20 to-stone-900/40 rounded-2xl border border-amber-500/30 text-center">
            <div className="max-w-md mx-auto space-y-5">
                <div>
                    <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                        Manager Decision Assistant
                    </span>
                    <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                        🎲 Coffee & Fuel Roulette
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Can&apos;t decide what to drink before your next meeting? Let the Barista Wheel choose your fuel!
                    </p>
                </div>

                {/* Roulette Showcase Box */}
                <div
                    className={`relative p-6 rounded-2xl bg-white dark:bg-stone-800 border-2 transition-all duration-200 shadow-xl ${
                        isSpinning
                            ? 'border-amber-400 scale-102 shadow-amber-500/20 ring-4 ring-amber-400/20'
                            : selectedItem
                            ? 'border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                            : 'border-stone-200 dark:border-stone-700'
                    }`}
                >
                    <div className="text-6xl mb-3 animate-bounce-short select-none">
                        {currentDisplayItem.icon}
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        {currentDisplayItem.name}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1">
                        {currentDisplayItem.arabicName}
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold">
                            ⚡ {currentDisplayItem.caffeineMg} mg Caffeine
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold">
                            ⏱️ ~{currentDisplayItem.prepTimeSec}s Prep
                        </span>
                    </div>

                    {selectedItem && (
                        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-left animate-fade-in">
                            <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                                🎯 <strong>Barista Verdict:</strong> {reason}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all transform active:scale-95 cursor-pointer flex items-center space-x-2 ${
                            isSpinning
                                ? 'bg-stone-400 text-stone-200 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/30'
                        }`}
                    >
                        <span>{isSpinning ? '🌀 Choosing Your Fuel...' : '🎲 Spin the Coffee Wheel'}</span>
                    </button>

                    {selectedItem && (
                        <button
                            type="button"
                            onClick={() => onSelectItem(selectedItem)}
                            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all transform active:scale-95 cursor-pointer flex items-center space-x-2 animate-fade-in"
                        >
                            <span>☕ Brew This ({selectedItem.price})</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoffeeRoulette;

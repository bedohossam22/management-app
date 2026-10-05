import React from 'react';
import { useCoffee } from '../../context/CoffeeContext';

export const BrewingOverlay: React.FC = () => {
    const { activeOrder } = useCoffee();

    if (!activeOrder) return null;

    const { item, customization, status, progress, recipient } = activeOrder;

    const getStatusText = () => {
        if (status === 'grinding') return '🫘 Grinding single-origin Arabica beans...';
        if (status === 'extracting') return '☕ Extracting golden espresso crema (9 bar pressure)...';
        if (status === 'steaming') return '🥛 Steaming silky microfoam & pouring latte art...';
        if (status === 'finishing') return '✨ Adding secret manager productivity sprinkles...';
        return '🎉 Order ready! Freshly brewed for maximum focus!';
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in shadow-2xl">
            <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-white rounded-2xl p-5 border border-amber-500/40 shadow-amber-900/40 backdrop-blur-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                        <div className="relative">
                            <span className="text-3xl inline-block animate-pulse">{item.icon}</span>
                            {status !== 'ready' && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-amber-100 text-base">{item.name}</h4>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {customization.size}
                                </span>
                            </div>
                            <p className="text-xs text-amber-200/80">
                                {recipient ? `Gift for ${recipient} 🎁` : 'Manager Desk Delivery 🚀'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-mono font-bold text-amber-300">{progress}%</span>
                    </div>
                </div>

                {/* Status message */}
                <div className="bg-black/30 rounded-xl px-3.5 py-2 mb-3 border border-amber-500/20">
                    <p className="text-xs text-amber-100/90 font-medium flex items-center space-x-1.5 transition-all">
                        <span>{getStatusText()}</span>
                    </p>
                </div>

                {/* Progress Bar with Steam Glow */}
                <div className="relative w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-amber-900/50">
                    <div
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Customization pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-amber-200/70">
                    <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                        {customization.milk}
                    </span>
                    <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                        {customization.sugar}
                    </span>
                    {customization.extraShots !== 'None' && (
                        <span className="bg-red-950/80 text-red-200 px-2 py-0.5 rounded border border-red-700/40 font-medium">
                            ⚡ {customization.extraShots}
                        </span>
                    )}
                    {customization.temperature && (
                        <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                            🌡️ {customization.temperature}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrewingOverlay;

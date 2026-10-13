import React from 'react';
import { useCoffee } from '../../context/CoffeeContext';

export const BrewingOverlay: React.FC = () => {
    const { activeOrder, rushBrewing, cancelBrewing, takeSip, dismissOrder } = useCoffee();

    if (!activeOrder) return null;

    const { item, customization, status, progress, recipient } = activeOrder;

    const getStatusText = () => {
        if (status === 'grinding') return '🫘 Grinding single-origin Arabica beans...';
        if (status === 'extracting') return '☕ Extracting golden espresso crema (9 bar pressure)...';
        if (status === 'steaming') return '🥛 Steaming silky microfoam & pouring latte art...';
        if (status === 'finishing') return '✨ Adding secret manager productivity sprinkles...';
        return '🎉 Order ready! Freshly brewed for maximum focus!';
    };

    const remainingSec = Math.max(1, Math.ceil(((100 - progress) / 100) * (item.prepTimeSec || 3)));

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in shadow-2xl">
            <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-white rounded-2xl p-5 border border-amber-500/40 shadow-amber-900/40 backdrop-blur-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                        <div className="relative">
                            {/* Animated rising steam wisps */}
                            <span
                                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs select-none pointer-events-none transition-all duration-300 animate-bounce opacity-85"
                                title="Fresh steam"
                            >
                                ♨️
                            </span>
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

                    {/* Progress indicator & Quick Controls */}
                    <div className="flex flex-col items-end space-y-1">
                        <span className="text-xl font-mono font-bold text-amber-300 leading-none">{progress}%</span>

                        {status !== 'ready' ? (
                            <div className="flex items-center space-x-1.5 pt-0.5">
                                <button
                                    type="button"
                                    onClick={rushBrewing}
                                    className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-black flex items-center space-x-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                    title="Rush Brew (Instant finish)"
                                >
                                    <span>⚡</span>
                                    <span>Rush</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelBrewing}
                                    className="px-1.5 py-0.5 rounded-lg bg-white/10 hover:bg-rose-500/40 text-amber-200 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                                    title="Cancel Brewing"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={dismissOrder}
                                className="px-1.5 py-0.5 rounded-lg bg-white/10 hover:bg-rose-500/40 text-amber-200 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                                title="Dismiss"
                            >
                                ✕ Close
                            </button>
                        )}
                    </div>
                </div>

                {/* Status message */}
                <div className="bg-black/30 rounded-xl px-3.5 py-2 mb-3 border border-amber-500/20 flex items-center justify-between">
                    <p className="text-xs text-amber-100/90 font-medium flex items-center space-x-1.5 transition-all">
                        <span>{getStatusText()}</span>
                    </p>
                    {status !== 'ready' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 whitespace-nowrap ml-2">
                            ~{remainingSec}s
                        </span>
                    )}
                </div>

                {/* Progress Bar with Steam Glow */}
                <div className="relative w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-amber-900/50">
                    <div
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Interactive Take a Sip Action (When ready) */}
                {status === 'ready' && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/30 animate-fade-in">
                        <button
                            type="button"
                            onClick={takeSip}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer ring-2 ring-amber-400/50 animate-pulse"
                        >
                            <span className="text-base">☕</span>
                            <span>Take a Sip & Energize (+100% Focus) ✨</span>
                        </button>
                    </div>
                )}

                {/* Customization pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-amber-200/70">
                    {customization.coffeeType && (
                        <span className="bg-amber-950/80 text-amber-200 font-semibold px-2 py-0.5 rounded border border-amber-600/50">
                            🫘 {customization.coffeeType}
                        </span>
                    )}
                    <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                        {customization.milk}
                    </span>
                    <span className="bg-amber-950/80 text-amber-200 px-2 py-0.5 rounded border border-amber-700/40 font-medium">
                        {customization.sugarSpoons !== undefined ? `🥄 ${customization.sugarSpoons} ${customization.sugarSpoons === 1 ? 'Spoon' : 'Spoons'} Sugar` : customization.sugar}
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
                    {customization.latteArt && customization.latteArt !== 'None' && (
                        <span className="bg-amber-950/80 text-amber-200 px-2 py-0.5 rounded border border-amber-500/40">
                            🎨 {customization.latteArt} Art
                        </span>
                    )}
                    {customization.specialNotes && (
                        <span className="bg-amber-950/80 text-amber-200/90 px-2 py-0.5 rounded border border-amber-700/40 truncate max-w-[200px]" title={customization.specialNotes}>
                            ✨ {customization.specialNotes}
                        </span>
                    )}
                    {customization.discountCode && (
                        <span className="bg-emerald-950/90 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-600/50">
                            🎟️ {customization.discountCode} ({customization.finalPrice})
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrewingOverlay;

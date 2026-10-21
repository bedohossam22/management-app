import React, { useState, useMemo } from 'react';
import { OT_REWARD_TIERS, getOTRewardTier, type OTRewardTier } from '../../data/coffeeMenu';
import { coffeeSound } from '../../utils/coffeeSounds';

interface OTRewardsProps {
    onApplyCode: (code: string) => void;
}

const OT_STORAGE_KEY = 'task_manager_ot_hours';

export const OTRewards: React.FC<OTRewardsProps> = ({ onApplyCode }) => {
    const [otHours, setOtHours] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(OT_STORAGE_KEY);
            return saved ? parseInt(saved, 10) : 7;
        } catch {
            return 7;
        }
    });

    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);

    const currentTier: OTRewardTier | null = useMemo(() => getOTRewardTier(otHours), [otHours]);

    const handleSliderChange = (val: number) => {
        setOtHours(val);
        localStorage.setItem(OT_STORAGE_KEY, String(val));
        setCopiedCode(null);
        setAppliedCode(null);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).catch(() => {});
        coffeeSound.playClick();
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleApply = (code: string) => {
        coffeeSound.playVoucherSuccess();
        setAppliedCode(code);
        onApplyCode(code);
    };

    // Progress toward next tier
    const nextTier: OTRewardTier | null = useMemo(() => {
        if (!currentTier) return OT_REWARD_TIERS[0];
        const idx = OT_REWARD_TIERS.findIndex((t) => t.id === currentTier.id);
        return idx < OT_REWARD_TIERS.length - 1 ? OT_REWARD_TIERS[idx + 1] : null;
    }, [currentTier]);

    const progressToNext = useMemo(() => {
        if (!nextTier) return 100;
        if (!currentTier) {
            return Math.min(Math.round((otHours / nextTier.minHours) * 100), 100);
        }
        const range = nextTier.minHours - currentTier.minHours;
        const progress = otHours - currentTier.minHours;
        return Math.min(Math.round((progress / range) * 100), 100);
    }, [otHours, currentTier, nextTier]);

    // Overall OT milestone percentage across full 30h range
    const totalOTPercentage = useMemo(() => {
        return Math.min(Math.round((otHours / 30) * 100), 100);
    }, [otHours]);

    const tierColorMap: Record<string, { bg: string; border: string; text: string; glow: string; barBg: string }> = {
        amber: {
            bg: 'bg-amber-500/10 dark:bg-amber-950/40',
            border: 'border-amber-400/50 dark:border-amber-700/60',
            text: 'text-amber-700 dark:text-amber-300',
            glow: 'shadow-amber-500/20',
            barBg: 'bg-amber-500',
        },
        slate: {
            bg: 'bg-slate-400/10 dark:bg-slate-800/60',
            border: 'border-slate-400/50 dark:border-slate-600/60',
            text: 'text-slate-700 dark:text-slate-300',
            glow: 'shadow-slate-400/20',
            barBg: 'bg-slate-400',
        },
        yellow: {
            bg: 'bg-yellow-400/10 dark:bg-yellow-950/40',
            border: 'border-yellow-400/50 dark:border-yellow-700/60',
            text: 'text-yellow-700 dark:text-yellow-300',
            glow: 'shadow-yellow-500/20',
            barBg: 'bg-yellow-500',
        },
        cyan: {
            bg: 'bg-cyan-400/10 dark:bg-cyan-950/40',
            border: 'border-cyan-400/50 dark:border-cyan-700/60',
            text: 'text-cyan-700 dark:text-cyan-300',
            glow: 'shadow-cyan-500/20',
            barBg: 'bg-cyan-500',
        },
    };

    return (
        <div className="space-y-5">
            {/* OT Header Banner */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-600/15 via-purple-500/10 to-cyan-500/10 dark:from-amber-950/50 dark:via-purple-950/30 dark:to-cyan-950/20 border border-amber-300/40 dark:border-amber-800/40">
                <div className="absolute right-3 top-3 opacity-10 text-7xl select-none pointer-events-none">🏆</div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
                            ⏰
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                                <span>Overtime Discount Rewards</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30">
                                    مكافآت الأوفرتايم
                                </span>
                            </h3>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                                Work overtime, earn café rewards! The more OT hours you log, the bigger your discount tier.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* OT Hours Slider Control */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <span>⏱️ Your Overtime Hours This Month</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                            {otHours}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">hours</span>
                    </div>
                </div>

                {/* Slider */}
                <div className="relative">
                    <input
                        type="range"
                        min={0}
                        max={30}
                        step={1}
                        value={otHours}
                        onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-amber-600
                            [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-stone-200 dark:[&::-webkit-slider-runnable-track]:bg-stone-700
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-stone-200 dark:[&::-moz-range-track]:bg-stone-700
                        "
                    />

                    {/* Tier markers on slider track */}
                    <div className="flex items-center justify-between mt-1 px-0.5">
                        <span className="text-[10px] text-stone-400">0h</span>
                        {OT_REWARD_TIERS.map((tier) => (
                            <span
                                key={tier.id}
                                className={`text-[10px] font-semibold ${
                                    otHours >= tier.minHours
                                        ? tierColorMap[tier.color]?.text || 'text-amber-600'
                                        : 'text-stone-400 dark:text-stone-500'
                                }`}
                            >
                                {tier.icon} {tier.minHours}h
                            </span>
                        ))}
                        <span className="text-[10px] text-stone-400">30h</span>
                    </div>
                </div>

                {/* Quick OT hour buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mr-1">Quick Set:</span>
                    {[0, 2, 5, 10, 15, 20, 25].map((h) => (
                        <button
                            key={h}
                            type="button"
                            onClick={() => handleSliderChange(h)}
                            className={`px-2 py-0.5 text-[11px] rounded-lg font-semibold border transition-all cursor-pointer ${
                                otHours === h
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                            }`}
                        >
                            {h}h
                        </button>
                    ))}
                </div>

                {/* Visual Overall OT Progress Bar */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
                            <span>📊</span>
                            <span>Overtime Reward Progress Bar</span>
                        </span>
                        <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                            {otHours} / 30h ({totalOTPercentage}%)
                        </span>
                    </div>

                    {/* Milestone Progress Bar Track */}
                    <div className="relative w-full h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 transition-all duration-500 ease-out shadow-xs"
                            style={{ width: `${Math.max(totalOTPercentage, otHours > 0 ? 4 : 0)}%` }}
                        />
                    </div>

                    {/* Milestone labels */}
                    <div className="grid grid-cols-4 text-center mt-1 text-[9px] text-stone-500 dark:text-stone-400">
                        <span className={otHours >= 1 ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>🥉 1h (10% OFF)</span>
                        <span className={otHours >= 5 ? 'font-bold text-slate-700 dark:text-slate-300' : ''}>🥈 5h (25% OFF)</span>
                        <span className={otHours >= 10 ? 'font-bold text-yellow-600 dark:text-yellow-400' : ''}>🥇 10h (50% OFF)</span>
                        <span className={otHours >= 20 ? 'font-bold text-cyan-600 dark:text-cyan-400' : ''}>💎 20h (100% FREE)</span>
                    </div>
                </div>
            </div>

            {/* Current Tier Status */}
            {currentTier ? (
                <div className={`p-4 rounded-2xl border-2 ${tierColorMap[currentTier.color]?.bg || ''} ${tierColorMap[currentTier.color]?.border || ''} shadow-lg ${tierColorMap[currentTier.color]?.glow || ''}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-3">
                            <span className="text-4xl">{currentTier.icon}</span>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h4 className={`text-base font-extrabold ${tierColorMap[currentTier.color]?.text || ''}`}>
                                        {currentTier.tierName}
                                    </h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tierColorMap[currentTier.color]?.bg || ''} ${tierColorMap[currentTier.color]?.border || ''} ${tierColorMap[currentTier.color]?.text || ''}`}>
                                        {currentTier.badge}
                                    </span>
                                </div>
                                <p className={`text-[11px] mt-0.5 font-medium ${tierColorMap[currentTier.color]?.text || ''} opacity-80`}>
                                    {currentTier.tierNameAr} • {currentTier.description}
                                </p>
                            </div>
                        </div>

                        {/* Apply / Copy Code Action */}
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handleCopy(currentTier.promoCode)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                    copiedCode === currentTier.promoCode
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:border-amber-400'
                                }`}
                            >
                                {copiedCode === currentTier.promoCode ? '✓ Copied!' : `📋 ${currentTier.promoCode}`}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApply(currentTier.promoCode)}
                                disabled={appliedCode === currentTier.promoCode}
                                className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
                                    appliedCode === currentTier.promoCode
                                        ? 'bg-emerald-600 text-white cursor-default'
                                        : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
                                }`}
                            >
                                {appliedCode === currentTier.promoCode ? '✓ Applied to Cart!' : '🎟️ Apply Discount'}
                            </button>
                        </div>
                    </div>

                    {/* Perks List */}
                    <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                            Your Tier Perks:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {currentTier.perks.map((perk, i) => (
                                <span
                                    key={i}
                                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${tierColorMap[currentTier.color]?.bg || ''} ${tierColorMap[currentTier.color]?.border || ''} ${tierColorMap[currentTier.color]?.text || ''}`}
                                >
                                    ✓ {perk}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {nextTier ? (
                        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                                <span className="font-semibold text-stone-600 dark:text-stone-400">
                                    Progress to {nextTier.icon} {nextTier.tierName}
                                </span>
                                <span className="font-bold text-amber-700 dark:text-amber-300">
                                    {nextTier.minHours - otHours}h to go
                                </span>
                            </div>
                            <div className="w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${tierColorMap[nextTier.color]?.barBg || 'bg-amber-500'}`}
                                    style={{ width: `${progressToNext}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                                <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center space-x-1">
                                    <span>💎</span>
                                    <span>Maximum Tier Achieved!</span>
                                </span>
                                <span className="font-bold text-cyan-700 dark:text-cyan-300">100% Free VIP</span>
                            </div>
                            <div className="w-full bg-cyan-200/50 dark:bg-cyan-950/50 h-2.5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-cyan-500 w-full animate-pulse" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
                    <span className="text-4xl block mb-2">⏰</span>
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                        No Overtime Hours Logged Yet
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Log at least 1 overtime hour to start earning café discount rewards!
                    </p>
                    <div className="mt-3 max-w-xs mx-auto">
                        <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 mb-1">
                            <span>Unlock 🥉 Bronze Tier (1h)</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">1h needed</span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* All Tiers Grid */}
            <div>
                <h4 className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                    <span>🏆 All OT Reward Tiers</span>
                    <span className="text-[10px] font-medium text-stone-400 normal-case">(مستويات المكافآت)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OT_REWARD_TIERS.map((tier: OTRewardTier) => {
                        const isUnlocked = otHours >= tier.minHours;
                        const isCurrent = currentTier?.id === tier.id;
                        const colors = tierColorMap[tier.color];

                        return (
                            <div
                                key={tier.id}
                                className={`relative p-3.5 rounded-2xl border transition-all duration-300 ${
                                    isCurrent
                                        ? `${colors?.bg || ''} ${colors?.border || ''} shadow-md ${colors?.glow || ''} ring-2 ring-offset-1 ring-amber-400/40 dark:ring-offset-stone-900`
                                        : isUnlocked
                                        ? `${colors?.bg || ''} ${colors?.border || ''} opacity-80`
                                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-60'
                                }`}
                            >
                                {/* Lock overlay for locked tiers */}
                                {!isUnlocked && (
                                    <div className="absolute inset-0 bg-stone-100/40 dark:bg-stone-900/40 rounded-2xl flex items-center justify-center z-10">
                                        <span className="text-2xl opacity-50">🔒</span>
                                    </div>
                                )}

                                {isCurrent && (
                                    <div className="absolute -top-2 -right-2 z-10 text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-extrabold shadow-sm animate-pulse">
                                        ⭐ CURRENT
                                    </div>
                                )}

                                <div className="flex items-start space-x-3">
                                    <span className={`text-3xl ${!isUnlocked ? 'grayscale' : ''}`}>
                                        {tier.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                            <h5 className={`text-sm font-extrabold ${isUnlocked ? (colors?.text || '') : 'text-stone-400 dark:text-stone-500'}`}>
                                                {tier.tierName}
                                            </h5>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                                                isUnlocked
                                                    ? `${colors?.bg || ''} ${colors?.border || ''} ${colors?.text || ''}`
                                                    : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500'
                                            }`}>
                                                {tier.badge}
                                            </span>
                                        </div>
                                        <p className={`text-[11px] mt-0.5 ${isUnlocked ? `${colors?.text || ''} opacity-80` : 'text-stone-400 dark:text-stone-500'}`}>
                                            {tier.tierNameAr}
                                        </p>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                            {tier.minHours}{tier.maxHours ? `–${tier.maxHours}` : '+'} OT hours • Code: <span className="font-mono font-bold">{tier.promoCode}</span>
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {tier.perks.slice(0, 2).map((perk, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                                        isUnlocked
                                                            ? `${colors?.bg || ''} ${colors?.text || ''} border ${colors?.border || ''}`
                                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700'
                                                    }`}
                                                >
                                                    {isUnlocked ? '✓' : '○'} {perk}
                                                </span>
                                            ))}
                                            {tier.perks.length > 2 && (
                                                <span className="text-[10px] px-1.5 py-0.5 text-stone-400 font-medium">
                                                    +{tier.perks.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* How It Works Info */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
                <p className="font-bold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
                    <span>💡</span>
                    <span>How OT Rewards Work</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Your overtime hours are tracked monthly and reset each new month.</li>
                    <li>Each tier unlocks a unique promo code — use it in the Coffee Customizer!</li>
                    <li>Higher tiers include all perks from lower tiers.</li>
                    <li>Diamond tier (20+ hours) gets <strong>everything free</strong> — drinks, snacks, and gifts!</li>
                </ul>
            </div>
        </div>
    );
};

export default OTRewards;

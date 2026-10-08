import React, { useState, useEffect } from 'react';
import type {
    CoffeeMenuItem,
    CoffeeCustomization,
    DrinkSize,
    MilkOption,
    SugarLevel,
    ExtraShot,
    Temperature,
    CoffeeDiscount,
} from '../../types/coffee';
import {
    MOCK_TEAM_MEMBERS,
    validateDiscountCode,
    calculateDiscountedPrice,
    COFFEE_DISCOUNT_CODES,
} from '../../data/coffeeMenu';
import { coffeeSound } from '../../utils/coffeeSounds';

interface CoffeeCustomizerModalProps {
    item: CoffeeMenuItem | null;
    onClose: () => void;
    onBrew: (customization: CoffeeCustomization, kudosMessage?: string) => void;
}

export const CoffeeCustomizerModal: React.FC<CoffeeCustomizerModalProps> = ({
    item,
    onClose,
    onBrew,
}) => {
    const isSnack = item?.category === 'snacks';

    const [size, setSize] = useState<DrinkSize>('Grande');
    const [milk, setMilk] = useState<MilkOption>('Oat Milk');
    const [sugar, setSugar] = useState<SugarLevel>('25% (Slight)');
    const [extraShots, setExtraShots] = useState<ExtraShot>('None');
    const [temperature, setTemperature] = useState<Temperature>(
        item?.category === 'iced' ? 'Iced' : 'Hot'
    );
    const [warmSnack, setWarmSnack] = useState(true);
    const [specialNotes, setSpecialNotes] = useState('');

    // Discount code state
    const [discountInput, setDiscountInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<CoffeeDiscount | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);

    // Send as Gift mode
    const [isGiftMode, setIsGiftMode] = useState(false);
    const [selectedMember, setSelectedMember] = useState(MOCK_TEAM_MEMBERS[0].name);
    const [kudosMessage, setKudosMessage] = useState('Great work on the recent sprint tickets! Fuel up ☕🔥');

    useEffect(() => {
        if (item?.category === 'iced') {
            setTemperature('Iced');
        } else {
            setTemperature('Hot');
        }
        setDiscountInput('');
        setAppliedDiscount(null);
        setDiscountError(null);
    }, [item]);

    if (!item) return null;

    const calculatedCaffeine =
        item.caffeineMg +
        (extraShots === '+1 Turbo Shot' ? 65 : extraShots === '+2 Sprint Crunch Shots' ? 130 : 0);

    const priceInfo = calculateDiscountedPrice(
        item.price,
        appliedDiscount ? appliedDiscount.discountPercent : 0
    );

    const handleApplyDiscount = (codeToApply?: string) => {
        const target = (codeToApply ?? discountInput).trim();
        if (!target) {
            setDiscountError('Please enter a discount code');
            return;
        }

        const match = validateDiscountCode(target);
        if (match) {
            coffeeSound.playVoucherSuccess();
            setAppliedDiscount(match);
            setDiscountInput(match.code);
            setDiscountError(null);
        } else {
            coffeeSound.playClick();
            setDiscountError('Invalid code. Try SPRINT100, BEDO50, or DEV20');
        }
    };

    const handleRemoveDiscount = () => {
        coffeeSound.playClick();
        setAppliedDiscount(null);
        setDiscountInput('');
        setDiscountError(null);
    };

    const handleConfirm = () => {
        coffeeSound.playClick();
        const customization: CoffeeCustomization = {
            size,
            milk: isSnack ? 'No Milk' : milk,
            sugar: isSnack ? '0% (Black)' : sugar,
            extraShots: isSnack ? 'None' : extraShots,
            temperature: isSnack ? 'Hot' : temperature,
            warmSnack: isSnack ? warmSnack : undefined,
            specialNotes: specialNotes.trim() || undefined,
            recipient: isGiftMode ? selectedMember : undefined,
            discountCode: appliedDiscount?.code,
            discountPercent: appliedDiscount?.discountPercent,
            finalPrice: priceInfo.finalFormatted,
        };

        onBrew(customization, isGiftMode ? kudosMessage : undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div
                className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with warm coffee gradient */}
                <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-5 flex items-start justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-9xl select-none pointer-events-none">
                        {item.icon}
                    </div>
                    <div className="relative z-10 flex items-center space-x-3.5">
                        <span className="text-4xl p-2 bg-amber-950/40 rounded-xl border border-amber-400/30">
                            {item.icon}
                        </span>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-xl font-bold tracking-tight text-amber-50">
                                    {item.name}
                                </h3>
                                {appliedDiscount ? (
                                    <div className="flex items-center space-x-1.5">
                                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/40 text-amber-300/60 line-through">
                                            {priceInfo.originalFormatted}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/40 animate-pulse">
                                            {priceInfo.finalFormatted} ({appliedDiscount.badge || `${appliedDiscount.discountPercent}% OFF`})
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-semibold border border-amber-300/30">
                                        {item.price}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-amber-200/80 mt-0.5">{item.description}</p>
                            <p className="text-xs text-amber-300 font-medium mt-1">
                                💡 <span className="underline">Manager Perk:</span> {item.managerPerk}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-amber-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-gray-800 dark:text-gray-200 flex-1">
                    {/* Order Mode Toggle (Myself vs Gift) */}
                    <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                        <button
                            type="button"
                            onClick={() => setIsGiftMode(false)}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                                !isGiftMode
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                            }`}
                        >
                            <span>☕ Order for My Desk</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsGiftMode(true)}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                                isGiftMode
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                            }`}
                        >
                            <span>🎁 Send to Teammate with Kudos</span>
                        </button>
                    </div>

                    {/* If Gift mode: recipient selector */}
                    {isGiftMode && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-3">
                            <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                                Select Team Member Recipient:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {MOCK_TEAM_MEMBERS.map((member) => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => setSelectedMember(member.name)}
                                        className={`p-2 rounded-lg text-left border text-xs transition-all cursor-pointer ${
                                            selectedMember === member.name
                                                ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                                                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>{member.avatar}</span>
                                            <span className="truncate">{member.name}</span>
                                        </div>
                                        <p className="text-[10px] opacity-80 truncate">{member.role}</p>
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    Cheer / Kudos Note:
                                </label>
                                <input
                                    type="text"
                                    value={kudosMessage}
                                    onChange={(e) => setKudosMessage(e.target.value)}
                                    placeholder="Write a cheerful message..."
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                />
                            </div>
                        </div>
                    )}

                    {!isSnack ? (
                        <>
                            {/* Drink Size */}
                            <div>
                                <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                                    Cup Size
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['Short', 'Tall', 'Grande', 'Manager Venti'] as DrinkSize[]).map((sz) => (
                                        <button
                                            key={sz}
                                            type="button"
                                            onClick={() => setSize(sz)}
                                            className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                size === sz
                                                    ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                                                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                                            }`}
                                        >
                                            {sz}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Milk Choice & Temperature */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                                        Milk Type
                                    </label>
                                    <select
                                        value={milk}
                                        onChange={(e) => setMilk(e.target.value as MilkOption)}
                                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                    >
                                        <option value="Oat Milk">🌾 Oat Milk (Barista Blend)</option>
                                        <option value="Whole Milk">🥛 Whole Milk (Classic Crema)</option>
                                        <option value="Almond Milk">🌰 Almond Milk (Nutty)</option>
                                        <option value="Soy Milk">🫘 Soy Milk (Silky)</option>
                                        <option value="No Milk">☕ No Milk / Black</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                                        Temperature
                                    </label>
                                    <div className="flex space-x-2">
                                        {(['Hot', 'Extra Hot', 'Iced'] as Temperature[]).map((temp) => (
                                            <button
                                                key={temp}
                                                type="button"
                                                onClick={() => setTemperature(temp)}
                                                className={`flex-1 py-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                    temperature === temp
                                                        ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                                                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                                                }`}
                                            >
                                                {temp === 'Hot' ? '🔥 Hot' : temp === 'Extra Hot' ? '🌋 Extra' : '🧊 Iced'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sweetness & Extra Turbo Shots */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                                        Sweetness Level
                                    </label>
                                    <select
                                        value={sugar}
                                        onChange={(e) => setSugar(e.target.value as SugarLevel)}
                                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                    >
                                        <option value="0% (Black)">0% (Unsweetened / Black)</option>
                                        <option value="25% (Slight)">25% (Slightly Sweet)</option>
                                        <option value="50% (Standard)">50% (Standard Sweet)</option>
                                        <option value="100% (Sweet)">100% (Extra Sweet)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                                        Extra Espresso Booster
                                    </label>
                                    <select
                                        value={extraShots}
                                        onChange={(e) => setExtraShots(e.target.value as ExtraShot)}
                                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
                                    >
                                        <option value="None">Standard Strength</option>
                                        <option value="+1 Turbo Shot">⚡ +1 Turbo Shot (+65mg caffeine)</option>
                                        <option value="+2 Sprint Crunch Shots">🚀 +2 Sprint Crunch Shots (+130mg)</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Snack specific settings */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                                <div>
                                    <span className="font-semibold text-xs text-stone-800 dark:text-stone-200">
                                        🔥 Warm in Oven / Toaster
                                    </span>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        Serve warm & freshly toasted for maximum butteriness
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={warmSnack}
                                    onChange={(e) => setWarmSnack(e.target.checked)}
                                    className="w-5 h-5 text-amber-600 rounded-md border-stone-300 focus:ring-amber-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* Special Barista Instructions */}
                    <div>
                        <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
                            Special Barista Instructions
                        </label>
                        <input
                            type="text"
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="e.g. Extra cinnamon dust, double cup, extra hot..."
                            className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Voucher & Promo Code Section */}
                    <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-stone-500/10 dark:from-amber-950/40 dark:to-stone-900/60 rounded-xl border border-amber-300/50 dark:border-amber-700/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center space-x-1.5">
                                <span>🎟️ Promo Voucher & Team Perks</span>
                            </label>
                            {appliedDiscount && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                                    <span>✓ Code Applied ({appliedDiscount.badge || `${appliedDiscount.discountPercent}% OFF`})</span>
                                </span>
                            )}
                        </div>

                        {appliedDiscount ? (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60">
                                <div className="flex items-center space-x-2 text-xs">
                                    <span className="text-base">🎉</span>
                                    <div>
                                        <p className="font-bold text-emerald-900 dark:text-emerald-200">
                                            {appliedDiscount.code} &bull; {appliedDiscount.description}
                                        </p>
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">
                                            Original: <span className="line-through">{priceInfo.originalFormatted}</span> &rarr; Final Price:{' '}
                                            <span className="font-bold">{priceInfo.finalFormatted}</span> ({priceInfo.discountAmountFormatted})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveDiscount}
                                    className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-white dark:bg-stone-800 rounded-md border border-rose-200 dark:border-rose-900 shadow-2xs cursor-pointer hover:bg-rose-50"
                                >
                                    Remove ✕
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={discountInput}
                                            onChange={(e) => {
                                                setDiscountInput(e.target.value.toUpperCase());
                                                if (discountError) setDiscountError(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleApplyDiscount();
                                                }
                                            }}
                                            placeholder="Enter promo code (e.g. SPRINT100)"
                                            className="w-full text-xs uppercase font-mono px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyDiscount()}
                                        className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        Apply Code
                                    </button>
                                </div>

                                {discountError && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                                        ⚠️ {discountError}
                                    </p>
                                )}

                                {/* Quick Click Vouchers */}
                                <div className="pt-1">
                                    <p className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 mb-1">
                                        Quick Sprint Perks:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {COFFEE_DISCOUNT_CODES.slice(0, 4).map((promo) => (
                                            <button
                                                key={promo.code}
                                                type="button"
                                                onClick={() => handleApplyDiscount(promo.code)}
                                                className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                                                title={promo.description}
                                            >
                                                <span>{promo.badge || promo.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Caffeine & Energy Indicator */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">⚡</span>
                            <div>
                                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                    Caffeine Kick: ~{calculatedCaffeine} mg
                                </p>
                                <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                                    {calculatedCaffeine > 150
                                        ? '🚨 High octane! Perfect for crunch hours.'
                                        : calculatedCaffeine > 60
                                        ? '✨ Smooth sustainable energy boost.'
                                        : '🌿 Gentle & zero crash.'}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300">
                            ⏱️ ~{item.prepTimeSec}s brew
                        </span>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-stone-50 dark:bg-stone-800/80 p-4 px-6 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all transform active:scale-95 flex items-center space-x-2 cursor-pointer"
                    >
                        <span>{isGiftMode ? '🎁 Send Coffee Gift' : '☕ Brew Fresh Order Now'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoffeeCustomizerModal;

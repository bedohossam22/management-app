import React, { useState } from 'react';
import { MOCK_TEAM_MEMBERS, COFFEE_MENU_ITEMS } from '../../data/coffeeMenu';
import type { CoffeeMenuItem } from '../../types/coffee';
import { coffeeSound } from '../../utils/coffeeSounds';
import { useCoffee } from '../../context/CoffeeContext';

interface SendCoffeeModalProps {
    onClose: () => void;
}

export const SendCoffeeModal: React.FC<SendCoffeeModalProps> = ({ onClose }) => {
    const { startBrewing } = useCoffee();
    const [selectedMember, setSelectedMember] = useState(MOCK_TEAM_MEMBERS[0]);
    const [selectedItem, setSelectedItem] = useState<CoffeeMenuItem>(COFFEE_MENU_ITEMS[0]);
    const [message, setMessage] = useState('Awesome teamwork today! Enjoy a freshly brewed coffee ☕🚀');

    const QUICK_MESSAGES = [
        'Awesome teamwork on closing today\'s sprint tickets! 🚀',
        'Thank you for fixing that high-priority bug so quickly! 🛠️',
        'You completely rocked the client demo presentation today! 👏',
        'Fuel up for our afternoon architecture brainstorm session! ☕',
    ];

    const handleSend = () => {
        coffeeSound.playClick();
        startBrewing(
            selectedItem,
            {
                size: 'Grande',
                milk: 'Oat Milk',
                sugar: '25% (Slight)',
                extraShots: 'None',
                temperature: 'Hot',
                recipient: selectedMember.name,
            },
            message
        );
        onClose();
    };

    return (
        <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-6">
            <div className="text-center max-w-lg mx-auto">
                <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                    Team Morale Booster
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                    🎁 Send Virtual Coffee & Kudos to Team
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Recognize great work, celebrate shipped PRs, or send a warm afternoon pick-me-up to a colleague.
                </p>
            </div>

            {/* Step 1: Select Member */}
            <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                    1. Choose Team Member:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {MOCK_TEAM_MEMBERS.map((member) => (
                        <button
                            key={member.id}
                            type="button"
                            onClick={() => setSelectedMember(member)}
                            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                                selectedMember.id === member.id
                                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-xs ring-2 ring-amber-400/20'
                                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">{member.avatar}</span>
                                <div className="truncate">
                                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                                        {member.name}
                                    </p>
                                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-1.5 text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate">
                                Fav: {member.favoriteDrink}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Select Drink or Treat */}
            <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                    2. Choose Coffee or Snack Treat:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COFFEE_MENU_ITEMS.slice(0, 8).map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                selectedItem.id === item.id
                                    ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                    : 'bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                            }`}
                        >
                            <span className="text-lg block mb-0.5">{item.icon}</span>
                            <p className="text-xs font-bold truncate">{item.name}</p>
                            <p className="text-[10px] opacity-80">{item.price}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 3: Kudos Message */}
            <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                    3. Personalized Kudos Note:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {QUICK_MESSAGES.map((msg, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setMessage(msg)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                        >
                            {msg}
                        </button>
                    ))}
                </div>
                <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900 dark:text-stone-100"
                />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={handleSend}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all transform active:scale-95 flex items-center space-x-2 cursor-pointer"
                >
                    <span>🎁 Deliver Coffee & Kudos to {selectedMember.name.split(' ')[0]}</span>
                </button>
            </div>
        </div>
    );
};

export default SendCoffeeModal;

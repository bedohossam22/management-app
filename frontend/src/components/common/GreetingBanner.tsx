import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

const quotes = [
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
    { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
    { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
    { text: 'Do the hard jobs first. The easy jobs will take care of themselves.', author: 'Dale Carnegie' },
    { text: 'Amateurs sit and wait for inspiration. The rest of us just get up and go to work.', author: 'Stephen King' },
    { text: 'You don\'t have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.' },
    { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
    { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
    { text: 'Productivity is never an accident. It is always the result of intelligent effort.', author: 'Paul J. Meyer' },
    { text: 'Your limitation—it\'s only your imagination.', author: 'Unknown' },
    { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
    { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
];

const getGreeting = (): { text: string; emoji: string } => {
    const hour = new Date().getHours();
    if (hour < 5) return { text: 'Good night', emoji: '🌙' };
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌇' };
    return { text: 'Good night', emoji: '🌙' };
};

const formatDate = (): string => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const GreetingBanner: React.FC = () => {
    const { user } = useAuth();
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

    const greeting = useMemo(() => getGreeting(), []);
    const today = useMemo(() => formatDate(), []);
    const quote = quotes[quoteIndex];

    const refreshQuote = () => {
        let next: number;
        do {
            next = Math.floor(Math.random() * quotes.length);
        } while (next === quoteIndex && quotes.length > 1);
        setQuoteIndex(next);
    };

    const firstName = user?.name?.split(' ')[0] || 'Manager';

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 sm:p-6 mb-6 shadow-lg shadow-blue-500/15 text-white">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Greeting + Date */}
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                        <span>{greeting.emoji}</span>
                        <span>{greeting.text}, {firstName}!</span>
                    </h2>
                    <p className="text-sm text-blue-100/80 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{today}</span>
                    </p>
                </div>

                {/* Right: Quote */}
                <button
                    type="button"
                    onClick={refreshQuote}
                    className="text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 max-w-md transition-all duration-200 cursor-pointer group"
                    title="Click for a new quote ✨"
                >
                    <p className="text-sm font-medium text-white/95 leading-relaxed italic">
                        "{quote.text}"
                    </p>
                    <p className="text-xs text-blue-200/70 mt-1.5 flex items-center justify-between gap-2">
                        <span>— {quote.author}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-200/50 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            new quote
                        </span>
                    </p>
                </button>
            </div>
        </div>
    );
};

export default GreetingBanner;

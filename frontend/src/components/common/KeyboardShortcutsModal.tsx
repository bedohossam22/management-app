import React from 'react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    { key: 'Ctrl + K', desc: 'Open Command Palette & Global Search' },
    { key: 'C', desc: '☕ Manager\'s Coffee & Break Bar' },
    { key: 'N', desc: 'Create a new task' },
    { key: '/', desc: 'Quickly focus search' },
    { key: '1', desc: 'Switch to List view' },
    { key: '2', desc: 'Switch to Kanban view' },
    { key: '?', desc: 'Toggle keyboard shortcuts guide' },
    { key: 'Esc', desc: 'Close open modal or unfocus search' },
];

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-stone-800 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-stone-800">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                            ⌨️
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-stone-100">Keyboard Shortcuts</h3>
                            <p className="text-xs text-gray-500 dark:text-stone-400">Speed up your workflow with hotkeys</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="py-4 space-y-2.5">
                    {shortcuts.map((shortcut) => (
                        <div
                            key={shortcut.key}
                            className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-800/60 transition-colors"
                        >
                            <span className="text-gray-700 dark:text-stone-300 font-medium text-xs sm:text-sm">{shortcut.desc}</span>
                            <kbd className="px-2.5 py-1 text-xs font-semibold text-gray-800 dark:text-stone-200 bg-gray-100 dark:bg-stone-800 border border-gray-300 dark:border-stone-700 rounded-md shadow-2xs font-mono">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-stone-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium text-gray-700 dark:text-stone-300 bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsModal;


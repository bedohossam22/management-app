import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import type {
    CoffeeMenuItem,
    CoffeeCustomization,
    ActiveBrewingOrder,
    CompletedOrder,
    CoffeeStats,
} from '../types/coffee';
import { COFFEE_MENU_ITEMS } from '../data/coffeeMenu';
import { coffeeSound } from '../utils/coffeeSounds';

export type CoffeeTabType = 'menu' | 'roulette' | 'send' | 'ot' | 'history';

interface CoffeeContextType {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    coffeeBarTab: CoffeeTabType;
    setCoffeeBarTab: (tab: CoffeeTabType) => void;
    openCoffeeBar: (tab?: CoffeeTabType) => void;
    closeCoffeeBar: () => void;
    activeOrder: ActiveBrewingOrder | null;
    orderHistory: CompletedOrder[];
    stats: CoffeeStats;
    favorites: string[];
    isMuted: boolean;
    toggleMute: () => boolean;
    startBrewing: (
        item: CoffeeMenuItem,
        customization: CoffeeCustomization,
        kudosMessage?: string
    ) => void;
    rushBrewing: () => void;
    cancelBrewing: () => void;
    takeSip: () => void;
    dismissOrder: () => void;
    reorder: (completedOrder: CompletedOrder) => void;
    toggleFavorite: (itemId: string) => void;
    isFavorite: (itemId: string) => boolean;
    clearHistory: () => void;
    customizingItem: CoffeeMenuItem | null;
    setCustomizingItem: (item: CoffeeMenuItem | null) => void;
}

const CoffeeContext = createContext<CoffeeContextType | undefined>(undefined);

const STATS_STORAGE_KEY = 'task_manager_coffee_stats';
const HISTORY_STORAGE_KEY = 'task_manager_coffee_history';
const FAVORITES_STORAGE_KEY = 'task_manager_coffee_favorites';

export const CoffeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [coffeeBarTab, setCoffeeBarTab] = useState<CoffeeTabType>('menu');
    const [customizingItem, setCustomizingItem] = useState<CoffeeMenuItem | null>(null);
    const [activeOrder, setActiveOrder] = useState<ActiveBrewingOrder | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(coffeeSound.isMuted);

    const brewIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoDismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeOrderDataRef = useRef<{
        orderId: string;
        item: CoffeeMenuItem;
        customization: CoffeeCustomization;
        kudosMessage?: string;
    } | null>(null);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (brewIntervalRef.current) clearInterval(brewIntervalRef.current);
            if (autoDismissTimeoutRef.current) clearTimeout(autoDismissTimeoutRef.current);
        };
    }, []);

    // Favorites
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
            return saved ? JSON.parse(saved) : ['sprint-espresso', 'production-coldbrew', 'butter-croissant'];
        } catch {
            return ['sprint-espresso', 'production-coldbrew', 'butter-croissant'];
        }
    });

    // Order History
    const [orderHistory, setOrderHistory] = useState<CompletedOrder[]>(() => {
        try {
            const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Daily & All-time Stats
    const [stats, setStats] = useState<CoffeeStats>(() => {
        try {
            const saved = localStorage.getItem(STATS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Check if date changed to reset daily count
                const today = new Date().toDateString();
                const lastDate = parsed.lastDate || today;
                if (lastDate !== today) {
                    return {
                        ...parsed,
                        cupsToday: 0,
                        caffeineTodayMg: 0,
                        lastDate: today,
                    };
                }
                return parsed;
            }
        } catch {}
        return {
            cupsToday: 1,
            caffeineTodayMg: 130,
            totalOrdersAllTime: 1,
            favoriteItemName: 'Sprint Espresso',
            kudosSentCount: 0,
            lastDate: new Date().toDateString(),
        };
    });

    // Save favorites to storage
    useEffect(() => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    // Save history to storage
    useEffect(() => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(orderHistory));
    }, [orderHistory]);

    // Save stats to storage
    useEffect(() => {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    }, [stats]);

    const openCoffeeBar = useCallback((tab?: CoffeeTabType) => {
        coffeeSound.playClick();
        if (tab) {
            setCoffeeBarTab(tab);
        }
        setIsModalOpen(true);
    }, []);

    const closeCoffeeBar = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const toggleMute = useCallback(() => {
        const newVal = coffeeSound.toggleMute();
        setIsMuted(newVal);
        return newVal;
    }, []);

    const isFavorite = useCallback(
        (itemId: string) => favorites.includes(itemId),
        [favorites]
    );

    const toggleFavorite = useCallback((itemId: string) => {
        setFavorites((prev) => {
            const exists = prev.includes(itemId);
            if (exists) {
                return prev.filter((id) => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    }, []);

    const clearHistory = useCallback(() => {
        setOrderHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    }, []);

    // Finish and serve active order helper
    const finishOrder = useCallback(
        (orderId: string, item: CoffeeMenuItem, customization: CoffeeCustomization, kudosMessage?: string) => {
            if (brewIntervalRef.current) {
                clearInterval(brewIntervalRef.current);
                brewIntervalRef.current = null;
            }

            setActiveOrder((prev) => (prev ? { ...prev, progress: 100, status: 'ready' } : null));

            // Play chime & celebrate
            coffeeSound.playReadyChime();

            // Complete order & save
            const recipient = customization.recipient;
            const completed: CompletedOrder = {
                id: orderId,
                item,
                customization,
                orderedAt: new Date().toISOString(),
                caffeineMg: item.caffeineMg + (customization.extraShots.includes('Turbo') ? 65 : customization.extraShots.includes('Sprint') ? 130 : 0),
                recipient,
                kudosMessage,
                discountCode: customization.discountCode,
                discountPercent: customization.discountPercent,
                finalPrice: customization.finalPrice,
            };

            setOrderHistory((prev) => [completed, ...prev].slice(0, 50));

            // Update stats
            setStats((prev) => ({
                ...prev,
                cupsToday: prev.cupsToday + (item.category !== 'snacks' ? 1 : 0),
                caffeineTodayMg: prev.caffeineTodayMg + completed.caffeineMg,
                totalOrdersAllTime: prev.totalOrdersAllTime + 1,
                kudosSentCount: prev.kudosSentCount + (recipient ? 1 : 0),
                favoriteItemName: item.name,
                lastDate: new Date().toDateString(),
                lastOrderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            if (recipient) {
                toast.success(`🎁 Virtual coffee & kudos successfully sent to ${recipient}! ☕✨`, {
                    position: 'bottom-right',
                    autoClose: 5000,
                });
            } else {
                toast.success(`☕ Ding! Your ${item.name} is freshly brewed and ready at your desk!`, {
                    position: 'bottom-right',
                    autoClose: 5000,
                });
            }

            // Auto dismiss after 6 seconds if user doesn't interact
            if (autoDismissTimeoutRef.current) {
                clearTimeout(autoDismissTimeoutRef.current);
            }
            autoDismissTimeoutRef.current = setTimeout(() => {
                setActiveOrder(null);
                autoDismissTimeoutRef.current = null;
                activeOrderDataRef.current = null;
            }, 6000);
        },
        []
    );

    // Simulated Brewing Pipeline
    const startBrewing = useCallback(
        (item: CoffeeMenuItem, customization: CoffeeCustomization, kudosMessage?: string) => {
            if (brewIntervalRef.current) clearInterval(brewIntervalRef.current);
            if (autoDismissTimeoutRef.current) clearTimeout(autoDismissTimeoutRef.current);

            const newOrderId = 'brew-' + Date.now();
            const recipient = customization.recipient;

            activeOrderDataRef.current = {
                orderId: newOrderId,
                item,
                customization,
                kudosMessage,
            };

            const initialOrder: ActiveBrewingOrder = {
                id: newOrderId,
                item,
                customization,
                status: 'grinding',
                progress: 10,
                createdAt: new Date().toISOString(),
                recipient,
                kudosMessage,
            };

            setActiveOrder(initialOrder);
            setCustomizingItem(null);
            coffeeSound.playGrind();

            // Total duration based on item prep time
            const totalDurationMs = Math.max(item.prepTimeSec * 1000, 3000);
            const intervalTime = 100;
            const stepIncrement = (intervalTime / totalDurationMs) * 100;

            let currentProg = 10;
            let playedSteam = false;

            brewIntervalRef.current = setInterval(() => {
                currentProg += stepIncrement;

                if (currentProg >= 35 && currentProg < 70 && !playedSteam) {
                    playedSteam = true;
                    coffeeSound.playSteam();
                }

                let newStatus: ActiveBrewingOrder['status'] = 'grinding';
                if (currentProg >= 75) {
                    newStatus = 'finishing';
                } else if (currentProg >= 45) {
                    newStatus = item.category === 'snacks' ? 'finishing' : 'steaming';
                } else if (currentProg >= 25) {
                    newStatus = 'extracting';
                }

                if (currentProg >= 100) {
                    finishOrder(newOrderId, item, customization, kudosMessage);
                } else {
                    setActiveOrder((prev) => (prev ? { ...prev, progress: Math.min(Math.round(currentProg), 99), status: newStatus } : null));
                }
            }, intervalTime);
        },
        [finishOrder]
    );

    // Fast-forward / instant finish brew
    const rushBrewing = useCallback(() => {
        if (!activeOrderDataRef.current) return;
        coffeeSound.playRush();
        const { orderId, item, customization, kudosMessage } = activeOrderDataRef.current;
        finishOrder(orderId, item, customization, kudosMessage);
    }, [finishOrder]);

    // Cancel current active brew
    const cancelBrewing = useCallback(() => {
        if (brewIntervalRef.current) {
            clearInterval(brewIntervalRef.current);
            brewIntervalRef.current = null;
        }
        if (autoDismissTimeoutRef.current) {
            clearTimeout(autoDismissTimeoutRef.current);
            autoDismissTimeoutRef.current = null;
        }
        activeOrderDataRef.current = null;
        setActiveOrder(null);
        coffeeSound.playClick();
        toast.info('☕ Brewing cancelled. Ready when you need energy!');
    }, []);

    // Take a sip action with sound & energy boost
    const takeSip = useCallback(() => {
        if (brewIntervalRef.current) {
            clearInterval(brewIntervalRef.current);
            brewIntervalRef.current = null;
        }
        if (autoDismissTimeoutRef.current) {
            clearTimeout(autoDismissTimeoutRef.current);
            autoDismissTimeoutRef.current = null;
        }
        activeOrderDataRef.current = null;
        setActiveOrder(null);

        coffeeSound.playSip();
        setStats((prev) => ({
            ...prev,
            sipsCount: (prev.sipsCount || 0) + 1,
        }));
        toast.success('☕ *Ahhh!* Delicious sip! +100% Focus Boost Activated! 🚀', {
            position: 'bottom-right',
            autoClose: 4000,
        });
    }, []);

    // Dismiss overlay without taking sip
    const dismissOrder = useCallback(() => {
        if (autoDismissTimeoutRef.current) {
            clearTimeout(autoDismissTimeoutRef.current);
            autoDismissTimeoutRef.current = null;
        }
        if (brewIntervalRef.current) {
            clearInterval(brewIntervalRef.current);
            brewIntervalRef.current = null;
        }
        activeOrderDataRef.current = null;
        setActiveOrder(null);
    }, []);

    const reorder = useCallback(
        (completed: CompletedOrder) => {
            const item = COFFEE_MENU_ITEMS.find((m) => m.id === completed.item.id) || completed.item;
            startBrewing(item, completed.customization, completed.kudosMessage);
        },
        [startBrewing]
    );

    return (
        <CoffeeContext.Provider
            value={{
                isModalOpen,
                setIsModalOpen,
                coffeeBarTab,
                setCoffeeBarTab,
                openCoffeeBar,
                closeCoffeeBar,
                activeOrder,
                orderHistory,
                stats,
                favorites,
                isMuted,
                toggleMute,
                startBrewing,
                rushBrewing,
                cancelBrewing,
                takeSip,
                dismissOrder,
                reorder,
                toggleFavorite,
                isFavorite,
                clearHistory,
                customizingItem,
                setCustomizingItem,
            }}
        >
            {children}
        </CoffeeContext.Provider>
    );
};

export const useCoffee = () => {
    const context = useContext(CoffeeContext);
    if (!context) {
        throw new Error('useCoffee must be used within a CoffeeProvider');
    }
    return context;
};

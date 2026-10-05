import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface CoffeeContextType {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    openCoffeeBar: () => void;
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
    const [customizingItem, setCustomizingItem] = useState<CoffeeMenuItem | null>(null);
    const [activeOrder, setActiveOrder] = useState<ActiveBrewingOrder | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(coffeeSound.isMuted);

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

    const openCoffeeBar = useCallback(() => {
        coffeeSound.playClick();
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

    // Simulated Brewing Pipeline
    const startBrewing = useCallback(
        (item: CoffeeMenuItem, customization: CoffeeCustomization, kudosMessage?: string) => {
            const newOrderId = 'brew-' + Date.now();
            const recipient = customization.recipient;

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

            const timer = setInterval(() => {
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
                    clearInterval(timer);
                    setActiveOrder((prev) => (prev ? { ...prev, progress: 100, status: 'ready' } : null));

                    // Play chime & celebrate
                    coffeeSound.playReadyChime();

                    // Complete order & save
                    const completed: CompletedOrder = {
                        id: newOrderId,
                        item,
                        customization,
                        orderedAt: new Date().toISOString(),
                        caffeineMg: item.caffeineMg + (customization.extraShots.includes('Turbo') ? 65 : customization.extraShots.includes('Sprint') ? 130 : 0),
                        recipient,
                        kudosMessage,
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

                    // Clear active order after 3.5 seconds
                    setTimeout(() => {
                        setActiveOrder(null);
                    }, 3500);
                } else {
                    setActiveOrder((prev) => (prev ? { ...prev, progress: Math.min(Math.round(currentProg), 99), status: newStatus } : null));
                }
            }, intervalTime);
        },
        []
    );

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
                openCoffeeBar,
                closeCoffeeBar,
                activeOrder,
                orderHistory,
                stats,
                favorites,
                isMuted,
                toggleMute,
                startBrewing,
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

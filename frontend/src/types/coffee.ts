export type CoffeeCategory = 'espresso' | 'iced' | 'tea' | 'snacks';

export type DrinkSize = 'Short' | 'Tall' | 'Grande' | 'Manager Venti';
export type MilkOption = 'Whole Milk' | 'Oat Milk' | 'Almond Milk' | 'Soy Milk' | 'No Milk';
export type SugarLevel = '0% (Black)' | '25% (Slight)' | '50% (Standard)' | '100% (Sweet)';
export type ExtraShot = 'None' | '+1 Turbo Shot' | '+2 Sprint Crunch Shots';
export type Temperature = 'Hot' | 'Extra Hot' | 'Iced';

export interface CoffeeMenuItem {
    id: string;
    name: string;
    arabicName?: string;
    category: CoffeeCategory;
    price: string;
    caffeineMg: number;
    description: string;
    managerPerk: string;
    icon: string;
    tags: string[];
    isPopular?: boolean;
    prepTimeSec: number;
    calories: number;
    recommendedFor: string;
}

export interface CoffeeCustomization {
    size: DrinkSize;
    milk: MilkOption;
    sugar: SugarLevel;
    extraShots: ExtraShot;
    temperature: Temperature;
    warmSnack?: boolean;
    specialNotes?: string;
    recipient?: string;
}

export interface ActiveBrewingOrder {
    id: string;
    item: CoffeeMenuItem;
    customization: CoffeeCustomization;
    status: 'grinding' | 'extracting' | 'steaming' | 'finishing' | 'ready';
    progress: number; // 0 to 100
    createdAt: string;
    recipient?: string;
    kudosMessage?: string;
}

export interface CompletedOrder {
    id: string;
    item: CoffeeMenuItem;
    customization: CoffeeCustomization;
    orderedAt: string;
    caffeineMg: number;
    recipient?: string;
    kudosMessage?: string;
}

export interface CoffeeStats {
    cupsToday: number;
    caffeineTodayMg: number;
    totalOrdersAllTime: number;
    favoriteItemName?: string;
    kudosSentCount: number;
    lastOrderTime?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    favoriteDrink: string;
}

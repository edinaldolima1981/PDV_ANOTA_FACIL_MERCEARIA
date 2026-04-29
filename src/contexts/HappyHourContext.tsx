import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import type { Product } from "@/data/products";

export interface HappyHourConfig {
  enabled: boolean;
  startHour: number;   // 0-23
  endHour: number;     // 0-23 (exclusivo)
  weekdays: number[];  // 0=domingo ... 6=sábado
  discountPct: number; // 0-100, aplicado em todos os produtos do bar
  appliesToCategories: string[]; // vazio = todos
}

interface HappyHourContextType {
  config: HappyHourConfig;
  updateConfig: (data: Partial<HappyHourConfig>) => void;
  isActiveNow: (now?: Date) => boolean;
  applyHappyHour: (product: Product, now?: Date) => { price: number; applied: boolean };
}

const STORAGE_KEY = "pdv:happy-hour:v1";

const DEFAULT_CONFIG: HappyHourConfig = {
  enabled: false,
  startHour: 18,
  endHour: 20,
  weekdays: [1, 2, 3, 4, 5],
  discountPct: 20,
  appliesToCategories: [],
};

const HappyHourContext = createContext<HappyHourContextType | undefined>(undefined);

export const HappyHourProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<HappyHourConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
  }, [config]);

  const updateConfig = useCallback((data: Partial<HappyHourConfig>) => {
    setConfig((prev) => ({ ...prev, ...data }));
  }, []);

  const isActiveNow = useCallback((now: Date = new Date()) => {
    if (!config.enabled) return false;
    const dow = now.getDay();
    if (!config.weekdays.includes(dow)) return false;
    const h = now.getHours();
    if (config.startHour <= config.endHour) {
      return h >= config.startHour && h < config.endHour;
    }
    // janela cruza meia-noite
    return h >= config.startHour || h < config.endHour;
  }, [config]);

  const applyHappyHour = useCallback((product: Product, now: Date = new Date()) => {
    if (!isActiveNow(now)) return { price: product.price, applied: false };
    if (config.appliesToCategories.length > 0 && !config.appliesToCategories.includes(product.category)) {
      return { price: product.price, applied: false };
    }
    const discounted = product.price * (1 - config.discountPct / 100);
    return { price: Math.max(0, Number(discounted.toFixed(2))), applied: true };
  }, [config, isActiveNow]);

  return (
    <HappyHourContext.Provider value={{ config, updateConfig, isActiveNow, applyHappyHour }}>
      {children}
    </HappyHourContext.Provider>
  );
};

export const useHappyHour = () => {
  const ctx = useContext(HappyHourContext);
  if (!ctx) throw new Error("useHappyHour must be used within HappyHourProvider");
  return ctx;
};

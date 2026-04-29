import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";

export interface Waiter {
  id: string;
  name: string;
  pin: string;
  commissionPct: number; // 0-100
  active: boolean;
}

export interface WaiterSale {
  id: string;
  waiterId: string;
  tableId: string;
  amount: number;
  at: string;
}

interface WaiterContextType {
  waiters: Waiter[];
  sales: WaiterSale[];
  addWaiter: (data: Omit<Waiter, "id" | "active">) => Waiter;
  updateWaiter: (id: string, data: Partial<Waiter>) => void;
  removeWaiter: (id: string) => void;
  getWaiter: (id?: string) => Waiter | undefined;
  registerSale: (sale: Omit<WaiterSale, "id" | "at">) => void;
  getCommissionsForPeriod: (fromIso?: string) => Array<{ waiter: Waiter; total: number; commission: number; sales: number }>;
}

const STORAGE_KEY = "pdv:waiters:v1";
const SALES_KEY = "pdv:waiter-sales:v1";

const DEFAULT_WAITERS: Waiter[] = [
  { id: "w1", name: "Carlos", pin: "1111", commissionPct: 10, active: true },
  { id: "w2", name: "Bruna", pin: "2222", commissionPct: 10, active: true },
];

const WaiterContext = createContext<WaiterContextType | undefined>(undefined);

export const WaiterProvider = ({ children }: { children: ReactNode }) => {
  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_WAITERS;
    } catch {
      return DEFAULT_WAITERS;
    }
  });
  const [sales, setSales] = useState<WaiterSale[]>(() => {
    try {
      const raw = localStorage.getItem(SALES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(waiters)); } catch {}
  }, [waiters]);
  useEffect(() => {
    try { localStorage.setItem(SALES_KEY, JSON.stringify(sales)); } catch {}
  }, [sales]);

  const addWaiter = useCallback((data: Omit<Waiter, "id" | "active">) => {
    const w: Waiter = { ...data, id: `w${Date.now()}`, active: true };
    setWaiters((prev) => [...prev, w]);
    return w;
  }, []);

  const updateWaiter = useCallback((id: string, data: Partial<Waiter>) => {
    setWaiters((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
  }, []);

  const removeWaiter = useCallback((id: string) => {
    setWaiters((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const getWaiter = useCallback((id?: string) => waiters.find((w) => w.id === id), [waiters]);

  const registerSale = useCallback((sale: Omit<WaiterSale, "id" | "at">) => {
    setSales((prev) => [...prev, { ...sale, id: `ws${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, at: new Date().toISOString() }]);
  }, []);

  const getCommissionsForPeriod = useCallback((fromIso?: string) => {
    const fromTime = fromIso ? new Date(fromIso).getTime() : 0;
    return waiters.map((w) => {
      const ws = sales.filter((s) => s.waiterId === w.id && new Date(s.at).getTime() >= fromTime);
      const total = ws.reduce((sum, s) => sum + s.amount, 0);
      return { waiter: w, total, commission: total * (w.commissionPct / 100), sales: ws.length };
    });
  }, [waiters, sales]);

  return (
    <WaiterContext.Provider value={{ waiters, sales, addWaiter, updateWaiter, removeWaiter, getWaiter, registerSale, getCommissionsForPeriod }}>
      {children}
    </WaiterContext.Provider>
  );
};

export const useWaiters = () => {
  const ctx = useContext(WaiterContext);
  if (!ctx) throw new Error("useWaiters must be used within WaiterProvider");
  return ctx;
};

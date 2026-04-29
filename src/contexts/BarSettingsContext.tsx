import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";

export interface BarSettings {
  serviceFeePct: number;        // 10 (taxa do garçom padrão)
  serviceFeeDefaultOn: boolean; // se mesas novas já vêm com taxa
  couvertPerPerson: number;     // valor do couvert por pessoa, 0 = desabilitado
  quickModifiers: string[];     // tags rápidas para modificadores
}

interface BarSettingsContextType {
  settings: BarSettings;
  update: (data: Partial<BarSettings>) => void;
}

const STORAGE_KEY = "pdv:bar-settings:v1";

const DEFAULT: BarSettings = {
  serviceFeePct: 10,
  serviceFeeDefaultOn: true,
  couvertPerPerson: 0,
  quickModifiers: ["sem gelo", "com limão", "para viagem", "dose dupla", "bem gelada", "sem açúcar"],
};

const BarSettingsContext = createContext<BarSettingsContextType | undefined>(undefined);

export const BarSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<BarSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  const update = useCallback((data: Partial<BarSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  return (
    <BarSettingsContext.Provider value={{ settings, update }}>
      {children}
    </BarSettingsContext.Provider>
  );
};

export const useBarSettings = () => {
  const ctx = useContext(BarSettingsContext);
  if (!ctx) throw new Error("useBarSettings must be used within BarSettingsProvider");
  return ctx;
};

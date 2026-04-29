import { useState, createContext, useContext, useCallback, type ReactNode } from "react";

export type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria" | "";

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storeHours: string;
  storePhone: string;
  ownerName: string;
  pixKey: string;
  pixKeyType: PixKeyType;
  moduleRestaurante: boolean;
  moduleBar: boolean;
  storeBanner: string; // data URL (base64) or empty string
}

interface StoreContextType extends StoreSettings {
  updateStore: (data: Partial<StoreSettings>) => void;
  setPixKey: (key: string) => void;
  setStoreBanner: (banner: string) => void;
  pixKeyFormatted: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function detectPixKeyType(key: string): PixKeyType {
  const clean = key.replace(/[\s.\-/()]/g, "");
  if (!clean) return "";
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key.trim())) return "email";
  // CPF: 11 digits (not starting with +)
  if (/^\d{11}$/.test(clean) && !clean.startsWith("+")) return "cpf";
  // CNPJ: 14 digits
  if (/^\d{14}$/.test(clean)) return "cnpj";
  // Phone: starts with + or has 10-13 digits
  if (/^\+?\d{10,13}$/.test(clean)) return "telefone";
  // Random key (UUID-like or 32+ chars)
  if (/^[a-f0-9-]{32,}$/i.test(clean)) return "aleatoria";
  // Fallback: if all digits
  if (/^\d+$/.test(clean)) {
    if (clean.length === 11) return "cpf";
    if (clean.length === 14) return "cnpj";
  }
  return "aleatoria";
}

function formatPixKey(key: string, type: PixKeyType): string {
  const clean = key.replace(/[\s.\-/()]/g, "");
  switch (type) {
    case "cpf":
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    case "cnpj":
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    case "telefone":
      if (clean.startsWith("55") && clean.length >= 12) {
        const ddd = clean.slice(2, 4);
        const num = clean.slice(4);
        return `+55 (${ddd}) ${num.slice(0, -4)}-${num.slice(-4)}`;
      }
      return key;
    default:
      return key.trim();
  }
}

const PIX_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  telefone: "Telefone",
  aleatoria: "Chave Aleatória",
  "": "",
};

export { PIX_TYPE_LABELS };

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "Empório Orgânico",
    storeAddress: "Rua das Flores, 123 - Centro",
    storeHours: "08:00 - 22:00",
    storePhone: "(11) 3333-4444",
    ownerName: "",
    pixKey: "95193258300",
    pixKeyType: "cpf",
    moduleRestaurante: false,
    moduleBar: false,
    storeBanner: "",
  });

  const updateStore = useCallback((data: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  const setPixKey = useCallback((key: string) => {
    const type = detectPixKeyType(key);
    setSettings((prev) => ({ ...prev, pixKey: key, pixKeyType: type }));
  }, []);

  const setStoreBanner = useCallback((banner: string) => {
    setSettings((prev) => ({ ...prev, storeBanner: banner }));
  }, []);

  const pixKeyFormatted = formatPixKey(settings.pixKey, settings.pixKeyType);

  return (
    <StoreContext.Provider value={{ ...settings, updateStore, setPixKey, setStoreBanner, pixKeyFormatted }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};

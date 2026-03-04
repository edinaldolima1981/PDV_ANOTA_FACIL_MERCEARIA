import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import type { Product, Category } from "@/data/products";
import { MOCK_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from "@/data/products";

export interface CustomUnit {
  id: string;
  label: string;
  short: string;
}

const DEFAULT_UNITS: CustomUnit[] = [
  { id: "un", label: "Unidade", short: "un" },
  { id: "kg", label: "Quilograma", short: "kg" },
  { id: "L", label: "Litro", short: "L" },
  { id: "m", label: "Metro", short: "m" },
  { id: "m2", label: "Metro²", short: "m²" },
  { id: "peca", label: "Peça", short: "pç" },
  { id: "par", label: "Par", short: "par" },
  { id: "saco", label: "Saco", short: "sc" },
  { id: "duzia", label: "Dúzia", short: "dz" },
  { id: "cx", label: "Caixa", short: "cx" },
];

// Keep backward-compatible exports
export type ProductUnit = string;

export const UNIT_LABELS: Record<string, string> = {};
export const UNIT_SHORT: Record<string, string> = {};
DEFAULT_UNITS.forEach((u) => {
  UNIT_LABELS[u.id] = u.label;
  UNIT_SHORT[u.id] = u.short;
});

interface ProductContextType {
  products: Product[];
  categories: Category[];
  units: CustomUnit[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addUnit: (unit: Omit<CustomUnit, "id">) => void;
  deleteUnit: (id: string) => void;
  getUnitShort: (id: string) => string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([...MOCK_PRODUCTS]);
  const [categories, setCategories] = useState<Category[]>([...DEFAULT_CATEGORIES]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const id = `p${Date.now()}`;
    setProducts((prev) => [...prev, { ...product, id } as Product]);
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCategory = useCallback((category: Category) => {
    setCategories((prev) => [...prev, category]);
  }, []);

  const updateCategory = useCallback((id: string, data: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <ProductContext.Provider
      value={{ products, categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within ProductProvider");
  return context;
};

import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import type { Product, Category } from "@/data/products";
import { MOCK_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from "@/data/products";

export type ProductUnit = "un" | "kg" | "L" | "m" | "m2" | "peca" | "par" | "saco" | "duzia" | "cx";

export const UNIT_LABELS: Record<ProductUnit, string> = {
  un: "Unidade",
  kg: "Quilograma",
  L: "Litro",
  m: "Metro",
  m2: "Metro²",
  peca: "Peça",
  par: "Par",
  saco: "Saco",
  duzia: "Dúzia",
  cx: "Caixa",
};

export const UNIT_SHORT: Record<ProductUnit, string> = {
  un: "un",
  kg: "kg",
  L: "L",
  m: "m",
  m2: "m²",
  peca: "pç",
  par: "par",
  saco: "sc",
  duzia: "dz",
  cx: "cx",
};

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
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

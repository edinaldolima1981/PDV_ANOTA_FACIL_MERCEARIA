export type SaleMode = "unit" | "weight";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image?: string;
  stock: number;
  /** Define como o produto é vendido. "weight" abre modal de pesagem no PDV. */
  saleMode?: SaleMode;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Category = {
  id: string;
  label: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: "todos", label: "Todos", icon: "🏪" },
  { id: "acougue", label: "Açougue", icon: "🥩" },
  { id: "frutas", label: "Frutas", icon: "🍎" },
  { id: "verduras", label: "Verduras", icon: "🥬" },
  { id: "laticinios", label: "Laticínios", icon: "🧀" },
  { id: "bebidas", label: "Bebidas", icon: "🥤" },
  { id: "graos", label: "Grãos", icon: "🌾" },
  { id: "padaria", label: "Padaria", icon: "🍞" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Banana Orgânica", price: 6.90, unit: "kg", category: "frutas", stock: 45 },
  { id: "2", name: "Maçã Fuji", price: 9.50, unit: "kg", category: "frutas", stock: 30 },
  { id: "3", name: "Alface Crespa", price: 3.50, unit: "un", category: "verduras", stock: 20 },
  { id: "4", name: "Brócolis Orgânico", price: 7.80, unit: "un", category: "verduras", stock: 15 },
  { id: "5", name: "Queijo Minas Frescal", price: 28.90, unit: "kg", category: "laticinios", stock: 10 },
  { id: "6", name: "Iogurte Natural", price: 8.50, unit: "un", category: "laticinios", stock: 25 },
  { id: "7", name: "Suco de Laranja", price: 12.00, unit: "L", category: "bebidas", stock: 18 },
  { id: "8", name: "Kombucha Gengibre", price: 15.90, unit: "un", category: "bebidas", stock: 12 },
  { id: "9", name: "Granola Artesanal", price: 22.50, unit: "kg", category: "graos", stock: 20 },
  { id: "10", name: "Arroz Integral", price: 9.80, unit: "kg", category: "graos", stock: 40 },
  { id: "11", name: "Pão Integral", price: 11.50, unit: "un", category: "padaria", stock: 8 },
  { id: "12", name: "Bolo de Cenoura", price: 18.00, unit: "un", category: "padaria", stock: 5 },
  { id: "13", name: "Morango Orgânico", price: 14.90, unit: "kg", category: "frutas", stock: 10 },
  { id: "14", name: "Leite de Amêndoas", price: 16.90, unit: "L", category: "bebidas", stock: 15 },
  { id: "15", name: "Couve Orgânica", price: 4.50, unit: "un", category: "verduras", stock: 22 },
  { id: "16", name: "Picanha Bovina", price: 69.90, unit: "kg", category: "acougue", stock: 15 },
  { id: "17", name: "Frango Inteiro", price: 14.90, unit: "kg", category: "acougue", stock: 20 },
  { id: "18", name: "Costela Suína", price: 32.90, unit: "kg", category: "acougue", stock: 12 },
  { id: "19", name: "Linguiça Toscana", price: 24.90, unit: "kg", category: "acougue", stock: 18 },
  { id: "20", name: "Carne Moída", price: 29.90, unit: "kg", category: "acougue", stock: 25 },
  { id: "21", name: "Alcatra", price: 49.90, unit: "kg", category: "acougue", stock: 10 },
];

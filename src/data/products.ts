export interface Product {
  id: string;
  name: string;
  price: number;
  unit: "kg" | "un" | "L";
  category: string;
  image?: string;
  stock: number;
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
];

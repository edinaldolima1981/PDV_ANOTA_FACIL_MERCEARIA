import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ScanBarcode, ShoppingCart, User } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import PosLayout from "@/components/pdv/PosLayout";
import CategoryBar from "@/components/pdv/CategoryBar";
import ProductCard from "@/components/pdv/ProductCard";
import CartPanel from "@/components/pdv/CartPanel";
import { toast } from "sonner";

const SalesHome = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const { addItem, totalItems, totalPrice } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PosLayout>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-12 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <ScanBarcode className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground font-body">Operador</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
              <span className="text-sm font-medium text-foreground font-body">Maria Oliveira</span>
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        <div className="px-5 py-3 border-b border-border bg-card flex-shrink-0">
          <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={(p) => {
                  addItem(p, 1);
                  toast.success(`${p.name} adicionado ao carrinho`);
                }}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-body">Nenhum produto encontrado</p>
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <button
            onClick={() => navigate("/cart")}
            className="lg:hidden fixed right-4 h-14 bg-primary text-primary-foreground rounded-2xl shadow-elevated flex items-center gap-3 px-5 active:scale-[0.98] transition-all z-40 animate-fade-up"
            style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-body font-semibold text-sm">{totalItems}</span>
            <span className="font-body font-bold text-sm">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </button>
        )}
      </main>
      <CartPanel />
    </PosLayout>
  );
};

export default SalesHome;

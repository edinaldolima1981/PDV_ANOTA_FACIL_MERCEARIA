import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ScanBarcode, ShoppingCart, Leaf, LogOut } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import CategoryBar from "@/components/pdv/CategoryBar";
import ProductCard from "@/components/pdv/ProductCard";
import QuantityModal from "@/components/pdv/QuantityModal";

const SalesHome = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="bg-card shadow-soft px-4 pt-6 pb-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                Empório Orgânico
              </h1>
              <p className="text-xs text-muted-foreground font-body">
                Mercearia & Conveniência
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-12 rounded-xl bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
            <ScanBarcode className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Categories */}
        <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
      </header>

      {/* Products Grid */}
      <main className="flex-1 px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground font-body">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-body">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      {/* Cart FAB */}
      {totalItems > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed bottom-6 left-4 right-4 h-14 bg-primary text-primary-foreground rounded-2xl shadow-elevated flex items-center justify-between px-5 active:scale-[0.98] transition-all z-40 animate-fade-up"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-body font-semibold text-sm">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
          </div>
          <span className="font-body font-bold text-base">
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </button>
      )}

      {/* Quantity Modal */}
      {selectedProduct && (
        <QuantityModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default SalesHome;

import { useState } from "react";
import { Search, Package, Plus, Edit2, ArrowLeft } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type StockFilter = "all" | "normal" | "low" | "out";

const getStockStatus = (stock: number): { label: string; color: string; bg: string } => {
  if (stock === 0) return { label: "Esgotado", color: "text-destructive", bg: "bg-destructive/10" };
  if (stock <= 10) return { label: "Baixo", color: "text-warning", bg: "bg-warning/10" };
  return { label: "Normal", color: "text-success", bg: "bg-success/10" };
};

const StockPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const navigate = useNavigate();

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    if (filter === "out") return matchesSearch && p.stock === 0;
    if (filter === "low") return matchesSearch && p.stock > 0 && p.stock <= 10;
    return matchesSearch && p.stock > 10;
  });

  const filters: { id: StockFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "normal", label: "Normal" },
    { id: "low", label: "Baixo" },
    { id: "out", label: "Esgotado" },
  ];

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditStock(String(product.stock));
    setEditPrice(product.price.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32">
      {/* Header */}
      <header className="bg-card shadow-soft px-4 pt-6 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/home")}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">Estoque</h1>
            <p className="text-xs text-muted-foreground font-body">{MOCK_PRODUCTS.length} produtos cadastrados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar no estoque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-body transition-all active:scale-95 ${
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Product List */}
      <main className="flex-1 px-4 pt-4 space-y-3">
        {filtered.map((product) => {
          const status = getStockStatus(product.stock);
          const unitLabel = product.unit === "kg" ? "kg" : product.unit === "L" ? "L" : "un";

          return (
            <div key={product.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                {product.category === "frutas" && "🍎"}
                {product.category === "verduras" && "🥬"}
                {product.category === "laticinios" && "🧀"}
                {product.category === "bebidas" && "🥤"}
                {product.category === "graos" && "🌾"}
                {product.category === "padaria" && "🍞"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground font-body truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground font-body">
                  R$ {product.price.toFixed(2).replace(".", ",")} / {unitLabel}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-body">
                    {product.stock} {unitLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openEdit(product)}
                className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-body">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setEditingProduct(null)}>
          <div className="bg-card w-full max-w-md rounded-t-3xl p-6 pb-8 shadow-elevated animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{editingProduct.name}</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Estoque ({editingProduct.unit})</label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <Button size="xl" className="w-full rounded-2xl" onClick={() => setEditingProduct(null)}>
              Salvar alterações
            </Button>
          </div>
        </div>
      )}

      {/* FAB Add Product */}
      <button className="fixed bottom-6 right-4 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-elevated flex items-center justify-center active:scale-95 transition-all z-40">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default StockPage;

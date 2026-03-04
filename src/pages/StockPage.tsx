import { useState } from "react";
import { Search, Package, Plus, Edit2 } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import PosLayout from "@/components/pdv/PosLayout";

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
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Estoque</h1>
              <p className="text-xs text-muted-foreground font-body">{MOCK_PRODUCTS.length} produtos cadastrados</p>
            </div>
            <Button size="sm" className="rounded-lg gap-1.5">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar no estoque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-medium font-body transition-all ${
                  filter === f.id
                    ? "bg-foreground text-card"
                    : "bg-secondary text-foreground border border-border hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        {/* Product List */}
        <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-2">
          {filtered.map((product) => {
            const status = getStockStatus(product.stock);
            const unitLabel = product.unit === "kg" ? "kg" : product.unit === "L" ? "L" : "un";

            return (
              <div key={product.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:shadow-soft transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground font-body truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    R$ {product.price.toFixed(2).replace(".", ",")} / {unitLabel}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {product.stock} {unitLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(product)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
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
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setEditingProduct(null)}>
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-elevated animate-fade-up mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{editingProduct.name}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Preço (R$)</label>
                <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Estoque ({editingProduct.unit})</label>
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <Button size="lg" className="w-full rounded-xl" onClick={() => setEditingProduct(null)}>
              Salvar alterações
            </Button>
          </div>
        </div>
      )}
    </PosLayout>
  );
};

export default StockPage;

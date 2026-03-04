import { useState } from "react";
import { Search, Package, Plus, Edit2, Trash2, ImagePlus, X, Save } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import PosLayout from "@/components/pdv/PosLayout";
import { toast } from "sonner";

type StockFilter = "all" | "normal" | "low" | "out";

const CATEGORY_EMOJI: Record<string, string> = {
  acougue: "🥩", frutas: "🍎", verduras: "🥬", laticinios: "🧀",
  bebidas: "🥤", graos: "🌾", padaria: "🍞",
};

const getStockStatus = (stock: number): { label: string; color: string; bg: string } => {
  if (stock === 0) return { label: "Esgotado", color: "text-destructive", bg: "bg-destructive/10" };
  if (stock <= 10) return { label: "Baixo", color: "text-warning", bg: "bg-warning/10" };
  return { label: "Normal", color: "text-success", bg: "bg-success/10" };
};

const StockPage = () => {
  const [products, setProducts] = useState<Product[]>([...MOCK_PRODUCTS]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
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
    setEditName(product.name);
    setEditImage(product.image || "");
  };

  const handleSave = () => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, name: editName, price: parseFloat(editPrice) || p.price, stock: parseInt(editStock) || 0, image: editImage || undefined }
          : p
      )
    );
    toast.success("Produto atualizado com sucesso!");
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
    toast.success("Produto excluído com sucesso!");
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Estoque</h1>
              <p className="text-xs text-muted-foreground font-body">{products.length} produtos cadastrados</p>
            </div>
            <Button size="sm" className="rounded-lg gap-1.5">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar no estoque..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>

          <div className="flex gap-2">
            {filters.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-medium font-body transition-all ${
                  filter === f.id ? "bg-foreground text-card" : "bg-secondary text-foreground border border-border hover:bg-muted"
                }`}>
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
                {/* Product Image */}
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{CATEGORY_EMOJI[product.category] || "📦"}</span>
                  )}
                </div>

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

                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(product)}
                    className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {deleteConfirmId === product.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(product.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(null)}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(product.id)}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
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
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Editar Produto</h3>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground font-body mb-1 block">Imagem do Produto</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border">
                  {editImage ? (
                    <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{CATEGORY_EMOJI[editingProduct.category] || "📦"}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs" onClick={handleImageUpload}>
                    <ImagePlus className="w-3.5 h-3.5" />
                    {editImage ? "Trocar Imagem" : "Adicionar Imagem"}
                  </Button>
                  {editImage && (
                    <button onClick={() => setEditImage("")} className="text-xs text-destructive font-body hover:underline text-left">
                      Remover imagem
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Nome</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
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
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button size="lg" className="flex-1 rounded-xl gap-1.5" onClick={handleSave}>
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </PosLayout>
  );
};

export default StockPage;

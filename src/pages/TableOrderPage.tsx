import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, ScanBarcode, ShoppingCart, ChevronLeft, X } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useTables } from "@/contexts/TableContext";
import { useHappyHour } from "@/contexts/HappyHourContext";
import type { Product } from "@/data/products";
import PosLayout from "@/components/pdv/PosLayout";
import CategoryBar from "@/components/pdv/CategoryBar";
import ProductCard from "@/components/pdv/ProductCard";
import TableComandaPanel from "@/components/pdv/TableComandaPanel";
import StoreBanner from "@/components/pdv/StoreBanner";
import WeightModal from "@/components/pdv/WeightModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TableOrderPage = () => {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const { tables, addOrder, addComanda, getTableTotals } = useTables();
  const { products, sellsByWeight } = useProducts();
  const { applyHappyHour } = useHappyHour();

  const table = tables.find((t) => t.id === tableId);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [activeComandaId, setActiveComandaId] = useState<string>("");
  const [showNewComanda, setShowNewComanda] = useState(false);
  const [newComandaLabel, setNewComandaLabel] = useState("");

  // Sync active comanda with table state
  useEffect(() => {
    if (!table) return;
    if (!activeComandaId || !table.comandas.find((c) => c.id === activeComandaId)) {
      setActiveComandaId(table.comandas[0]?.id || "");
    }
  }, [table, activeComandaId]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [products, search, selectedCategory]
  );

  if (!table) {
    return (
      <PosLayout>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground font-body">Mesa não encontrada</p>
            <Button className="mt-4 rounded-xl" onClick={() => navigate(-1)}>Voltar</Button>
          </div>
        </main>
      </PosLayout>
    );
  }

  const handleAddProduct = (product: Product, qty: number) => {
    const { price } = applyHappyHour(product);
    addOrder(table.id, {
      product,
      quantity: qty,
      unitPrice: price,
      comandaId: activeComandaId || undefined,
      waiterId: table.waiterId,
    });
    toast.success(`${product.name} adicionado à comanda`);
  };

  const handleNewComanda = () => {
    const id = addComanda(table.id, newComandaLabel.trim() || undefined);
    setActiveComandaId(id);
    setNewComandaLabel("");
    setShowNewComanda(false);
    toast.success("Nova comanda criada");
  };

  const totals = getTableTotals(table.id);
  const backRoute = table.module === "bar" ? "/bar" : "/restaurante";

  return (
    <PosLayout>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate(backRoute)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
            title="Voltar para mesas"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <StoreBanner size="sm" />
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
            <span className="text-xs text-muted-foreground font-body">Mesa</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
              <span className="text-sm font-medium text-foreground font-body">{table.label}</span>
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
                  if (sellsByWeight(p)) {
                    setWeightProduct(p);
                  } else {
                    handleAddProduct(p, 1);
                  }
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

        {/* Mobile floating cart button */}
        {totals.subtotal > 0 && (
          <button
            onClick={() => navigate(`/mesa/${table.id}/conta`)}
            className="lg:hidden fixed right-4 h-14 bg-primary text-primary-foreground rounded-2xl shadow-elevated flex items-center gap-3 px-5 active:scale-[0.98] transition-all z-40 animate-fade-up"
            style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-body font-bold text-sm">
              R$ {totals.total.toFixed(2).replace(".", ",")}
            </span>
          </button>
        )}
      </main>

      <TableComandaPanel
        table={table}
        activeComandaId={activeComandaId}
        onChangeComanda={setActiveComandaId}
        onNewComanda={() => setShowNewComanda(true)}
        onCheckout={() => {
          // Navigate back to the map; payment is in the side panel via TableOrderPanel
          // For now, route to bar/restaurant page where payment modal lives
          navigate(backRoute, { state: { openTable: table.id } });
        }}
      />

      {weightProduct && (
        <WeightModal
          product={weightProduct}
          onClose={() => setWeightProduct(null)}
          onConfirm={(w) => {
            handleAddProduct(weightProduct, w);
            setWeightProduct(null);
          }}
        />
      )}

      {showNewComanda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-display text-base font-bold text-foreground">Nova comanda</h3>
              <button onClick={() => setShowNewComanda(false)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={newComandaLabel}
                onChange={(e) => setNewComandaLabel(e.target.value)}
                placeholder="Nome do cliente (opcional)"
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body"
                autoFocus
              />
              <Button className="w-full rounded-xl" onClick={handleNewComanda}>
                Criar comanda
              </Button>
            </div>
          </div>
        </div>
      )}
    </PosLayout>
  );
};

export default TableOrderPage;

import { useState } from "react";
import { useTables, type Table } from "@/contexts/TableContext";
import { useProducts } from "@/contexts/ProductContext";
import { useStore } from "@/contexts/StoreContext";
import { X, Plus, Minus, Trash2, Printer, SplitSquareHorizontal, Search, ChevronLeft, CheckCircle2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import WeightModal from "@/components/pdv/WeightModal";
import type { Product } from "@/data/products";

interface TableOrderPanelProps {
  table: Table;
  onClose: () => void;
}

const TableOrderPanel = ({ table, onClose }: TableOrderPanelProps) => {
  const { addOrder, removeOrder, updateOrderQuantity, closeTable, openTable, reserveTable, markAllPrinted, getTableTotal, splitBill } = useTables();
  const { products, isWeightUnit, getUnitShort } = useProducts();
  const store = useStore();
  const [showProducts, setShowProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSplit, setShowSplit] = useState(false);
  const [splitParts, setSplitParts] = useState(2);
  const [customerName, setCustomerName] = useState(table.customerName || "");
  const [showReserve, setShowReserve] = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const total = getTableTotal(table.id);
  const perPerson = splitBill(table.id, splitParts);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: typeof products[0]) => {
    if (isWeightUnit(product.unit)) {
      setWeightProduct(product);
      return;
    }
    addOrder(table.id, product, 1);
    if (table.status === "free") {
      openTable(table.id, customerName || undefined);
    }
    toast({ title: `${product.name} adicionado à ${table.label}` });
  };

  const confirmWeightAdd = (weight: number) => {
    if (!weightProduct) return;
    addOrder(table.id, weightProduct, weight);
    if (table.status === "free") {
      openTable(table.id, customerName || undefined);
    }
    toast({ title: `${weightProduct.name} (${weight.toFixed(3).replace(".", ",")} ${getUnitShort(weightProduct.unit)}) adicionado` });
    setWeightProduct(null);
  };

  const handleCloseTable = () => {
    closeTable(table.id);
    toast({ title: `${table.label} fechada`, description: `Total: ${fmt(total)}` });
    onClose();
  };

  const handleOpenTable = () => {
    openTable(table.id, customerName || undefined);
    toast({ title: `${table.label} aberta` });
  };

  const handleReserve = () => {
    if (!customerName.trim()) return;
    reserveTable(table.id, customerName);
    setShowReserve(false);
    toast({ title: `${table.label} reservada para ${customerName}` });
  };

  const handlePrintComanda = () => {
    const unprintedOrders = table.orders.filter((o) => !o.printed);
    if (unprintedOrders.length === 0) {
      toast({ title: "Nenhum item novo para imprimir" });
      return;
    }

    const now = new Date();
    const header = `
════════════════════════════
   COMANDA - ${table.label.toUpperCase()}
   ${store.storeName}
════════════════════════════
Data: ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}
${table.customerName ? `Cliente: ${table.customerName}` : ""}
────────────────────────────
`;
    const items = unprintedOrders
      .map((o) => `${o.quantity}x ${o.product.name} ${o.notes ? `(${o.notes})` : ""}`)
      .join("\n");

    const content = header + items + "\n════════════════════════════\n";

    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${content}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }

    markAllPrinted(table.id);
    toast({ title: "Comanda enviada para impressão" });
  };

  const handlePrintBill = () => {
    const now = new Date();
    const header = `
════════════════════════════
   CONTA - ${table.label.toUpperCase()}
   ${store.storeName}
════════════════════════════
Data: ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}
${table.customerName ? `Cliente: ${table.customerName}` : ""}
────────────────────────────
`;
    const items = table.orders
      .map((o) => {
        const subtotal = o.product.price * o.quantity;
        return `${o.quantity}x ${o.product.name}\n   ${fmt(o.product.price)} = ${fmt(subtotal)}`;
      })
      .join("\n");

    const footer = `
────────────────────────────
TOTAL: ${fmt(total)}
${showSplit ? `\nDivisão em ${splitParts}x: ${fmt(perPerson)} cada` : ""}
${store.pixKey ? `\nPix: ${store.pixKeyFormatted}` : ""}
════════════════════════════
`;

    const content = header + items + footer;
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${content}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-foreground/20 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-lg bg-card shadow-elevated flex flex-col animate-fade-up">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-foreground">{table.label}</h2>
            <p className="text-xs text-muted-foreground font-body">
              {table.status === "free" ? "Livre" : table.status === "occupied" ? "Ocupada" : "Reservada"}
              {table.customerName && ` • ${table.customerName}`}
            </p>
          </div>
          {table.status === "free" && (
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setShowReserve(true)}>
                Reservar
              </Button>
              <Button size="sm" className="rounded-xl text-xs" onClick={handleOpenTable}>
                Abrir Mesa
              </Button>
            </div>
          )}
        </div>

        {/* Reserve modal inline */}
        {showReserve && (
          <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-2">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do cliente"
              className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm font-body"
            />
            <Button size="sm" className="rounded-lg" onClick={handleReserve} disabled={!customerName.trim()}>
              Confirmar
            </Button>
            <button onClick={() => setShowReserve(false)} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Orders */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {table.orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm font-body">Nenhum pedido ainda</p>
              <p className="text-xs font-body mt-1">Adicione itens ao pedido</p>
            </div>
          ) : (
            table.orders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground font-body truncate">{order.product.name}</p>
                    {order.printed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground font-body">
                    {fmt(order.product.price)} × {order.quantity} = {fmt(order.product.price * order.quantity)}
                  </p>
                  {order.notes && <p className="text-xs text-primary font-body mt-0.5">📝 {order.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateOrderQuantity(table.id, order.id, order.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{order.quantity}</span>
                  <button
                    onClick={() => updateOrderQuantity(table.id, order.id, order.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeOrder(table.id, order.id)}
                    className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Split bill */}
        {showSplit && table.orders.length > 0 && (
          <div className="px-4 py-3 bg-muted/50 border-t border-border">
            <p className="text-xs font-medium text-foreground font-body mb-2">Dividir conta em:</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setSplitParts(Math.max(2, splitParts - 1))} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold font-display">{splitParts}x</span>
              <button onClick={() => setSplitParts(splitParts + 1)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm font-body text-foreground ml-auto">
                {fmt(perPerson)} <span className="text-muted-foreground">cada</span>
              </span>
            </div>
          </div>
        )}

        {/* Add product panel */}
        {showProducts && (
          <div className="border-t border-border max-h-[40vh] overflow-y-auto">
            <div className="p-3 sticky top-0 bg-card border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm font-body"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-2 space-y-1">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddProduct(p)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-body truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{p.category}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground font-body">{fmt(p.price)}</span>
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="border-t border-border p-4 space-y-3">
          {table.orders.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-body">Total</span>
              <span className="text-xl font-display font-bold text-foreground">{fmt(total)}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-1.5"
              onClick={() => setShowProducts(!showProducts)}
            >
              <Plus className="w-4 h-4" />
              {showProducts ? "Fechar" : "Adicionar"}
            </Button>

            {table.orders.length > 0 && (
              <>
                <Button variant="outline" size="icon" className="rounded-xl" onClick={handlePrintComanda} title="Imprimir comanda">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setShowSplit(!showSplit)} title="Dividir conta">
                  <SplitSquareHorizontal className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {table.orders.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handlePrintBill}>
                Imprimir Conta
              </Button>
              <Button className="flex-1 rounded-xl" onClick={handleCloseTable}>
                Fechar Mesa
              </Button>
            </div>
          )}
        </div>
      </div>
      {weightProduct && (
        <WeightModal
          product={weightProduct}
          onClose={() => setWeightProduct(null)}
          onConfirm={confirmWeightAdd}
        />
      )}
    </div>
  );
};

export default TableOrderPanel;

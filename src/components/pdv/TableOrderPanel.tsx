import { useState, useMemo } from "react";
import { useTables, type Table, type Comanda, type Payment } from "@/contexts/TableContext";
import { useProducts } from "@/contexts/ProductContext";
import { useStore } from "@/contexts/StoreContext";
import { useWaiters } from "@/contexts/WaiterContext";
import { useHappyHour } from "@/contexts/HappyHourContext";
import { useBarSettings } from "@/contexts/BarSettingsContext";
import { useCustomers } from "@/contexts/CustomerContext";
import {
  X, Plus, Minus, Trash2, Printer, SplitSquareHorizontal, Search, ChevronLeft,
  CheckCircle2, Scale, Users, Bell, ArrowLeftRight, History, Receipt,
  Banknote, QrCode, CreditCard, Wallet, UserPlus, Sparkles, ChefHat, Wine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import WeightModal from "@/components/pdv/WeightModal";
import type { Product } from "@/data/products";

interface Props {
  table: Table;
  onClose: () => void;
}

type ActiveModal =
  | null
  | "products"
  | "transfer"
  | "history"
  | "payment"
  | "settings"
  | "newComanda"
  | "modifiers";

const PAY_METHODS: Array<{ id: Payment["method"]; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "dinheiro", label: "Dinheiro", icon: Banknote },
  { id: "pix", label: "Pix", icon: QrCode },
  { id: "credito", label: "Crédito", icon: CreditCard },
  { id: "debito", label: "Débito", icon: CreditCard },
  { id: "a_prazo", label: "A Prazo", icon: Wallet },
];

const TableOrderPanel = ({ table: initialTable, onClose }: Props) => {
  const {
    tables,
    addOrder, removeOrder, updateOrderQuantity, markAllPrinted,
    openTable, closeTable, reserveTable, requestBill, updateTable, markCleaned,
    addComanda, transferOrder, registerPayment,
    getTableTotals, getComandaTotal,
  } = useTables();
  const { products, sellsByWeight, getUnitShort } = useProducts();
  const store = useStore();
  const { waiters, registerSale, getWaiter } = useWaiters();
  const { applyHappyHour, isActiveNow } = useHappyHour();
  const { settings: barSettings } = useBarSettings();
  const { customers } = useCustomers();

  // Refresh table from context (since props can be stale)
  const table = tables.find((t) => t.id === initialTable.id) || initialTable;
  const totals = getTableTotals(table.id);
  const happyActive = isActiveNow();

  // UI state
  const [modal, setModal] = useState<ActiveModal>(null);
  const [activeComandaId, setActiveComandaId] = useState<string>(table.comandas[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [splitParts, setSplitParts] = useState(2);
  const [showSplit, setShowSplit] = useState(false);
  const [customerName, setCustomerName] = useState(table.customerName || "");
  const [showReserve, setShowReserve] = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [notesText, setNotesText] = useState("");
  const [newComandaLabel, setNewComandaLabel] = useState("");
  const [transferOrderId, setTransferOrderId] = useState<string | null>(null);
  const [transferTargetTableId, setTransferTargetTableId] = useState<string>("");
  const [transferTargetComandaId, setTransferTargetComandaId] = useState<string>("");
  // Payment
  const [payMethod, setPayMethod] = useState<Payment["method"]>("dinheiro");
  const [payAmount, setPayAmount] = useState<string>("");
  const [payCustomerId, setPayCustomerId] = useState<string>("");
  // Settings
  const [feeOn, setFeeOn] = useState(table.serviceFeeEnabled);
  const [occupants, setOccupants] = useState(table.occupants ?? table.seats);
  const [waiterId, setWaiterId] = useState<string>(table.waiterId || "");

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const activeComanda = table.comandas.find((c) => c.id === activeComandaId) || table.comandas[0];
  const currentWaiter = getWaiter(table.waiterId);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  // Bar favorites: most-frequent products in table comandas history (fallback: first 12)
  const favoriteProducts = useMemo(() => products.slice(0, 12), [products]);

  const ensureOpened = () => {
    if (table.status === "free" || table.status === "reserved") {
      openTable(table.id, { customerName: customerName || undefined, waiterId: waiterId || undefined, occupants });
    }
  };

  // ===== Add product flow =====
  const handlePickProduct = (product: Product) => {
    if (sellsByWeight(product)) {
      setWeightProduct(product);
      return;
    }
    // open modifiers modal
    setPendingProduct(product);
    setModifiers([]);
    setNotesText("");
    setModal("modifiers");
  };

  const confirmAddProduct = (qty: number, weight?: number) => {
    if (!pendingProduct && !weightProduct) return;
    const product = (pendingProduct || weightProduct) as Product;
    const { price } = applyHappyHour(product);
    ensureOpened();
    addOrder(table.id, {
      product,
      quantity: weight ?? qty,
      unitPrice: price,
      notes: notesText || undefined,
      modifiers: modifiers.length > 0 ? modifiers : undefined,
      comandaId: activeComandaId || undefined,
      waiterId: waiterId || table.waiterId,
    });
    toast({ title: `${product.name} adicionado` });
    setPendingProduct(null);
    setWeightProduct(null);
    setModifiers([]);
    setNotesText("");
    setModal(null);
  };

  // ===== Comanda =====
  const handleNewComanda = () => {
    const id = addComanda(table.id, newComandaLabel.trim() || undefined);
    setActiveComandaId(id);
    setNewComandaLabel("");
    setModal(null);
    toast({ title: "Nova comanda criada" });
  };

  // ===== Transfer =====
  const openTransferFor = (orderId: string) => {
    setTransferOrderId(orderId);
    setTransferTargetTableId(table.id);
    setTransferTargetComandaId("");
    setModal("transfer");
  };
  const confirmTransfer = () => {
    if (!transferOrderId || !activeComanda) return;
    if (!transferTargetTableId || !transferTargetComandaId) {
      toast({ title: "Selecione mesa e comanda destino", variant: "destructive" });
      return;
    }
    transferOrder(table.id, activeComanda.id, transferOrderId, transferTargetTableId, transferTargetComandaId);
    toast({ title: "Item transferido" });
    setTransferOrderId(null);
    setModal(null);
  };

  // ===== Payment =====
  const openPayment = () => {
    setPayAmount(totals.remaining.toFixed(2));
    setPayMethod("dinheiro");
    setPayCustomerId("");
    setModal("payment");
  };
  const confirmPayment = () => {
    const amount = parseFloat(payAmount.replace(",", "."));
    if (!amount || amount <= 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }
    const customer = customers.find((c) => c.id === payCustomerId);
    registerPayment(table.id, "all", {
      method: payMethod,
      amount,
      customerId: customer?.id,
      customerName: customer?.name,
    });
    if (table.waiterId) registerSale({ waiterId: table.waiterId, tableId: table.id, amount });
    const after = totals.remaining - amount;
    if (after <= 0.01) {
      closeTable(table.id);
      toast({ title: "Mesa paga", description: `Total: ${fmt(totals.total)}` });
      setModal(null);
      onClose();
    } else {
      toast({ title: `Pagamento parcial registrado`, description: `Restante: ${fmt(after)}` });
      setModal(null);
    }
  };

  // ===== Print =====
  const handlePrintComanda = () => {
    if (!activeComanda) return;
    const unprinted = activeComanda.orders.filter((o) => !o.printed);
    if (unprinted.length === 0) { toast({ title: "Nenhum item novo para imprimir" }); return; }

    const groups: Record<string, typeof unprinted> = { bar: [], kitchen: [] };
    unprinted.forEach((o) => { (groups[o.destination || "bar"]).push(o); });

    const now = new Date();
    const blocks: string[] = [];
    (["kitchen", "bar"] as const).forEach((dest) => {
      if (groups[dest].length === 0) return;
      const title = dest === "kitchen" ? "COZINHA" : "BAR";
      const items = groups[dest].map((o) => {
        const mods = o.modifiers && o.modifiers.length ? `\n   [${o.modifiers.join(", ")}]` : "";
        const notes = o.notes ? `\n   * ${o.notes}` : "";
        return `${o.quantity}x ${o.product.name}${mods}${notes}`;
      }).join("\n");
      blocks.push(`
════════════════════════════
   ${title} - ${table.label.toUpperCase()}
   Comanda #${activeComanda.number}${activeComanda.label ? ` (${activeComanda.label})` : ""}
   ${store.storeName}
════════════════════════════
${now.toLocaleString("pt-BR")}
${currentWaiter ? `Garçom: ${currentWaiter.name}\n` : ""}────────────────────────────
${items}
════════════════════════════
`);
    });

    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${blocks.join("\n")}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
    markAllPrinted(table.id, activeComanda.id);
    toast({ title: "Pedido enviado" });
  };

  const handlePrintBill = () => {
    const now = new Date();
    let body = `
════════════════════════════
   CONTA - ${table.label.toUpperCase()}
   ${store.storeName}
════════════════════════════
${now.toLocaleString("pt-BR")}
${table.customerName ? `Cliente: ${table.customerName}` : ""}
${currentWaiter ? `Garçom: ${currentWaiter.name}` : ""}
${table.occupants ? `Pessoas: ${table.occupants}` : ""}
────────────────────────────
`;
    table.comandas.forEach((c) => {
      body += `\nCOMANDA #${c.number}${c.label ? ` (${c.label})` : ""}\n`;
      c.orders.forEach((o) => {
        body += `${o.quantity}x ${o.product.name}  ${fmt(o.unitPrice)} = ${fmt(o.unitPrice * o.quantity)}\n`;
      });
      body += `  Subtotal: ${fmt(getComandaTotal(table.id, c.id))}\n`;
    });
    body += `\n────────────────────────────\n`;
    body += `Subtotal:        ${fmt(totals.subtotal)}\n`;
    if (totals.couvert > 0) body += `Couvert (${table.occupants}p): ${fmt(totals.couvert)}\n`;
    if (totals.serviceFee > 0) body += `Taxa (${table.serviceFeePct}%):    ${fmt(totals.serviceFee)}\n`;
    body += `TOTAL:           ${fmt(totals.total)}\n`;
    if (totals.paid > 0) body += `Pago:            ${fmt(totals.paid)}\nRestante:        ${fmt(totals.remaining)}\n`;
    if (showSplit) body += `\nDivisão ${splitParts}x: ${fmt(totals.total / splitParts)} cada\n`;
    if (store.pixKey) body += `\nPix: ${store.pixKeyFormatted}\n`;
    body += `════════════════════════════\n`;

    const w = window.open("", "_blank", "width=300,height=600");
    if (w) {
      w.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${body}</pre>`);
      w.document.close();
      w.print();
    }
  };

  // ===== UI =====
  const allOrders = table.comandas.flatMap((c) => c.orders);

  const toggleModifier = (m: string) => {
    setModifiers((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-foreground/20 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-xl bg-card shadow-elevated flex flex-col animate-fade-up">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-foreground truncate">{table.label}</h2>
              {happyActive && table.module === "bar" && (
                <span className="text-[10px] bg-amber-500/20 text-amber-700 px-1.5 py-0.5 rounded-full font-body font-bold">🍻 HAPPY HOUR</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body truncate">
              {table.status === "free" ? "Livre"
                : table.status === "occupied" ? "Ocupada"
                : table.status === "awaiting_payment" ? "Aguardando pagamento"
                : table.status === "reserved" ? "Reservada"
                : "Suja"}
              {currentWaiter && ` • Garçom: ${currentWaiter.name}`}
              {table.customerName && ` • ${table.customerName}`}
            </p>
          </div>
          <button onClick={() => setModal("settings")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center" title="Configurações da mesa">
            <Users className="w-4 h-4" />
          </button>
          <button onClick={() => setModal("history")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center" title="Histórico">
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* Free state actions */}
        {table.status === "free" && (
          <div className="p-3 bg-muted/30 border-b border-border flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => setShowReserve(true)}>
              Reservar
            </Button>
            <Button size="sm" className="flex-1 rounded-xl text-xs" onClick={() => { ensureOpened(); }}>
              Abrir Mesa
            </Button>
          </div>
        )}

        {table.status === "dirty" && (
          <div className="p-3 bg-muted/30 border-b border-border">
            <Button size="sm" className="w-full rounded-xl gap-1.5" onClick={() => { markCleaned(table.id); onClose(); }}>
              <Sparkles className="w-4 h-4" /> Marcar como limpa e liberar
            </Button>
          </div>
        )}

        {showReserve && (
          <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-2">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do cliente"
              className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm font-body"
            />
            <Button size="sm" className="rounded-lg" disabled={!customerName.trim()} onClick={() => { reserveTable(table.id, customerName); setShowReserve(false); toast({ title: `Mesa reservada para ${customerName}` }); }}>
              Confirmar
            </Button>
            <button onClick={() => setShowReserve(false)} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Comanda tabs */}
        {table.comandas.length > 0 && (
          <div className="px-3 pt-3 border-b border-border">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {table.comandas.map((c) => {
                const cTotal = getComandaTotal(table.id, c.id);
                const isActive = c.id === activeComandaId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveComandaId(c.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-body transition-all ${isActive ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary text-foreground"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-3 h-3" />
                      <span>#{c.number}</span>
                      {c.label && <span className="opacity-80">· {c.label}</span>}
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">{fmt(cTotal)}</div>
                  </button>
                );
              })}
              <button
                onClick={() => { setNewComandaLabel(""); setModal("newComanda"); }}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-body bg-secondary border-2 border-dashed border-border text-muted-foreground"
              >
                <UserPlus className="w-3 h-3 inline mr-1" /> Nova
              </button>
            </div>
          </div>
        )}

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!activeComanda || activeComanda.orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm font-body">Comanda vazia</p>
              <p className="text-xs font-body mt-1">Toque em "Adicionar" para lançar itens</p>
            </div>
          ) : (
            activeComanda.orders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground font-body truncate">{order.product.name}</p>
                    {order.printed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    {order.destination === "kitchen" ? <ChefHat className="w-3 h-3 text-muted-foreground" /> : <Wine className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground font-body">
                    {fmt(order.unitPrice)} × {sellsByWeight(order.product) ? `${order.quantity.toFixed(3).replace(".", ",")} ${getUnitShort(order.product.unit)}` : order.quantity} = {fmt(order.unitPrice * order.quantity)}
                  </p>
                  {order.modifiers && order.modifiers.length > 0 && (
                    <p className="text-[11px] text-primary font-body mt-0.5">{order.modifiers.map((m) => `[${m}]`).join(" ")}</p>
                  )}
                  {order.notes && <p className="text-xs text-primary font-body mt-0.5">📝 {order.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  {!sellsByWeight(order.product) && (
                    <>
                      <button onClick={() => updateOrderQuantity(table.id, activeComanda.id, order.id, order.quantity - 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{order.quantity}</span>
                      <button onClick={() => updateOrderQuantity(table.id, activeComanda.id, order.id, order.quantity + 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button onClick={() => openTransferFor(order.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center" title="Transferir">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeOrder(table.id, activeComanda.id, order.id)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + Split */}
        {allOrders.length > 0 && (
          <div className="px-4 py-3 bg-muted/30 border-t border-border space-y-1.5">
            <div className="flex items-center justify-between text-xs font-body">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">{fmt(totals.subtotal)}</span>
            </div>
            {totals.couvert > 0 && (
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-muted-foreground">Couvert ({table.occupants} p)</span>
                <span className="text-foreground">{fmt(totals.couvert)}</span>
              </div>
            )}
            {totals.serviceFee > 0 && (
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-muted-foreground">Taxa ({table.serviceFeePct}%)</span>
                <span className="text-foreground">{fmt(totals.serviceFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1.5 border-t border-border">
              <span className="text-sm text-muted-foreground font-body">Total</span>
              <span className="text-xl font-display font-bold text-foreground">{fmt(totals.total)}</span>
            </div>
            {totals.paid > 0 && (
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-emerald-600">Pago: {fmt(totals.paid)}</span>
                <span className="text-amber-600 font-semibold">Falta: {fmt(totals.remaining)}</span>
              </div>
            )}
            {showSplit && (
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setSplitParts(Math.max(2, splitParts - 1))} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold">{splitParts}x</span>
                <button onClick={() => setSplitParts(splitParts + 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="ml-auto text-xs text-foreground font-body">{fmt(totals.total / splitParts)} cada</span>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        {table.status !== "free" && table.status !== "dirty" && table.status !== "reserved" && (
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl gap-1.5" onClick={() => setModal("products")}>
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
              {allOrders.length > 0 && (
                <>
                  <Button variant="outline" size="icon" className="rounded-xl" onClick={handlePrintComanda} title="Imprimir pedido (KDS)">
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setShowSplit(!showSplit)} title="Dividir conta">
                    <SplitSquareHorizontal className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            {allOrders.length > 0 && (
              <div className="flex gap-2">
                {table.status === "occupied" && (
                  <Button variant="outline" className="flex-1 rounded-xl gap-1.5" onClick={() => requestBill(table.id)}>
                    <Bell className="w-4 h-4" /> Pedir conta
                  </Button>
                )}
                <Button variant="outline" className="flex-1 rounded-xl" onClick={handlePrintBill}>
                  Imprimir Conta
                </Button>
                <Button className="flex-1 rounded-xl" onClick={openPayment}>
                  Pagar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Modals ===== */}
      {weightProduct && (
        <WeightModal
          product={weightProduct}
          onClose={() => setWeightProduct(null)}
          onConfirm={(w) => { setPendingProduct(weightProduct); confirmAddProduct(0, w); }}
        />
      )}

      {modal === "products" && (
        <Modal onClose={() => setModal(null)} title="Adicionar produto" wide>
          <div className="p-3 sticky top-0 bg-card border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border text-sm font-body"
                autoFocus
              />
            </div>
          </div>
          {!searchTerm && (
            <div className="p-3 border-b border-border">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body mb-2">⭐ Favoritos do Bar</p>
              <div className="grid grid-cols-2 gap-2">
                {favoriteProducts.map((p) => {
                  const { price, applied } = applyHappyHour(p);
                  return (
                    <button key={p.id} onClick={() => handlePickProduct(p)} className="text-left p-3 rounded-xl bg-background border border-border hover:border-primary transition-colors active:scale-95">
                      <p className="text-sm font-semibold text-foreground font-body truncate">{p.name}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        {applied && <span className="text-[10px] line-through text-muted-foreground">{fmt(p.price)}</span>}
                        <span className={`text-sm font-bold font-body ${applied ? "text-amber-600" : "text-foreground"}`}>{fmt(price)}</span>
                        <span className="text-[10px] text-muted-foreground">/{getUnitShort(p.unit)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="p-2 space-y-1 max-h-[40vh] overflow-y-auto">
            {filteredProducts.map((p) => {
              const { price, applied } = applyHappyHour(p);
              return (
                <button key={p.id} onClick={() => handlePickProduct(p)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-body truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{p.category}</p>
                  </div>
                  <div className="text-right">
                    {applied && <p className="text-[10px] line-through text-muted-foreground">{fmt(p.price)}</p>}
                    <span className={`text-sm font-bold font-body ${applied ? "text-amber-600" : "text-foreground"}`}>{fmt(price)}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">/{getUnitShort(p.unit)}</span></span>
                  </div>
                  {sellsByWeight(p) ? <Scale className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {modal === "modifiers" && pendingProduct && (
        <Modal onClose={() => { setModal(null); setPendingProduct(null); }} title={pendingProduct.name}>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">Modificadores rápidos</p>
              <div className="flex flex-wrap gap-1.5">
                {barSettings.quickModifiers.map((m) => {
                  const on = modifiers.includes(m);
                  return (
                    <button key={m} onClick={() => toggleModifier(m)} className={`px-2.5 py-1.5 rounded-full text-xs font-body transition-all ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">Observação livre</p>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Ex: bem gelada, sem cebola..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-body"
              />
            </div>
            <Button className="w-full rounded-xl" onClick={() => confirmAddProduct(1)}>
              Adicionar à comanda
            </Button>
          </div>
        </Modal>
      )}

      {modal === "newComanda" && (
        <Modal onClose={() => setModal(null)} title="Nova comanda">
          <div className="p-4 space-y-3">
            <input
              value={newComandaLabel}
              onChange={(e) => setNewComandaLabel(e.target.value)}
              placeholder="Nome do cliente (opcional)"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body"
              autoFocus
            />
            <Button className="w-full rounded-xl" onClick={handleNewComanda}>Criar comanda</Button>
          </div>
        </Modal>
      )}

      {modal === "transfer" && activeComanda && (
        <Modal onClose={() => setModal(null)} title="Transferir item">
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-body mb-1.5">Mesa destino</p>
              <select
                value={transferTargetTableId}
                onChange={(e) => { setTransferTargetTableId(e.target.value); setTransferTargetComandaId(""); }}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body"
              >
                <option value="">— Selecionar —</option>
                {tables.filter((t) => t.module === table.module).map((t) => (
                  <option key={t.id} value={t.id}>{t.label} {t.id === table.id ? "(esta)" : ""}</option>
                ))}
              </select>
            </div>
            {transferTargetTableId && (
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">Comanda destino</p>
                <select
                  value={transferTargetComandaId}
                  onChange={(e) => setTransferTargetComandaId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body"
                >
                  <option value="">— Selecionar —</option>
                  {(tables.find((t) => t.id === transferTargetTableId)?.comandas || []).filter((c) => c.id !== activeComanda.id).map((c) => (
                    <option key={c.id} value={c.id}>#{c.number}{c.label ? ` (${c.label})` : ""}</option>
                  ))}
                </select>
              </div>
            )}
            <Button className="w-full rounded-xl" onClick={confirmTransfer}>Transferir</Button>
          </div>
        </Modal>
      )}

      {modal === "settings" && (
        <Modal onClose={() => setModal(null)} title="Configurações da Mesa">
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-body">Garçom responsável</label>
              <select
                value={waiterId}
                onChange={(e) => { setWaiterId(e.target.value); updateTable(table.id, { waiterId: e.target.value || undefined }); }}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body mt-1"
              >
                <option value="">— Nenhum —</option>
                {waiters.filter((w) => w.active).map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body">Pessoas na mesa (couvert)</label>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => { const v = Math.max(0, occupants - 1); setOccupants(v); updateTable(table.id, { occupants: v }); }} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="text-base font-bold w-8 text-center">{occupants}</span>
                <button onClick={() => { const v = occupants + 1; setOccupants(v); updateTable(table.id, { occupants: v }); }} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                {table.couvertPerPerson > 0 && <span className="text-xs text-muted-foreground font-body ml-2">= {fmt(table.couvertPerPerson * occupants)}</span>}
              </div>
            </div>
            <label className="flex items-center justify-between bg-background border border-border rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-foreground font-body">Taxa de serviço {table.serviceFeePct}%</p>
                <p className="text-[11px] text-muted-foreground font-body">Aplicada sobre o subtotal</p>
              </div>
              <input
                type="checkbox"
                checked={feeOn}
                onChange={(e) => { setFeeOn(e.target.checked); updateTable(table.id, { serviceFeeEnabled: e.target.checked }); }}
                className="w-5 h-5 accent-primary"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground font-body">Taxa %</label>
                <input
                  type="number"
                  value={table.serviceFeePct}
                  onChange={(e) => updateTable(table.id, { serviceFeePct: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full h-9 px-2 rounded-lg bg-background border border-border text-sm font-body mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-body">Couvert / pessoa</label>
                <input
                  type="number"
                  value={table.couvertPerPerson}
                  onChange={(e) => updateTable(table.id, { couvertPerPerson: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full h-9 px-2 rounded-lg bg-background border border-border text-sm font-body mt-1"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal === "history" && (
        <Modal onClose={() => setModal(null)} title="Histórico da Mesa">
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {table.history.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground font-body py-8">Sem registros ainda</p>
            ) : (
              [...table.history].reverse().map((ev) => (
                <div key={ev.id} className="flex gap-3 text-xs font-body border-l-2 border-primary/30 pl-3 py-1">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {new Date(ev.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-foreground">{ev.description}</span>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {modal === "payment" && (
        <Modal onClose={() => setModal(null)} title="Pagamento">
          <div className="p-4 space-y-4">
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="flex justify-between text-xs font-body"><span className="text-muted-foreground">Total</span><span className="font-bold">{fmt(totals.total)}</span></div>
              <div className="flex justify-between text-xs font-body"><span className="text-muted-foreground">Já pago</span><span>{fmt(totals.paid)}</span></div>
              <div className="flex justify-between text-sm font-body mt-1 pt-1 border-t border-border"><span className="font-semibold">Restante</span><span className="font-bold text-amber-600">{fmt(totals.remaining)}</span></div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">Forma de pagamento</p>
              <div className="grid grid-cols-3 gap-2">
                {PAY_METHODS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setPayMethod(id)} className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${payMethod === id ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-body">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            {payMethod === "a_prazo" && (
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1.5">Cliente</p>
                <select value={payCustomerId} onChange={(e) => setPayCustomerId(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body">
                  <option value="">— Selecionar —</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-body mb-1.5">Valor</p>
              <input
                type="text"
                inputMode="decimal"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full h-12 px-3 rounded-lg bg-background border border-border text-lg font-bold font-body text-center"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setPayAmount((totals.remaining / 2).toFixed(2))} className="flex-1 text-[11px] py-1.5 rounded-lg bg-secondary font-body">½</button>
                <button onClick={() => setPayAmount(totals.remaining.toFixed(2))} className="flex-1 text-[11px] py-1.5 rounded-lg bg-secondary font-body">Total</button>
              </div>
            </div>
            <Button className="w-full rounded-xl" onClick={confirmPayment} disabled={payMethod === "a_prazo" && !payCustomerId}>
              Confirmar pagamento
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===== Generic Modal =====
const Modal = ({ children, onClose, title, wide }: { children: React.ReactNode; onClose: () => void; title: string; wide?: boolean }) => (
  <div className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className={`bg-card rounded-2xl shadow-elevated w-full ${wide ? "max-w-md" : "max-w-sm"} max-h-[85vh] overflow-hidden flex flex-col`} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>
      <div className="overflow-y-auto">{children}</div>
    </div>
  </div>
);

export default TableOrderPanel;

import { useState } from "react";
import { Minus, Plus, Trash2, UserPlus, Printer, ChevronRight, Scale, Receipt, Bell } from "lucide-react";
import { useTables, type Table } from "@/contexts/TableContext";
import { useProducts } from "@/contexts/ProductContext";
import { useWaiters } from "@/contexts/WaiterContext";
import { Button } from "@/components/ui/button";
import WeightModal from "@/components/pdv/WeightModal";
import type { Product } from "@/data/products";

interface Props {
  table: Table;
  activeComandaId: string;
  onChangeComanda: (id: string) => void;
  onNewComanda: () => void;
  onCheckout: () => void;
}

const TableComandaPanel = ({ table, activeComandaId, onChangeComanda, onNewComanda, onCheckout }: Props) => {
  const { updateOrderQuantity, removeOrder, getTableTotals, getComandaTotal, requestBill } = useTables();
  const { sellsByWeight, getUnitShort } = useProducts();
  const { getWaiter } = useWaiters();
  const [editing, setEditing] = useState<{ product: Product; quantity: number; orderId: string } | null>(null);

  const totals = getTableTotals(table.id);
  const activeComanda = table.comandas.find((c) => c.id === activeComandaId) || table.comandas[0];
  const waiter = getWaiter(table.waiterId);
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const totalItems = activeComanda?.orders.reduce((s, o) => s + (sellsByWeight(o.product) ? 1 : o.quantity), 0) || 0;

  return (
    <aside className="hidden lg:flex w-[340px] xl:w-[380px] bg-card border-l border-border flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display text-base font-bold text-foreground">{table.label}</h2>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          {table.customerName || "Sem cliente"}
          {waiter && ` • Garçom: ${waiter.name}`}
          {table.occupants ? ` • ${table.occupants}p` : ""}
        </p>
      </div>

      {/* Comanda tabs */}
      {table.comandas.length > 0 && (
        <div className="px-3 pt-3 border-b border-border">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
            {table.comandas.map((c) => {
              const isActive = c.id === activeComandaId;
              return (
                <button
                  key={c.id}
                  onClick={() => onChangeComanda(c.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
                    isActive ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-3 h-3" />
                    <span>#{c.number}</span>
                    {c.label && <span className="opacity-80 truncate max-w-[60px]">· {c.label}</span>}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">{fmt(getComandaTotal(table.id, c.id))}</div>
                </button>
              );
            })}
            <button
              onClick={onNewComanda}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-body bg-secondary border-2 border-dashed border-border text-muted-foreground"
              title="Nova comanda"
            >
              <UserPlus className="w-3 h-3 inline mr-1" /> Nova
            </button>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3 scrollbar-none">
        {!activeComanda || activeComanda.orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <p className="text-sm font-body">Comanda vazia</p>
            <p className="text-xs font-body mt-1">Toque nos produtos para adicionar</p>
          </div>
        ) : (
          activeComanda.orders.map((order) => {
            const unitLabel = getUnitShort(order.product.unit);
            const isWeight = sellsByWeight(order.product);
            const step = isWeight ? 0.1 : 1;
            const subtotal = order.unitPrice * order.quantity;
            const qtyDisplay = isWeight ? order.quantity.toFixed(3).replace(".", ",") : String(order.quantity);

            return (
              <div key={order.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground font-body truncate">
                    {order.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {fmt(order.unitPrice)} / {unitLabel}
                  </p>
                  {order.modifiers && order.modifiers.length > 0 && (
                    <p className="text-[10px] text-primary font-body">{order.modifiers.map((m) => `[${m}]`).join(" ")}</p>
                  )}
                  {order.notes && <p className="text-[10px] text-primary font-body">📝 {order.notes}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateOrderQuantity(table.id, activeComanda.id, order.id, Math.round((order.quantity - step) * 1000) / 1000)}
                      className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3 text-foreground" />
                    </button>
                    {isWeight ? (
                      <button
                        onClick={() => setEditing({ product: order.product, quantity: order.quantity, orderId: order.id })}
                        className="flex items-center gap-1 px-2 h-6 rounded-md bg-secondary hover:bg-muted transition-colors"
                      >
                        <Scale className="w-3 h-3 text-primary" />
                        <span className="text-xs font-semibold text-foreground font-body">{qtyDisplay} {unitLabel}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-foreground font-body min-w-[32px] text-center">{qtyDisplay}</span>
                    )}
                    <button
                      onClick={() => updateOrderQuantity(table.id, activeComanda.id, order.id, Math.round((order.quantity + step) * 1000) / 1000)}
                      className="w-6 h-6 rounded-md bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-foreground font-body">{fmt(subtotal)}</span>
                  <button
                    onClick={() => removeOrder(table.id, activeComanda.id, order.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4 space-y-2">
        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-muted-foreground">Total Itens</span>
          <span className="font-semibold text-foreground">{totalItems} Itens</span>
        </div>

        <div className="flex items-center justify-between text-xs font-body">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{fmt(totals.subtotal)}</span>
        </div>
        {totals.couvert > 0 && (
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground">Couvert</span>
            <span className="text-foreground">{fmt(totals.couvert)}</span>
          </div>
        )}
        {totals.serviceFee > 0 && (
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground">Taxa {table.serviceFeePct}%</span>
            <span className="text-foreground">{fmt(totals.serviceFee)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground font-body">Valor Total</span>
          <span className="text-xl font-bold text-foreground font-display">{fmt(totals.total)}</span>
        </div>

        {totals.paid > 0 && (
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-emerald-600">Pago: {fmt(totals.paid)}</span>
            <span className="text-amber-600 font-semibold">Falta: {fmt(totals.remaining)}</span>
          </div>
        )}

        {table.status === "occupied" && totals.subtotal > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl gap-1.5"
            onClick={() => requestBill(table.id)}
          >
            <Bell className="w-3.5 h-3.5" /> Pedir Conta
          </Button>
        )}

        <Button
          size="lg"
          className="w-full rounded-xl gap-2"
          disabled={totals.subtotal === 0}
          onClick={onCheckout}
        >
          <Printer className="w-4 h-4" />
          Fechar Conta
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>

      {editing && activeComanda && (
        <WeightModal
          product={editing.product}
          initialWeight={editing.quantity}
          confirmLabel="Atualizar"
          onClose={() => setEditing(null)}
          onConfirm={(w) => {
            updateOrderQuantity(table.id, activeComanda.id, editing.orderId, w);
            setEditing(null);
          }}
        />
      )}
    </aside>
  );
};

export default TableComandaPanel;

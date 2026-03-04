import { Minus, Plus, Trash2, UserPlus, Printer, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CartPanel = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex w-[340px] xl:w-[380px] bg-card border-l border-border flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display text-base font-bold text-foreground">Pedido Atual</h2>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-0 scrollbar-none">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <p className="text-sm font-body">Carrinho vazio</p>
            <p className="text-xs font-body mt-1">Adicione produtos para começar</p>
          </div>
        ) : (
          items.map(({ product, quantity }) => {
            const unitLabel = product.unit === "kg" ? "kg" : product.unit === "L" ? "L" : "un";
            const step = product.unit === "kg" ? 0.1 : 1;
            const subtotal = product.price * quantity;

            return (
              <div key={product.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground font-body truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    R$ {product.price.toFixed(2).replace(".", ",")} / {unitLabel}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(product.id, Math.round((quantity - step) * 10) / 10)}
                      className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3 text-foreground" />
                    </button>
                    <span className="text-xs font-semibold text-foreground font-body min-w-[32px] text-center">
                      {product.unit === "kg" ? quantity.toFixed(1) : quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, Math.round((quantity + step) * 10) / 10)}
                      className="w-6 h-6 rounded-md bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-foreground font-body">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                  <button
                    onClick={() => removeItem(product.id)}
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
      <div className="border-t border-border px-5 py-4 space-y-3">
        {/* Items count */}
        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-muted-foreground">Total Itens</span>
          <span className="font-semibold text-foreground">{totalItems} Itens</span>
        </div>

        {/* Customer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-body">Cliente</span>
          <button className="flex items-center gap-1.5 text-sm text-primary font-medium font-body hover:underline">
            <UserPlus className="w-3.5 h-3.5" />
            Cliente Anônimo
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground font-body">Valor Total</span>
          <span className="text-xl font-bold text-foreground font-display">
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* Finalize button */}
        <Button
          size="lg"
          className="w-full rounded-xl gap-2"
          disabled={items.length === 0}
          onClick={() => navigate("/checkout")}
        >
          <Printer className="w-4 h-4" />
          Finalizar Venda
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </aside>
  );
};

export default CartPanel;

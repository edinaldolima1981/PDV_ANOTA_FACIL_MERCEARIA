import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Scale } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import WeightModal from "@/components/pdv/WeightModal";
import type { Product } from "@/data/products";

const CartPage = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const { getUnitShort, isWeightUnit } = useProducts();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<{ product: Product; quantity: number } | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          Carrinho vazio
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-6">
          Adicione produtos para continuar
        </p>
        <Button size="lg" className="rounded-2xl" onClick={() => navigate("/home")}>
          Voltar às compras
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-40">
      {/* Header */}
      <header className="bg-card shadow-soft px-4 pt-6 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">
              Carrinho
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>
      </header>

      {/* Items list */}
      <main className="flex-1 px-4 pt-4 space-y-3">
        {items.map(({ product, quantity }) => {
          const unitLabel = getUnitShort(product.unit);
          const step = product.unit === "kg" ? 0.1 : 1;
          const subtotal = product.price * quantity;

          return (
            <div
              key={product.id}
              className="bg-card rounded-2xl p-4 shadow-soft flex gap-4 items-center"
            >
              {/* Emoji icon */}
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                  {product.category === "acougue" && "🥩"}
                  {product.category === "frutas" && "🍎"}
                  {product.category === "verduras" && "🥬"}
                  {product.category === "laticinios" && "🧀"}
                  {product.category === "bebidas" && "🥤"}
                  {product.category === "graos" && "🌾"}
                  {product.category === "padaria" && "🍞"}
                  {!["acougue","frutas","verduras","laticinios","bebidas","graos","padaria"].includes(product.category) && "📦"}
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground font-body truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  R$ {product.price.toFixed(2).replace(".", ",")} / {unitLabel}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(
                        product.id,
                        Math.round((quantity - step) * 10) / 10
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5 text-foreground" />
                  </button>
                  <span className="text-sm font-semibold text-foreground font-body min-w-[40px] text-center">
                    {product.unit === "kg" ? quantity.toFixed(1) : quantity} {unitLabel}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        product.id,
                        Math.round((quantity + step) * 10) / 10
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                </div>
              </div>

              {/* Subtotal & delete */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-primary font-body">
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </span>
                <button
                  onClick={() => removeItem(product.id)}
                  className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* Checkout Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-elevated z-40 safe-bottom" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {/* Summary */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground font-body">Total</span>
          <span className="text-2xl font-bold text-foreground font-display">
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* Payment button */}
        <Button
          size="xl"
          className="w-full rounded-2xl"
          onClick={() => navigate("/checkout")}
        >
          Escolher pagamento
        </Button>
      </div>
    </div>
  );
};

export default CartPage;

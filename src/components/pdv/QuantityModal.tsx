import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

interface QuantityModalProps {
  product: Product;
  onClose: () => void;
}

const QuantityModal = ({ product, onClose }: QuantityModalProps) => {
  const [quantity, setQuantity] = useState(product.unit === "kg" ? 0.5 : 1);
  const { addItem } = useCart();
  const step = product.unit === "kg" ? 0.1 : 1;
  const unitLabel = product.unit === "kg" ? "kg" : product.unit === "L" ? "L" : "un";

  const increment = () => setQuantity((q) => Math.round((q + step) * 10) / 10);
  const decrement = () =>
    setQuantity((q) => Math.max(step, Math.round((q - step) * 10) / 10));

  const handleAdd = () => {
    addItem(product, quantity);
    onClose();
  };

  const total = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-t-3xl p-6 pb-8 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              R$ {product.price.toFixed(2).replace(".", ",")} / {unitLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-destructive/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={decrement}
            className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all"
          >
            <Minus className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center min-w-[100px]">
            <p className="text-4xl font-bold text-foreground font-body">
              {product.unit === "kg" ? quantity.toFixed(1) : quantity}
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">{unitLabel}</p>
          </div>
          <button
            onClick={increment}
            className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Total */}
        <div className="bg-secondary/50 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-body">Total</span>
          <span className="text-xl font-bold text-primary font-body">
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* Add button */}
        <Button size="xl" className="w-full rounded-2xl" onClick={handleAdd}>
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
};

export default QuantityModal;

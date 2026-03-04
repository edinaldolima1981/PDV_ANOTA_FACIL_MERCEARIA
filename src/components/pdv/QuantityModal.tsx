import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";

interface QuantityModalProps {
  product: Product;
  onClose: () => void;
}

const QuantityModal = ({ product, onClose }: QuantityModalProps) => {
  const [quantity, setQuantity] = useState(product.unit === "kg" ? 0.5 : 1);
  const { addItem } = useCart();
  const { getUnitShort } = useProducts();
  const step = product.unit === "kg" ? 0.1 : 1;
  const unitLabel = getUnitShort(product.unit);

  const increment = () => setQuantity((q) => Math.round((q + step) * 10) / 10);
  const decrement = () =>
    setQuantity((q) => Math.max(step, Math.round((q - step) * 10) / 10));

  const handleAdd = () => {
    addItem(product, quantity);
    onClose();
  };

  const total = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-elevated animate-fade-up mx-4"
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
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={decrement}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
          >
            <Minus className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center min-w-[80px]">
            <p className="text-3xl font-bold text-foreground font-body">
              {product.unit === "kg" ? quantity.toFixed(1) : quantity}
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">{unitLabel}</p>
          </div>
          <button
            onClick={increment}
            className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Total */}
        <div className="bg-secondary rounded-xl p-4 mb-5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-body">Total</span>
          <span className="text-xl font-bold text-foreground font-body">
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* Add button */}
        <Button size="lg" className="w-full rounded-xl" onClick={handleAdd}>
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
};

export default QuantityModal;

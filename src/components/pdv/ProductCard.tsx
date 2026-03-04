import type { Product } from "@/data/products";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  const unitLabel = product.unit === "kg" ? "/kg" : product.unit === "L" ? "/L" : "/un";

  return (
    <button
      onClick={() => onAdd(product)}
      className="bg-card rounded-2xl p-4 flex flex-col gap-3 shadow-soft hover:shadow-medium transition-all duration-200 active:scale-[0.97] text-left group"
    >
      {/* Product image placeholder */}
      <div className="w-full aspect-square rounded-xl bg-secondary flex items-center justify-center text-4xl">
        {product.category === "frutas" && "🍎"}
        {product.category === "verduras" && "🥬"}
        {product.category === "laticinios" && "🧀"}
        {product.category === "bebidas" && "🥤"}
        {product.category === "graos" && "🌾"}
        {product.category === "padaria" && "🍞"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground font-body truncate">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          Estoque: {product.stock} {product.unit}
        </p>
      </div>

      {/* Price + Add */}
      <div className="flex items-center justify-between w-full">
        <span className="text-base font-bold text-primary font-body">
          R$ {product.price.toFixed(2).replace(".", ",")}
          <span className="text-xs font-normal text-muted-foreground">{unitLabel}</span>
        </span>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </button>
  );
};

export default ProductCard;

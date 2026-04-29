import type { Product } from "@/data/products";
import { useProducts } from "@/contexts/ProductContext";
import { Plus, Scale } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  const { categories, getUnitShort, sellsByWeight } = useProducts();
  const unitLabel = getUnitShort(product.unit);
  const category = categories.find((c) => c.id === product.category);
  const emoji = category?.icon || "📦";
  const byWeight = sellsByWeight(product);

  return (
    <button
      onClick={() => onAdd(product)}
      className="bg-card rounded-xl p-4 flex flex-col gap-3 border border-border hover:border-primary/40 hover:shadow-medium transition-all duration-200 active:scale-[0.98] text-left group relative"
    >
      {byWeight && (
        <div
          className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-semibold font-body"
          title="Vendido por peso"
        >
          <Scale className="w-3 h-3" />
          Peso
        </div>
      )}
      <div className="w-full aspect-[4/3] rounded-lg bg-secondary flex items-center justify-center text-3xl overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          emoji
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground font-body truncate leading-tight">
          {product.name}
        </p>
      </div>
      <div className="flex items-center justify-between w-full">
        <span className="text-base font-bold text-foreground font-body">
          R$ {product.price.toFixed(2).replace(".", ",")}
          <span className="text-xs font-normal text-muted-foreground ml-0.5">/{unitLabel}</span>
        </span>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </button>
  );
};

export default ProductCard;

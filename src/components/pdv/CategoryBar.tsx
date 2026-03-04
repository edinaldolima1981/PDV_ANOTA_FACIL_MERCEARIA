import { useProducts } from "@/contexts/ProductContext";

interface CategoryBarProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryBar = ({ selected, onSelect }: CategoryBarProps) => {
  const { categories } = useProducts();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-150 ${
            selected === cat.id
              ? "bg-foreground text-card shadow-soft"
              : "bg-card text-foreground border border-border hover:bg-secondary"
          }`}
        >
          <span className="mr-1">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;

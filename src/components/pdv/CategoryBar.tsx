import { CATEGORIES } from "@/data/products";

interface CategoryBarProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryBar = ({ selected, onSelect }: CategoryBarProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium font-body transition-all duration-200 active:scale-95 ${
            selected === cat.id
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-card text-foreground hover:bg-secondary"
          }`}
        >
          <span className="text-base">{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;

import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Package, Users, BarChart3, Settings, Receipt, UtensilsCrossed, Wine } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();

  const NAV_ITEMS = [
    { path: "/home", label: "Vendas", icon: ShoppingCart, show: true },
    { path: "/stock", label: "Estoque", icon: Package, show: true },
    { path: "/fiado", label: "Fiado", icon: Users, show: true },
    { path: "/contas-receber", label: "A Prazo", icon: Receipt, show: true },
    { path: "/restaurante", label: "Rest.", icon: UtensilsCrossed, show: store.moduleRestaurante },
    { path: "/bar", label: "Bar", icon: Wine, show: store.moduleBar },
    { path: "/dashboard", label: "Painel", icon: BarChart3, show: true },
    { path: "/admin", label: "Config", icon: Settings, show: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 pt-1 z-50 flex items-center justify-around md:hidden safe-bottom" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {NAV_ITEMS.filter((i) => i.show).map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium font-body">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;

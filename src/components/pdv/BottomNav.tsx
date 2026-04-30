import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Package, Users, BarChart3, Settings, Receipt } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_ITEMS = [
    { path: "/home", label: "Vendas", icon: ShoppingCart },
    { path: "/stock", label: "Estoque", icon: Package },
    { path: "/fiado", label: "Fiado", icon: Users },
    { path: "/contas-receber", label: "A Prazo", icon: Receipt },
    { path: "/dashboard", label: "Painel", icon: BarChart3 },
    { path: "/admin", label: "Config", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 pt-1 z-50 flex items-center justify-around md:hidden safe-bottom" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {NAV_ITEMS.map((item) => {
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

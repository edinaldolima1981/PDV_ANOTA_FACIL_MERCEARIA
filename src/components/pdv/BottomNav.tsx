import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, Users, BarChart3, Settings } from "lucide-react";

const NAV_ITEMS = [
  { path: "/home", label: "Vendas", icon: Home },
  { path: "/stock", label: "Estoque", icon: Package },
  { path: "/fiado", label: "Fiado", icon: Users },
  { path: "/dashboard", label: "Painel", icon: BarChart3 },
  { path: "/admin", label: "Admin", icon: Settings },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 pb-2 pt-1 z-50 flex items-center justify-around">
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

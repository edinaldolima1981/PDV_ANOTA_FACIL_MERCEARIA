import { useNavigate, useLocation } from "react-router-dom";
import { Store, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, Receipt, UtensilsCrossed, Wine } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();

  const NAV_ITEMS = [
    { path: "/home", label: "Vendas", icon: ShoppingCart, show: true },
    { path: "/stock", label: "Estoque", icon: Package, show: true },
    { path: "/fiado", label: "Fiado", icon: Users, show: true },
    { path: "/contas-receber", label: "A Prazo", icon: Receipt, show: true },
    { path: "/restaurante", label: "Restaurante", icon: UtensilsCrossed, show: store.moduleRestaurante },
    { path: "/bar", label: "Bar", icon: Wine, show: store.moduleBar },
    { path: "/dashboard", label: "Relatórios", icon: BarChart3, show: true },
    { path: "/admin", label: "Config", icon: Settings, show: true },
  ];

  return (
    <aside className="hidden md:flex w-[72px] bg-sidebar flex-col items-center py-5 gap-1 border-r border-sidebar-border flex-shrink-0">
      <button
        onClick={() => navigate("/home")}
        className="w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center mb-6 overflow-hidden"
        title={store.storeName}
      >
        {store.storeBanner ? (
          <img src={store.storeBanner} alt="" className="w-full h-full object-cover" />
        ) : (
          <Store className="w-5 h-5 text-sidebar-primary-foreground" />
        )}
      </button>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.filter((i) => i.show).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium font-body leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => navigate("/")}
        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-destructive transition-all"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[9px] font-medium font-body leading-tight">Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;

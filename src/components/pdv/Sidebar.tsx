import { useNavigate, useLocation } from "react-router-dom";
import { Store, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, Receipt } from "lucide-react";

const NAV_ITEMS = [
  { path: "/home", label: "Vendas", icon: ShoppingCart },
  { path: "/stock", label: "Estoque", icon: Package },
  { path: "/fiado", label: "Fiado", icon: Users },
  { path: "/contas-receber", label: "A Prazo", icon: Receipt },
  { path: "/dashboard", label: "Relatórios", icon: BarChart3 },
  { path: "/admin", label: "Config", icon: Settings },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-[72px] bg-sidebar flex-col items-center py-5 gap-1 border-r border-sidebar-border flex-shrink-0">
      {/* Logo */}
      <button
        onClick={() => navigate("/home")}
        className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center mb-6"
      >
        <Store className="w-5 h-5 text-sidebar-primary-foreground" />
      </button>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
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

      {/* Logout */}
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

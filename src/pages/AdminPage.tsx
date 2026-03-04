import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Store, Users, Shield, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Store, label: "Dados da Loja", description: "Nome, endereço e horário", action: () => {} },
    { icon: Users, label: "Equipe", description: "Gerenciar colaboradores e PINs", action: () => {} },
    { icon: Shield, label: "Permissões", description: "Níveis de acesso ao sistema", action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-soft px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/home")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground leading-tight">Administração</h1>
        </div>

        {/* Admin profile */}
        <div className="bg-primary rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Leaf className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-primary-foreground">Empório Orgânico</p>
            <p className="text-xs text-primary-foreground/70 font-body">Administrador</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4 text-left active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground font-body">{item.label}</p>
                <p className="text-xs text-muted-foreground font-body">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}

        <div className="pt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-2xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={() => navigate("/")}
          >
            <LogOut className="w-4 h-4" />
            Sair do sistema
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

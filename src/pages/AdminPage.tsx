import { useNavigate } from "react-router-dom";
import { Store, Users, Shield, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PosLayout from "@/components/pdv/PosLayout";

const AdminPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Store, label: "Dados da Loja", description: "Nome, endereço e horário", action: () => {} },
    { icon: Users, label: "Equipe", description: "Gerenciar colaboradores e PINs", action: () => {} },
    { icon: Shield, label: "Permissões", description: "Níveis de acesso ao sistema", action: () => {} },
  ];

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <h1 className="font-display text-lg font-bold text-foreground">Administração</h1>
          <p className="text-xs text-muted-foreground font-body">Configurações do sistema</p>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-3">
          {/* Admin profile card */}
          <div className="bg-primary rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-primary-foreground">Empório Orgânico</p>
              <p className="text-xs text-primary-foreground/70 font-body">Administrador</p>
            </div>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 text-left hover:shadow-soft transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
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
              className="w-full rounded-xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-4 h-4" />
              Sair do sistema
            </Button>
          </div>
        </main>
      </div>
    </PosLayout>
  );
};

export default AdminPage;

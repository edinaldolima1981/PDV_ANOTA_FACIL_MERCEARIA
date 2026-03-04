import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Users, Shield, LogOut, ChevronRight, X, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/contexts/CustomerContext";
import PosLayout from "@/components/pdv/PosLayout";
import AdminAuthModal from "@/components/pdv/AdminAuthModal";

interface Employee {
  id: string;
  name: string;
  role: "admin" | "operador";
  pin: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { adminLogs, customers, updateCustomerLimit } = useCustomers();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Store data
  const [storeName, setStoreName] = useState("Empório Orgânico");
  const [storeAddress, setStoreAddress] = useState("Rua das Flores, 123 - Centro");
  const [storeHours, setStoreHours] = useState("08:00 - 22:00");
  const [storePhone, setStorePhone] = useState("(11) 3333-4444");

  // Employees
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", name: "Maria Oliveira", role: "operador", pin: "5678" },
    { id: "2", name: "Administrador", role: "admin", pin: "1234" },
  ]);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState<"admin" | "operador">("operador");
  const [newEmpPin, setNewEmpPin] = useState("");

  // Customer limit editing
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [newLimitValue, setNewLimitValue] = useState("");

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const handleOpenSection = (section: string) => {
    if (!isAuthenticated) {
      setPendingSection(section);
      setShowAdminAuth(true);
    } else {
      setActiveSection(section);
    }
  };

  const handleAdminAuth = () => {
    setIsAuthenticated(true);
    setShowAdminAuth(false);
    if (pendingSection) {
      setActiveSection(pendingSection);
      setPendingSection(null);
    }
  };

  const handleAddEmployee = () => {
    if (!newEmpName.trim() || !newEmpPin.trim()) return;
    setEmployees((prev) => [...prev, { id: `e${Date.now()}`, name: newEmpName.trim(), role: newEmpRole, pin: newEmpPin }]);
    setNewEmpName("");
    setNewEmpPin("");
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveLimit = (customerId: string) => {
    if (!newLimitValue.trim()) return;
    updateCustomerLimit(customerId, parseFloat(newLimitValue), "admin-001");
    setEditingCustomerId(null);
    setNewLimitValue("");
  };

  const menuItems = [
    { id: "loja", icon: Store, label: "Dados da Loja", description: "Nome, endereço e horário" },
    { id: "equipe", icon: Users, label: "Equipe", description: "Gerenciar colaboradores e PINs" },
    { id: "permissoes", icon: Shield, label: "Permissões e Limites", description: "Limites de crédito dos clientes" },
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
              <p className="font-display text-base font-bold text-primary-foreground">{storeName}</p>
              <p className="text-xs text-primary-foreground/70 font-body">Administrador</p>
            </div>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleOpenSection(item.id)}
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

          {/* Admin Logs */}
          {isAuthenticated && adminLogs.length > 0 && (
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm font-medium text-foreground font-body mb-3">Log de Ações (últimas 5)</p>
              <div className="space-y-2">
                {adminLogs.slice(-5).reverse().map((log) => (
                  <div key={log.id} className="text-xs bg-background rounded-lg p-2.5 border border-border">
                    <p className="font-medium text-foreground font-body">{log.action}</p>
                    <p className="text-muted-foreground font-body">{log.details}</p>
                    <p className="text-muted-foreground/60 font-body mt-1">{new Date(log.date).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Dados da Loja Modal */}
      {activeSection === "loja" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setActiveSection(null)}>
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated animate-fade-up mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Dados da Loja</h3>
              <button onClick={() => setActiveSection(null)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Nome da Loja</label>
                <input value={storeName} onChange={(e) => setStoreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Endereço</label>
                <input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Horário de Funcionamento</label>
                <input value={storeHours} onChange={(e) => setStoreHours(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Telefone</label>
                <input value={storePhone} onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
            </div>
            <Button className="w-full rounded-xl" onClick={() => setActiveSection(null)}>Salvar Alterações</Button>
          </div>
        </div>
      )}

      {/* Equipe Modal */}
      {activeSection === "equipe" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setActiveSection(null)}>
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated animate-fade-up mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Equipe</h3>
              <button onClick={() => setActiveSection(null)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Employee list */}
            <div className="space-y-2 mb-4">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground font-body">{emp.name}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {emp.role === "admin" ? "Administrador" : "Operador"} • PIN: {emp.pin}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteEmployee(emp.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new employee */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-medium text-foreground font-body">Adicionar Colaborador</p>
              <input value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} placeholder="Nome"
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="flex gap-2">
                <input value={newEmpPin} onChange={(e) => setNewEmpPin(e.target.value)} placeholder="PIN (4 dígitos)" maxLength={4}
                  className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <select value={newEmpRole} onChange={(e) => setNewEmpRole(e.target.value as "admin" | "operador")}
                  className="h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="operador">Operador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button className="w-full rounded-xl gap-1.5" onClick={handleAddEmployee} disabled={!newEmpName.trim() || !newEmpPin.trim()}>
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissões / Limites Modal */}
      {activeSection === "permissoes" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setActiveSection(null)}>
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated animate-fade-up mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Limites de Crédito</h3>
              <button onClick={() => setActiveSection(null)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2">
              {customers.map((c) => (
                <div key={c.id} className="p-3 bg-background rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground font-body">{c.name}</p>
                    <button onClick={() => { setEditingCustomerId(c.id); setNewLimitValue(String(c.limite_credito)); }}
                      className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground font-body">
                    <span>Limite: {fmt(c.limite_credito)}</span>
                    <span>Aberto: {fmt(c.valor_em_aberto)}</span>
                    <span className="text-success">Disp: {fmt(c.limite_credito - c.valor_em_aberto)}</span>
                  </div>
                  {editingCustomerId === c.id && (
                    <div className="flex gap-2 mt-2">
                      <input type="number" value={newLimitValue} onChange={(e) => setNewLimitValue(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-lg bg-card border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <Button size="sm" className="rounded-lg" onClick={() => handleSaveLimit(c.id)}>Salvar</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAdminAuth && (
        <AdminAuthModal
          onAuth={handleAdminAuth}
          onClose={() => { setShowAdminAuth(false); setPendingSection(null); }}
          title="Acesso Administrativo"
          description="Insira o PIN de administrador para acessar."
        />
      )}
    </PosLayout>
  );
};

export default AdminPage;

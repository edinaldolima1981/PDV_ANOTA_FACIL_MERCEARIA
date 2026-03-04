import { useState } from "react";
import { Search, UserPlus, UserCircle, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers, type Customer } from "@/contexts/CustomerContext";

interface CustomerSelectModalProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
  saleAmount: number;
}

const CustomerSelectModal = ({ onSelect, onClose, saleAmount }: CustomerSelectModalProps) => {
  const { customers, addCustomer, checkCreditAvailable } = useCustomers();
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim() || !newLimit.trim()) return;
    const customer = addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      cpf: newCpf.trim() || undefined,
      limite_credito: parseFloat(newLimit),
    });
    onSelect(customer);
  };

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated mx-4 max-h-[85vh] flex flex-col animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-3">
            {showNewForm ? "Cadastro Rápido" : "Selecionar Cliente"}
          </h3>
          {!showNewForm && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showNewForm ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Nome *</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome completo"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Telefone *</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="(00) 00000-0000"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">CPF (opcional)</label>
                <input value={newCpf} onChange={(e) => setNewCpf(e.target.value)} placeholder="000.000.000-00"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Limite de Crédito *</label>
                <input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder="Ex: 500.00"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground font-body text-center py-6">Nenhum cliente encontrado</p>
              )}
              {filtered.map((customer) => {
                const credit = checkCreditAvailable(customer.id, saleAmount);
                const nearLimit = credit.disponivel > 0 && (credit.emAberto / credit.limite) >= 0.8;
                return (
                  <button
                    key={customer.id}
                    onClick={() => onSelect(customer)}
                    className="w-full bg-background rounded-xl p-4 border border-border flex items-center gap-3 text-left hover:border-primary/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground font-body truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{customer.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground font-body">Disponível</p>
                      <p className={`text-sm font-bold font-body ${!credit.available ? "text-destructive" : nearLimit ? "text-warning" : "text-success"}`}>
                        {fmt(credit.disponivel)}
                      </p>
                      {nearLimit && <AlertTriangle className="w-3 h-3 text-warning inline ml-1" />}
                      {!credit.available && <AlertTriangle className="w-3 h-3 text-destructive inline ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          {showNewForm ? (
            <>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowNewForm(false)}>Voltar</Button>
              <Button className="flex-1 rounded-xl" onClick={handleAddCustomer} disabled={!newName.trim() || !newPhone.trim() || !newLimit.trim()}>
                <Check className="w-4 h-4 mr-1" /> Cadastrar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancelar</Button>
              <Button variant="secondary" className="flex-1 rounded-xl gap-1.5" onClick={() => setShowNewForm(true)}>
                <UserPlus className="w-4 h-4" /> Novo Cliente
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSelectModal;

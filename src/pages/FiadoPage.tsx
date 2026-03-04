import { useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { Search, UserCircle, Plus, Check, AlertCircle, MessageCircle, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers, type Customer } from "@/contexts/CustomerContext";
import PosLayout from "@/components/pdv/PosLayout";

const FiadoPage = () => {
  const { customers, creditSales, addCustomer } = useCustomers();
  const { storeName } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalFiado = customers.reduce((sum, c) => sum + c.valor_em_aberto, 0);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const getCustomerTransactions = (customerId: string) => {
    return creditSales.filter((s) => s.customerId === customerId);
  };

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim() || !newLimit.trim()) return;
    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      cpf: newCpf.trim() || undefined,
      limite_credito: parseFloat(newLimit),
    });
    setNewName("");
    setNewPhone("");
    setNewCpf("");
    setNewLimit("");
    setShowNewForm(false);
  };

  const handleWhatsApp = (customer: Customer) => {
    const transactions = getCustomerTransactions(customer.id).filter((t) => t.status !== "pago");
    let message = `Olá ${customer.name}! 🧾\n\nSegue seu extrato de fiado:\n\n`;
    transactions.forEach((t) => {
      message += `📅 ${t.date} - ${fmt(t.amount)} (${t.status === "atrasado" ? "⚠️ ATRASADO" : "Pendente"})\n`;
    });
    message += `\n💰 Total em aberto: ${fmt(customer.valor_em_aberto)}`;
    message += `\n\nObrigado pela preferência!`;
    const phone = customer.phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handlePrint = (customer: Customer) => {
    const transactions = getCustomerTransactions(customer.id).filter((t) => t.status !== "pago");
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Extrato - ${customer.name}</title>
      <style>
        body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
        h2 { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
        .line { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #ccc; }
        .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; text-align: right; border-top: 2px dashed #000; padding-top: 10px; }
        .info { font-size: 0.85em; color: #666; }
      </style></head><body>
      <h2>${storeName}</h2>
      <p style="text-align:center;font-size:0.9em;margin:0">EXTRATO DE FIADO</p>
      <p><strong>${customer.name}</strong><br/><span class="info">${customer.phone}</span></p>
      <p class="info">Limite: ${fmt(customer.limite_credito)} | Disponível: ${fmt(customer.limite_credito - customer.valor_em_aberto)}</p>
      <hr/>
      ${transactions.map((t) => `<div class="line"><span>${t.date}</span><span>${fmt(t.amount)}</span></div>`).join("")}
      <p class="total">Total: ${fmt(customer.valor_em_aberto)}</p>
      <p class="info" style="text-align:center;margin-top:20px;">Impresso em ${new Date().toLocaleString("pt-BR")}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Controle de Fiado</h1>
              <p className="text-xs text-muted-foreground font-body">{customers.length} clientes</p>
            </div>
            <Button size="sm" className="rounded-lg gap-1.5" onClick={() => setShowNewForm(true)}>
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </div>

          {/* Total card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-body">Total em aberto</p>
              <p className="text-xl font-bold text-primary font-display">{fmt(totalFiado)}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-primary/50" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </header>

        {/* Customer List */}
        <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-2">
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4 text-left hover:shadow-soft transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground font-body truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground font-body">{customer.phone}</p>
              </div>
              <div className="text-right">
                {customer.valor_em_aberto > 0 ? (
                  <span className="text-sm font-bold text-destructive font-body">{fmt(customer.valor_em_aberto)}</span>
                ) : (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">Quitado</span>
                )}
              </div>
            </button>
          ))}
        </main>
      </div>

      {/* New Customer Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewForm(false)}>
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-elevated animate-fade-up mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Novo Cliente</h3>
            <div className="space-y-3 mb-5">
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
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowNewForm(false)}>Cancelar</Button>
              <Button className="flex-1 rounded-xl" onClick={handleAddCustomer} disabled={!newName.trim() || !newPhone.trim() || !newLimit.trim()}>
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated animate-fade-up mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-foreground">{selectedCustomer.name}</h3>
                <p className="text-xs text-muted-foreground font-body">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Credit info */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-background rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground font-body">Limite</p>
                <p className="text-sm font-bold text-foreground font-body">{fmt(selectedCustomer.limite_credito)}</p>
              </div>
              <div className="bg-background rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground font-body">Em Aberto</p>
                <p className="text-sm font-bold text-destructive font-body">{fmt(selectedCustomer.valor_em_aberto)}</p>
              </div>
              <div className="bg-background rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground font-body">Disponível</p>
                <p className="text-sm font-bold text-success font-body">{fmt(selectedCustomer.limite_credito - selectedCustomer.valor_em_aberto)}</p>
              </div>
            </div>

            {/* Action buttons: WhatsApp + Print */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2 text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => handleWhatsApp(selectedCustomer)}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2"
                onClick={() => handlePrint(selectedCustomer)}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>

            {selectedCustomer.valor_em_aberto > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body">Débito total</p>
                  <p className="text-xl font-bold text-destructive font-display">{fmt(selectedCustomer.valor_em_aberto)}</p>
                </div>
              </div>
            )}

            <p className="text-sm font-medium text-foreground font-body mb-3">Histórico</p>
            <div className="space-y-2">
              {getCustomerTransactions(selectedCustomer.id).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div>
                    <p className="text-sm text-foreground font-body">{fmt(t.amount)}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {t.status === "pago" ? (
                      <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Pago
                      </span>
                    ) : t.status === "atrasado" ? (
                      <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">Atrasado</span>
                    ) : (
                      <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-md">Pendente</span>
                    )}
                  </div>
                </div>
              ))}
              {getCustomerTransactions(selectedCustomer.id).length === 0 && (
                <p className="text-sm text-muted-foreground font-body text-center py-4">Nenhuma transação encontrada</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PosLayout>
  );
};

export default FiadoPage;

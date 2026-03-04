import { useState } from "react";
import { Search, UserCircle, Plus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PosLayout from "@/components/pdv/PosLayout";

// ... keep existing code (Customer interface and MOCK_CUSTOMERS data)
interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
  transactions: { id: string; date: string; description: string; amount: number; paid: boolean }[];
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1", name: "Maria Silva", phone: "(11) 99999-1234", totalDebt: 87.50,
    transactions: [
      { id: "t1", date: "28/02/2026", description: "Compra - Frutas e Verduras", amount: 45.00, paid: false },
      { id: "t2", date: "25/02/2026", description: "Compra - Laticínios", amount: 42.50, paid: false },
      { id: "t3", date: "20/02/2026", description: "Compra - Padaria", amount: 23.00, paid: true },
    ],
  },
  {
    id: "2", name: "João Santos", phone: "(11) 98888-5678", totalDebt: 156.30,
    transactions: [
      { id: "t4", date: "03/03/2026", description: "Compra - Bebidas e Grãos", amount: 89.80, paid: false },
      { id: "t5", date: "27/02/2026", description: "Compra - Geral", amount: 66.50, paid: false },
    ],
  },
  {
    id: "3", name: "Ana Oliveira", phone: "(11) 97777-9012", totalDebt: 0,
    transactions: [
      { id: "t6", date: "01/03/2026", description: "Compra - Orgânicos", amount: 55.00, paid: true },
    ],
  },
  {
    id: "4", name: "Carlos Ferreira", phone: "(11) 96666-3456", totalDebt: 32.90,
    transactions: [
      { id: "t7", date: "04/03/2026", description: "Compra - Frutas", amount: 32.90, paid: false },
    ],
  },
];

const FiadoPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = MOCK_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalFiado = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.totalDebt, 0);

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Controle de Fiado</h1>
              <p className="text-xs text-muted-foreground font-body">{MOCK_CUSTOMERS.length} clientes</p>
            </div>
            <Button size="sm" className="rounded-lg gap-1.5">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </div>

          {/* Total card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-body">Total em aberto</p>
              <p className="text-xl font-bold text-primary font-display">
                R$ {totalFiado.toFixed(2).replace(".", ",")}
              </p>
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
                {customer.totalDebt > 0 ? (
                  <span className="text-sm font-bold text-destructive font-body">
                    R$ {customer.totalDebt.toFixed(2).replace(".", ",")}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                    Quitado
                  </span>
                )}
              </div>
            </button>
          ))}
        </main>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated animate-fade-up mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{selectedCustomer.name}</h3>
                <p className="text-xs text-muted-foreground font-body">{selectedCustomer.phone}</p>
              </div>
            </div>

            {selectedCustomer.totalDebt > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body">Débito total</p>
                  <p className="text-xl font-bold text-destructive font-display">
                    R$ {selectedCustomer.totalDebt.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <Button size="sm" className="rounded-lg">Quitar tudo</Button>
              </div>
            )}

            <p className="text-sm font-medium text-foreground font-body mb-3">Histórico</p>
            <div className="space-y-2">
              {selectedCustomer.transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div>
                    <p className="text-sm text-foreground font-body">{t.description}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={`text-sm font-semibold font-body ${t.paid ? "text-success" : "text-foreground"}`}>
                      R$ {t.amount.toFixed(2).replace(".", ",")}
                    </span>
                    {t.paid && <Check className="w-4 h-4 text-success" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PosLayout>
  );
};

export default FiadoPage;

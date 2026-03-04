import { useState } from "react";
import { Search, UserCircle, DollarSign, AlertTriangle, Check, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/contexts/CustomerContext";
import PosLayout from "@/components/pdv/PosLayout";

type StatusFilter = "todos" | "pendente" | "pago" | "atrasado";

const ContasReceberPage = () => {
  const { customers, creditSales, receiveSalePayment } = useCustomers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [receiveMethod, setReceiveMethod] = useState("dinheiro");

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const filteredSales = creditSales.filter((s) => {
    const matchSearch = s.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPendente = creditSales.filter((s) => s.status === "pendente").reduce((sum, s) => sum + s.amount, 0);
  const totalAtrasado = creditSales.filter((s) => s.status === "atrasado").reduce((sum, s) => sum + s.amount, 0);
  const totalRecebido = creditSales.filter((s) => s.status === "pago").reduce((sum, s) => sum + s.amount, 0);

  const handleReceive = (saleId: string) => {
    receiveSalePayment(saleId, receiveMethod);
    setReceivingId(null);
  };

  const statusFilters: { id: StatusFilter; label: string; count: number }[] = [
    { id: "todos", label: "Todos", count: creditSales.length },
    { id: "pendente", label: "Pendente", count: creditSales.filter((s) => s.status === "pendente").length },
    { id: "atrasado", label: "Atrasado", count: creditSales.filter((s) => s.status === "atrasado").length },
    { id: "pago", label: "Pago", count: creditSales.filter((s) => s.status === "pago").length },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente": return <span className="text-[10px] font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-md">Pendente</span>;
      case "atrasado": return <span className="text-[10px] font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-md">Atrasado</span>;
      case "pago": return <span className="text-[10px] font-medium bg-success/10 text-success px-2 py-0.5 rounded-md">Pago</span>;
      default: return null;
    }
  };

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <h1 className="font-display text-lg font-bold text-foreground">Contas a Receber</h1>
          <p className="text-xs text-muted-foreground font-body mb-4">Vendas a prazo e pagamentos</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-body">Pendente</p>
              <p className="text-sm font-bold text-warning font-display">{fmt(totalPendente)}</p>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-body">Atrasado</p>
              <p className="text-sm font-bold text-destructive font-display">{fmt(totalAtrasado)}</p>
            </div>
            <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-body">Recebido</p>
              <p className="text-sm font-bold text-success font-display">{fmt(totalRecebido)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {statusFilters.map((f) => (
              <button key={f.id} onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-body whitespace-nowrap transition-colors ${
                  statusFilter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-2">
          {filteredSales.length === 0 && (
            <p className="text-sm text-muted-foreground font-body text-center py-10">Nenhuma conta encontrada.</p>
          )}
          {filteredSales.map((sale) => {
            const customer = customers.find((c) => c.id === sale.customerId);
            return (
              <div key={sale.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-body truncate">{sale.customerName}</p>
                    <p className="text-xs text-muted-foreground font-body">{customer?.phone}</p>
                  </div>
                  {getStatusBadge(sale.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-body">Valor</p>
                    <p className="text-sm font-bold text-foreground font-body">{fmt(sale.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-body">Compra</p>
                    <p className="text-xs text-foreground font-body">{new Date(sale.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-body">Vencimento</p>
                    <p className={`text-xs font-body ${sale.status === "atrasado" ? "text-destructive font-bold" : "text-foreground"}`}>
                      {new Date(sale.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {customer && sale.status !== "pago" && (
                  <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2 mb-3">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body">Limite</p>
                        <p className="text-xs font-bold text-foreground font-body">{fmt(customer.limite_credito)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body">Em Aberto</p>
                        <p className="text-xs font-bold text-destructive font-body">{fmt(customer.valor_em_aberto)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body">Disponível</p>
                        <p className="text-xs font-bold text-success font-body">{fmt(customer.limite_credito - customer.valor_em_aberto)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {sale.status !== "pago" && (
                  receivingId === sale.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {["dinheiro", "pix", "credito", "debito"].map((m) => (
                          <button key={m} onClick={() => setReceiveMethod(m)}
                            className={`flex-1 text-xs py-2 rounded-lg font-body transition-colors ${receiveMethod === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                            {m === "dinheiro" ? "Dinheiro" : m === "pix" ? "Pix" : m === "credito" ? "Crédito" : "Débito"}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setReceivingId(null)}>Cancelar</Button>
                        <Button size="sm" className="flex-1 rounded-lg gap-1" onClick={() => handleReceive(sale.id)}>
                          <Check className="w-3 h-3" /> Confirmar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full rounded-lg gap-1.5" onClick={() => setReceivingId(sale.id)}>
                      <DollarSign className="w-4 h-4" /> Receber Pagamento
                    </Button>
                  )
                )}

                {sale.status === "pago" && sale.paidAt && (
                  <div className="flex items-center gap-2 text-xs text-success font-body">
                    <Check className="w-3 h-3" />
                    Pago em {new Date(sale.paidAt).toLocaleDateString("pt-BR")} via {sale.paymentMethod}
                  </div>
                )}
              </div>
            );
          })}
        </main>
      </div>
    </PosLayout>
  );
};

export default ContasReceberPage;

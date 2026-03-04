import { useState } from "react";
import { Search, UserCircle, DollarSign, Check, MessageCircle, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/contexts/CustomerContext";
import PosLayout from "@/components/pdv/PosLayout";
import { toast } from "sonner";

type StatusFilter = "todos" | "pendente" | "pago" | "atrasado";

const ContasReceberPage = () => {
  const { customers, creditSales, receiveSalePayment } = useCustomers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [receiveMethod, setReceiveMethod] = useState("dinheiro");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const filteredSales = creditSales.filter((s) => {
    const matchSearch = s.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPendente = creditSales.filter((s) => s.status === "pendente").reduce((sum, s) => sum + s.amount, 0);
  const totalAtrasado = creditSales.filter((s) => s.status === "atrasado").reduce((sum, s) => sum + s.amount, 0);
  const totalRecebido = creditSales.filter((s) => s.status === "pago").reduce((sum, s) => sum + s.amount, 0);

  const handleConfirmReceive = (saleId: string) => {
    receiveSalePayment(saleId, receiveMethod);
    setConfirmingId(saleId);
    setReceivingId(null);
    toast.success("Pagamento recebido com sucesso!");
  };

  const handleWhatsApp = (sale: typeof creditSales[0]) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const phone = customer?.phone?.replace(/\D/g, "") || "";
    const msg = encodeURIComponent(
      `Olá ${sale.customerName}!\n\nComprovante de pagamento:\n` +
      `Valor: ${fmt(sale.amount)}\n` +
      `Data compra: ${new Date(sale.date).toLocaleDateString("pt-BR")}\n` +
      `Vencimento: ${new Date(sale.dueDate).toLocaleDateString("pt-BR")}\n` +
      `Status: ${sale.status === "pago" ? "PAGO ✅" : "PENDENTE"}\n\n` +
      `Obrigado pela preferência!`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const handlePrint = (sale: typeof creditSales[0]) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const printWindow = window.open("", "_blank", "width=320,height=500");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Comprovante</title>
      <style>body{font-family:monospace;font-size:12px;padding:10px;max-width:280px;margin:0 auto}
      .center{text-align:center}.line{border-top:1px dashed #000;margin:8px 0}
      .bold{font-weight:bold}.row{display:flex;justify-content:space-between;margin:2px 0}</style></head>
      <body>
        <div class="center bold">${sale.status === "pago" ? "COMPROVANTE DE PAGAMENTO" : "COMPROVANTE DE DÉBITO"}</div>
        <div class="line"></div>
        <div class="bold">${sale.customerName}</div>
        <div>${customer?.phone || ""}</div>
        <div class="line"></div>
        <div class="row"><span>Valor:</span><span class="bold">${fmt(sale.amount)}</span></div>
        <div class="row"><span>Data compra:</span><span>${new Date(sale.date).toLocaleDateString("pt-BR")}</span></div>
        <div class="row"><span>Vencimento:</span><span>${new Date(sale.dueDate).toLocaleDateString("pt-BR")}</span></div>
        <div class="row"><span>Status:</span><span class="bold">${sale.status === "pago" ? "PAGO ✅" : sale.status === "atrasado" ? "ATRASADO ⚠️" : "PENDENTE"}</span></div>
        ${sale.status === "pago" && sale.paidAt ? `<div class="row"><span>Pago em:</span><span>${new Date(sale.paidAt).toLocaleDateString("pt-BR")}</span></div>
        <div class="row"><span>Forma:</span><span>${sale.paymentMethod}</span></div>` : ""}
        <div class="line"></div>
        <div class="center" style="margin-top:10px">Obrigado pela preferência!</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
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

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

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
            const justConfirmed = confirmingId === sale.id && sale.status === "pago";

            return (
              <div key={sale.id} className={`bg-card rounded-xl p-4 border transition-all ${justConfirmed ? "border-success/40 bg-success/5" : "border-border"}`}>
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

                {/* Actions for non-paid */}
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
                        <Button size="sm" className="flex-1 rounded-lg gap-1 bg-success hover:bg-success/90" onClick={() => handleConfirmReceive(sale.id)}>
                          <Check className="w-3 h-3" /> Confirmar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg gap-1.5" onClick={() => setReceivingId(sale.id)}>
                        <DollarSign className="w-4 h-4" /> Receber
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleWhatsApp(sale)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handlePrint(sale)}>
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                )}

                {/* Paid status with actions */}
                {sale.status === "pago" && sale.paidAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-success font-body">
                      <Check className="w-3 h-3" />
                      Pago em {new Date(sale.paidAt).toLocaleDateString("pt-BR")} via {sale.paymentMethod}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg gap-1.5 text-xs" onClick={() => handleWhatsApp(sale)}>
                        <MessageCircle className="w-3.5 h-3.5" /> Enviar Comprovante
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg gap-1.5 text-xs" onClick={() => handlePrint(sale)}>
                        <Printer className="w-3.5 h-3.5" /> Imprimir
                      </Button>
                    </div>
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

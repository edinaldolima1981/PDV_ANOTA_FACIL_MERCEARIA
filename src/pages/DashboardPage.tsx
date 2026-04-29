import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Users, BarChart3, Wine, Award, Clock } from "lucide-react";
import PosLayout from "@/components/pdv/PosLayout";
import { useTables } from "@/contexts/TableContext";
import { useWaiters } from "@/contexts/WaiterContext";

const MOCK_STATS = {
  totalToday: 1847.50,
  totalWeek: 8932.00,
  ticketMedio: 42.30,
  totalSales: 44,
  topProducts: [
    { name: "Banana Orgânica", qty: "23.5 kg", revenue: 162.15 },
    { name: "Queijo Minas Frescal", qty: "8.2 kg", revenue: 237.00 },
    { name: "Suco de Laranja", qty: "15 L", revenue: 180.00 },
    { name: "Granola Artesanal", qty: "6.8 kg", revenue: 153.00 },
    { name: "Pão Integral", qty: "12 un", revenue: 138.00 },
  ],
  hourlyData: [
    { hour: "08h", value: 120 }, { hour: "09h", value: 280 }, { hour: "10h", value: 350 },
    { hour: "11h", value: 420 }, { hour: "12h", value: 310 }, { hour: "13h", value: 180 },
    { hour: "14h", value: 220 }, { hour: "15h", value: 290 }, { hour: "16h", value: 380 },
    { hour: "17h", value: 450 },
  ],
};

const maxHourly = Math.max(...MOCK_STATS.hourlyData.map((d) => d.value));
const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const DashboardPage = () => {
  const [tab, setTab] = useState<"geral" | "bar">("geral");
  const { getTablesByModule, getTableTotals } = useTables();
  const { waiters, getCommissionsForPeriod } = useWaiters();

  // ---- Bar live stats ----
  const barStats = useMemo(() => {
    const barTables = getTablesByModule("bar");
    const occupied = barTables.filter((t) => t.status === "occupied" || t.status === "awaiting_payment");
    const totalAtivo = occupied.reduce((s, t) => s + getTableTotals(t.id).total, 0);
    const ticketMedio = occupied.length > 0 ? totalAtivo / occupied.length : 0;
    // Top produtos no bar agora
    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    barTables.forEach((t) => t.comandas.forEach((c) => c.orders.forEach((o) => {
      const cur = productMap.get(o.product.id) || { name: o.product.name, qty: 0, revenue: 0 };
      cur.qty += o.quantity;
      cur.revenue += o.unitPrice * o.quantity;
      productMap.set(o.product.id, cur);
    })));
    const top = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Tempo médio de mesa ocupada (em minutos)
    const now = Date.now();
    const tempos = occupied.filter((t) => t.openedAt).map((t) => (now - new Date(t.openedAt!).getTime()) / 60000);
    const tempoMedio = tempos.length ? tempos.reduce((s, x) => s + x, 0) / tempos.length : 0;

    return { occupied: occupied.length, total: barTables.length, totalAtivo, ticketMedio, top, tempoMedio };
  }, [getTablesByModule, getTableTotals]);

  // Comissões hoje
  const today = new Date(); today.setHours(0,0,0,0);
  const commissions = getCommissionsForPeriod(today.toISOString()).filter((c) => c.sales > 0 || c.waiter.active);

  const statCards = [
    { label: "Vendas Hoje", value: fmt(MOCK_STATS.totalToday), icon: DollarSign, accent: true },
    { label: "Vendas Semana", value: fmt(MOCK_STATS.totalWeek), icon: TrendingUp, accent: false },
    { label: "Ticket Médio", value: fmt(MOCK_STATS.ticketMedio), icon: ShoppingBag, accent: false },
    { label: "Nº de Vendas", value: String(MOCK_STATS.totalSales), icon: Users, accent: false },
  ];

  const barCards = [
    { label: "Mesas Ativas", value: `${barStats.occupied}/${barStats.total}`, icon: Wine, accent: true },
    { label: "Em aberto agora", value: fmt(barStats.totalAtivo), icon: DollarSign, accent: false },
    { label: "Ticket / mesa", value: fmt(barStats.ticketMedio), icon: ShoppingBag, accent: false },
    { label: "Tempo médio", value: `${Math.round(barStats.tempoMedio)}min`, icon: Clock, accent: false },
  ];

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <h1 className="font-display text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-body">Resumo de vendas</p>
        </header>

        <div className="border-b border-border bg-card flex">
          {[{ id: "geral", label: "Geral" }, { id: "bar", label: "🍺 Bar" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-3 text-sm font-body font-medium ${tab === t.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-4">
          {tab === "geral" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`rounded-xl p-4 border ${stat.accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.accent ? "bg-primary-foreground/20" : "bg-secondary"}`}>
                        <Icon className={`w-4 h-4 ${stat.accent ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <p className={`text-xs font-body mb-0.5 ${stat.accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{stat.label}</p>
                      <p className={`text-lg font-bold font-display ${stat.accent ? "" : "text-foreground"}`}>{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground font-body">Vendas por hora</p>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {MOCK_STATS.hourlyData.map((d) => (
                    <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-md bg-primary/20 hover:bg-primary/40 transition-colors relative group" style={{ height: `${(d.value / maxHourly) * 100}%`, minHeight: 4 }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-body">R$ {d.value}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-body">{d.hour}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm font-medium text-foreground font-body mb-4">Mais vendidos hoje</p>
                <div className="space-y-3">
                  {MOCK_STATS.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-body">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-body truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{p.qty}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground font-body">{fmt(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "bar" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {barCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`rounded-xl p-4 border ${stat.accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.accent ? "bg-primary-foreground/20" : "bg-secondary"}`}>
                        <Icon className={`w-4 h-4 ${stat.accent ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <p className={`text-xs font-body mb-0.5 ${stat.accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{stat.label}</p>
                      <p className={`text-lg font-bold font-display ${stat.accent ? "" : "text-foreground"}`}>{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground font-body">Comissões dos garçons (hoje)</p>
                </div>
                {commissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-body text-center py-6">Nenhum garçom cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {commissions.map((c) => (
                      <div key={c.waiter.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {c.waiter.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground font-body">{c.waiter.name}</p>
                          <p className="text-xs text-muted-foreground font-body">{c.sales} vendas • {c.waiter.commissionPct}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground font-body">{fmt(c.total)}</p>
                          <p className="text-xs text-emerald-600 font-body">+ {fmt(c.commission)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm font-medium text-foreground font-body mb-4">Top produtos no bar (em aberto)</p>
                {barStats.top.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-body text-center py-6">Nenhum pedido ativo</p>
                ) : (
                  <div className="space-y-3">
                    {barStats.top.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-body">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-body truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-body">{p.qty.toFixed(p.qty % 1 === 0 ? 0 : 2)} un</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground font-body">{fmt(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </PosLayout>
  );
};

export default DashboardPage;

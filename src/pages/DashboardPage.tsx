import { TrendingUp, DollarSign, ShoppingBag, Users, BarChart3 } from "lucide-react";
import PosLayout from "@/components/pdv/PosLayout";

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
    { hour: "08h", value: 120 },
    { hour: "09h", value: 280 },
    { hour: "10h", value: 350 },
    { hour: "11h", value: 420 },
    { hour: "12h", value: 310 },
    { hour: "13h", value: 180 },
    { hour: "14h", value: 220 },
    { hour: "15h", value: 290 },
    { hour: "16h", value: 380 },
    { hour: "17h", value: 450 },
  ],
};

const maxHourly = Math.max(...MOCK_STATS.hourlyData.map((d) => d.value));

const DashboardPage = () => {
  const statCards = [
    { label: "Vendas Hoje", value: `R$ ${MOCK_STATS.totalToday.toFixed(2).replace(".", ",")}`, icon: DollarSign, accent: true },
    { label: "Vendas Semana", value: `R$ ${MOCK_STATS.totalWeek.toFixed(2).replace(".", ",")}`, icon: TrendingUp, accent: false },
    { label: "Ticket Médio", value: `R$ ${MOCK_STATS.ticketMedio.toFixed(2).replace(".", ",")}`, icon: ShoppingBag, accent: false },
    { label: "Nº de Vendas", value: String(MOCK_STATS.totalSales), icon: Users, accent: false },
  ];

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <h1 className="font-display text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-body">Resumo de vendas</p>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`rounded-xl p-4 border ${
                    stat.accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    stat.accent ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}>
                    <Icon className={`w-4 h-4 ${stat.accent ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <p className={`text-xs font-body mb-0.5 ${stat.accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {stat.label}
                  </p>
                  <p className={`text-lg font-bold font-display ${stat.accent ? "" : "text-foreground"}`}>
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hourly Chart */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground font-body">Vendas por hora</p>
            </div>
            <div className="flex items-end gap-2 h-32">
              {MOCK_STATS.hourlyData.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                    style={{ height: `${(d.value / maxHourly) * 100}%`, minHeight: 4 }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-body">
                      R$ {d.value}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-body">{d.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm font-medium text-foreground font-body mb-4">Mais vendidos hoje</p>
            <div className="space-y-3">
              {MOCK_STATS.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-body">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-body truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{p.qty}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground font-body">
                    R$ {p.revenue.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PosLayout>
  );
};

export default DashboardPage;

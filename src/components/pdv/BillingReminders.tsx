import { useState, useEffect, useCallback } from "react";
import { Bell, MessageCircle, Send, Clock, Settings, X, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/contexts/CustomerContext";
import { useStore } from "@/contexts/StoreContext";
import { toast } from "sonner";

export interface ReminderSettings {
  enabled: boolean;
  daysBeforeDue: number;
  frequency: "unica" | "diaria" | "a_cada_2_dias" | "a_cada_3_dias" | "semanal";
  sendOnOverdue: boolean;
  overdueFrequency: "diaria" | "a_cada_2_dias" | "a_cada_3_dias" | "semanal";
  messageTemplate: string;
  overdueTemplate: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  daysBeforeDue: 5,
  frequency: "unica",
  sendOnOverdue: true,
  overdueFrequency: "diaria",
  messageTemplate: "Olá {nome}! 😊\n\nLembramos que você tem uma conta no valor de {valor} com vencimento em {vencimento}.\n\nEvite juros, efetue o pagamento até a data.\n\n{loja} agradece! 🙏",
  overdueTemplate: "Olá {nome}! ⚠️\n\nSua conta no valor de {valor} venceu em {vencimento} e encontra-se em atraso.\n\nPor favor, regularize o quanto antes.\n\n{loja} agradece a compreensão! 🙏",
};

const FREQUENCY_LABELS: Record<string, string> = {
  unica: "Apenas uma vez",
  diaria: "Diariamente",
  a_cada_2_dias: "A cada 2 dias",
  a_cada_3_dias: "A cada 3 dias",
  semanal: "Semanalmente",
};

interface PendingReminder {
  saleId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
  message: string;
}

export const useReminderSettings = () => {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem("reminder_settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = useCallback((data: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem("reminder_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { settings, updateSettings };
};

export const usePendingReminders = (settings: ReminderSettings) => {
  const { customers, creditSales } = useCustomers();
  const { storeName } = useStore();

  const buildMessage = useCallback((template: string, customerName: string, amount: number, dueDate: string) => {
    return template
      .replace(/{nome}/g, customerName)
      .replace(/{valor}/g, `R$ ${amount.toFixed(2).replace(".", ",")}`)
      .replace(/{vencimento}/g, new Date(dueDate).toLocaleDateString("pt-BR"))
      .replace(/{loja}/g, storeName);
  }, [storeName]);

  const pendingReminders: PendingReminder[] = [];

  if (!settings.enabled) return pendingReminders;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  creditSales.forEach((sale) => {
    if (sale.status === "pago") return;

    const dueDate = new Date(sale.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;

    const customer = customers.find((c) => c.id === sale.customerId);
    if (!customer?.phone) return;

    let shouldRemind = false;

    if (!isOverdue && daysUntilDue <= settings.daysBeforeDue) {
      shouldRemind = true;
    }

    if (isOverdue && settings.sendOnOverdue) {
      shouldRemind = true;
    }

    if (shouldRemind) {
      const template = isOverdue ? settings.overdueTemplate : settings.messageTemplate;
      pendingReminders.push({
        saleId: sale.id,
        customerName: sale.customerName,
        customerPhone: customer.phone,
        amount: sale.amount,
        dueDate: sale.dueDate,
        daysUntilDue,
        isOverdue,
        message: buildMessage(template, sale.customerName, sale.amount, sale.dueDate),
      });
    }
  });

  return pendingReminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

// Reminder Settings Modal for Admin
export const ReminderSettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { settings, updateSettings } = useReminderSettings();
  const [local, setLocal] = useState(settings);

  const handleSave = () => {
    updateSettings(local);
    toast.success("Configurações de cobrança salvas!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated animate-fade-up mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">Cobranças Automáticas</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
            <div>
              <p className="text-sm font-medium text-foreground font-body">Ativar lembretes</p>
              <p className="text-xs text-muted-foreground font-body">Cobranças via WhatsApp</p>
            </div>
            <button
              onClick={() => setLocal((p) => ({ ...p, enabled: !p.enabled }))}
              className={`w-12 h-7 rounded-full transition-colors relative ${local.enabled ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 bg-card rounded-full absolute top-1 transition-transform ${local.enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {local.enabled && (
            <>
              {/* Days before due */}
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Enviar cobrança quantos dias antes do vencimento?</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={local.daysBeforeDue}
                    onChange={(e) => setLocal((p) => ({ ...p, daysBeforeDue: parseInt(e.target.value) || 5 }))}
                    className="w-20 h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted-foreground font-body">dias antes</span>
                </div>
              </div>

              {/* Pre-due frequency */}
              <div>
                <label className="text-xs font-medium text-muted-foreground font-body">Frequência antes do vencimento</label>
                <select
                  value={local.frequency}
                  onChange={(e) => setLocal((p) => ({ ...p, frequency: e.target.value as ReminderSettings["frequency"] }))}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Overdue section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm font-medium text-foreground font-body">Cobrar contas atrasadas</p>
                  </div>
                  <button
                    onClick={() => setLocal((p) => ({ ...p, sendOnOverdue: !p.sendOnOverdue }))}
                    className={`w-12 h-7 rounded-full transition-colors relative ${local.sendOnOverdue ? "bg-destructive" : "bg-muted"}`}
                  >
                    <div className={`w-5 h-5 bg-card rounded-full absolute top-1 transition-transform ${local.sendOnOverdue ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {local.sendOnOverdue && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground font-body">Frequência para atrasadas</label>
                    <select
                      value={local.overdueFrequency}
                      onChange={(e) => setLocal((p) => ({ ...p, overdueFrequency: e.target.value as ReminderSettings["overdueFrequency"] }))}
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
                    >
                      {Object.entries(FREQUENCY_LABELS).filter(([k]) => k !== "unica").map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Message templates */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground font-body mb-1">
                  Mensagem antes do vencimento
                  <span className="text-[10px] text-primary ml-1">Use: {"{nome}"} {"{valor}"} {"{vencimento}"} {"{loja}"}</span>
                </p>
                <textarea
                  value={local.messageTemplate}
                  onChange={(e) => setLocal((p) => ({ ...p, messageTemplate: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground font-body mb-1">Mensagem para atrasadas</p>
                <textarea
                  value={local.overdueTemplate}
                  onChange={(e) => setLocal((p) => ({ ...p, overdueTemplate: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </>
          )}
        </div>

        <Button className="w-full rounded-xl mt-5" onClick={handleSave}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

// Reminder Dashboard Panel for ContasReceber
export const ReminderPanel = () => {
  const { settings } = useReminderSettings();
  const reminders = usePendingReminders(settings);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  if (!settings.enabled || reminders.length === 0) return null;

  const handleSendOne = (reminder: PendingReminder) => {
    const phone = reminder.customerPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(reminder.message);
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
    setSentIds((prev) => new Set([...prev, reminder.saleId]));
    toast.success(`Cobrança enviada para ${reminder.customerName}!`);
  };

  const handleSendAll = () => {
    reminders.forEach((r, i) => {
      if (sentIds.has(r.saleId)) return;
      setTimeout(() => {
        handleSendOne(r);
      }, i * 1500); // stagger to avoid blocking
    });
  };

  const pendingCount = reminders.filter((r) => !sentIds.has(r.saleId)).length;
  const overdueCount = reminders.filter((r) => r.isOverdue).length;

  return (
    <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-warning" />
          <p className="text-sm font-semibold text-foreground font-body">
            Cobranças Pendentes ({pendingCount})
          </p>
        </div>
        {pendingCount > 0 && (
          <Button size="sm" className="rounded-lg gap-1.5 text-xs bg-success hover:bg-success/90" onClick={handleSendAll}>
            <Send className="w-3 h-3" /> Enviar Todas
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {reminders.map((r) => {
          const sent = sentIds.has(r.saleId);
          return (
            <div key={r.saleId} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
              sent ? "bg-success/5 border-success/20" : r.isOverdue ? "bg-destructive/5 border-destructive/20" : "bg-background border-border"
            }`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground font-body truncate">{r.customerName}</p>
                <p className="text-[10px] text-muted-foreground font-body">
                  R$ {r.amount.toFixed(2).replace(".", ",")} •{" "}
                  {r.isOverdue ? (
                    <span className="text-destructive font-semibold">Atrasado {Math.abs(r.daysUntilDue)} dias</span>
                  ) : (
                    <span>Vence em {r.daysUntilDue} dias</span>
                  )}
                </p>
              </div>
              {sent ? (
                <span className="text-[10px] text-success font-medium bg-success/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enviado
                </span>
              ) : (
                <button
                  onClick={() => handleSendOne(r)}
                  className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center hover:bg-success/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-success" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

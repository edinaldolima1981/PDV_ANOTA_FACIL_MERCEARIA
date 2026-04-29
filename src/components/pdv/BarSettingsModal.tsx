import { useState } from "react";
import { X, Plus, Trash2, Wine, Sparkles, Clock, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWaiters } from "@/contexts/WaiterContext";
import { useHappyHour } from "@/contexts/HappyHourContext";
import { useBarSettings } from "@/contexts/BarSettingsContext";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const BarSettingsModal = ({ onClose }: Props) => {
  const { waiters, addWaiter, removeWaiter, updateWaiter } = useWaiters();
  const { config: hh, updateConfig } = useHappyHour();
  const { settings, update } = useBarSettings();

  const [tab, setTab] = useState<"waiters" | "happy" | "general">("waiters");

  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newComm, setNewComm] = useState("10");

  const [newMod, setNewMod] = useState("");

  const handleAddWaiter = () => {
    if (!newName.trim() || !newPin.trim()) return;
    addWaiter({ name: newName.trim(), pin: newPin.trim(), commissionPct: parseFloat(newComm) || 0 });
    setNewName(""); setNewPin(""); setNewComm("10");
    toast.success("Garçom adicionado");
  };

  const toggleWeekday = (d: number) => {
    const set = new Set(hh.weekdays);
    set.has(d) ? set.delete(d) : set.add(d);
    updateConfig({ weekdays: Array.from(set).sort() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-elevated mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">Configurações do Bar</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex border-b border-border">
          {[
            { id: "waiters", label: "Garçons" },
            { id: "happy", label: "Happy Hour" },
            { id: "general", label: "Taxas / Modif." },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-3 text-xs font-body font-medium ${tab === t.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {tab === "waiters" && (
            <>
              <div className="space-y-2">
                {waiters.map((w) => (
                  <div key={w.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground font-body">{w.name}</p>
                      <p className="text-xs text-muted-foreground font-body">PIN: {w.pin} • Comissão: {w.commissionPct}%</p>
                    </div>
                    <input
                      type="number"
                      value={w.commissionPct}
                      onChange={(e) => updateWaiter(w.id, { commissionPct: parseFloat(e.target.value) || 0 })}
                      className="w-16 h-8 px-2 rounded-lg bg-card border border-border text-xs text-center font-body"
                      title="Comissão %"
                    />
                    <button onClick={() => updateWaiter(w.id, { active: !w.active })} className={`px-2 py-1 rounded-lg text-[10px] font-body font-medium ${w.active ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {w.active ? "Ativo" : "Inativo"}
                    </button>
                    <button onClick={() => removeWaiter(w.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-sm font-medium text-foreground font-body">Adicionar garçom</p>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="PIN" maxLength={4}
                    className="h-10 px-3 rounded-lg bg-background border border-border text-sm font-body" />
                  <div className="relative">
                    <input value={newComm} onChange={(e) => setNewComm(e.target.value)} type="number" placeholder="Comissão"
                      className="w-full h-10 px-3 pr-7 rounded-lg bg-background border border-border text-sm font-body" />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
                <Button className="w-full rounded-xl gap-1.5" onClick={handleAddWaiter} disabled={!newName.trim() || !newPin.trim()}>
                  <Plus className="w-4 h-4" /> Adicionar garçom
                </Button>
              </div>
            </>
          )}

          {tab === "happy" && (
            <>
              <label className="flex items-center justify-between bg-background border border-border rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground font-body">Happy Hour ativo</p>
                    <p className="text-[11px] text-muted-foreground font-body">Aplica desconto automático no horário</p>
                  </div>
                </div>
                <input type="checkbox" checked={hh.enabled} onChange={(e) => updateConfig({ enabled: e.target.checked })} className="w-5 h-5 accent-primary" />
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground font-body">Início</label>
                  <input type="number" min={0} max={23} value={hh.startHour}
                    onChange={(e) => updateConfig({ startHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) })}
                    className="w-full h-10 px-2 rounded-lg bg-background border border-border text-sm font-body text-center mt-1" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-body">Fim</label>
                  <input type="number" min={0} max={24} value={hh.endHour}
                    onChange={(e) => updateConfig({ endHour: Math.max(0, Math.min(24, parseInt(e.target.value) || 0)) })}
                    className="w-full h-10 px-2 rounded-lg bg-background border border-border text-sm font-body text-center mt-1" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-body">Desconto %</label>
                  <input type="number" min={0} max={100} value={hh.discountPct}
                    onChange={(e) => updateConfig({ discountPct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                    className="w-full h-10 px-2 rounded-lg bg-background border border-border text-sm font-body text-center mt-1" />
                </div>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground font-body mb-2">Dias da semana</p>
                <div className="flex gap-1.5">
                  {WEEKDAYS.map((d, i) => {
                    const on = hh.weekdays.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleWeekday(i)}
                        title={WEEKDAY_LABELS[i]}
                        className={`flex-1 h-10 rounded-lg font-body text-sm font-bold transition-all ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-body">
                  Vigência: {String(hh.startHour).padStart(2,"0")}h às {String(hh.endHour).padStart(2,"0")}h, {hh.weekdays.map((d) => WEEKDAY_LABELS[d]).join(", ") || "nenhum dia"}
                </p>
              </div>
            </>
          )}

          {tab === "general" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground font-body">Taxa serviço padrão %</label>
                  <input type="number" value={settings.serviceFeePct}
                    onChange={(e) => update({ serviceFeePct: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body mt-1" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-body">Couvert / pessoa (R$)</label>
                  <input type="number" step="0.01" value={settings.couvertPerPerson}
                    onChange={(e) => update({ couvertPerPerson: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-body mt-1" />
                </div>
              </div>
              <label className="flex items-center justify-between bg-background border border-border rounded-xl p-3">
                <span className="text-sm font-body text-foreground">Aplicar taxa em mesas novas</span>
                <input type="checkbox" checked={settings.serviceFeeDefaultOn}
                  onChange={(e) => update({ serviceFeeDefaultOn: e.target.checked })}
                  className="w-5 h-5 accent-primary" />
              </label>

              <div>
                <p className="text-sm font-medium text-foreground font-body mb-2">Modificadores rápidos</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {settings.quickModifiers.map((m) => (
                    <span key={m} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs font-body">
                      {m}
                      <button onClick={() => update({ quickModifiers: settings.quickModifiers.filter((x) => x !== m) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newMod} onChange={(e) => setNewMod(e.target.value)} placeholder="Ex: sem gelo"
                    className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm font-body" />
                  <Button size="sm" className="rounded-lg" onClick={() => {
                    if (!newMod.trim()) return;
                    update({ quickModifiers: [...settings.quickModifiers, newMod.trim()] });
                    setNewMod("");
                  }}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarSettingsModal;

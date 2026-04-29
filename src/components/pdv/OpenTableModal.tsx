import { useState } from "react";
import { X, Users, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTables, type Table } from "@/contexts/TableContext";
import { useWaiters } from "@/contexts/WaiterContext";

interface Props {
  table: Table;
  onClose: () => void;
  onOpened: () => void;
}

const OpenTableModal = ({ table, onClose, onOpened }: Props) => {
  const { openTable } = useTables();
  const { waiters } = useWaiters();
  const [customerName, setCustomerName] = useState("");
  const [waiterId, setWaiterId] = useState<string>("");
  const [occupants, setOccupants] = useState(table.seats);

  const handleConfirm = () => {
    openTable(table.id, {
      customerName: customerName.trim() || undefined,
      waiterId: waiterId || undefined,
      occupants,
    });
    onOpened();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Abrir {table.label}</h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{table.seats} lugares disponíveis</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider">
              Nome do cliente (opcional)
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm font-body mt-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Pessoas na mesa
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <button
                onClick={() => setOccupants(Math.max(1, occupants - 1))}
                className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 h-11 rounded-xl bg-background border border-border flex items-center justify-center">
                <span className="text-lg font-display font-bold text-foreground">{occupants}</span>
              </div>
              <button
                onClick={() => setOccupants(occupants + 1)}
                className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>

          {waiters.filter((w) => w.active).length > 0 && (
            <div>
              <label className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                Garçom responsável
              </label>
              <select
                value={waiterId}
                onChange={(e) => setWaiterId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm font-body mt-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Sem garçom —</option>
                {waiters.filter((w) => w.active).map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          <Button size="lg" className="w-full rounded-xl mt-2" onClick={handleConfirm}>
            Abrir mesa e adicionar itens
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenTableModal;

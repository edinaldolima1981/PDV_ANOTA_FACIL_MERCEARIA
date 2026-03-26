import { useTables, type Table, type ModuleType } from "@/contexts/TableContext";
import { Users, Clock, Plus, Minus, UtensilsCrossed, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TableMapProps {
  module: ModuleType;
  onSelectTable: (table: Table) => void;
}

const STATUS_STYLES: Record<string, string> = {
  free: "bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500",
  occupied: "bg-amber-500/10 border-amber-500/40 hover:border-amber-500",
  reserved: "bg-blue-500/10 border-blue-500/40 hover:border-blue-500",
};

const STATUS_LABELS: Record<string, string> = {
  free: "Livre",
  occupied: "Ocupada",
  reserved: "Reservada",
};

const STATUS_DOT: Record<string, string> = {
  free: "bg-emerald-500",
  occupied: "bg-amber-500",
  reserved: "bg-blue-500",
};

const TableMap = ({ module, onSelectTable }: TableMapProps) => {
  const { getTablesByModule, addTable, removeTable, getTableTotal } = useTables();
  const tables = getTablesByModule(module);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSeats, setNewSeats] = useState(4);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const ModuleIcon = module === "restaurante" ? UtensilsCrossed : Wine;

  const handleAddTable = () => {
    const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
    addTable({
      number: maxNum + 1,
      label: `Mesa ${maxNum + 1}`,
      module,
      seats: newSeats,
    });
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[key]}`} />
            {label}
          </div>
        ))}
        <div className="ml-auto">
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-3.5 h-3.5" /> Mesa
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="text-sm font-body text-foreground">Lugares:</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setNewSeats(Math.max(1, newSeats - 1))} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold w-6 text-center">{newSeats}</span>
            <button onClick={() => setNewSeats(newSeats + 1)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="rounded-xl ml-auto" onClick={handleAddTable}>Criar Mesa</Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {tables.map((table) => {
          const total = getTableTotal(table.id);
          return (
            <button
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={`relative p-4 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-2 min-h-[120px] ${STATUS_STYLES[table.status]}`}
            >
              {/* Status dot */}
              <div className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${STATUS_DOT[table.status]}`} />

              <ModuleIcon className="w-6 h-6 text-muted-foreground" />

              <span className="font-display text-base font-bold text-foreground">{table.label}</span>

              <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                <Users className="w-3 h-3" />
                {table.seats} lugares
              </div>

              {table.status === "occupied" && (
                <>
                  {table.customerName && (
                    <span className="text-[10px] text-muted-foreground font-body truncate max-w-full">
                      {table.customerName}
                    </span>
                  )}
                  {total > 0 && (
                    <span className="text-xs font-bold text-foreground font-body">{fmt(total)}</span>
                  )}
                  {table.openedAt && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {Math.round((Date.now() - table.openedAt.getTime()) / 60000)}min
                    </div>
                  )}
                </>
              )}

              {table.status === "reserved" && table.customerName && (
                <span className="text-[10px] text-muted-foreground font-body truncate max-w-full">
                  {table.customerName}
                </span>
              )}

              {table.status === "free" && table.orders.length === 0 && (
                <span className="text-[10px] text-muted-foreground font-body">{STATUS_LABELS[table.status]}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableMap;

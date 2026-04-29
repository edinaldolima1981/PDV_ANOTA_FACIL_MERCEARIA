import { useState } from "react";
import PosLayout from "@/components/pdv/PosLayout";
import TableMap from "@/components/pdv/TableMap";
import TableOrderPanel from "@/components/pdv/TableOrderPanel";
import StoreBanner from "@/components/pdv/StoreBanner";
import { useHappyHour } from "@/contexts/HappyHourContext";
import type { Table } from "@/contexts/TableContext";

const BarPage = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { isActiveNow, config } = useHappyHour();
  const happy = isActiveNow();

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <StoreBanner size="sm" />
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground">🍺 Bar</h1>
            <p className="text-xs text-muted-foreground font-body">Mesas, comandas e pedidos</p>
          </div>
          {happy && (
            <div className="bg-amber-500/15 border border-amber-500/40 text-amber-700 px-3 py-1.5 rounded-xl">
              <p className="text-xs font-bold font-body">🍻 HAPPY HOUR ATIVO</p>
              <p className="text-[10px] font-body">−{config.discountPct}% até {String(config.endHour).padStart(2,"0")}h</p>
            </div>
          )}
        </header>
        <TableMap module="bar" onSelectTable={setSelectedTable} />
      </div>
      {selectedTable && (
        <TableOrderPanel
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </PosLayout>
  );
};

export default BarPage;

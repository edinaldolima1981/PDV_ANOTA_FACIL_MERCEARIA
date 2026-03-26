import { useState } from "react";
import PosLayout from "@/components/pdv/PosLayout";
import TableMap from "@/components/pdv/TableMap";
import TableOrderPanel from "@/components/pdv/TableOrderPanel";
import type { Table } from "@/contexts/TableContext";

const BarPage = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
          <h1 className="font-display text-lg font-bold text-foreground">🍺 Bar</h1>
          <p className="text-xs text-muted-foreground font-body">Gerenciamento de mesas e pedidos</p>
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

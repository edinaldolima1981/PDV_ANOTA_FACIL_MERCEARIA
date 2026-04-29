import { useState } from "react";
import PosLayout from "@/components/pdv/PosLayout";
import TableMap from "@/components/pdv/TableMap";
import TableOrderPanel from "@/components/pdv/TableOrderPanel";
import StoreBanner from "@/components/pdv/StoreBanner";
import type { Table } from "@/contexts/TableContext";

const RestaurantPage = () => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  return (
    <PosLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <StoreBanner size="sm" />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">🍽️ Restaurante</h1>
            <p className="text-xs text-muted-foreground font-body">Gerenciamento de mesas e pedidos</p>
          </div>
        </header>
        <TableMap module="restaurante" onSelectTable={setSelectedTable} />
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

export default RestaurantPage;

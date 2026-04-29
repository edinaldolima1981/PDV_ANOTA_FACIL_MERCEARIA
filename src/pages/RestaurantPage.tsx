import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PosLayout from "@/components/pdv/PosLayout";
import TableMap from "@/components/pdv/TableMap";
import TableOrderPanel from "@/components/pdv/TableOrderPanel";
import OpenTableModal from "@/components/pdv/OpenTableModal";
import StoreBanner from "@/components/pdv/StoreBanner";
import type { Table } from "@/contexts/TableContext";

const RestaurantPage = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [openingTable, setOpeningTable] = useState<Table | null>(null);

  const handleSelectTable = (table: Table) => {
    if (table.status === "free") {
      setOpeningTable(table);
    } else if (table.status === "occupied" || table.status === "awaiting_payment") {
      navigate(`/mesa/${table.id}`);
    } else {
      setSelectedTable(table);
    }
  };

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
        <TableMap module="restaurante" onSelectTable={handleSelectTable} />
      </div>
      {selectedTable && (
        <TableOrderPanel
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
      {openingTable && (
        <OpenTableModal
          table={openingTable}
          onClose={() => setOpeningTable(null)}
          onOpened={() => {
            const id = openingTable.id;
            setOpeningTable(null);
            navigate(`/mesa/${id}`);
          }}
        />
      )}
    </PosLayout>
  );
};

export default RestaurantPage;

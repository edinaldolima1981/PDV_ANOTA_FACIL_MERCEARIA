import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PosLayout from "@/components/pdv/PosLayout";
import TableMap from "@/components/pdv/TableMap";
import TableOrderPanel from "@/components/pdv/TableOrderPanel";
import OpenTableModal from "@/components/pdv/OpenTableModal";
import StoreBanner from "@/components/pdv/StoreBanner";
import { useHappyHour } from "@/contexts/HappyHourContext";
import type { Table } from "@/contexts/TableContext";

const BarPage = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [openingTable, setOpeningTable] = useState<Table | null>(null);
  const { isActiveNow, config } = useHappyHour();
  const happy = isActiveNow();

  const handleSelectTable = (table: Table) => {
    if (table.status === "free") {
      // Mesa livre → abrir modal "abrir mesa" e depois ir para tela de pedidos
      setOpeningTable(table);
    } else if (table.status === "occupied" || table.status === "awaiting_payment") {
      // Mesa ativa → ir direto para tela de pedidos (split-screen)
      navigate(`/mesa/${table.id}`);
    } else {
      // Reservada/suja → painel lateral antigo (gestão rápida)
      setSelectedTable(table);
    }
  };

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
        <TableMap module="bar" onSelectTable={handleSelectTable} />
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

export default BarPage;

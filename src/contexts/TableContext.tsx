import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type TableStatus = "free" | "occupied" | "reserved";
export type ModuleType = "restaurante" | "bar";

export interface TableOrder {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  notes?: string;
  createdAt: Date;
  printed: boolean;
}

export interface Table {
  id: string;
  number: number;
  label: string;
  status: TableStatus;
  module: ModuleType;
  seats: number;
  orders: TableOrder[];
  customerName?: string;
  openedAt?: Date;
}

interface TableContextType {
  tables: Table[];
  addTable: (table: Omit<Table, "id" | "orders" | "status">) => void;
  removeTable: (id: string) => void;
  updateTable: (id: string, data: Partial<Table>) => void;
  openTable: (id: string, customerName?: string) => void;
  closeTable: (id: string) => void;
  reserveTable: (id: string, customerName: string) => void;
  addOrder: (tableId: string, product: Product, quantity: number, notes?: string) => void;
  removeOrder: (tableId: string, orderId: string) => void;
  updateOrderQuantity: (tableId: string, orderId: string, quantity: number) => void;
  markOrderPrinted: (tableId: string, orderId: string) => void;
  markAllPrinted: (tableId: string) => void;
  getTableTotal: (tableId: string) => number;
  splitBill: (tableId: string, parts: number) => number;
  getTablesByModule: (module: ModuleType) => Table[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

const createDefaultTables = (): Table[] => {
  const tables: Table[] = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({
      id: `rest_${i}`,
      number: i,
      label: `Mesa ${i}`,
      status: "free",
      module: "restaurante",
      seats: i <= 4 ? 2 : i <= 8 ? 4 : 6,
      orders: [],
    });
  }
  for (let i = 1; i <= 6; i++) {
    tables.push({
      id: `bar_${i}`,
      number: i,
      label: `Mesa ${i}`,
      status: "free",
      module: "bar",
      seats: i <= 3 ? 2 : 4,
      orders: [],
    });
  }
  return tables;
};

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<Table[]>(createDefaultTables);

  const addTable = useCallback((table: Omit<Table, "id" | "orders" | "status">) => {
    const id = `${table.module}_${Date.now()}`;
    setTables((prev) => [...prev, { ...table, id, orders: [], status: "free" as TableStatus }]);
  }, []);

  const removeTable = useCallback((id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTable = useCallback((id: string, data: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const openTable = useCallback((id: string, customerName?: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "occupied" as TableStatus, customerName, openedAt: new Date() } : t
      )
    );
  }, []);

  const closeTable = useCallback((id: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "free" as TableStatus, orders: [], customerName: undefined, openedAt: undefined }
          : t
      )
    );
  }, []);

  const reserveTable = useCallback((id: string, customerName: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "reserved" as TableStatus, customerName } : t))
    );
  }, []);

  const addOrder = useCallback((tableId: string, product: Product, quantity: number, notes?: string) => {
    const order: TableOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      productId: product.id,
      product,
      quantity,
      notes,
      createdAt: new Date(),
      printed: false,
    };
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        // If same product exists, increase quantity
        const existing = t.orders.find((o) => o.productId === product.id && !o.printed);
        if (existing) {
          return {
            ...t,
            orders: t.orders.map((o) =>
              o.id === existing.id ? { ...o, quantity: o.quantity + quantity } : o
            ),
          };
        }
        return { ...t, orders: [...t.orders, order], status: "occupied" as TableStatus, openedAt: t.openedAt || new Date() };
      })
    );
  }, []);

  const removeOrder = useCallback((tableId: string, orderId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, orders: t.orders.filter((o) => o.id !== orderId) } : t))
    );
  }, []);

  const updateOrderQuantity = useCallback((tableId: string, orderId: string, quantity: number) => {
    if (quantity <= 0) {
      removeOrder(tableId, orderId);
      return;
    }
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, orders: t.orders.map((o) => (o.id === orderId ? { ...o, quantity } : o)) }
          : t
      )
    );
  }, [removeOrder]);

  const markOrderPrinted = useCallback((tableId: string, orderId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, orders: t.orders.map((o) => (o.id === orderId ? { ...o, printed: true } : o)) }
          : t
      )
    );
  }, []);

  const markAllPrinted = useCallback((tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, orders: t.orders.map((o) => ({ ...o, printed: true })) } : t
      )
    );
  }, []);

  const getTableTotal = useCallback(
    (tableId: string) => {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return 0;
      return table.orders.reduce((sum, o) => sum + o.product.price * o.quantity, 0);
    },
    [tables]
  );

  const splitBill = useCallback(
    (tableId: string, parts: number) => {
      if (parts <= 0) return 0;
      return getTableTotal(tableId) / parts;
    },
    [getTableTotal]
  );

  const getTablesByModule = useCallback(
    (module: ModuleType) => tables.filter((t) => t.module === module),
    [tables]
  );

  return (
    <TableContext.Provider
      value={{
        tables,
        addTable,
        removeTable,
        updateTable,
        openTable,
        closeTable,
        reserveTable,
        addOrder,
        removeOrder,
        updateOrderQuantity,
        markOrderPrinted,
        markAllPrinted,
        getTableTotal,
        splitBill,
        getTablesByModule,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTables = () => {
  const context = useContext(TableContext);
  if (!context) throw new Error("useTables must be used within TableProvider");
  return context;
};

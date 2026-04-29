import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type TableStatus = "free" | "occupied" | "awaiting_payment" | "reserved" | "dirty";
export type ModuleType = "restaurante" | "bar";
export type PrintDestination = "bar" | "kitchen";

export interface TableOrder {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;        // preço aplicado (pode ter happy hour)
  notes?: string;
  modifiers?: string[];
  destination?: PrintDestination;
  waiterId?: string;
  createdAt: Date;
  printed: boolean;
}

export interface Payment {
  id: string;
  method: "dinheiro" | "pix" | "credito" | "debito" | "a_prazo";
  amount: number;
  at: Date;
  customerId?: string;
  customerName?: string;
}

export interface Comanda {
  id: string;
  number: number;
  label?: string;       // ex: nome do cliente
  openedAt: Date;
  closedAt?: Date;
  orders: TableOrder[];
  payments: Payment[];
}

export type TableEventType =
  | "open" | "close" | "reserve" | "cleaned" | "request_bill"
  | "add_order" | "remove_order" | "transfer_order" | "merge_table"
  | "split_table" | "add_comanda" | "close_comanda" | "payment";

export interface TableEvent {
  id: string;
  at: Date;
  type: TableEventType;
  description: string;
  by?: string; // waiterId
}

export interface Table {
  id: string;
  number: number;
  label: string;
  status: TableStatus;
  module: ModuleType;
  seats: number;
  occupants?: number;          // pessoas reais sentadas (couvert)
  customerName?: string;
  waiterId?: string;
  serviceFeeEnabled: boolean;
  serviceFeePct: number;       // % aplicada
  couvertPerPerson: number;    // valor por pessoa
  comandas: Comanda[];
  history: TableEvent[];
  openedAt?: Date;
}

export interface TableTotals {
  subtotal: number;
  serviceFee: number;
  couvert: number;
  paid: number;
  total: number;
  remaining: number;
}

interface AddOrderInput {
  product: Product;
  quantity: number;
  unitPrice?: number;
  notes?: string;
  modifiers?: string[];
  comandaId?: string;
  waiterId?: string;
}

interface TableContextType {
  tables: Table[];
  // Mesa
  addTable: (data: { number: number; label: string; module: ModuleType; seats: number }) => void;
  removeTable: (id: string) => void;
  updateTable: (id: string, data: Partial<Table>) => void;
  openTable: (id: string, opts?: { customerName?: string; waiterId?: string; occupants?: number }) => void;
  closeTable: (id: string) => void;
  markCleaned: (id: string) => void;
  requestBill: (id: string) => void;
  reserveTable: (id: string, customerName: string) => void;
  // Comanda
  addComanda: (tableId: string, label?: string) => string;
  removeComanda: (tableId: string, comandaId: string) => void;
  closeComanda: (tableId: string, comandaId: string) => void;
  // Pedidos
  addOrder: (tableId: string, input: AddOrderInput) => void;
  removeOrder: (tableId: string, comandaId: string, orderId: string) => void;
  updateOrderQuantity: (tableId: string, comandaId: string, orderId: string, quantity: number) => void;
  markAllPrinted: (tableId: string, comandaId?: string) => void;
  // Transferências
  transferOrder: (fromTableId: string, fromComandaId: string, orderId: string, toTableId: string, toComandaId: string) => void;
  mergeTable: (sourceTableId: string, targetTableId: string) => void;
  // Pagamento
  registerPayment: (tableId: string, comandaId: string | "all", payment: Omit<Payment, "id" | "at">) => void;
  // Totais
  getTableTotals: (tableId: string) => TableTotals;
  getComandaTotal: (tableId: string, comandaId: string) => number;
  getTablesByModule: (module: ModuleType) => Table[];
  // Compat (Restaurant antigo)
  getOrdersFlat: (tableId: string) => TableOrder[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

const STORAGE_KEY = "pdv:tables:v2";

const reviveDates = (t: Table): Table => ({
  ...t,
  openedAt: t.openedAt ? new Date(t.openedAt) : undefined,
  comandas: (t.comandas || []).map((c) => ({
    ...c,
    openedAt: new Date(c.openedAt),
    closedAt: c.closedAt ? new Date(c.closedAt) : undefined,
    orders: c.orders.map((o) => ({ ...o, createdAt: new Date(o.createdAt) })),
    payments: (c.payments || []).map((p) => ({ ...p, at: new Date(p.at) })),
  })),
  history: (t.history || []).map((e) => ({ ...e, at: new Date(e.at) })),
});

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
      serviceFeeEnabled: false,
      serviceFeePct: 10,
      couvertPerPerson: 0,
      comandas: [],
      history: [],
    });
  }
  for (let i = 1; i <= 8; i++) {
    tables.push({
      id: `bar_${i}`,
      number: i,
      label: `Mesa ${i}`,
      status: "free",
      module: "bar",
      seats: i <= 3 ? 2 : 4,
      serviceFeeEnabled: true,
      serviceFeePct: 10,
      couvertPerPerson: 0,
      comandas: [],
      history: [],
    });
  }
  return tables;
};

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Table[];
        return parsed.map(reviveDates);
      }
    } catch {}
    return createDefaultTables();
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tables)); } catch {}
  }, [tables]);

  // Helpers
  const pushEvent = (t: Table, type: TableEventType, description: string, by?: string): Table => ({
    ...t,
    history: [...t.history, { id: newId("ev"), at: new Date(), type, description, by }].slice(-200),
  });

  const ensureFirstComanda = (t: Table, label?: string): { table: Table; comandaId: string } => {
    if (t.comandas.length > 0) return { table: t, comandaId: t.comandas[0].id };
    const c: Comanda = {
      id: newId("cmd"),
      number: 1,
      label,
      openedAt: new Date(),
      orders: [],
      payments: [],
    };
    return { table: { ...t, comandas: [c] }, comandaId: c.id };
  };

  // ============ Mesa ============
  const addTable: TableContextType["addTable"] = useCallback((data) => {
    const id = newId(data.module);
    setTables((prev) => [...prev, {
      id, number: data.number, label: data.label, module: data.module, seats: data.seats,
      status: "free",
      serviceFeeEnabled: data.module === "bar",
      serviceFeePct: 10,
      couvertPerPerson: 0,
      comandas: [],
      history: [],
    }]);
  }, []);

  const removeTable = useCallback((id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTable = useCallback((id: string, data: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const openTable: TableContextType["openTable"] = useCallback((id, opts) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const updated: Table = {
        ...t,
        status: "occupied",
        customerName: opts?.customerName ?? t.customerName,
        waiterId: opts?.waiterId ?? t.waiterId,
        occupants: opts?.occupants ?? t.occupants ?? t.seats,
        openedAt: t.openedAt || new Date(),
      };
      const withFirst = ensureFirstComanda(updated, opts?.customerName);
      return pushEvent(withFirst.table, "open", `Mesa aberta${opts?.customerName ? ` por ${opts.customerName}` : ""}`, opts?.waiterId);
    }));
  }, []);

  const closeTable = useCallback((id: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const cleaned: Table = {
        ...t,
        status: "dirty",
        comandas: t.comandas.map((c) => ({ ...c, closedAt: c.closedAt || new Date() })),
      };
      return pushEvent(cleaned, "close", `Mesa fechada`, t.waiterId);
    }));
  }, []);

  const markCleaned = useCallback((id: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const reset: Table = {
        ...t,
        status: "free",
        comandas: [],
        customerName: undefined,
        waiterId: undefined,
        occupants: undefined,
        openedAt: undefined,
      };
      return pushEvent(reset, "cleaned", `Mesa limpa e liberada`);
    }));
  }, []);

  const requestBill = useCallback((id: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      return pushEvent({ ...t, status: "awaiting_payment" }, "request_bill", "Cliente pediu a conta", t.waiterId);
    }));
  }, []);

  const reserveTable = useCallback((id: string, customerName: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      return pushEvent({ ...t, status: "reserved", customerName }, "reserve", `Reservada para ${customerName}`);
    }));
  }, []);

  // ============ Comanda ============
  const addComanda: TableContextType["addComanda"] = useCallback((tableId, label) => {
    let createdId = "";
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      const nextNumber = (t.comandas.reduce((m, c) => Math.max(m, c.number), 0)) + 1;
      const c: Comanda = {
        id: newId("cmd"), number: nextNumber, label, openedAt: new Date(), orders: [], payments: [],
      };
      createdId = c.id;
      return pushEvent({ ...t, comandas: [...t.comandas, c], status: t.status === "free" ? "occupied" : t.status }, "add_comanda", `Comanda #${nextNumber} aberta${label ? ` (${label})` : ""}`);
    }));
    return createdId;
  }, []);

  const removeComanda = useCallback((tableId: string, comandaId: string) => {
    setTables((prev) => prev.map((t) => t.id !== tableId ? t : { ...t, comandas: t.comandas.filter((c) => c.id !== comandaId) }));
  }, []);

  const closeComanda = useCallback((tableId: string, comandaId: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      const updated = { ...t, comandas: t.comandas.map((c) => c.id === comandaId ? { ...c, closedAt: new Date() } : c) };
      const cmd = t.comandas.find((c) => c.id === comandaId);
      return pushEvent(updated, "close_comanda", `Comanda #${cmd?.number ?? "?"} fechada`);
    }));
  }, []);

  // ============ Pedidos ============
  const addOrder: TableContextType["addOrder"] = useCallback((tableId, input) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      let working = t;
      let targetComandaId = input.comandaId;
      if (!targetComandaId) {
        const ensured = ensureFirstComanda(working, working.customerName);
        working = ensured.table;
        targetComandaId = ensured.comandaId;
      }
      const order: TableOrder = {
        id: newId("ord"),
        productId: input.product.id,
        product: input.product,
        quantity: input.quantity,
        unitPrice: input.unitPrice ?? input.product.price,
        notes: input.notes,
        modifiers: input.modifiers,
        destination: (input.product as any).printDestination || "bar",
        waiterId: input.waiterId ?? working.waiterId,
        createdAt: new Date(),
        printed: false,
      };
      const updated: Table = {
        ...working,
        status: working.status === "free" ? "occupied" : working.status,
        openedAt: working.openedAt || new Date(),
        comandas: working.comandas.map((c) => c.id === targetComandaId ? { ...c, orders: [...c.orders, order] } : c),
      };
      return pushEvent(updated, "add_order", `${input.quantity}x ${input.product.name} (Comanda #${updated.comandas.find(c=>c.id===targetComandaId)?.number})`, input.waiterId);
    }));
  }, []);

  const removeOrder = useCallback((tableId: string, comandaId: string, orderId: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, comandas: t.comandas.map((c) => c.id === comandaId ? { ...c, orders: c.orders.filter((o) => o.id !== orderId) } : c) };
    }));
  }, []);

  const updateOrderQuantity = useCallback((tableId: string, comandaId: string, orderId: string, quantity: number) => {
    if (quantity <= 0) { removeOrder(tableId, comandaId, orderId); return; }
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, comandas: t.comandas.map((c) => c.id === comandaId ? { ...c, orders: c.orders.map((o) => o.id === orderId ? { ...o, quantity } : o) } : c) };
    }));
  }, [removeOrder]);

  const markAllPrinted = useCallback((tableId: string, comandaId?: string) => {
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, comandas: t.comandas.map((c) => (!comandaId || c.id === comandaId) ? { ...c, orders: c.orders.map((o) => ({ ...o, printed: true })) } : c) };
    }));
  }, []);

  // ============ Transferências ============
  const transferOrder: TableContextType["transferOrder"] = useCallback((fromTableId, fromComandaId, orderId, toTableId, toComandaId) => {
    setTables((prev) => {
      const fromTable = prev.find((t) => t.id === fromTableId);
      const fromComanda = fromTable?.comandas.find((c) => c.id === fromComandaId);
      const order = fromComanda?.orders.find((o) => o.id === orderId);
      if (!order) return prev;
      return prev.map((t) => {
        if (t.id === fromTableId) {
          const updated = { ...t, comandas: t.comandas.map((c) => c.id === fromComandaId ? { ...c, orders: c.orders.filter((o) => o.id !== orderId) } : c) };
          return pushEvent(updated, "transfer_order", `${order.quantity}x ${order.product.name} → ${toTableId === fromTableId ? "outra comanda" : "outra mesa"}`);
        }
        if (t.id === toTableId) {
          let working = t;
          let targetCmdId = toComandaId;
          if (!working.comandas.find((c) => c.id === targetCmdId)) {
            const ensured = ensureFirstComanda(working);
            working = ensured.table;
            targetCmdId = ensured.comandaId;
          }
          return { ...working, status: working.status === "free" ? "occupied" : working.status, comandas: working.comandas.map((c) => c.id === targetCmdId ? { ...c, orders: [...c.orders, { ...order, id: newId("ord") }] } : c) };
        }
        return t;
      });
    });
  }, []);

  const mergeTable: TableContextType["mergeTable"] = useCallback((sourceTableId, targetTableId) => {
    setTables((prev) => {
      const source = prev.find((t) => t.id === sourceTableId);
      if (!source) return prev;
      const sourceComandasRenum = source.comandas;
      return prev
        .map((t) => {
          if (t.id === targetTableId) {
            const baseNum = t.comandas.reduce((m, c) => Math.max(m, c.number), 0);
            const merged = sourceComandasRenum.map((c, i) => ({ ...c, number: baseNum + i + 1 }));
            return pushEvent({ ...t, status: "occupied", comandas: [...t.comandas, ...merged] }, "merge_table", `Comandas mescladas de ${source.label}`);
          }
          if (t.id === sourceTableId) {
            return { ...t, status: "free" as TableStatus, comandas: [], customerName: undefined, openedAt: undefined };
          }
          return t;
        });
    });
  }, []);

  // ============ Pagamento ============
  const registerPayment: TableContextType["registerPayment"] = useCallback((tableId, comandaId, payment) => {
    const p: Payment = { ...payment, id: newId("pay"), at: new Date() };
    setTables((prev) => prev.map((t) => {
      if (t.id !== tableId) return t;
      const updated: Table = {
        ...t,
        comandas: t.comandas.map((c) => {
          if (comandaId !== "all" && c.id !== comandaId) return c;
          return { ...c, payments: [...c.payments, p] };
        }),
      };
      return pushEvent(updated, "payment", `Pagamento ${payment.method} de R$ ${payment.amount.toFixed(2)}`);
    }));
  }, []);

  // ============ Totais ============
  const getComandaTotal = useCallback((tableId: string, comandaId: string) => {
    const t = tables.find((x) => x.id === tableId);
    const c = t?.comandas.find((x) => x.id === comandaId);
    if (!c) return 0;
    return c.orders.reduce((s, o) => s + o.unitPrice * o.quantity, 0);
  }, [tables]);

  const getTableTotals: TableContextType["getTableTotals"] = useCallback((tableId) => {
    const t = tables.find((x) => x.id === tableId);
    if (!t) return { subtotal: 0, serviceFee: 0, couvert: 0, paid: 0, total: 0, remaining: 0 };
    const subtotal = t.comandas.reduce((s, c) => s + c.orders.reduce((ss, o) => ss + o.unitPrice * o.quantity, 0), 0);
    const couvert = (t.couvertPerPerson || 0) * (t.occupants || 0);
    const serviceFee = t.serviceFeeEnabled ? subtotal * (t.serviceFeePct / 100) : 0;
    const paid = t.comandas.reduce((s, c) => s + c.payments.reduce((sp, p) => sp + p.amount, 0), 0);
    const total = subtotal + serviceFee + couvert;
    return { subtotal, serviceFee, couvert, paid, total, remaining: Math.max(0, total - paid) };
  }, [tables]);

  const getTablesByModule = useCallback((module: ModuleType) => tables.filter((t) => t.module === module), [tables]);

  const getOrdersFlat = useCallback((tableId: string) => {
    const t = tables.find((x) => x.id === tableId);
    return t ? t.comandas.flatMap((c) => c.orders) : [];
  }, [tables]);

  return (
    <TableContext.Provider value={{
      tables,
      addTable, removeTable, updateTable,
      openTable, closeTable, markCleaned, requestBill, reserveTable,
      addComanda, removeComanda, closeComanda,
      addOrder, removeOrder, updateOrderQuantity, markAllPrinted,
      transferOrder, mergeTable,
      registerPayment,
      getTableTotals, getComandaTotal, getTablesByModule, getOrdersFlat,
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTables = () => {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("useTables must be used within TableProvider");
  return ctx;
};

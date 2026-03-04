import { useState, createContext, useContext, useCallback, type ReactNode } from "react";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  limite_credito: number;
  valor_em_aberto: number;
}

export interface CreditSale {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "pendente" | "pago" | "atrasado";
  paymentMethod?: string;
  paidAt?: string;
  // Admin override info
  adminOverride?: {
    adminId: string;
    date: string;
    amountOverLimit: number;
    reason: string;
  };
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  date: string;
  details: string;
}

interface CustomerContextType {
  customers: Customer[];
  creditSales: CreditSale[];
  adminLogs: AdminLog[];
  addCustomer: (customer: Omit<Customer, "id" | "valor_em_aberto">) => Customer;
  getCustomer: (id: string) => Customer | undefined;
  getCreditoDisponivel: (customerId: string) => number;
  addCreditSale: (sale: Omit<CreditSale, "id" | "date" | "dueDate" | "status">) => CreditSale;
  receiveSalePayment: (saleId: string, paymentMethod: string) => void;
  updateCustomerLimit: (customerId: string, newLimit: number, adminId: string) => void;
  logAdminAction: (adminId: string, action: string, details: string) => void;
  checkCreditAvailable: (customerId: string, amount: number) => { available: boolean; limite: number; emAberto: number; disponivel: number };
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Maria Silva", phone: "(11) 99999-1234", limite_credito: 500, valor_em_aberto: 87.50 },
  { id: "c2", name: "João Santos", phone: "(11) 98888-5678", limite_credito: 300, valor_em_aberto: 156.30 },
  { id: "c3", name: "Ana Oliveira", phone: "(11) 97777-9012", limite_credito: 200, valor_em_aberto: 0 },
  { id: "c4", name: "Carlos Ferreira", phone: "(11) 96666-3456", limite_credito: 150, valor_em_aberto: 32.90 },
];

const INITIAL_CREDIT_SALES: CreditSale[] = [
  { id: "cs1", customerId: "c1", customerName: "Maria Silva", date: "2026-02-28", dueDate: "2026-03-30", amount: 45.00, status: "pendente" },
  { id: "cs2", customerId: "c1", customerName: "Maria Silva", date: "2026-02-25", dueDate: "2026-03-27", amount: 42.50, status: "pendente" },
  { id: "cs3", customerId: "c2", customerName: "João Santos", date: "2026-03-03", dueDate: "2026-04-02", amount: 89.80, status: "pendente" },
  { id: "cs4", customerId: "c2", customerName: "João Santos", date: "2026-02-27", dueDate: "2026-03-29", amount: 66.50, status: "atrasado" },
  { id: "cs5", customerId: "c4", customerName: "Carlos Ferreira", date: "2026-03-04", dueDate: "2026-04-03", amount: 32.90, status: "pendente" },
];

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [creditSales, setCreditSales] = useState<CreditSale[]>(INITIAL_CREDIT_SALES);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  const addCustomer = useCallback((data: Omit<Customer, "id" | "valor_em_aberto">) => {
    const newCustomer: Customer = {
      ...data,
      id: `c${Date.now()}`,
      valor_em_aberto: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  }, []);

  const getCustomer = useCallback((id: string) => {
    return customers.find((c) => c.id === id);
  }, [customers]);

  const getCreditoDisponivel = useCallback((customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return 0;
    return customer.limite_credito - customer.valor_em_aberto;
  }, [customers]);

  const checkCreditAvailable = useCallback((customerId: string, amount: number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { available: false, limite: 0, emAberto: 0, disponivel: 0 };
    const disponivel = customer.limite_credito - customer.valor_em_aberto;
    return {
      available: amount <= disponivel,
      limite: customer.limite_credito,
      emAberto: customer.valor_em_aberto,
      disponivel,
    };
  }, [customers]);

  const addCreditSale = useCallback((data: Omit<CreditSale, "id" | "date" | "dueDate" | "status">) => {
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 30);

    const sale: CreditSale = {
      ...data,
      id: `cs${Date.now()}`,
      date: now.toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
      status: "pendente",
    };

    setCreditSales((prev) => [...prev, sale]);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === data.customerId
          ? { ...c, valor_em_aberto: c.valor_em_aberto + data.amount }
          : c
      )
    );
    return sale;
  }, []);

  const receiveSalePayment = useCallback((saleId: string, paymentMethod: string) => {
    setCreditSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? { ...s, status: "pago" as const, paymentMethod, paidAt: new Date().toISOString() }
          : s
      )
    );
    const sale = creditSales.find((s) => s.id === saleId);
    if (sale) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === sale.customerId
            ? { ...c, valor_em_aberto: Math.max(0, c.valor_em_aberto - sale.amount) }
            : c
        )
      );
    }
  }, [creditSales]);

  const updateCustomerLimit = useCallback((customerId: string, newLimit: number, adminId: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, limite_credito: newLimit } : c))
    );
    logAdminAction(adminId, "Alteração de limite", `Limite alterado para R$ ${newLimit.toFixed(2)} - Cliente: ${customerId}`);
  }, []);

  const logAdminAction = useCallback((adminId: string, action: string, details: string) => {
    setAdminLogs((prev) => [
      ...prev,
      { id: `log${Date.now()}`, adminId, action, date: new Date().toISOString(), details },
    ]);
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customers, creditSales, adminLogs,
        addCustomer, getCustomer, getCreditoDisponivel,
        addCreditSale, receiveSalePayment, updateCustomerLimit,
        logAdminAction, checkCreditAvailable,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomers must be used within CustomerProvider");
  return context;
};

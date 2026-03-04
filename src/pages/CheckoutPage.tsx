import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, QrCode, Banknote, Wallet, Check, UserCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { useCustomers, type Customer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import CustomerSelectModal from "@/components/pdv/CustomerSelectModal";
import AdminAuthModal from "@/components/pdv/AdminAuthModal";

const PAYMENT_METHODS = [
  { id: "dinheiro", label: "Dinheiro", icon: Banknote, description: "Pagamento em espécie" },
  { id: "pix", label: "Pix", icon: QrCode, description: "Pagamento instantâneo" },
  { id: "credito", label: "Crédito", icon: CreditCard, description: "Cartão de crédito" },
  { id: "debito", label: "Débito", icon: CreditCard, description: "Cartão de débito" },
  { id: "a_prazo", label: "A Prazo", icon: Wallet, description: "Conta do cliente" },
];

const CheckoutPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminOverrideGranted, setAdminOverrideGranted] = useState(false);
  const { totalPrice, totalItems, items, clearCart } = useCart();
  const { checkCreditAvailable, addCreditSale, logAdminAction } = useCustomers();
  const navigate = useNavigate();

  const isAPrazo = selectedMethod === "a_prazo";
  const creditCheck = selectedCustomer ? checkCreditAvailable(selectedCustomer.id, totalPrice) : null;
  const creditExceeded = isAPrazo && creditCheck && !creditCheck.available;
  const nearLimit = isAPrazo && creditCheck && creditCheck.available && creditCheck.limite > 0 && (creditCheck.emAberto / creditCheck.limite) >= 0.8;

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId === "a_prazo" && !selectedCustomer) {
      setShowCustomerModal(true);
    }
    if (methodId !== "a_prazo") {
      setSelectedCustomer(null);
      setAdminOverrideGranted(false);
    }
  };

  const handleCustomerSelected = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setAdminOverrideGranted(false);
  };

  const handleAdminAuth = (adminId: string) => {
    setAdminOverrideGranted(true);
    setShowAdminAuth(false);
    logAdminAction(adminId, "Liberação de venda acima do limite", `Cliente: ${selectedCustomer?.name}, Valor: ${fmt(totalPrice)}, Limite disponível: ${fmt(creditCheck?.disponivel || 0)}`);
  };

  const canFinalize = () => {
    if (!selectedMethod) return false;
    if (isAPrazo) {
      if (!selectedCustomer) return false;
      if (creditExceeded && !adminOverrideGranted) return false;
    }
    return true;
  };

  const handleFinalize = () => {
    if (!canFinalize()) return;
    setProcessing(true);

    if (isAPrazo && selectedCustomer) {
      addCreditSale({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        amount: totalPrice,
        ...(adminOverrideGranted ? {
          adminOverride: {
            adminId: "admin-001",
            date: new Date().toISOString(),
            amountOverLimit: totalPrice - (creditCheck?.disponivel || 0),
            reason: "Liberação manual pelo administrador",
          }
        } : {}),
      });
    }

    setTimeout(() => {
      navigate("/receipt", { state: { paymentMethod: selectedMethod, customerName: selectedCustomer?.name } });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32">
      <header className="bg-card shadow-soft px-4 pt-6 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/cart")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">Pagamento</h1>
            <p className="text-xs text-muted-foreground font-body">Selecione a forma de pagamento</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-soft mb-6">
          <p className="text-sm text-muted-foreground font-body mb-1">Resumo do pedido</p>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground font-display">{fmt(totalPrice)}</span>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{totalItems} {totalItems === 1 ? "item" : "itens"}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <p className="text-sm font-medium text-foreground font-body mb-3">Forma de pagamento</p>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            const isAPrazoMethod = method.id === "a_prazo";

            return (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method.id)}
                disabled={processing}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                  isSelected
                    ? isAPrazoMethod
                      ? "border-warning bg-warning/5 shadow-soft"
                      : "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? (isAPrazoMethod ? "bg-warning" : "bg-primary") : "bg-secondary"
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? "text-primary-foreground" : "text-foreground"}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground font-body">{method.label}</p>
                  <p className="text-xs text-muted-foreground font-body">{method.description}</p>
                </div>
                {isSelected && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center animate-pin-pop ${isAPrazoMethod ? "bg-warning" : "bg-primary"}`}>
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* A Prazo: Customer Info */}
        {isAPrazo && (
          <div className="mt-5 space-y-3">
            {selectedCustomer ? (
              <>
                <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground font-body">{selectedCustomer.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{selectedCustomer.phone}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setShowCustomerModal(true)}>
                      Trocar
                    </Button>
                  </div>

                  {/* Credit Info */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground font-body">Limite</p>
                      <p className="text-sm font-bold text-foreground font-body">{fmt(creditCheck?.limite || 0)}</p>
                    </div>
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground font-body">Em Aberto</p>
                      <p className="text-sm font-bold text-destructive font-body">{fmt(creditCheck?.emAberto || 0)}</p>
                    </div>
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground font-body">Disponível</p>
                      <p className={`text-sm font-bold font-body ${creditExceeded ? "text-destructive" : nearLimit ? "text-warning" : "text-success"}`}>
                        {fmt(creditCheck?.disponivel || 0)}
                      </p>
                    </div>
                  </div>

                  {nearLimit && !creditExceeded && (
                    <div className="mt-3 flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                      <p className="text-xs text-warning font-body">Cliente próximo do limite de crédito (acima de 80%).</p>
                    </div>
                  )}
                </div>

                {/* Credit Exceeded Alert */}
                {creditExceeded && !adminOverrideGranted && (
                  <div className="bg-destructive/5 border-2 border-destructive/30 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-destructive font-body">Limite de crédito excedido</p>
                        <p className="text-xs text-muted-foreground font-body mt-1">
                          Limite disponível: <strong>{fmt(creditCheck?.disponivel || 0)}</strong><br />
                          Valor em aberto: <strong>{fmt(creditCheck?.emAberto || 0)}</strong><br />
                          Valor da venda: <strong>{fmt(totalPrice)}</strong>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                      onClick={() => setShowAdminAuth(true)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Solicitar Liberação do Administrador
                    </Button>
                  </div>
                )}

                {/* Admin Override Granted */}
                {adminOverrideGranted && (
                  <div className="bg-success/5 border-2 border-success/30 rounded-2xl p-4 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-success flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-success font-body">Venda liberada pelo administrador</p>
                      <p className="text-xs text-muted-foreground font-body">Autorização registrada no sistema.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button variant="outline" className="w-full rounded-2xl gap-2 h-14" onClick={() => setShowCustomerModal(true)}>
                <UserCircle className="w-5 h-5" />
                Selecionar Cliente
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Finalize Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-elevated z-40 safe-bottom" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <Button
          size="xl"
          className={`w-full rounded-2xl ${isAPrazo ? "bg-warning hover:bg-warning/90 text-foreground" : ""}`}
          disabled={!canFinalize() || processing}
          onClick={handleFinalize}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processando...
            </span>
          ) : isAPrazo ? (
            `Finalizar A Prazo — ${fmt(totalPrice)}`
          ) : (
            `Finalizar — ${fmt(totalPrice)}`
          )}
        </Button>
      </div>

      {showCustomerModal && (
        <CustomerSelectModal
          saleAmount={totalPrice}
          onSelect={handleCustomerSelected}
          onClose={() => {
            setShowCustomerModal(false);
            if (!selectedCustomer) setSelectedMethod(null);
          }}
        />
      )}

      {showAdminAuth && (
        <AdminAuthModal
          onAuth={handleAdminAuth}
          onClose={() => setShowAdminAuth(false)}
          title="Liberação de Crédito"
          description="PIN do administrador para liberar venda acima do limite."
        />
      )}
    </div>
  );
};

export default CheckoutPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, QrCode, Banknote, Wallet, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

const PAYMENT_METHODS = [
  { id: "pix", label: "Pix", icon: QrCode, description: "Pagamento instantâneo" },
  { id: "credito", label: "Crédito", icon: CreditCard, description: "Cartão de crédito" },
  { id: "debito", label: "Débito", icon: CreditCard, description: "Cartão de débito" },
  { id: "dinheiro", label: "Dinheiro", icon: Banknote, description: "Pagamento em espécie" },
  { id: "fiado", label: "Fiado", icon: Wallet, description: "Conta do cliente" },
];

const CheckoutPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const handleFinalize = () => {
    if (!selectedMethod) return;
    setProcessing(true);
    setTimeout(() => {
      navigate("/receipt");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32">
      {/* Header */}
      <header className="bg-card shadow-soft px-4 pt-6 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">
              Pagamento
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              Selecione a forma de pagamento
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6">
        {/* Order Summary Card */}
        <div className="bg-card rounded-2xl p-5 shadow-soft mb-6">
          <p className="text-sm text-muted-foreground font-body mb-1">Resumo do pedido</p>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground font-display">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <p className="text-sm font-medium text-foreground font-body mb-3">
          Forma de pagamento
        </p>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={processing}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    }`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground font-body">
                    {method.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {method.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-pin-pop">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Finalize Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-6 shadow-elevated z-40">
        <Button
          size="xl"
          className="w-full rounded-2xl"
          disabled={!selectedMethod || processing}
          onClick={handleFinalize}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processando...
            </span>
          ) : (
            `Finalizar — R$ ${totalPrice.toFixed(2).replace(".", ",")}`
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;

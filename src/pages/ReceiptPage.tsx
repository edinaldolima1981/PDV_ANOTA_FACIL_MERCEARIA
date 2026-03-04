import { useNavigate } from "react-router-dom";
import { Check, Printer, MessageCircle, ArrowLeft, Leaf } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

const ReceiptPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const orderNumber = String(Math.floor(Math.random() * 9000) + 1000);

  const handleNewSale = () => {
    clearCart();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4 animate-pin-pop">
        <Check className="w-10 h-10 text-success" strokeWidth={3} />
      </div>
      <h1 className="font-display text-xl font-bold text-foreground mb-1">
        Venda realizada!
      </h1>
      <p className="text-sm text-muted-foreground font-body mb-6">
        Pedido #{orderNumber}
      </p>

      {/* Receipt Card */}
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-medium overflow-hidden mb-6">
        {/* Receipt header */}
        <div className="bg-primary px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-primary-foreground">
              Empório Orgânico
            </p>
            <p className="text-xs text-primary-foreground/70 font-body">
              {dateStr} às {timeStr}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-4 space-y-3">
          {items.map(({ product, quantity }) => {
            const unitLabel = product.unit === "kg" ? "kg" : product.unit === "L" ? "L" : "un";
            return (
              <div key={product.id} className="flex justify-between text-sm font-body">
                <span className="text-foreground">
                  {product.name}{" "}
                  <span className="text-muted-foreground">
                    x{product.unit === "kg" ? quantity.toFixed(1) : quantity} {unitLabel}
                  </span>
                </span>
                <span className="font-semibold text-foreground">
                  R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-dashed border-border" />

        {/* Total */}
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-body">Total</span>
          <span className="text-xl font-bold text-primary font-display">
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {/* QR Code placeholder */}
        <div className="px-5 pb-5 flex flex-col items-center">
          <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center mb-2">
            <span className="text-3xl">📱</span>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Escaneie para nota fiscal
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>

        <Button
          size="xl"
          className="w-full rounded-2xl"
          onClick={handleNewSale}
        >
          Nova venda
        </Button>
      </div>
    </div>
  );
};

export default ReceiptPage;

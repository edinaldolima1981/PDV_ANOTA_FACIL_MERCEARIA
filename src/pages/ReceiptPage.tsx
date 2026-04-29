import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Printer, MessageCircle, ArrowLeft, Leaf, Copy } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { useStore, PIX_TYPE_LABELS } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const ReceiptPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { storeName, pixKey, pixKeyType, pixKeyFormatted, storeBanner } = useStore();
  const { getUnitShort, sellsByWeight } = useProducts();
  const fmtQty = (product: any, qty: number) =>
    sellsByWeight(product) ? qty.toFixed(3).replace(".", ",") : String(qty);
  const navigate = useNavigate();
  const location = useLocation();
  const paymentMethod = (location.state as any)?.paymentMethod || "";

  const now = useMemo(() => new Date(), []);
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const orderNumber = useMemo(() => String(Math.floor(Math.random() * 9000) + 1000), []);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const handlePrint = () => {
    try {
      const printWindow = window.open("", "_blank", "width=320,height=600");
      if (!printWindow) return;
      const itemsHtml = items.map(({ product, quantity }) => {
        const unitLabel = getUnitShort(product.unit);
        const qty = fmtQty(product, quantity);
        return `<div class="row"><span>${product.name} x${qty} ${unitLabel}</span><span>${fmt(product.price * quantity)}</span></div>`;
      }).join("");
      printWindow.document.write(`
        <html><head><title>Comprovante</title>
        <style>body{font-family:monospace;font-size:12px;padding:10px;max-width:280px;margin:0 auto}
        .center{text-align:center}.line{border-top:1px dashed #000;margin:8px 0}
        .bold{font-weight:bold}.row{display:flex;justify-content:space-between;margin:2px 0}</style></head>
        <body>
          ${storeBanner ? `<div class="center"><img src="${storeBanner}" style="max-height:60px;max-width:240px;margin-bottom:4px" /></div>` : ''}
          <div class="center bold" style="font-size:14px;margin-bottom:2px">${storeName}</div>
          <div class="center bold">COMPROVANTE DE PAGAMENTO</div>
          <div class="center">Pedido #${orderNumber}</div>
          <div class="center">${dateStr} às ${timeStr}</div>
          <div class="line"></div>
          ${itemsHtml}
          <div class="line"></div>
          <div class="row"><span class="bold">TOTAL:</span><span class="bold">${fmt(totalPrice)}</span></div>
          <div class="line"></div>
          ${pixKey ? `<div class="center bold" style="margin-top:8px">CHAVE PIX (${PIX_TYPE_LABELS[pixKeyType]})</div>
          <div class="center">${pixKeyFormatted}</div>` : ''}

          <div class="line"></div>
          <div class="center" style="margin-top:10px">Obrigado pela preferência!</div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao imprimir:", error);
    }
  };

  const handleWhatsApp = () => {
    try {
      const itemsList = items.map(({ product, quantity }) => {
        const unitLabel = getUnitShort(product.unit);
        const qty = fmtQty(product, quantity);
        return `• ${product.name} x${qty} ${unitLabel} - ${fmt(product.price * quantity)}`;
      }).join("\n");
      const msg = encodeURIComponent(
        `*COMPROVANTE DE PAGAMENTO*\n` +
        `Pedido #${orderNumber}\n` +
        `${dateStr} às ${timeStr}\n\n` +
        `${itemsList}\n\n` +
        `*TOTAL: ${fmt(totalPrice)}*\n\n` +
        (pixKey ? `💳 *Chave Pix (${PIX_TYPE_LABELS[pixKeyType]}):* ${pixKeyFormatted}\n\n` : '') +
        `Obrigado pela preferência! 🙏`
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
    }
  };

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
          {storeBanner ? (
            <img src={storeBanner} alt={storeName} className="h-10 max-w-[80px] w-auto object-contain rounded bg-primary-foreground/10 p-0.5" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <div>
            <p className="font-display text-sm font-bold text-primary-foreground">
              {storeName}
            </p>
            <p className="text-xs text-primary-foreground/70 font-body">
              {dateStr} às {timeStr}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-4 space-y-3">
          {items.map(({ product, quantity }) => {
            const unitLabel = getUnitShort(product.unit);
            return (
              <div key={product.id} className="flex justify-between text-sm font-body">
                <span className="text-foreground">
                  {product.name}{" "}
                  <span className="text-muted-foreground">
                    x{fmtQty(product, quantity)} {unitLabel}
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

        {/* QR Code Pix */}
        {pixKey && (
          <div className="px-5 pb-5 flex flex-col items-center">
            <QRCodeSVG
              value={`00020126330014BR.GOV.BCB.PIX0111${pixKey.replace(/[\s.\-/()]/g, "")}5204000053039865404${totalPrice.toFixed(2)}5802BR5913${storeName.slice(0, 25)}6009SAO PAULO62070503***6304`}
              size={120}
              level="M"
              className="mb-3"
            />
            <p className="text-xs font-semibold text-foreground font-body mb-1">Pague via Pix</p>
            <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
              <p className="text-xs text-muted-foreground font-body font-mono">
                {pixKeyFormatted}
              </p>
              <button
                onClick={() => { navigator.clipboard.writeText(pixKey); toast.success("Chave Pix copiada!"); }}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground font-body mt-1">{PIX_TYPE_LABELS[pixKeyType]}: Chave Pix</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl gap-2"
            onClick={handleWhatsApp}
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

import { useState, useMemo, useEffect } from "react";
import { X, Delete, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { useProducts } from "@/contexts/ProductContext";

interface WeightModalProps {
  product: Product;
  /** Peso/quantidade inicial (modo edição). Se omitido, começa vazio. */
  initialWeight?: number;
  /** Texto do botão de confirmação. */
  confirmLabel?: string;
  onConfirm: (weight: number) => void;
  onClose: () => void;
}

const MAX_WEIGHT = 50; // limite de segurança (kg ou L)

const WeightModal = ({ product, initialWeight, confirmLabel, onConfirm, onClose }: WeightModalProps) => {
  const { getUnitShort } = useProducts();
  const productUnit = getUnitShort(product.unit);

  // Define se o input é em "g/mL" (sub-unidade) ou na unidade base do produto.
  // Para produtos cadastrados em kg ou L, oferecemos toggle entre g/mL e kg/L.
  const baseIsKg = product.unit === "kg";
  const baseIsL = product.unit === "L";
  const supportsToggle = baseIsKg || baseIsL;
  const subUnitShort = baseIsKg ? "g" : baseIsL ? "mL" : productUnit;

  // Modo de digitação: "base" (kg/L/un cadastrada) ou "sub" (g/mL)
  const [mode, setMode] = useState<"base" | "sub">(supportsToggle ? "sub" : "base");

  // Texto cru digitado (string para suportar vírgula e estado vazio)
  const [raw, setRaw] = useState<string>(() => {
    if (initialWeight === undefined) return "";
    if (supportsToggle) {
      // exibir em g/mL por padrão
      return String(Math.round(initialWeight * 1000)).replace(".", ",");
    }
    return String(initialWeight).replace(".", ",");
  });

  // Tara opcional (sempre na mesma unidade exibida)
  const [tara, setTara] = useState<string>("");

  useEffect(() => {
    // Foca no documento para capturar tecla física
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, tara, mode]);

  const parse = (s: string) => {
    if (!s) return 0;
    const n = parseFloat(s.replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  // Converte o valor digitado para a unidade base do produto
  const valueInBaseUnit = useMemo(() => {
    const gross = parse(raw);
    const tareVal = parse(tara);
    const liquid = Math.max(0, gross - tareVal);
    if (mode === "sub" && supportsToggle) {
      return liquid / 1000; // g→kg, mL→L
    }
    return liquid;
  }, [raw, tara, mode, supportsToggle]);

  const total = product.price * valueInBaseUnit;
  const fmtBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const currentUnitLabel = mode === "sub" && supportsToggle ? subUnitShort : productUnit;

  const append = (ch: string) => {
    setRaw((prev) => {
      if (ch === ",") {
        if (prev.includes(",")) return prev;
        if (prev === "") return "0,";
      }
      // limite de tamanho razoável
      if (prev.length >= 8) return prev;
      return prev + ch;
    });
  };

  const backspace = () => setRaw((prev) => prev.slice(0, -1));
  const clear = () => setRaw("");

  // Atalhos: gerados conforme unidade
  const presets = useMemo(() => {
    if (mode === "sub" && baseIsKg) return [
      { label: "100 g", value: "100" },
      { label: "250 g", value: "250" },
      { label: "500 g", value: "500" },
      { label: "750 g", value: "750" },
      { label: "1 kg", value: "1000" },
      { label: "2 kg", value: "2000" },
    ];
    if (mode === "sub" && baseIsL) return [
      { label: "100 mL", value: "100" },
      { label: "250 mL", value: "250" },
      { label: "500 mL", value: "500" },
      { label: "1 L", value: "1000" },
      { label: "1,5 L", value: "1500" },
      { label: "2 L", value: "2000" },
    ];
    if (baseIsKg) return [
      { label: "0,5 kg", value: "0,5" },
      { label: "1 kg", value: "1" },
      { label: "1,5 kg", value: "1,5" },
      { label: "2 kg", value: "2" },
    ];
    if (baseIsL) return [
      { label: "0,5 L", value: "0,5" },
      { label: "1 L", value: "1" },
      { label: "2 L", value: "2" },
    ];
    return [
      { label: `0,5 ${productUnit}`, value: "0,5" },
      { label: `1 ${productUnit}`, value: "1" },
      { label: `2 ${productUnit}`, value: "2" },
    ];
  }, [mode, baseIsKg, baseIsL, productUnit]);

  const handleConfirm = () => {
    if (valueInBaseUnit <= 0) return;
    if (valueInBaseUnit > MAX_WEIGHT) return;
    onConfirm(Math.round(valueInBaseUnit * 1000) / 1000); // 3 casas
  };

  const toggleMode = () => {
    if (!supportsToggle) return;
    // Converte o valor atualmente digitado para a outra unidade
    const cur = parse(raw);
    if (mode === "sub") {
      // de g/mL para kg/L
      const conv = cur / 1000;
      setRaw(conv ? String(conv).replace(".", ",") : "");
      setMode("base");
    } else {
      const conv = cur * 1000;
      setRaw(conv ? String(Math.round(conv)) : "");
      setMode("sub");
    }
    setTara("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-2xl p-5 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-foreground truncate">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground font-body">
                {fmtBRL(product.price)} / {productUnit}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Toggle unidade */}
        {supportsToggle && (
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl mb-3 text-xs font-body">
            <button
              onClick={() => mode !== "sub" && toggleMode()}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                mode === "sub" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              Em {subUnitShort}
            </button>
            <button
              onClick={() => mode !== "base" && toggleMode()}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                mode === "base" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              Em {productUnit}
            </button>
          </div>
        )}

        {/* Display do peso */}
        <div className="bg-background border-2 border-border rounded-xl px-4 py-4 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={raw}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9,]/g, "");
                // só uma vírgula
                const parts = v.split(",");
                const cleaned = parts.length > 1 ? parts[0] + "," + parts.slice(1).join("") : v;
                setRaw(cleaned);
              }}
              placeholder="0"
              className="flex-1 bg-transparent text-3xl font-bold text-foreground font-body outline-none placeholder:text-muted-foreground/40 min-w-0"
              autoFocus
            />
            <span className="text-base font-semibold text-muted-foreground font-body flex-shrink-0">
              {currentUnitLabel}
            </span>
          </div>
          {parse(tara) > 0 && (
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              Bruto - tara ({tara} {currentUnitLabel}) = líquido
            </p>
          )}
        </div>

        {/* Atalhos */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setRaw(p.value)}
              className="py-2 rounded-lg bg-secondary hover:bg-muted text-xs font-semibold text-foreground font-body transition-colors active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Teclado numérico */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <button
              key={n}
              onClick={() => append(n)}
              className="h-11 rounded-lg bg-secondary hover:bg-muted text-lg font-bold text-foreground font-body transition-colors active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => append(",")}
            className="h-11 rounded-lg bg-secondary hover:bg-muted text-lg font-bold text-foreground font-body transition-colors active:scale-95"
          >
            ,
          </button>
          <button
            onClick={() => append("0")}
            className="h-11 rounded-lg bg-secondary hover:bg-muted text-lg font-bold text-foreground font-body transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={backspace}
            onDoubleClick={clear}
            className="h-11 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center text-foreground transition-colors active:scale-95"
            title="Apagar (duplo clique limpa)"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Tara */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-muted-foreground font-body">Tara:</label>
          <input
            type="text"
            inputMode="decimal"
            value={tara}
            onChange={(e) => setTara(e.target.value.replace(/[^0-9,]/g, ""))}
            placeholder="0"
            className="w-20 h-8 px-2 rounded-md bg-background border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-muted-foreground font-body">{currentUnitLabel}</span>
          {tara && (
            <button
              onClick={() => setTara("")}
              className="text-xs text-primary hover:underline font-body ml-auto"
            >
              limpar
            </button>
          )}
        </div>

        {/* Total */}
        <div className="bg-primary/10 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-body">Total a pagar</p>
            <p className="text-[10px] text-muted-foreground font-body">
              {valueInBaseUnit.toFixed(3).replace(".", ",")} {productUnit} × {fmtBRL(product.price)}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary font-display">
            {fmtBRL(total)}
          </span>
        </div>

        {/* Confirmar */}
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="lg"
            className="flex-[1.5] rounded-xl"
            disabled={valueInBaseUnit <= 0 || valueInBaseUnit > MAX_WEIGHT}
            onClick={handleConfirm}
          >
            {confirmLabel || "Adicionar"}
          </Button>
        </div>
        {valueInBaseUnit > MAX_WEIGHT && (
          <p className="text-xs text-destructive font-body text-center mt-2">
            Peso máximo permitido: {MAX_WEIGHT} {productUnit}
          </p>
        )}
      </div>
    </div>
  );
};

export default WeightModal;

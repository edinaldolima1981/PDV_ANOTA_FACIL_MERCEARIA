import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAuthModalProps {
  onAuth: (adminId: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

const AdminAuthModal = ({ onAuth, onClose, title = "Autenticação Admin", description = "Insira as credenciais de administrador para continuar." }: AdminAuthModalProps) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // PIN admin = 1234
    if (pin === "1234") {
      onAuth("admin-001");
    } else {
      setError("PIN inválido. Apenas administradores podem realizar esta ação.");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-elevated mx-4 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground font-body">{description}</p>
        </div>

        <div className="px-6 pb-2">
          <label className="text-xs font-medium text-muted-foreground font-body">PIN Administrador</label>
          <div className="relative mt-1">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(""); }}
              placeholder="••••"
              maxLength={4}
              className="w-full h-12 px-4 pr-12 rounded-xl bg-background border border-border text-center text-xl tracking-[0.5em] font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && handleSubmit()}
            />
            <button onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive font-body mt-2">{error}</p>}
        </div>

        <div className="px-6 py-5 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 rounded-xl" onClick={handleSubmit} disabled={pin.length < 4}>Autorizar</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthModal;

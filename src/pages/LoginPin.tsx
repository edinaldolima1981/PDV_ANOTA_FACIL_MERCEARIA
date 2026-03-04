import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, Delete, ShieldCheck, User } from "lucide-react";

const ADMIN_PIN = "1234";
const EMPLOYEE_PIN = "0000";

type UserRole = "admin" | "employee" | null;

const LoginPin = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState<UserRole>(null);
  const navigate = useNavigate();

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    setError(false);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === ADMIN_PIN) {
        setSuccess("admin");
        setTimeout(() => navigate("/home"), 800);
      } else if (newPin === EMPLOYEE_PIN) {
        setSuccess("employee");
        setTimeout(() => navigate("/home"), 800);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  }, [pin, navigate]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleClear = useCallback(() => {
    setPin("");
    setError(false);
  }, []);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      {/* Logo & Brand */}
      <div className="animate-fade-up flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-medium mb-4">
          <Store className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          Empório Orgânico
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">
          Sistema PDV
        </p>
      </div>

      {/* PIN Dots */}
      <div className={`flex gap-4 mb-8 ${error ? "animate-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              i < pin.length
                ? success
                  ? "bg-success scale-110"
                  : "bg-primary scale-110"
                : "bg-border"
            } ${i < pin.length ? "animate-pin-pop" : ""}`}
          />
        ))}
      </div>

      {/* Success Feedback */}
      {success && (
        <div className="animate-fade-up flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-success/10">
          {success === "admin" ? (
            <ShieldCheck className="w-4 h-4 text-success" />
          ) : (
            <User className="w-4 h-4 text-success" />
          )}
          <span className="text-sm font-medium text-success font-body">
            {success === "admin" ? "Administrador" : "Colaborador"}
          </span>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <p className="text-destructive text-sm font-medium mb-4 animate-fade-up font-body">
          PIN incorreto. Tente novamente.
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-[280px]">
        {digits.map((digit) => (
          <Button
            key={digit}
            variant="pin"
            size="icon"
            className="h-16 w-full"
            onClick={() => handleDigit(digit)}
            disabled={!!success}
          >
            {digit}
          </Button>
        ))}
        <Button
          variant="pinAction"
          size="icon"
          className="h-16 w-full text-xs"
          onClick={handleClear}
          disabled={!!success}
        >
          Limpar
        </Button>
        <Button
          variant="pin"
          size="icon"
          className="h-16 w-full"
          onClick={() => handleDigit("0")}
          disabled={!!success}
        >
          0
        </Button>
        <Button
          variant="pinAction"
          size="icon"
          className="h-16 w-full"
          onClick={handleDelete}
          disabled={!!success}
        >
          <Delete className="w-5 h-5" />
        </Button>
      </div>

      {/* Hint */}
      <p className="text-muted-foreground text-xs text-center font-body max-w-[240px]">
        Digite seu PIN de 4 dígitos para acessar o sistema
      </p>
    </div>
  );
};

export default LoginPin;

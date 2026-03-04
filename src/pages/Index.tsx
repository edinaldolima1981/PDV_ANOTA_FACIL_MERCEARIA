import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-soft">
          <Leaf className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Empório Orgânico
        </h1>
      </div>
      <p className="text-muted-foreground text-center mb-8 font-body">
        Bem-vindo ao sistema PDV. Em breve: tela de vendas.
      </p>
      <Button size="lg" onClick={() => window.location.href = "/login"}>
        Voltar ao Login
      </Button>
    </div>
  );
};

export default Index;

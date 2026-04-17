import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/presentation/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-card/80 backdrop-blur-xl border-none shadow-2xl rounded-2xl p-8 text-center space-y-8 relative overflow-hidden">
        {/* Premium Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />

        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 bg-background/60 rounded-full flex items-center justify-center border border-border/50 shadow-inner group transition-colors duration-300">
            <FileQuestion className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform duration-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-7xl font-black text-foreground tracking-tighter opacity-20 select-none">
            404
          </h1>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              ¿Te has perdido?
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[85%] mx-auto font-medium">
              La ruta que buscas no existe, fue movida o quizás nunca estuvo
              aquí.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 h-12 border-border/50 bg-background/40 hover:bg-accent hover:text-accent-foreground transition-all font-medium text-base hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="flex-1 h-12 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Inicio
          </Button>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center space-y-2 opacity-40">
        <p className="text-xs font-bold tracking-widest uppercase text-foreground">
          Parking Control
        </p>
        <div className="h-px w-8 bg-foreground" />
      </div>
    </div>
  );
};

export default NotFound;

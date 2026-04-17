import { Car } from "lucide-react";

const LazyLoadingPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-50 h-50 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center gap-8 text-center px-4 w-full max-w-sm">
        <div className="relative group">
          <div className="absolute -inset-6 bg-linear-to-r from-primary/30 to-primary/20 rounded-2xl opacity-40 blur-xl" />
          <div className="relative w-20 h-20 border border-border/50 rounded-2xl flex items-center justify-center shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-primary/10" />
            <Car
              className="w-9 h-9 text-primary relative z-10 animate-pulse"
              strokeWidth={1.5}
            />
          </div>

          <div className="absolute -inset-3">
            <svg className="w-28 h-28 -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-primary/10"
              />
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset="80"
                className="text-primary/60 animate-[dash_2s_ease-in-out_infinite]"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Parking{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/70">
              Control
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
            <span className="animate-pulse">Cargando...</span>
          </div>
        </div>

        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
          <div className="h-full bg-linear-to-r from-primary via-primary/70 to-primary/50 w-1/3 rounded-full animate-[loading_2s_infinite_ease-in-out]" />
        </div>
      </div>

      <style>{`
        @keyframes dash {
          0% { stroke-dashoffset: 314; }
          50% { stroke-dashoffset: 80; }
          100% { stroke-dashoffset: 314; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default LazyLoadingPage;

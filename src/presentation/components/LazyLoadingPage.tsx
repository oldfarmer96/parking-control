import { Zap } from "lucide-react";

const LazyLoadingPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-75 h-75 bg-cyan-500/10 rounded-full blur-[100px] animate-bounce duration-10000" />

      <div className="relative flex flex-col items-center gap-8 text-center px-4">
        <div className="relative group">
          <div className="absolute -inset-4 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative w-20 h-20 border border-white/10 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/20 via-transparent to-cyan-500/20 animate-spin-slow" />
            <Zap className="w-10 h-10 text-emerald-400 relative z-10 animate-pulse" />
          </div>

          <div className="absolute -inset-2">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-emerald-500/20"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="276"
                strokeDashoffset="70"
                className="text-emerald-400 animate-[dash_2s_ease-in-out_infinite]"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tighter sm:text-4xl">
            Un{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
              Momento
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 text-slate-400 font-medium tracking-wide">
            <p className="animate-pulse">Cargando módulos del sistema...</p>
          </div>
        </div>

        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div className="h-full bg-linear-to-r from-emerald-500 to-cyan-500 w-1/3 rounded-full animate-[loading_2s_infinite_ease-in-out]" />
        </div>
      </div>

      <style>{`
        @keyframes dash {
          0% { stroke-dashoffset: 276; }
          50% { stroke-dashoffset: 70; }
          100% { stroke-dashoffset: 276; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LazyLoadingPage;

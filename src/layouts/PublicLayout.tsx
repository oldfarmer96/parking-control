import { Outlet } from "react-router-dom";
import { CarFront } from "lucide-react";
import { ModeToggle } from "@/presentation/components/theme/mode-toggle";

const PublicLayout = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--color-green-500)/0.12,transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-primary)/0.08,transparent_30%)]" />
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/20">
            <CarFront className="size-5" />
          </div>
          <div>
            <p className="font-black leading-none">Parqueo</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Orden de vehículos</p>
          </div>
        </div>
        <ModeToggle />
      </div>
    </header>
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <Outlet />
    </main>
  </div>
);

export default PublicLayout;

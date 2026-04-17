import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { LogOut, Menu, Car, PlusCircle } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/presentation/components/ui/sheet";
import { useAuthStore } from "@/application/store/auth-store";
import { useLogout } from "@/application/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/presentation/components/theme/mode-toggle";

const OperatorLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const logout = useLogout();

  const menuItems = [
    { icon: PlusCircle, label: "Crear Ticket", href: "/" },
    // { icon: History, label: "Historial Hoy", href: "/history" }, // Can be in the same page
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Car className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">
          Parking<span className="text-primary">Ops</span>
        </span>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-muted p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-bold uppercase">
            {user?.nombre_completo.charAt(0)}
          </div>
          <div className="overflow-hidden text-foreground">
            <p className="text-sm font-bold truncate">
              {user?.nombre_completo}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {user?.rol || "Operador"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={() => logout.mutate()}
          className="w-full justify-start gap-3 px-4 py-6 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 bg-card/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-[280px] border-none bg-card/80 backdrop-blur-2xl"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de Operador</SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/50" />
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-tight">
              Parking<span className="text-primary">Ops</span>
            </span>
          </div>
        </div>

        <ModeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="w-full h-full p-4 max-w-lg mx-auto overflow-x-hidden transition-all duration-300">
          <Outlet />
        </div>
      </main>

      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent z-50 pointer-events-none" />
    </div>
  );
};

export default OperatorLayout;

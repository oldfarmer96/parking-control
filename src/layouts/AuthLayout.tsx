import { ModeToggle } from "@/presentation/components/theme/mode-toggle";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-background via-background to-muted/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-100 h-75 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <header className="absolute top-0 right-0 p-4 z-10">
        <ModeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
};
export default AuthLayout;

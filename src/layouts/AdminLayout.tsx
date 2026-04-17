import { useAuthStore } from "@/application/store/auth-store";
import { useLogout } from "@/application/hooks/use-auth";
import { useIsMobile } from "@/application/hooks/use-mobile";
import { usePeruTime } from "@/application/hooks/use-peru-time";
import { allNavItems, type NavItem } from "@/presentation/components/NavItems";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Car,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ModeToggle } from "@/presentation/components/theme/mode-toggle";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const location = useLocation();
  const { user } = useAuthStore();
  const logout = useLogout();
  const time = usePeruTime();
  const isMobile = useIsMobile();

  // If user is not authenticated, they shouldn't be here (handled by AuthGuard)
  if (!user) {
    return null;
  }

  const navGroups = allNavItems.filter((group) => group.role === user.rol);
  const navItems = navGroups.flatMap((group) => group.children);

  // Auto-expand menu if child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children?.some((child) => location.pathname === child.to)) {
        if (!expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const NavLinkComponent = ({
    item,
    isMobileSide = false,
  }: {
    item: NavItem;
    isMobileSide?: boolean;
  }) => {
    const hasChildren = !!item.children;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.to
      ? item.exact
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to) &&
          (item.to !== "/" || location.pathname === "/")
      : item.children?.some((c) => location.pathname === c.to);

    if (hasChildren) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "group relative flex items-center h-11 w-full rounded-xl transition-all duration-300",
              isActive && !isExpanded
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              sidebarCollapsed && !isMobileSide && "justify-center",
            )}
            title={sidebarCollapsed && !isMobileSide ? item.label : undefined}
          >
            <div
              className={cn(
                "shrink-0 flex items-center justify-center",
                sidebarCollapsed && !isMobileSide ? "w-11 h-11" : "w-10 h-10",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-primary scale-110"
                    : "group-hover:scale-110 transition-transform",
                )}
              />
            </div>
            {(isMobileSide || !sidebarCollapsed) && (
              <>
                <span className="font-semibold text-sm tracking-tight flex-1 text-left ml-2">
                  {item.label}
                </span>
                <div className="pr-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  )}
                </div>
              </>
            )}
          </button>

          {(isMobileSide || !sidebarCollapsed) && isExpanded && (
            <div className="pl-6 space-y-1 border-l border-border/50 ml-5 animate-in slide-in-from-left-2 duration-200">
              {item.children?.map((child) => {
                const isChildActive = location.pathname === child.to;
                return (
                  <Link
                    key={child.to}
                    to={child.to}
                    onClick={() => isMobileSide && setSidebarOpen(false)}
                    className={cn(
                      "flex items-center h-9 px-4 rounded-lg text-xs font-medium transition-all group",
                      isChildActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                    )}
                  >
                    <child.icon className="w-3.5 h-3.5 mr-3" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.to!}
        onClick={() => isMobileSide && setSidebarOpen(false)}
        className={cn(
          "group relative flex items-center h-11 rounded-xl transition-all duration-300 overflow-hidden",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          sidebarCollapsed && !isMobileSide && "justify-center",
        )}
        title={sidebarCollapsed && !isMobileSide ? item.label : undefined}
      >
        <div
          className={cn(
            "shrink-0 flex items-center justify-center",
            sidebarCollapsed && !isMobileSide ? "w-11 h-11" : "w-10 h-10",
          )}
        >
          <item.icon
            className={cn(
              "w-5 h-5",
              isActive
                ? "scale-110"
                : "group-hover:scale-110 transition-transform",
            )}
          />
        </div>
        {(isMobileSide || !sidebarCollapsed) && (
          <span className="font-semibold text-sm tracking-tight transition-all duration-300 whitespace-nowrap ml-2">
            {item.label}
          </span>
        )}
        {isActive && !isMobileSide && !sidebarCollapsed && (
          <div className="absolute right-0 w-1 h-5 bg-primary-foreground/30 rounded-l-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="h-screen w-full bg-background flex text-foreground font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border/50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl",
          sidebarCollapsed ? "lg:w-20" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 gap-3 border-b border-border/50 overflow-hidden shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Car className="w-6 h-6 text-primary-foreground" />
          </div>
          {(!sidebarCollapsed || sidebarOpen) && (
            <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500">
              <h1 className="text-lg font-bold tracking-tight">Parqueo</h1>
              <p className="text-[10px] tracking-widest text-primary font-black mt-1">
                Unidad minera Huinchos Pataccocha
              </p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-2 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={cn(
            "flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-none",
            sidebarCollapsed && !sidebarOpen && "px-2",
          )}
        >
          {navItems.map((item) => (
            <NavLinkComponent
              key={item.label}
              item={item}
              isMobileSide={sidebarOpen}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/50 flex flex-col gap-4">
          {/* Collapse Sidebar Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-full h-10 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-3 px-3 w-full">
                <PanelLeftClose className="w-5 h-5" />
                <span className="text-sm font-semibold">Contraer menú</span>
              </div>
            )}
          </button>

          {/* User Profile Info */}
          {!sidebarCollapsed || sidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 border border-border/50 overflow-hidden relative group">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {user.nombre_completo.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">
                  {user.nombre_completo}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {user.rol}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex justify-center w-full"
              title={user.nombre_completo}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-inner">
                {user.nombre_completo.charAt(0)}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => logout.mutate()}
            className={cn(
              "flex items-center w-full h-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all group overflow-hidden",
              sidebarCollapsed && !sidebarOpen ? "justify-center" : "px-3",
            )}
          >
            <div className="shrink-0 flex items-center justify-center w-6 h-6">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            {(!sidebarCollapsed || sidebarOpen) && (
              <span className="font-semibold text-sm ml-3">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-card/50 backdrop-blur-md border-b border-border/50 flex items-center px-4 lg:px-8 justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden lg:block font-semibold">Centro de Control</h2>
          </div>

          <div className="flex items-center gap-4">
            {!isMobile && (
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  Perú
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {time}
                </span>
              </div>
            )}
            <ModeToggle />
          </div>
        </header>

        <div className="h-[2px] w-full bg-linear-to-r from-primary/50 via-primary/10 to-transparent shrink-0" />

        <div className="flex-1 overflow-y-auto scroll-smooth relative p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>

          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 -z-10 pointer-events-none opacity-5">
            <Car className="w-96 h-96 -rotate-12 translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

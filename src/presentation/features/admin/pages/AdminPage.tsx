import { DollarSign, Clock, ArrowRight, Loader2, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { useDashboard } from "../hooks/useDashboard";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { data, isLoading, isError } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium animate-pulse">
          Cargando panel de control...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-destructive">
        <p className="font-bold">Error al cargar los datos</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-1">
            Resumen general del estado de la Unidad Minera.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-card/40 backdrop-blur-md rounded-xl border border-border/50">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {format(new Date(), "eeee, d 'de' MMMM")}
            </span>
          </div>
          <Button
            onClick={() => navigate("/reports")}
            className="h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Ver Reportes Completos
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Recaudación Mensual"
          value={`S/ ${(data?.totalRevenue || 0).toFixed(2)}`}
          description="Total cobrado este mes"
          icon={<DollarSign size={22} />}
          color="text-emerald-500 bg-emerald-500/10"
        />
        {/* <StatCard
          title="Ocupación Actual"
          value={`${data?.activeTickets} Vehículos`}
          description="Dentro del parqueadero"
          icon={<Car size={22} />}
          color="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Personal"
          value={`${data?.totalOperators} Operadores`}
          description="Personal registrado"
          icon={<Users size={22} />}
          color="text-purple-500 bg-purple-500/10"
        /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Recent Activity Card */}
        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Movimientos Recientes</CardTitle>
              <CardDescription>
                Últimas operaciones registradas en el sistema.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reports")}
              className="border-border/50 hover:bg-primary/5"
            >
              Ver historial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Placa
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Operación
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Operador
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Fecha/Hora
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Monto
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentActivity.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono font-black text-sm bg-primary/5 text-primary px-2 py-1 rounded border border-primary/20 uppercase tracking-tighter">
                          {activity.placa}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {activity.estado === "PENDIENTE" ? "Entrada" : "Salida"}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {activity.operador}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(activity.fecha), "dd/MM HH:mm")}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold">
                        {activity.estado === "PAGADO"
                          ? `S/ ${activity.monto}`
                          : "—"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={activity.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, description, icon, color }: any) => (
  <Card className="border-none shadow-xl bg-card/65 backdrop-blur-md overflow-hidden hover:scale-[1.01] transition-transform">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <div className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center opacity-40">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-black mt-1 tracking-tight">{value}</h3>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PAGADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    PENDIENTE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    NO_PAGADO: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ANULADO: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default AdminPage;

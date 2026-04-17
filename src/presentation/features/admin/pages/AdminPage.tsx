import {
  Users,
  TrendingUp,
  DollarSign,
  Car,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";

const stats = [
  {
    title: "Ingresos Totales",
    value: "$12,450.00",
    description: "Este mes",
    icon: DollarSign,
    trend: "+12.5%",
    trendUp: true,
    color: "primary",
  },
  {
    title: "Tickets Activos",
    value: "45",
    description: "Vehículos en parqueadero",
    icon: Car,
    trend: "+3",
    trendUp: true,
    color: "blue",
  },
  {
    title: "Operadores",
    value: "8",
    description: "4 activos ahora",
    icon: Users,
    trend: "0",
    trendUp: null,
    color: "purple",
  },
  {
    title: "Promedio Estadía",
    value: "2h 15m",
    description: "Por vehículo",
    icon: Clock,
    trend: "-10m",
    trendUp: false,
    color: "orange",
  },
];

const activity = [
  {
    id: 1,
    plate: "ABC-123",
    time: "10:25 AM",
    action: "Entrada",
    operator: "Juan Pérez",
    status: "PENDIENTE",
  },
  {
    id: 2,
    plate: "XYZ-789",
    time: "09:45 AM",
    action: "Salida",
    operator: "María García",
    status: "PAGADO",
    amount: "$15.00",
  },
  {
    id: 3,
    plate: "KKB-456",
    time: "09:12 AM",
    action: "Entrada",
    operator: "Juan Pérez",
    status: "PENDIENTE",
  },
  {
    id: 4,
    plate: "LOP-321",
    time: "08:30 AM",
    action: "Salida",
    operator: "Andrés Castro",
    status: "PAGADO",
    amount: "$10.00",
  },
  {
    id: 5,
    plate: "WER-555",
    time: "08:15 AM",
    action: "Anulado",
    operator: "María García",
    status: "ANULADO",
  },
];

const AdminPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido administrador.
          </h1>
          {/* <p className="text-muted-foreground">
            Bienvenido de nuevo, administrador.
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10">
            Exportar Reporte
          </Button>
          <Button className="h-10 bg-primary shadow-lg shadow-primary/20">
            Nuevo Ticket
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden group hover:scale-[1.02] transition-all duration-300"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-primary/20 group-hover:bg-primary transition-colors`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <stat.icon size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                {stat.trendUp !== null && (
                  <span
                    className={`flex items-center text-xs font-semibold ${stat.trendUp ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {stat.trendUp ? (
                      <ArrowUpRight size={12} className="mr-1" />
                    ) : (
                      <ArrowDownRight size={12} className="mr-1" />
                    )}
                    {stat.trend}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Activity Chart Area Placeholder */}
        <Card className="lg:col-span-4 border-none shadow-xl bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Flujo de Ingresos</CardTitle>
            <CardDescription>
              Visualización de recaudación de la última semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center relative overflow-hidden">
              <div className="flex items-end gap-3 h-full pt-10 px-10 w-full justify-around">
                {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 w-full group"
                  >
                    <div
                      className="w-full max-w-[40px] bg-primary/40 group-hover:bg-primary transition-all duration-300 rounded-t-lg relative"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${h * 10}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                      {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <TrendingUp className="absolute top-4 right-4 text-primary opacity-20 w-32 h-32 -rotate-12" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Table */}
        <Card className="lg:col-span-3 border-none shadow-xl bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimos movimientos del sistema.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              Ver todo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                        item.status === "PAGADO"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : item.status === "ANULADO"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}
                    >
                      {item.action === "Entrada" ? (
                        <Car size={18} />
                      ) : item.action === "Salida" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-widest">
                        {item.plate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.action} • {item.operator}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{item.time}</p>
                    {item.amount && (
                      <p className="text-xs font-bold text-primary">
                        {item.amount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

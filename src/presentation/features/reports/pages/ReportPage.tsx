import { useReports } from "../hooks/useReports";
import { exportToExcel } from "../utils/export.utils";
import { TicketReportPdf } from "../components/TicketReportPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  TrendingUp, 
  Ticket as TicketIcon, 
  DollarSign,
  Loader2
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select";
import { format } from "date-fns";

const ReportPage = () => {
  const { data, isLoading, filters, updateFilters } = useReports();

  const handleExportExcel = () => {
    if (data?.tickets) {
      exportToExcel(data.tickets);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Analiza y exporta los datos de tu parqueadero.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            className="h-11 border-border/50 bg-card/50 backdrop-blur-md"
            disabled={isLoading || !data?.tickets.length}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
            Excel
          </Button>

          {data && (
            <PDFDownloadLink
              document={
                <TicketReportPdf 
                  tickets={data.tickets} 
                  summary={data.summary} 
                  dateRange={{ start: filters.startDate, end: filters.endDate }} 
                />
              }
              fileName={`reporte-${format(new Date(), "yyyyMMdd")}.pdf`}
            >
              {({ loading }) => (
                <Button 
                  className="h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  disabled={isLoading || !data?.tickets.length || loading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-none bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Fecha Inicio</label>
              <Input
                type="date"
                value={format(new Date(filters.startDate), "yyyy-MM-dd")}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Fecha Fin</label>
              <Input
                type="date"
                value={format(new Date(filters.endDate), "yyyy-MM-dd")}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Estado</label>
              <Select 
                value={filters.status || "ALL"} 
                onValueChange={(val) => updateFilters({ status: val === "ALL" ? undefined : val as any })}
              >
                <SelectTrigger className="h-11 bg-background/50 border-border/50">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PAGADO">Pagado</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="NO_PAGADO">No Pagado</SelectItem>
                  <SelectItem value="ANULADO">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Placa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar placa..."
                  value={filters.placa || ""}
                  onChange={(e) => updateFilters({ placa: e.target.value })}
                  className="h-11 pl-10 bg-background/50 border-border/50 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Recaudado" 
          value={`S/ ${(data?.summary.totalAmount || 0).toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend="+12% vs anterior"
          color="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard 
          title="Tickets Totales" 
          value={data?.summary.totalTickets.toString() || "0"}
          icon={<TicketIcon className="h-5 w-5" />}
          trend="En el periodo"
          color="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard 
          title="Pendientes" 
          value={data?.summary.byStatus.PENDIENTE.toString() || "0"}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="Por cobrar"
          color="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard 
          title="No Pagados" 
          value={data?.summary.byStatus.NO_PAGADO.toString() || "0"}
          icon={<Filter className="h-5 w-5" />}
          trend="Excepciones"
          color="bg-rose-500/10 text-rose-500"
        />
      </div>

      {/* Main Table Card */}
      <Card className="border-none bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Detalle de Actividad</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="p-4 font-semibold text-sm">Ticket</th>
                  <th className="p-4 font-semibold text-sm">Placa</th>
                  <th className="p-4 font-semibold text-sm">Fecha/Hora</th>
                  <th className="p-4 font-semibold text-sm">Monto</th>
                  <th className="p-4 font-semibold text-sm">Estado</th>
                  <th className="p-4 font-semibold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-muted-foreground">Cargando datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : data?.tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-muted-foreground">
                      No se encontraron resultados para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  data?.tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-sm font-medium">#{ticket.numero_ticket}</td>
                      <td className="p-4 text-sm">
                        <span className="bg-primary/5 text-primary px-2 py-1 rounded font-mono font-bold border border-primary/20 uppercase">
                          {ticket.placa}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(ticket.fecha_creacion), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="p-4 text-sm font-bold">
                        S/ {ticket.estado === "PAGADO" ? Number(ticket.monto_cobrado).toFixed(2) : "0.00"}
                      </td>
                      <td className="p-4 text-sm">
                        <StatusBadge status={ticket.estado} />
                      </td>
                      <td className="p-4 text-sm text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, trend, color }: any) => (
  <Card className="border-none bg-card/60 backdrop-blur-xl shadow-lg hover:translate-y-[-2px] transition-transform">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${color}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{trend}</span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
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
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default ReportPage;


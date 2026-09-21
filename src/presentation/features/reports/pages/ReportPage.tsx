import { useReports } from "../hooks/useReports";
import { exportAportesToExcel, exportToExcel } from "../utils/export.utils";
import { TicketReportPdf } from "../components/TicketReportPdf";
import { AporteReportPdf } from "../components/AporteReportPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  TrendingUp,
  Ticket as TicketIcon,
  DollarSign,
  Loader2,
  UserCircle,
  HandCoins,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { format } from "date-fns";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { TicketStatus } from "@/core/entities/ticket.entity";
import RegularizarAporteTicket, {
  ENABLE_TEMPORARY_APORTE_BACKFILL,
} from "../components/RegularizarAporteTicket";

const normalizePlate = (plate: string) =>
  plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const ReportPage = () => {
  const { data, isLoading, filters, updateFilters } = useReports();
  const aporteResultsByPlate = useMemo(
    () =>
      new Map(
        (data?.aporteActivo?.resultados ?? []).map((resultado) => [
          resultado.placa_normalizada,
          resultado,
        ]),
      ),
    [data?.aporteActivo?.resultados],
  );

  const handleExportExcel = () => {
    if (data?.tickets) {
      exportToExcel(data.tickets);
    }
  };

  const handleExportAportesExcel = () => {
    if (data?.aporteReport) {
      exportAportesToExcel(data.aporteReport, {
        start: filters.startDate,
        end: filters.endDate,
      });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Analiza y exporta los datos de tu parqueadero.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="h-11 border-border/50 bg-card/50 backdrop-blur-md"
            disabled={isLoading || !data?.tickets.length}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
            Excel tickets
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
                  PDF tickets
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-none bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Fecha Inicio
              </label>
              <Input
                type="date"
                value={format(new Date(filters.startDate), "yyyy-MM-dd")}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Fecha Fin
              </label>
              <Input
                type="date"
                value={format(new Date(filters.endDate), "yyyy-MM-dd")}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Estado
              </label>
              <Select
                value={filters.status || "ALL"}
                onValueChange={(val) =>
                  updateFilters({
                    status: val === "ALL" ? undefined : (val as TicketStatus),
                  })
                }
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
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Placa
              </label>
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

      {/* Active contribution report */}
      <Card className="relative overflow-hidden border border-teal-500/20 bg-linear-to-br from-teal-500/10 via-card/80 to-emerald-500/5 shadow-xl">
        <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-teal-400 to-emerald-600" />
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-xl bg-teal-500/15 p-2.5 text-teal-600 dark:text-teal-400">
                <HandCoins className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  Reporte del aporte en curso
                </h2>
                {data?.aporteReport ? (
                  <>
                    <p className="mt-1 truncate text-sm font-medium text-teal-700 dark:text-teal-300">
                      {data.aporteReport.nombre} · S/{" "}
                      {data.aporteReport.monto.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Usa el rango de fechas y la placa de los filtros
                      superiores. La fecha corresponde al último cambio del
                      estado.
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No existe un aporte activo para generar el reporte.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <div className="rounded-lg border border-teal-500/15 bg-background/60 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Pagados
                </p>
                <p className="font-bold">
                  {data?.aporteReport?.summary.pagados ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/15 bg-background/60 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Preferenciales
                </p>
                <p className="font-bold">
                  {data?.aporteReport?.summary.preferenciales ?? 0}
                </p>
              </div>
              <div className="col-span-2 rounded-lg border border-emerald-500/15 bg-background/60 px-3 py-2 text-center sm:col-span-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Recaudado
                </p>
                <p className="font-bold text-emerald-600">
                  S/{" "}
                  {(data?.aporteReport?.summary.totalRecaudado ?? 0).toFixed(2)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportAportesExcel}
                className="h-11 bg-background/70"
                disabled={isLoading || !data?.aporteReport?.resultados.length}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                Excel aportes
              </Button>
              {data?.aporteReport ? (
                <PDFDownloadLink
                  document={
                    <AporteReportPdf
                      report={data.aporteReport}
                      dateRange={{
                        start: filters.startDate,
                        end: filters.endDate,
                      }}
                    />
                  }
                  fileName={`reporte-aporte-${format(new Date(), "yyyyMMdd")}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      className="h-11 w-full bg-teal-700 text-white hover:bg-teal-800"
                      disabled={
                        isLoading ||
                        !data.aporteReport?.resultados.length ||
                        loading
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      PDF aportes
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : null}
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
                  <th className="p-4 font-semibold text-sm">Operador</th>
                  {ENABLE_TEMPORARY_APORTE_BACKFILL ? (
                    <th className="p-4 font-semibold text-sm">
                      Acciones aporte
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={ENABLE_TEMPORARY_APORTE_BACKFILL ? 7 : 6}
                      className="p-20 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-muted-foreground">
                          Cargando datos...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : data?.tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={ENABLE_TEMPORARY_APORTE_BACKFILL ? 7 : 6}
                      className="p-20 text-center text-muted-foreground"
                    >
                      No se encontraron resultados para los filtros
                      seleccionados.
                    </td>
                  </tr>
                ) : (
                  data?.tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 text-sm font-medium">
                        #{ticket.numero_ticket}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="bg-primary/5 text-primary px-2 py-1 rounded font-mono font-bold border border-primary/20 uppercase">
                          {ticket.placa}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(
                          new Date(ticket.fecha_creacion),
                          "dd/MM/yyyy HH:mm",
                        )}
                      </td>
                      <td className="p-4 text-sm font-bold">
                        S/{" "}
                        {ticket.estado === "PAGADO"
                          ? Number(ticket.monto_cobrado).toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="p-4 text-sm">
                        <StatusBadge status={ticket.estado} />
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <UserCircle className="h-3.5 w-3.5" />
                          {ticket.operador_nombre || "Sistema"}
                        </div>
                      </td>
                      {ENABLE_TEMPORARY_APORTE_BACKFILL ? (
                        <td className="p-4 text-sm">
                          <RegularizarAporteTicket
                            ticket={ticket}
                            aporte={data.aporteActivo}
                            resultado={aporteResultsByPlate.get(
                              normalizePlate(ticket.placa),
                            )}
                          />
                        </td>
                      ) : null}
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

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
  color: string;
}

const SummaryCard = ({
  title,
  value,
  icon,
  trend,
  color,
}: SummaryCardProps) => (
  <Card className="border-none bg-card/60 backdrop-blur-xl shadow-lg hover:-translate-y-0.5 transition-transform">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
        <span className="text-xs font-medium text-muted-foreground">
          {trend}
        </span>
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
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default ReportPage;

import { useState } from "react";
import {
  CalendarDays,
  CarFront,
  Clock3,
  History,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  useIngresosActivos,
  useIngresosHistorial,
  useRegistrarIngreso,
} from "@/application/hooks/use-ingresos";
import type {
  HistorialIngresosFilters,
  IngresoVehiculo,
} from "@/core/entities/ingreso.entity";
import { cn } from "@/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  formatDateTime,
  formatDuration,
  toLocalDateTimeInput,
} from "@/utils/ingreso-format";
import GenerarTicketIngresoDialog from "../components/GenerarTicketIngresoDialog";
import SalidaSinTicketDialog from "../components/SalidaSinTicketDialog";

const PAGE_SIZE = 20;

const getLocalDate = () => toLocalDateTimeInput().slice(0, 10);

const getDateKey = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const formatDateRibbon = (dateKey: string) => {
  const today = getLocalDate();
  const yesterday = new Date(`${today}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday.toISOString());
  const label = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));

  if (dateKey === today) return `Hoy · ${label}`;
  if (dateKey === yesterdayKey) return `Ayer · ${label}`;
  return label;
};

const groupByEntryDate = <T extends IngresoVehiculo>(rows: T[]) => {
  const groups = new Map<string, T[]>();
  rows.forEach((row) => {
    const key = getDateKey(row.fecha_entrada);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  return [...groups.entries()];
};

const EmptyState = ({ history = false }: { history?: boolean }) => (
  <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">
    {history ? (
      <History className="mx-auto mb-3 size-9 opacity-30" />
    ) : (
      <CarFront className="mx-auto mb-3 size-9 opacity-30" />
    )}
    <p className="font-medium">
      {history ? "No se encontraron salidas" : "No hay vehículos dentro"}
    </p>
  </div>
);

const DateRibbon = ({ dateKey }: { dateKey: string }) => (
  <div className="sticky top-16 z-10 flex items-center gap-3 bg-muted/95 py-2 backdrop-blur-sm">
    <CalendarDays className="size-4 text-primary" />
    <p className="text-xs font-black uppercase tracking-wider">
      {formatDateRibbon(dateKey)}
    </p>
    <div className="h-px flex-1 bg-border" />
  </div>
);

const ActiveRow = ({
  ingreso,
  position,
}: {
  ingreso: IngresoVehiculo;
  position: number;
}) => (
  <Card className="relative overflow-hidden border-green-500/20 bg-green-500/5 shadow-sm">
    <div className="absolute inset-y-0 left-0 w-1.5 bg-green-500" />
    <CardContent className="p-4 pl-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500 text-lg font-black text-white">
            {position}
          </div>
          <div>
            <p className="text-xl font-black tracking-widest uppercase">
              {ingreso.placa}
            </p>
            <p className="text-xs text-muted-foreground">
              Entrada: {formatDateTime(ingreso.fecha_entrada)}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-green-500/15 px-2 py-1 text-[10px] font-black uppercase text-green-700 dark:text-green-400">
          Dentro
        </span>
      </div>
      <div className="my-4 flex items-center gap-2 rounded-xl bg-background/70 p-3 text-sm">
        <Clock3 className="size-4 text-green-600" />
        <span className="text-muted-foreground">Permanencia</span>
        <strong className="ml-auto">
          {formatDuration(ingreso.fecha_entrada)}
        </strong>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <GenerarTicketIngresoDialog ingreso={ingreso} />
        <SalidaSinTicketDialog ingreso={ingreso} />
      </div>
    </CardContent>
  </Card>
);

const HistoryRow = ({ ingreso }: { ingreso: IngresoVehiculo }) => {
  const withTicket = ingreso.estado === "SALIO_CON_TICKET";
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        withTicket
          ? "border-slate-400/30 bg-slate-500/5"
          : "border-red-500/20 bg-red-500/5",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          withTicket ? "bg-slate-500" : "bg-red-500",
        )}
      />
      <CardContent className="grid gap-3 p-4 pl-5 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-black tracking-widest uppercase">
              {ingreso.placa}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-black uppercase",
                withTicket
                  ? "bg-slate-500/15 text-slate-600 dark:text-slate-300"
                  : "bg-red-500/15 text-red-700 dark:text-red-400",
              )}
            >
              {withTicket ? "Con ticket" : "Sin ticket"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Entrada: {formatDateTime(ingreso.fecha_entrada)}
          </p>
          <p className="text-xs text-muted-foreground">
            Salida: {ingreso.fecha_salida ? formatDateTime(ingreso.fecha_salida) : "-"}
          </p>
          {!withTicket && ingreso.motivo_sin_ticket ? (
            <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-700 dark:text-red-300">
              {ingreso.motivo_sin_ticket}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl bg-background/70 p-3 text-sm sm:text-right">
          <p className="text-xs text-muted-foreground">Permanencia</p>
          <p className="font-bold">
            {formatDuration(ingreso.fecha_entrada, ingreso.fecha_salida)}
          </p>
          {ingreso.ticket_id ? (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Ticket vinculado
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const initialHistoryFilters = (): HistorialIngresosFilters => ({
  placa: "",
  fecha: getLocalDate(),
  estado: "TODOS",
  page: 1,
  pageSize: PAGE_SIZE,
});

const IngresosPage = () => {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [placa, setPlaca] = useState("");
  const [fechaEntrada, setFechaEntrada] = useState(toLocalDateTimeInput);
  const [activeSearch, setActiveSearch] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [historyPlate, setHistoryPlate] = useState("");
  const [historyDate, setHistoryDate] = useState(getLocalDate);
  const [historyStatus, setHistoryStatus] = useState<HistorialIngresosFilters["estado"]>("TODOS");
  const [appliedHistoryFilters, setAppliedHistoryFilters] = useState(initialHistoryFilters);
  const activos = useIngresosActivos();
  const historial = useIngresosHistorial(appliedHistoryFilters, tab === "history");
  const registrar = useRegistrarIngreso();

  const normalizedActiveSearch = activeSearch.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const activeRows = (activos.data ?? [])
    .map((ingreso, index) => ({ ingreso, position: index + 1 }))
    .filter(({ ingreso }) => {
      const matchesPlate = normalizedActiveSearch
        ? ingreso.placa_normalizada.includes(normalizedActiveSearch)
        : true;
      const matchesDate = activeDate
        ? getDateKey(ingreso.fecha_entrada) === activeDate
        : true;
      return matchesPlate && matchesDate;
    });
  const activeGroups = groupByEntryDate(activeRows.map(({ ingreso }) => ingreso));
  const activePositions = new Map(activeRows.map(({ ingreso, position }) => [ingreso.id, position]));
  const historyGroups = groupByEntryDate(historial.data?.rows ?? []);
  const totalPages = Math.max(1, Math.ceil((historial.data?.total ?? 0) / PAGE_SIZE));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (placa.trim().length < 3) return;
    registrar.mutate(
      { placa, fechaEntrada },
      {
        onSuccess: () => {
          setPlaca("");
          setFechaEntrada(toLocalDateTimeInput());
          setTab("active");
        },
      },
    );
  };

  const applyHistoryFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedHistoryFilters({
      placa: historyPlate.trim(),
      fecha: historyDate,
      estado: historyStatus,
      page: 1,
      pageSize: PAGE_SIZE,
    });
  };

  const clearHistoryFilters = () => {
    const today = getLocalDate();
    setHistoryPlate("");
    setHistoryDate(today);
    setHistoryStatus("TODOS");
    setAppliedHistoryFilters(initialHistoryFilters());
  };

  const changeHistoryPage = (page: number) => {
    setAppliedHistoryFilters((current) => ({ ...current, page }));
  };

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-500">
      <Card className="overflow-hidden border-none bg-card/70 shadow-xl backdrop-blur-xl">
        <div className="h-1 bg-linear-to-r from-green-500 via-green-400 to-emerald-300" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CarFront className="text-green-600" /> Registrar entrada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={submit}
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="entry-plate">Placa</Label>
              <Input
                id="entry-plate"
                value={placa}
                onChange={(event) => setPlaca(event.target.value.toUpperCase())}
                placeholder="ABC-123"
                className="h-12 text-lg font-black tracking-widest uppercase"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="entry-date">Fecha y hora de entrada</Label>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => setFechaEntrada(toLocalDateTimeInput())}
                >
                  <RefreshCw /> Hora actual
                </Button>
              </div>
              <Input
                id="entry-date"
                type="datetime-local"
                value={fechaEntrada}
                onChange={(event) => setFechaEntrada(event.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-5"
              disabled={registrar.isPending || placa.trim().length < 3}
            >
              {registrar.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-1 rounded-2xl border bg-muted p-1">
        <button
          onClick={() => setTab("active")}
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold",
            tab === "active" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          <CarFront className="size-4" /> Dentro ({activos.data?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold",
            tab === "history" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          <History className="size-4" /> Historial
        </button>
      </div>

      {tab === "active" ? (
        <section className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={activeSearch}
                onChange={(event) => setActiveSearch(event.target.value)}
                placeholder="Buscar placa dentro"
                className="h-11 pl-10 uppercase"
              />
            </div>
            <Input
              type="date"
              value={activeDate}
              onChange={(event) => setActiveDate(event.target.value)}
              className="h-11 sm:w-40"
              aria-label="Filtrar entradas por fecha"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setActiveDate(getLocalDate())}
              >
                Hoy
              </Button>
              <Button
                variant="ghost"
                className="h-11"
                onClick={() => {
                  setActiveDate("");
                  setActiveSearch("");
                }}
              >
                Todos
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-bold">Orden de llegada</h2>
              <p className="text-xs text-muted-foreground">
                {activeDate
                  ? `Entradas del ${new Date(`${activeDate}T12:00:00`).toLocaleDateString("es-PE")}`
                  : "Todos los vehículos que continúan dentro"}
              </p>
            </div>
            {activos.isFetching ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          {activos.isLoading ? (
            <div className="p-10 text-center text-muted-foreground">
              Cargando vehículos...
            </div>
          ) : activeRows.length ? (
            activeGroups.map(([dateKey, rows]) => (
              <div key={dateKey} className="space-y-3">
                <DateRibbon dateKey={dateKey} />
                {rows.map((ingreso) => (
                  <ActiveRow
                    key={ingreso.id}
                    ingreso={ingreso}
                    position={activePositions.get(ingreso.id) ?? 0}
                  />
                ))}
              </div>
            ))
          ) : (
            <EmptyState />
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <Card className="bg-card/70">
            <CardContent className="p-4">
              <form onSubmit={applyHistoryFilters} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="history-plate">Placa</Label>
                    <Input
                      id="history-plate"
                      value={historyPlate}
                      onChange={(event) => setHistoryPlate(event.target.value.toUpperCase())}
                      placeholder="ABC-123"
                      className="h-11 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="history-date">Fecha de salida</Label>
                    <Input
                      id="history-date"
                      type="date"
                      value={historyDate}
                      onChange={(event) => setHistoryDate(event.target.value)}
                      className="h-11"
                      disabled={Boolean(historyPlate.trim())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resultado</Label>
                    <Select
                      value={historyStatus}
                      onValueChange={(value) =>
                        setHistoryStatus(value as HistorialIngresosFilters["estado"])
                      }
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>
                        <SelectItem value="SALIO_CON_TICKET">Con ticket</SelectItem>
                        <SelectItem value="SALIO_SIN_TICKET">Sin ticket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {historyPlate.trim() ? (
                  <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium">
                    La placa se buscará en todo el historial, sin limitar por fecha.
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11"
                    onClick={clearHistoryFilters}
                  >
                    <X /> Limpiar
                  </Button>
                  <Button type="submit" className="h-11" disabled={historial.isFetching}>
                    {historial.isFetching ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Search />
                    )}
                    Buscar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span>
              {appliedHistoryFilters.placa
                ? `Resultados globales para ${appliedHistoryFilters.placa.toUpperCase()}`
                : `Salidas del ${new Date(`${appliedHistoryFilters.fecha}T12:00:00`).toLocaleDateString("es-PE")}`}
            </span>
            <span>{historial.data?.total ?? 0} registros</span>
          </div>

          {historial.isLoading ? (
            <div className="p-10 text-center text-muted-foreground">
              Cargando historial...
            </div>
          ) : historyGroups.length ? (
            historyGroups.map(([dateKey, rows]) => (
              <div key={dateKey} className="space-y-3">
                <DateRibbon dateKey={dateKey} />
                {rows.map((ingreso) => (
                  <HistoryRow key={ingreso.id} ingreso={ingreso} />
                ))}
              </div>
            ))
          ) : (
            <EmptyState history />
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-xl border bg-card p-2">
              <Button
                variant="outline"
                className="h-10"
                disabled={appliedHistoryFilters.page === 1 || historial.isFetching}
                onClick={() => changeHistoryPage(appliedHistoryFilters.page - 1)}
              >
                Anterior
              </Button>
              <span className="text-xs font-bold">
                Página {appliedHistoryFilters.page} de {totalPages}
              </span>
              <Button
                variant="outline"
                className="h-10"
                disabled={appliedHistoryFilters.page === totalPages || historial.isFetching}
                onClick={() => changeHistoryPage(appliedHistoryFilters.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
};

export default IngresosPage;

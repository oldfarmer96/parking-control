import { useState } from "react";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useMovimientosPublicos } from "@/application/hooks/use-ingresos";
import type { MovimientoPublico } from "@/core/entities/ingreso.entity";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { formatDateTime, formatDuration } from "@/utils/ingreso-format";

const getLimaDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const normalizePlate = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const formatDateRibbon = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));

const VehicleCard = ({ item }: { item: MovimientoPublico }) => (
  <article className="grid grid-cols-[4.5rem_1fr] items-center gap-4 overflow-hidden rounded-3xl border border-green-500/25 bg-card p-4 shadow-sm sm:grid-cols-[6rem_1fr_auto] sm:p-5">
    <div>
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-green-600 text-3xl font-black text-white shadow-lg shadow-green-600/20 sm:text-4xl">
        {item.posicion_actual}
      </div>
      <p className="mt-2 text-center text-[10px] font-black uppercase leading-tight tracking-wide text-green-700 dark:text-green-400">
        Posición
      </p>
    </div>

    <div className="min-w-0">
      <p className="truncate text-2xl font-black tracking-[0.12em] uppercase sm:text-4xl">
        {item.placa}
      </p>
      <div className="mt-2 flex items-start gap-2 text-sm font-medium text-foreground/80 sm:text-base">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-green-600 sm:size-5" />
        <span>Entró el {formatDateTime(item.fecha_entrada)}</span>
      </div>
    </div>

    <div className="col-span-2 rounded-2xl bg-green-500/10 px-4 py-3 sm:col-span-1 sm:min-w-40 sm:text-right">
      <p className="text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400">
        Tiempo dentro
      </p>
      <p className="mt-1 text-xl font-black sm:text-2xl">
        {formatDuration(item.fecha_entrada)}
      </p>
    </div>
  </article>
);

const SearchResult = ({ item, onClose }: { item: MovimientoPublico; onClose: () => void }) => (
  <section className="relative overflow-hidden rounded-3xl border-2 border-green-500/40 bg-green-500/10 p-5 shadow-xl shadow-green-500/10 sm:p-7">
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-3 top-3"
      onClick={onClose}
      aria-label="Cerrar resultado"
    >
      <X />
    </Button>
    <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-green-700 dark:text-green-400">
      <CheckCircle2 className="size-5" /> Vehículo encontrado
    </div>
    <div className="grid gap-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex size-24 flex-col items-center justify-center rounded-3xl bg-green-600 text-white shadow-xl shadow-green-600/25">
        <span className="text-[10px] font-bold uppercase tracking-wider">Posición</span>
        <span className="text-5xl font-black leading-none">{item.posicion_actual}</span>
      </div>
      <div>
        <p className="text-4xl font-black tracking-[0.12em] uppercase sm:text-5xl">
          {item.placa}
        </p>
        <p className="mt-2 flex items-center gap-2 text-base font-semibold">
          <CalendarDays className="size-5 text-green-600" />
          Entrada: {formatDateTime(item.fecha_entrada)}
        </p>
      </div>
      <div className="rounded-2xl bg-background/80 p-4 sm:text-right">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tiempo dentro
        </p>
        <p className="mt-1 text-2xl font-black">{formatDuration(item.fecha_entrada)}</p>
      </div>
    </div>
  </section>
);

const ColaPublicaPage = () => {
  const [selectedDate, setSelectedDate] = useState(getLimaDate);
  const [showPrevious, setShowPrevious] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const movements = useMovimientosPublicos(selectedDate);
  const updatedAt = movements.dataUpdatedAt ? new Date(movements.dataUpdatedAt) : null;
  const activeRows = (movements.data ?? []).filter((item) => item.estado === "DENTRO");
  const currentDayRows = activeRows.filter((item) => !item.es_anterior);
  const previousRows = activeRows.filter((item) => item.es_anterior);
  const visibleRows = (showPrevious ? activeRows : currentDayRows).toSorted(
    (a, b) => (a.posicion_actual ?? 0) - (b.posicion_actual ?? 0),
  );
  const normalizedSearch = normalizePlate(appliedSearch);
  const searchResult = normalizedSearch
    ? activeRows.find((item) => normalizePlate(item.placa) === normalizedSearch) ??
      activeRows.find((item) => normalizePlate(item.placa).includes(normalizedSearch))
    : undefined;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedSearch(searchDraft.trim());
  };

  const clearSearch = () => {
    setSearchDraft("");
    setAppliedSearch("");
  };

  const changeDate = (date: string) => {
    setSelectedDate(date);
    setShowPrevious(false);
    clearSearch();
  };

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-xl">
        <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-7">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400">
              <span className="size-2 animate-pulse rounded-full bg-green-500" /> En vivo
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Consulta tu posición
            </h1>
            <p className="mt-2 max-w-xl text-base font-medium text-muted-foreground sm:text-lg">
              Busca tu placa o revisa el orden actual de los vehículos dentro.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Dentro este día
              </p>
              <p className="text-4xl font-black text-green-600">{currentDayRows.length}</p>
            </div>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => movements.refetch()}
              disabled={movements.isFetching}
            >
              <RefreshCw className={movements.isFetching ? "animate-spin" : ""} />
              Actualizar
            </Button>
          </div>
        </div>
        <div className="border-t bg-muted/40 px-5 py-2 text-sm font-medium text-muted-foreground sm:px-7">
          {updatedAt
            ? `Actualizado a las ${updatedAt.toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}`
            : "Conectando..."}
        </div>
      </section>

      <form
        onSubmit={submitSearch}
        className="grid gap-3 rounded-3xl border border-green-500/20 bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:p-5"
      >
        <div className="space-y-2">
          <label htmlFor="public-plate-search" className="text-sm font-black">
            Buscar mi placa
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="public-plate-search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value.toUpperCase())}
              placeholder="Ejemplo: ABC-123"
              className="h-14 pl-12 text-xl font-black tracking-widest uppercase"
              autoComplete="off"
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            La búsqueda incluye vehículos de días anteriores que todavía siguen dentro.
          </p>
        </div>
        <Button
          type="submit"
          className="h-14 self-end px-6 text-base font-bold"
          disabled={!searchDraft.trim() || movements.isLoading}
        >
          <Search /> Buscar placa
        </Button>
      </form>

      {appliedSearch ? (
        searchResult ? (
          <SearchResult item={searchResult} onClose={clearSearch} />
        ) : (
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <Search className="size-8 text-amber-700 dark:text-amber-400" />
              <div>
                <p className="text-lg font-black">No encontramos {appliedSearch.toUpperCase()}</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Revisa la placa. Solo aparecen vehículos que continúan dentro.
                </p>
              </div>
              <Button variant="outline" onClick={clearSearch}>Limpiar búsqueda</Button>
            </CardContent>
          </Card>
        )
      ) : null}

      <section className="grid gap-3 rounded-2xl border bg-card/70 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <label
            htmlFor="public-date"
            className="flex items-center gap-2 text-sm font-black"
          >
            <CalendarDays className="size-5 text-green-600" /> Día de entrada
          </label>
          <Input
            id="public-date"
            type="date"
            value={selectedDate}
            max={getLimaDate()}
            onChange={(event) => {
              if (event.target.value) changeDate(event.target.value);
            }}
            className="h-12 text-base font-semibold"
          />
        </div>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => changeDate(getLimaDate())}
        >
          Ver hoy
        </Button>
      </section>

      {previousRows.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 sm:flex-row sm:items-center">
          <Clock3 className="size-6 shrink-0 text-amber-700 dark:text-amber-400" />
          <p className="flex-1 text-base font-semibold">
            Hay {previousRows.length} vehículo{previousRows.length === 1 ? "" : "s"} de días
            anteriores que {previousRows.length === 1 ? "sigue" : "siguen"} dentro.
          </p>
          <Button
            variant="outline"
            className="h-11 bg-background/80"
            onClick={() => setShowPrevious((current) => !current)}
          >
            {showPrevious ? "Ver solo este día" : "Mostrar en la lista"}
          </Button>
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-black">Orden actual</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            La posición se ajusta cuando un vehículo es atendido.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-green-500/10 px-3 py-1 text-sm font-black text-green-700 dark:text-green-400">
          {visibleRows.length} visibles
        </span>
      </div>

      {movements.isLoading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-9 animate-spin text-green-600" />
          <p className="text-base font-medium">Cargando el orden...</p>
        </div>
      ) : movements.isError ? (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="p-6 text-center text-base font-semibold text-destructive">
            No se pudo cargar la lista. Intenta actualizar nuevamente.
          </CardContent>
        </Card>
      ) : visibleRows.length ? (
        <div className="grid gap-3">
          {visibleRows.map((item, index) => {
            const dateKey = getLimaDate(new Date(item.fecha_entrada));
            const previousDateKey = index
              ? getLimaDate(new Date(visibleRows[index - 1].fecha_entrada))
              : null;
            return (
              <div key={item.clave_publica} className="grid gap-3">
                {showPrevious && dateKey !== previousDateKey ? (
                  <div className="flex items-center gap-3 pt-2 text-sm font-black uppercase tracking-wider text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {formatDateRibbon(item.fecha_entrada)}
                    <div className="h-px flex-1 bg-border" />
                  </div>
                ) : null}
                <VehicleCard item={item} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-card/40 p-8 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
            <CarFront className="size-8" />
          </div>
          <h2 className="text-xl font-black">No hay vehículos dentro para este día</h2>
          <p className="mt-2 text-base font-medium text-muted-foreground">
            Puedes elegir otra fecha o actualizar la lista.
          </p>
        </div>
      )}
    </div>
  );
};

export default ColaPublicaPage;

import { useState } from "react";
import {
  Banknote,
  CircleDollarSign,
  HandCoins,
  Loader2,
  Pencil,
  Power,
  PowerOff,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useActualizarAporte,
  useAportes,
  useCambiarEstadoAporte,
  useCrearAporte,
} from "@/application/hooks/use-aportes";
import type { AporteResumen } from "@/core/entities/aporte.entity";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/presentation/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const AporteStateButton = ({ aporte }: { aporte: AporteResumen }) => {
  const cambiarEstado = useCambiarEstadoAporte();
  const activating = aporte.estado === "INACTIVO";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={activating ? "default" : "outline"}
          className="h-11 flex-1"
          disabled={cambiarEstado.isPending}
        >
          {cambiarEstado.isPending ? (
            <Loader2 className="animate-spin" />
          ) : activating ? (
            <Power />
          ) : (
            <PowerOff />
          )}
          {activating ? "Activar" : "Desactivar"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {activating ? "¿Activar este aporte?" : "¿Desactivar este aporte?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activating
              ? `“${aporte.nombre}” aparecerá en la pantalla de ingresos. Si hay otro aporte activo, se desactivará automáticamente.`
              : `“${aporte.nombre}” dejará de aparecer inmediatamente en la pantalla de ingresos. Los pagos registrados se conservarán.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              cambiarEstado.mutate({ aporteId: aporte.id, activo: activating })
            }
          >
            {activating ? "Sí, activar" : "Sí, desactivar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default function AportesPage() {
  const aportes = useAportes();
  const crear = useCrearAporte();
  const actualizar = useActualizarAporte();
  const [editing, setEditing] = useState<AporteResumen | null>(null);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("50.00");

  const resetForm = () => {
    setEditing(null);
    setNombre("");
    setMonto("50.00");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(monto);
    if (nombre.trim().length < 3 || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    const onSuccess = resetForm;
    if (editing) {
      actualizar.mutate(
        { aporteId: editing.id, nombre: nombre.trim(), monto: parsedAmount },
        { onSuccess },
      );
      return;
    }
    crear.mutate({ nombre: nombre.trim(), monto: parsedAmount }, { onSuccess });
  };

  const active = aportes.data?.find((aporte) => aporte.estado === "ACTIVO");
  const pending = crear.isPending || actualizar.isPending;

  const startEditing = (aporte: AporteResumen) => {
    setEditing(aporte);
    setNombre(aporte.nombre);
    setMonto(aporte.monto.toFixed(2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <header>
        <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-primary">Recaudación</p>
        <h1 className="text-3xl font-black tracking-tight">Aportes</h1>
        <p className="mt-1 text-muted-foreground">
          Crea aportes y decide manualmente cuál se cobra en ingresos.
        </p>
      </header>

      <Card className={cn("overflow-hidden border-2", active ? "border-teal-500/30 bg-teal-500/5" : "border-dashed")}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", active ? "bg-teal-600 text-white" : "bg-muted text-muted-foreground")}>
            {active ? <HandCoins /> : <PowerOff />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Aporte de turno</p>
              {active ? <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-black text-white">ACTIVO</span> : null}
            </div>
            {active ? (
              <>
                <h2 className="text-xl font-black leading-tight">{active.nombre}</h2>
                <p className="font-bold text-teal-700 dark:text-teal-300">{money.format(active.monto)} por placa</p>
              </>
            ) : (
              <p className="font-bold">No hay un aporte activo</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="size-5 text-primary" />
            {editing ? "Editar aporte" : "Crear aporte"}
          </CardTitle>
          <CardDescription>
            Se guardará inactivo. Actívalo cuando esté listo para comenzar el cobro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="aporte-name">Nombre del aporte</Label>
              <Input id="aporte-name" value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej. Aporte comunal 2026" className="h-11" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aporte-amount">Monto (S/)</Label>
              <Input id="aporte-amount" type="number" min="0.01" step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} className="h-11" />
            </div>
            <div className="flex gap-2">
              {editing ? (
                <Button type="button" variant="outline" className="h-11" onClick={resetForm} aria-label="Cancelar edición"><RotateCcw /></Button>
              ) : null}
              <Button type="submit" className="h-11 flex-1 px-6" disabled={pending || nombre.trim().length < 3 || Number(monto) <= 0}>
                {pending ? <Loader2 className="animate-spin" /> : <Save />}
                {editing ? "Guardar" : "Crear"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-black">Historial de aportes</h2>
          <p className="text-sm text-muted-foreground">Los resultados se conservan al desactivar un aporte.</p>
        </div>

        {aportes.isLoading ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 animate-spin" />Cargando aportes...</div>
        ) : aportes.data?.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {aportes.data.map((aporte) => (
              <Card key={aporte.id} className={cn("overflow-hidden", aporte.estado === "ACTIVO" && "border-teal-500/30")}>
                <div className={cn("h-1", aporte.estado === "ACTIVO" ? "bg-teal-500" : "bg-muted")} />
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black">{aporte.nombre}</p>
                      <p className="font-bold text-primary">{money.format(aporte.monto)} por placa</p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black", aporte.estado === "ACTIVO" ? "bg-teal-600 text-white" : "bg-muted text-muted-foreground")}>{aporte.estado}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-muted/60 p-3"><Banknote className="mx-auto mb-1 size-4 text-teal-600" /><strong className="block">{aporte.pagados}</strong><span className="text-[10px] text-muted-foreground">Pagados</span></div>
                    <div className="rounded-xl bg-muted/60 p-3"><ShieldCheck className="mx-auto mb-1 size-4 text-violet-600" /><strong className="block">{aporte.preferenciales}</strong><span className="text-[10px] text-muted-foreground">Preferenciales</span></div>
                    <div className="rounded-xl bg-muted/60 p-3"><CircleDollarSign className="mx-auto mb-1 size-4 text-primary" /><strong className="block text-sm">{money.format(aporte.total_recaudado)}</strong><span className="text-[10px] text-muted-foreground">Recaudado</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="h-11" onClick={() => startEditing(aporte)}><Pencil /> Editar</Button>
                    <AporteStateButton aporte={aporte} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">
            <HandCoins className="mx-auto mb-3 size-9 opacity-30" />
            <p className="font-medium">Todavía no hay aportes</p>
          </div>
        )}
      </section>
    </div>
  );
}

import { useState } from "react";
import { BadgeCheck, Clock3, HeartHandshake, Loader2 } from "lucide-react";
import { useCorregirEstadoAporte } from "@/application/hooks/use-aportes";
import type { AporteVisualEstado } from "@/core/entities/aporte.entity";
import type {
  ReportAporteActivo,
  ReportAporteResultado,
} from "@/core/entities/report.entity";
import type { Ticket } from "@/core/entities/ticket.entity";
import { cn } from "@/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";

// Herramienta temporal para regularizar placas anteriores a la puesta en marcha.
// Cambiar a false retira la columna completa sin afectar los datos registrados.
export const ENABLE_TEMPORARY_APORTE_BACKFILL = true;

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const states: Array<{
  value: AporteVisualEstado;
  label: string;
  icon: typeof Clock3;
  activeClass: string;
}> = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
    icon: Clock3,
    activeClass:
      "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  {
    value: "PAGADO",
    label: "Pagado",
    icon: BadgeCheck,
    activeClass:
      "border-teal-500/30 bg-teal-500/15 text-teal-700 dark:text-teal-300",
  },
  {
    value: "PREFERENCIAL",
    label: "Preferencial",
    icon: HeartHandshake,
    activeClass:
      "border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
];

const RegularizarAporteTicket = ({
  ticket,
  aporte,
  resultado,
}: {
  ticket: Ticket;
  aporte: ReportAporteActivo | null;
  resultado?: ReportAporteResultado;
}) => {
  const corregir = useCorregirEstadoAporte();
  const [targetState, setTargetState] = useState<AporteVisualEstado | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const currentState: AporteVisualEstado = resultado?.estado ?? "PENDIENTE";
  const currentAmount = resultado?.monto_pagado ?? 0;
  const newAmount = targetState === "PAGADO" ? (aporte?.monto ?? 0) : 0;

  if (!aporte) {
    return (
      <span className="text-xs text-muted-foreground">Sin aporte activo</span>
    );
  }

  const resetDialog = () => {
    setTargetState(null);
    setReason("");
  };

  const closeDialog = () => {
    if (corregir.isPending) return;
    resetDialog();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!targetState || reason.trim().length < 5) return;
    corregir.mutate(
      {
        ticketId: ticket.id,
        estadoNuevo: targetState,
        motivo: reason.trim(),
      },
      { onSuccess: resetDialog },
    );
  };

  return (
    <>
      <div className="min-w-71.25">
        <div className="grid grid-cols-3 gap-1 rounded-xl border bg-muted/40 p-1">
          {states.map((state) => {
            const Icon = state.icon;
            const selected = currentState === state.value;
            return (
              <button
                key={state.value}
                type="button"
                onClick={() => !selected && setTargetState(state.value)}
                disabled={selected || corregir.isPending}
                aria-pressed={selected}
                aria-label={`${state.label}: ${ticket.placa}`}
                className={cn(
                  "flex h-9 items-center justify-center gap-1 rounded-lg border border-transparent px-2 text-[10px] font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? state.activeClass
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {state.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-center text-[10px] font-medium text-muted-foreground">
          {currentState === "PAGADO"
            ? `${money.format(currentAmount)} registrado`
            : currentState === "PREFERENCIAL"
              ? "No paga este aporte"
              : "Sin registro de aporte"}
        </p>
      </div>

      <Dialog
        open={targetState !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Confirmar corrección del aporte</DialogTitle>
              <DialogDescription>
                Este cambio actualizará la recaudación de “{aporte.nombre}” y
                quedará auditado.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {ticket.placa}
              </p>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Anterior</p>
                  <p className="font-black">{currentState}</p>
                  <p className="text-xs">{money.format(currentAmount)}</p>
                </div>
                <span className="text-muted-foreground">→</span>
                <div>
                  <p className="text-xs text-muted-foreground">Nuevo</p>
                  <p className="font-black">{targetState}</p>
                  <p className="text-xs">{money.format(newAmount)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`aporte-reason-${ticket.id}`}>
                Motivo de la corrección
              </Label>
              <textarea
                id={`aporte-reason-${ticket.id}`}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ej. Se registró el pago por error"
                maxLength={500}
                className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                autoFocus
                required
              />
              <p className="text-right text-[10px] text-muted-foreground">
                {reason.trim().length}/500 · mínimo 5
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={corregir.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={corregir.isPending || reason.trim().length < 5}
              >
                {corregir.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                Confirmar cambio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegularizarAporteTicket;

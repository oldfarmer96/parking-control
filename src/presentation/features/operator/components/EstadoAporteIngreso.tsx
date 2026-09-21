import { BadgeCheck, Banknote, HeartHandshake, Loader2 } from "lucide-react";
import { useRegistrarEstadoAportePlaca } from "@/application/hooks/use-aportes";
import type { AportePlacaEstado } from "@/core/entities/aporte.entity";
import type { IngresoVehiculoConAporte } from "@/core/entities/ingreso.entity";
import { Button } from "@/presentation/components/ui/button";
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

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);

const ConfirmationButton = ({
  ingreso,
  estado,
}: {
  ingreso: IngresoVehiculoConAporte;
  estado: AportePlacaEstado;
}) => {
  const registrar = useRegistrarEstadoAportePlaca();
  const isPayment = estado === "PAGADO";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={isPayment ? "default" : "outline"}
          className="h-11 flex-1"
          disabled={registrar.isPending}
        >
          {registrar.isPending ? (
            <Loader2 className="animate-spin" />
          ) : isPayment ? (
            <Banknote />
          ) : (
            <HeartHandshake />
          )}
          {isPayment ? "Registrar pago" : "Es preferencial"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPayment ? "¿Confirmar el pago?" : "¿Marcar como preferencial?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPayment
              ? `${ingreso.placa} quedará registrado con un pago de ${formatMoney(ingreso.aporte_monto ?? 0)} para “${ingreso.aporte_nombre}”.`
              : `${ingreso.placa} no pagará “${ingreso.aporte_nombre}”. Esta preferencia solo se aplicará a este aporte.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => registrar.mutate({ ingresoId: ingreso.id, estado })}
            className={isPayment ? "" : "bg-violet-600 text-white hover:bg-violet-700"}
          >
            {isPayment ? "Sí, registrar pago" : "Sí, es preferencial"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EstadoAporteIngreso = ({ ingreso }: { ingreso: IngresoVehiculoConAporte }) => {
  if (!ingreso.aporte_id) return null;

  if (ingreso.aporte_estado === "PAGADO") {
    return (
      <div className="my-4 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/10 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
          <BadgeCheck className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-muted-foreground">{ingreso.aporte_nombre}</p>
          <p className="font-black text-teal-700 dark:text-teal-300">
            {formatMoney(ingreso.aporte_monto_pagado ?? ingreso.aporte_monto ?? 0)} pagado
          </p>
        </div>
        <span className="rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-black text-white">PAGADO</span>
      </div>
    );
  }

  if (ingreso.aporte_estado === "PREFERENCIAL") {
    return (
      <div className="my-4 flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
          <HeartHandshake className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-muted-foreground">{ingreso.aporte_nombre}</p>
          <p className="font-black text-violet-700 dark:text-violet-300">No paga este aporte</p>
        </div>
        <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-black text-white">PREFERENCIAL</span>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-muted-foreground">{ingreso.aporte_nombre}</p>
          <p className="font-black text-amber-800 dark:text-amber-300">
            {formatMoney(ingreso.aporte_monto ?? 0)} pendiente
          </p>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-800 dark:text-amber-300">NO PAGADO</span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ConfirmationButton ingreso={ingreso} estado="PAGADO" />
        <ConfirmationButton ingreso={ingreso} estado="PREFERENCIAL" />
      </div>
    </div>
  );
};

export default EstadoAporteIngreso;

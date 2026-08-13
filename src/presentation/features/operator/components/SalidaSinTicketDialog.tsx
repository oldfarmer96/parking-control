import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRegistrarSalidaSinTicket } from "@/application/hooks/use-ingresos";
import type { IngresoVehiculo } from "@/core/entities/ingreso.entity";
import { Button } from "@/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import { Label } from "@/presentation/components/ui/label";

const SalidaSinTicketDialog = ({ ingreso }: { ingreso: IngresoVehiculo }) => {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const mutation = useRegistrarSalidaSinTicket();

  const submit = () => {
    if (!motivo.trim()) return;
    mutation.mutate(
      { ingresoId: ingreso.id, motivo },
      {
        onSuccess: () => {
          setOpen(false);
          setMotivo("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="h-11 flex-1 gap-2">
          <LogOut /> Sin ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar salida sin ticket</DialogTitle>
          <DialogDescription>
            La visita de {ingreso.placa} quedará marcada en rojo en el historial.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`reason-${ingreso.id}`}>Motivo obligatorio</Label>
          <textarea
            id={`reason-${ingreso.id}`}
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            placeholder="Explica por qué salió sin generar ticket"
            className="min-h-28 w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-destructive/20"
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            className="h-11 w-full sm:w-auto"
            disabled={!motivo.trim() || mutation.isPending}
            onClick={submit}
          >
            {mutation.isPending ? "Registrando..." : "Confirmar salida sin ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalidaSinTicketDialog;

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { useConfig } from "@/application/hooks/use-config";
import { useGenerarTicketDesdeIngreso } from "@/application/hooks/use-ingresos";
import type { IngresoVehiculo } from "@/core/entities/ingreso.entity";
import type { TicketStatus } from "@/core/entities/ticket.entity";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

interface Props {
  ingreso: IngresoVehiculo;
}

const GenerarTicketIngresoDialog = ({ ingreso }: Props) => {
  const [open, setOpen] = useState(false);
  const [estado, setEstado] = useState<TicketStatus>("PAGADO");
  const [notas, setNotas] = useState("");
  const { data: config } = useConfig();
  const mutation = useGenerarTicketDesdeIngreso();
  const requiresNotes = estado === "NO_PAGADO" || estado === "ANULADO";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEstado("PAGADO");
      setNotas("");
    }
  };

  const submit = () => {
    if (!config || (requiresNotes && !notas.trim())) return;
    mutation.mutate(
      {
        ingresoId: ingreso.id,
        montoCobrado: Number(config.precio_defecto),
        estado,
        notas,
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-11 flex-1 gap-2">
          <ReceiptText /> Generar ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salida de {ingreso.placa}</DialogTitle>
          <DialogDescription>
            Se creará el ticket y el vehículo pasará al historial.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Placa</p>
            <p className="font-black tracking-widest">{ingreso.placa}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monto</p>
            <p className="font-black">
              {config ? `S/. ${Number(config.precio_defecto).toFixed(2)}` : "Cargando..."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Estado del ticket</Label>
          <Select value={estado} onValueChange={(value) => setEstado(value as TicketStatus)}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAGADO">Pagado</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="NO_PAGADO">No pagado</SelectItem>
              <SelectItem value="ANULADO">Anulado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`ticket-notes-${ingreso.id}`}>
            Notas {requiresNotes ? "(obligatorias)" : "(opcionales)"}
          </Label>
          <textarea
            id={`ticket-notes-${ingreso.id}`}
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
            className="min-h-24 w-full rounded-xl border bg-background p-3 outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <DialogFooter>
          <Button
            className="h-11 w-full sm:w-auto"
            disabled={!config || mutation.isPending || (requiresNotes && !notas.trim())}
            onClick={submit}
          >
            {mutation.isPending ? "Generando..." : "Confirmar ticket y salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerarTicketIngresoDialog;

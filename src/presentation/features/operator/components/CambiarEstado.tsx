import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { ClipboardList, Loader2, Save, AlertTriangle } from "lucide-react";
import { useTickets } from "@/application/hooks/use-tickets";
import type { TicketStatus } from "@/core/entities/ticket.entity";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CambiarEstadoProps {
  ticketId: string;
  currentStatus: TicketStatus;
  currentNotas: string | null;
}

const CambiarEstado = ({
  ticketId,
  currentStatus,
  currentNotas,
}: CambiarEstadoProps) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [notas, setNotas] = useState(currentNotas || "");
  const { updateTicketMutation } = useTickets();

  const handleUpdate = () => {
    // Validation
    if (
      (status === "ANULADO" || status === "NO_PAGADO") &&
      notas.trim() === ""
    ) {
      toast.error("Debe proporcionar un motivo para este estado");
      return;
    }

    updateTicketMutation.mutate(
      {
        id: ticketId,
        dto: {
          estado: status,
          notas: notas.trim() !== "" ? notas.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  const getStatusColor = (s: TicketStatus) => {
    switch (s) {
      case "PAGADO":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "PENDIENTE":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "NO_PAGADO":
      case "ANULADO":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex-1 h-9 rounded-lg text-[10px] font-black uppercase border transition-all",
            getStatusColor(currentStatus),
          )}
        >
          {currentStatus}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl bg-card/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="text-primary" />
            Actualizar Estado
          </DialogTitle>
          <DialogDescription>
            Cambia el estado del ticket y añade una nota si es necesario.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Estado del Ticket
            </Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as TicketStatus)}
            >
              <SelectTrigger className="h-12 bg-background/50 border-primary/10">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAGADO">PAGADO</SelectItem>
                <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                <SelectItem value="NO_PAGADO">NO PAGADO</SelectItem>
                <SelectItem value="ANULADO">ANULADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notas"
                className="font-bold text-xs uppercase tracking-wider text-muted-foreground"
              >
                Notas / Motivo
              </Label>
              {(status === "ANULADO" || status === "NO_PAGADO") && (
                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                  <AlertTriangle size={10} /> Obligatorio
                </span>
              )}
            </div>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escribe el motivo del cambio..."
              className={cn(
                "w-full min-h-[100px] p-3 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none",
                (status === "ANULADO" || status === "NO_PAGADO") &&
                  notas.trim() === "" &&
                  "border-rose-500/50 ring-rose-500/10",
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-xl font-bold"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              updateTicketMutation.isPending ||
              (status === currentStatus && notas === (currentNotas || ""))
            }
            className="rounded-xl font-bold gap-2 px-6 shadow-lg shadow-primary/20"
          >
            {updateTicketMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Actualizar Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CambiarEstado;

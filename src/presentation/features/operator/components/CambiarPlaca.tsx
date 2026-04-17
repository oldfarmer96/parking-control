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
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Car, Edit2, Loader2, Save } from "lucide-react";
import { useTickets } from "@/application/hooks/use-tickets";

interface CambiarPlacaProps {
  ticketId: string;
  currentPlaca: string;
}

const CambiarPlaca = ({ ticketId, currentPlaca }: CambiarPlacaProps) => {
  const [open, setOpen] = useState(false);
  const [newPlaca, setNewPlaca] = useState(currentPlaca);
  const { updateTicketMutation } = useTickets();

  const handleUpdate = () => {
    if (!newPlaca || newPlaca.trim() === "" || newPlaca === currentPlaca) {
      setOpen(false);
      return;
    }

    updateTicketMutation.mutate(
      {
        id: ticketId,
        dto: { placa: newPlaca.toUpperCase().trim() },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 h-9 rounded-lg text-[10px] font-bold gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Edit2 size={12} /> Editar Placa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl bg-card/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="text-primary" />
            Actualizar Placa
          </DialogTitle>
          <DialogDescription>
            Modifica el número de placa del vehículo. Asegúrate de que sea el
            correcto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="placa" className="text-right font-bold">
              Nueva Placa
            </Label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                id="placa"
                value={newPlaca}
                onChange={(e) => setNewPlaca(e.target.value.toUpperCase())}
                placeholder="ABC-123"
                className="pl-10 h-14 text-2xl font-black tracking-widest uppercase bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20 focus-visible:ring-primary/20"
                autoFocus
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
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
              newPlaca === currentPlaca ||
              !newPlaca
            }
            className="rounded-xl font-bold gap-2 px-6 shadow-lg shadow-primary/20"
          >
            {updateTicketMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CambiarPlaca;

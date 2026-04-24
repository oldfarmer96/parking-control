import { useResetTickets } from "@/application/hooks/useResetTickets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
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
import { Ticket, AlertTriangle } from "lucide-react";

export default function ConfiguracionTicketPage() {
  const resetTicketsMutation = useResetTickets();

  const handleReset = () => {
    resetTicketsMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Configuración de Tickets
        </h2>
        <p className="text-muted-foreground">
          Administra la secuencia y numeración de los tickets del sistema.
        </p>
      </div>

      <Card className="border-destructive/20 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones críticas que afectan la numeración de los tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="space-y-1">
              <h4 className="font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                Reiniciar Conteo de Tickets
              </h4>
              <p className="text-sm text-muted-foreground">
                Esta acción reiniciará la secuencia de los tickets a 1. Útil
                para iniciar un nuevo ciclo (ej. nuevo día, nuevo mes).
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={resetTicketsMutation.isPending}
                >
                  {resetTicketsMutation.isPending
                    ? "Reiniciando..."
                    : "Reiniciar Conteo"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Estás completamente seguro?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se reiniciará la secuencia
                    actual de los tickets y el próximo ticket generado comenzará
                    desde el número 1. Esto podría causar confusión si aún hay
                    tickets activos de la secuencia anterior.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sí, reiniciar conteo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

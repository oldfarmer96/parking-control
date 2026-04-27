import { useConfig } from "@/application/hooks/use-config";
import { useUpdateConfig } from "@/application/hooks/use-update-config";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { DollarSign, Save } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

export default function ConfiguracionTicketPage() {
  // const resetTicketsMutation = useResetTickets();
  const { data: config, isLoading: isLoadingConfig } = useConfig();
  const updateConfigMutation = useUpdateConfig();
  const [precio, setPrecio] = useState<string>("");

  useEffect(() => {
    if (config?.precio_defecto) {
      setPrecio(config.precio_defecto.toString());
    }
  }, [config]);

  // const handleReset = () => {
  //   resetTicketsMutation.mutate();
  // };

  const handleUpdatePrice = () => {
    const nuevoPrecio = parseFloat(precio);
    if (!isNaN(nuevoPrecio) && nuevoPrecio >= 0) {
      updateConfigMutation.mutate({ precio_defecto: nuevoPrecio });
    }
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

      <Card className="shadow-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tarifario General
          </CardTitle>
          <CardDescription>
            Establece el precio base por defecto para cada ticket generado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4 p-4 rounded-lg border bg-card/50">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="precio_ticket">Precio por Defecto (S/)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="precio_ticket"
                  type="number"
                  step="0.1"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-border/50"
                  placeholder="Ej: 8.00"
                />
              </div>
            </div>

            <Button
              onClick={handleUpdatePrice}
              disabled={
                updateConfigMutation.isPending ||
                isLoadingConfig ||
                precio === config?.precio_defecto?.toString()
              }
              className="h-11 px-8 gap-2 w-full sm:w-auto"
            >
              {updateConfigMutation.isPending ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Precio
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="border-destructive/20 shadow-md">
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
      </Card> */}
    </div>
  );
}

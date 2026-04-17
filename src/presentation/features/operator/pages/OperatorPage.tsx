import { useTickets } from "@/application/hooks/use-tickets";
import { useConfig } from "@/application/hooks/use-config";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PlusCircle,
  History,
  Car,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/core/entities/ticket.entity";
import CambiarPlaca from "../components/CambiarPlaca";
import CambiarEstado from "../components/CambiarEstado";

// Zod Schema
const ticketSchema = z
  .object({
    placa: z
      .string()
      .min(3, "La placa debe tener al menos 3 caracteres")
      .toUpperCase(),
    monto_cobrado: z.coerce.number().min(0, "El monto debe ser positivo"),
    estado: z.enum(["PAGADO", "PENDIENTE", "NO_PAGADO", "ANULADO"]),
    notas: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.estado === "ANULADO" || data.estado === "NO_PAGADO") &&
        (!data.notas || data.notas.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Se requiere una nota para estados de Anulado o No Pagado",
      path: ["notas"],
    },
  );

// type TicketFormValues = z.infer<typeof ticketSchema>;
type TicketFormInput = z.input<typeof ticketSchema>;
type TicketFormValues = z.output<typeof ticketSchema>;

const OperatorPage = () => {
  const [activeTab, setActiveTab] = useState<"create" | "list">("create");
  const { ticketsQuery, createTicketMutation } = useTickets();
  const { data: config } = useConfig();
  // const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketFormInput, unknown, TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      estado: "PAGADO",
      monto_cobrado: config?.precio_defecto || 8,
    },
  });

  const currentStatus = watch("estado");

  // Sync default price when config loads
  useState(() => {
    if (config?.precio_defecto) {
      setValue("monto_cobrado", config.precio_defecto);
    }
  });

  const onSubmit = (data: TicketFormValues) => {
    createTicketMutation.mutate(data, {
      onSuccess: () => {
        reset({
          placa: "",
          estado: "PAGADO",
          monto_cobrado: config?.precio_defecto || 0,
          notas: "",
        });
        setActiveTab("list");
      },
    });
  };

  // const handleUpdateStatus = (id: string, currentPlaca: string, currentNotas: string | null) => {
  //     // In a real app, we'd open a dialog. Here we'll do a simple prompt for the sake of completion
  //     // but let's implement a small "inline edit" state if possible.
  //     // For now, let's keep it simple as requested.
  // };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Mobile Custom Tabs */}
      <div className="flex p-1 bg-muted rounded-2xl border border-border/50 shadow-inner">
        <button
          onClick={() => setActiveTab("create")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-bold text-sm",
            activeTab === "create"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo Ticket
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-bold text-sm",
            activeTab === "list"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <History className="w-4 h-4" />
          Hoy ({ticketsQuery.data?.length || 0})
        </button>
      </div>

      {activeTab === "create" ? (
        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="text-primary" />
              Ingreso de Vehículo
            </CardTitle>
            <CardDescription>
              Completa los datos para el nuevo ticket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="placa">Número de Placa</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="placa"
                    {...register("placa")}
                    placeholder="ABC-123"
                    className="pl-10 h-14 text-2xl font-black tracking-widest uppercase bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                {errors.placa && (
                  <p className="text-xs text-destructive animate-in shake">
                    {errors.placa.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto_cobrado">Precio (S/.)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input
                      id="monto_cobrado"
                      type="number"
                      step="0.1"
                      disabled
                      {...register("monto_cobrado")}
                      className="pl-10 h-12 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado Inicial</Label>
                  <Select
                    defaultValue="PAGADO"
                    onValueChange={(val) =>
                      setValue("estado", val as TicketStatus)
                    }
                  >
                    <SelectTrigger className="h-12 bg-background/50 border-primary/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAGADO">Pagado</SelectItem>
                      <SelectItem value="PENDIENTE">Por Pagar</SelectItem>
                      <SelectItem value="NO_PAGADO">Se Escapó</SelectItem>
                      <SelectItem value="ANULADO">Anulado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas / Observaciones</Label>
                <div className="relative">
                  <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                  <textarea
                    id="notas"
                    {...register("notas")}
                    placeholder="Agrega alguna nota importante aquí..."
                    className={cn(
                      "w-full min-h-[100px] pl-10 pt-2 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.notas &&
                        "border-destructive/50 ring-destructive/10",
                    )}
                  />
                </div>
                {errors.notas && (
                  <p className="text-xs text-destructive animate-in shake">
                    {errors.notas.message}
                  </p>
                )}
                {(currentStatus === "ANULADO" ||
                  currentStatus === "NO_PAGADO") && (
                  <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                    <AlertCircle size={10} /> Nota obligatoria para este estado.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 group hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {createTicketMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="mr-2 group-hover:rotate-90 transition-transform" />
                    Generar Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold flex items-center gap-2">
              <History className="text-primary" />
              Recientes de hoy
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Auto-actualizado
            </span>
          </div>

          <div className="space-y-4">
            {ticketsQuery.isLoading ? (
              <div className="p-10 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="font-medium animate-pulse">Cargando tickets...</p>
              </div>
            ) : ticketsQuery.data?.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Search className="w-10 h-10 opacity-20" />
                <p className="font-medium">No hay tickets hoy</p>
              </div>
            ) : (
              ticketsQuery.data?.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="border-none shadow-lg bg-card/40 backdrop-blur-md overflow-hidden animate-in fade-in duration-500 group"
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-1.5 h-full",
                      ticket.estado === "PAGADO"
                        ? "bg-emerald-500"
                        : ticket.estado === "PENDIENTE"
                          ? "bg-amber-500"
                          : "bg-rose-500",
                    )}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center font-black text-xs text-primary border border-primary/10">
                          #{String(ticket.numero_ticket).padStart(4, "0")}
                        </div>
                        <div>
                          <p className="text-xl font-black tracking-widest uppercase">
                            {ticket.placa}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {new Date(ticket.fecha_creacion).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">
                          S/. {ticket.monto_cobrado.toFixed(2)}
                        </p>
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                            ticket.estado === "PAGADO"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : ticket.estado === "PENDIENTE"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-600",
                          )}
                        >
                          {ticket.estado}
                        </span>
                      </div>
                    </div>

                    {ticket.notas && (
                      <div className="mt-3 p-2 bg-muted/50 rounded-lg text-[10px] text-muted-foreground italic flex items-center gap-2">
                        <ClipboardList size={12} className="shrink-0" />
                        <span className="truncate">{ticket.notas}</span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <CambiarPlaca
                        ticketId={ticket.id}
                        currentPlaca={ticket.placa}
                      />
                      <CambiarEstado
                        ticketId={ticket.id}
                        currentStatus={ticket.estado}
                        currentNotas={ticket.notas}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorPage;

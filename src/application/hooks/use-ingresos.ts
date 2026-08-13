import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CrearIngresoDTO,
  GenerarTicketDesdeIngresoDTO,
  HistorialIngresosFilters,
  SalidaSinTicketDTO,
} from "@/core/entities/ingreso.entity";
import { ingresoApi } from "@/infrastructure/api/ingreso.api";

const invalidateIngresos = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
    queryClient.invalidateQueries({ queryKey: ["cola-publica"] }),
  ]);

export const useIngresosActivos = () =>
  useQuery({
    queryKey: ["ingresos", "activos"],
    queryFn: ingresoApi.getActivos,
    refetchInterval: 15_000,
  });

export const useIngresosHistorial = (
  filters: HistorialIngresosFilters,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["ingresos", "historial", filters],
    queryFn: () => ingresoApi.getHistorial(filters),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useColaPublica = () =>
  useQuery({
    queryKey: ["cola-publica"],
    queryFn: ingresoApi.getColaPublica,
    refetchInterval: 15_000,
  });

export const useMovimientosPublicos = (fecha: string) =>
  useQuery({
    queryKey: ["cola-publica", "movimientos", fecha],
    queryFn: () => ingresoApi.getMovimientosPublicos(fecha),
    refetchInterval: 15_000,
  });

export const useRegistrarIngreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearIngresoDTO) => ingresoApi.registrar(dto),
    onSuccess: async () => {
      await invalidateIngresos(queryClient);
      toast.success("Entrada registrada correctamente");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useGenerarTicketDesdeIngreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: GenerarTicketDesdeIngresoDTO) =>
      ingresoApi.generarTicket(dto),
    onSuccess: async () => {
      await Promise.all([
        invalidateIngresos(queryClient),
        queryClient.invalidateQueries({ queryKey: ["tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ]);
      toast.success("Ticket generado y salida registrada");
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useRegistrarSalidaSinTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SalidaSinTicketDTO) =>
      ingresoApi.registrarSalidaSinTicket(dto),
    onSuccess: async () => {
      await invalidateIngresos(queryClient);
      toast.success("Salida sin ticket registrada");
    },
    onError: (error) => toast.error(error.message),
  });
};

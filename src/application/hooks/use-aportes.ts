import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ActualizarAporteDTO,
  CambiarEstadoAporteDTO,
  GuardarAporteDTO,
  RegistrarEstadoAportePlacaDTO,
} from "@/core/entities/aporte.entity";
import { aporteApi } from "@/infrastructure/api/aporte.api";

export const useAportes = () =>
  useQuery({
    queryKey: ["aportes"],
    queryFn: aporteApi.listar,
  });

const useAporteMutation = <T,>(
  mutationFn: (dto: T) => Promise<unknown>,
  successMessage: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["aportes"] }),
        queryClient.invalidateQueries({ queryKey: ["ingresos", "activos"] }),
      ]);
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useCrearAporte = () =>
  useAporteMutation<GuardarAporteDTO>(aporteApi.crear, "Aporte creado");

export const useActualizarAporte = () =>
  useAporteMutation<ActualizarAporteDTO>(
    aporteApi.actualizar,
    "Aporte actualizado",
  );

export const useCambiarEstadoAporte = () =>
  useAporteMutation<CambiarEstadoAporteDTO>(
    aporteApi.cambiarEstado,
    "Estado del aporte actualizado",
  );

export const useRegistrarEstadoAportePlaca = () =>
  useAporteMutation<RegistrarEstadoAportePlacaDTO>(
    aporteApi.registrarEstadoPlaca,
    "Estado del aporte registrado",
  );

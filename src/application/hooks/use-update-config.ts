import { useMutation, useQueryClient } from "@tanstack/react-query";
import { configApi } from "@/infrastructure/api/config.api";
import type { AppConfig } from "@/core/entities/ticket.entity";
import { toast } from "sonner";

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<AppConfig>) => configApi.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
      toast.success("Configuración actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la configuración");
    },
  });
};

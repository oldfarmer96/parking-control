import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/infrastructure/api/profile.api";
import { toast } from "sonner";

export const useUpdateProfileStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: boolean }) =>
      profileApi.updateStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Estado de usuario actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el estado");
    },
  });
};

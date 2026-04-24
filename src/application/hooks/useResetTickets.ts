import { ticketApi } from "@/infrastructure/api/ticket.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useResetTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketApi.reiniciarSecuenciaTickets(),
    onSuccess: () => {
      // Opcional: Refrescar datos del dashboard si es necesario
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      alert("¡Éxito! El próximo ticket iniciará en 1.");
    },
    onError: (error) => {
      alert("Hubo un error al reiniciar los tickets: " + error.message);
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketApi } from "@/infrastructure/api/ticket.api";
import type { CreateTicketDTO, UpdateTicketDTO } from "@/core/entities/ticket.entity";
import { toast } from "sonner";

export const useTickets = () => {
  const queryClient = useQueryClient();

  const ticketsQuery = useQuery({
    queryKey: ["tickets", "today"],
    queryFn: () => ticketApi.getTodayTickets(),
  });

  const createTicketMutation = useMutation({
    mutationFn: (dto: CreateTicketDTO) => ticketApi.createTicket(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "today"] });
      toast.success("Ticket creado correctamente");
    },
    onError: (err) => {
      toast.error("Error al crear ticket: " + err.message);
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTicketDTO }) => 
      ticketApi.updateTicket(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "today"] });
      toast.success("Ticket actualizado correctamente");
    },
    onError: (err) => {
       toast.error("Error al actualizar ticket: " + err.message);
    }
  });

  return {
    ticketsQuery,
    createTicketMutation,
    updateTicketMutation
  };
};

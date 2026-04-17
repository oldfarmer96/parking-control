import { supabase } from "@/config/supabase";
import type { Ticket, CreateTicketDTO, UpdateTicketDTO } from "@/core/entities/ticket.entity";

export const ticketApi = {
  async getTodayTickets(): Promise<Ticket[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .gte("fecha_creacion", today.toISOString())
      .order("fecha_creacion", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async createTicket(dto: CreateTicketDTO): Promise<Ticket> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        ...dto,
        operador_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateTicket(id: string, dto: UpdateTicketDTO): Promise<Ticket> {
    const { data, error } = await supabase
      .from("tickets")
      .update(dto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

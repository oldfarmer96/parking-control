import { supabase } from "@/config/supabase";
import type { ReportFilter, ReportData, ReportSummary } from "@/core/entities/report.entity";
import type { Ticket } from "@/core/entities/ticket.entity";

export const reportApi = {
  async getReportData(filter: ReportFilter): Promise<ReportData> {
    let query = supabase
      .from("tickets")
      .select(`
        *,
        perfiles (nombre_completo)
      `)
      .gte("fecha_creacion", filter.startDate)
      .lte("fecha_creacion", filter.endDate)
      .order("fecha_creacion", { ascending: false });

    if (filter.status) {
      query = query.eq("estado", filter.status);
    }

    if (filter.placa) {
      query = query.ilike("placa", `%${filter.placa}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const tickets = (data as any[]).map((t) => ({
      ...t,
      operador_nombre: t.perfiles?.nombre_completo || "Sistema",
      perfiles: undefined,
    })) as Ticket[];
    
    // Calculate summary
    const summary: ReportSummary = {
      totalTickets: tickets.length,
      totalAmount: tickets.reduce((acc, t) => t.estado === "PAGADO" ? acc + Number(t.monto_cobrado) : acc, 0),
      byStatus: {
        PAGADO: tickets.filter(t => t.estado === "PAGADO").length,
        PENDIENTE: tickets.filter(t => t.estado === "PENDIENTE").length,
        NO_PAGADO: tickets.filter(t => t.estado === "NO_PAGADO").length,
        ANULADO: tickets.filter(t => t.estado === "ANULADO").length,
      }
    };

    return { tickets, summary };
  }
};

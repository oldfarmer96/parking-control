import { supabase } from "@/config/supabase";
import type {
  ReportAporteActivo,
  ReportAporteData,
  ReportAporteResultado,
  ReportFilter,
  ReportData,
  ReportSummary,
} from "@/core/entities/report.entity";
import type { Ticket } from "@/core/entities/ticket.entity";

interface TicketQueryRow extends Ticket {
  perfiles: { nombre_completo: string | null } | null;
}

interface AporteActivoQueryRow {
  id: string;
  nombre: string;
  monto: number;
  aporte_placas: Array<Omit<ReportAporteResultado, "operador_nombre"> & {
    perfiles: { nombre_completo: string | null } | null;
  }> | null;
}

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

    const aporteQuery = supabase
      .from("aportes")
      .select(`
        id,
        nombre,
        monto,
        aporte_placas(
          id,
          placa,
          placa_normalizada,
          estado,
          monto_pagado,
          fecha_registro,
          fecha_actualizacion,
          ingreso_id,
          ticket_id,
          registrado_por,
          perfiles!aporte_placas_registrado_por_fkey(nombre_completo)
        )
      `)
      .eq("estado", "ACTIVO")
      .maybeSingle();

    const [ticketsResult, aporteResult] = await Promise.all([query, aporteQuery]);
    const { data, error } = ticketsResult;

    if (error) throw new Error(error.message);
    if (aporteResult.error) throw new Error(aporteResult.error.message);

    const tickets = ((data ?? []) as TicketQueryRow[]).map((ticket) => {
      const { perfiles, ...base } = ticket;
      return {
        ...base,
        operador_nombre: perfiles?.nombre_completo || "Sistema",
      };
    });

    const rawAporte = aporteResult.data as AporteActivoQueryRow | null;
    const resultadosAporte: ReportAporteResultado[] = (rawAporte?.aporte_placas ?? []).map(
      ({ perfiles, ...resultado }) => ({
        ...resultado,
        monto_pagado: Number(resultado.monto_pagado),
        operador_nombre: perfiles?.nombre_completo || "Sistema",
      }),
    );
    const aporteActivo: ReportAporteActivo | null = rawAporte
      ? {
          id: rawAporte.id,
          nombre: rawAporte.nombre,
          monto: Number(rawAporte.monto),
          resultados: resultadosAporte,
        }
      : null;

    const plateFilter = filter.placa?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const resultadosReporte = resultadosAporte
      .filter((resultado) => {
        const fechaEstado = new Date(resultado.fecha_actualizacion).getTime();
        return (
          fechaEstado >= new Date(filter.startDate).getTime() &&
          fechaEstado <= new Date(filter.endDate).getTime() &&
          (!plateFilter || resultado.placa_normalizada.includes(plateFilter))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.fecha_actualizacion).getTime() -
          new Date(a.fecha_actualizacion).getTime(),
      );

    const aporteReport: ReportAporteData | null = rawAporte
      ? {
          aporteId: rawAporte.id,
          nombre: rawAporte.nombre,
          monto: Number(rawAporte.monto),
          resultados: resultadosReporte,
          summary: {
            totalRegistros: resultadosReporte.length,
            pagados: resultadosReporte.filter((item) => item.estado === "PAGADO").length,
            preferenciales: resultadosReporte.filter(
              (item) => item.estado === "PREFERENCIAL",
            ).length,
            totalRecaudado: resultadosReporte.reduce(
              (total, item) => total + Number(item.monto_pagado),
              0,
            ),
          },
        }
      : null;
    
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

    return { tickets, summary, aporteActivo, aporteReport };
  }
};

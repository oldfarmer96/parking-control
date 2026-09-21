import { supabase } from "@/config/supabase";
import type {
  ColaPublicaItem,
  CrearIngresoDTO,
  GenerarTicketDesdeIngresoDTO,
  HistorialIngresosFilters,
  HistorialIngresosResult,
  IngresoVehiculo,
  IngresoVehiculoConAporte,
  MovimientoPublico,
  ResultadoTicketDesdeIngreso,
  SalidaSinTicketDTO,
} from "@/core/entities/ingreso.entity";

const normalizeRows = (rows: IngresoVehiculo[] | null) => rows ?? [];

export const ingresoApi = {
  async getActivos(): Promise<IngresoVehiculoConAporte[]> {
    const { data, error } = await supabase.rpc(
      "obtener_ingresos_activos_con_aporte",
    );

    if (error) throw new Error(error.message);
    return (data ?? []).map((row: IngresoVehiculoConAporte) => ({
      ...row,
      aporte_monto: row.aporte_monto == null ? null : Number(row.aporte_monto),
      aporte_monto_pagado:
        row.aporte_monto_pagado == null
          ? null
          : Number(row.aporte_monto_pagado),
    })) as IngresoVehiculoConAporte[];
  },

  async getHistorial(
    filters: HistorialIngresosFilters,
  ): Promise<HistorialIngresosResult> {
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    let query = supabase
      .from("ingresos_vehiculos")
      .select("*", { count: "exact" })
      .neq("estado", "DENTRO")
      .order("fecha_salida", { ascending: false })
      .range(from, to);

    const normalizedSearch = filters.placa
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    if (normalizedSearch) {
      query = query.ilike("placa_normalizada", `%${normalizedSearch}%`);
    } else if (filters.fecha) {
      const start = new Date(`${filters.fecha}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query = query
        .gte("fecha_salida", start.toISOString())
        .lt("fecha_salida", end.toISOString());
    }

    if (filters.estado !== "TODOS") {
      query = query.eq("estado", filters.estado);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return {
      rows: normalizeRows(data as IngresoVehiculo[] | null),
      total: count ?? 0,
    };
  },

  async registrar(dto: CrearIngresoDTO): Promise<IngresoVehiculo> {
    const { data, error } = await supabase.rpc("registrar_ingreso_vehiculo", {
      p_placa: dto.placa,
      p_fecha_entrada: new Date(dto.fechaEntrada).toISOString(),
    });

    if (error) throw new Error(error.message);
    return data as IngresoVehiculo;
  },

  async generarTicket(
    dto: GenerarTicketDesdeIngresoDTO,
  ): Promise<ResultadoTicketDesdeIngreso> {
    const { data, error } = await supabase.rpc("generar_ticket_desde_ingreso", {
      p_ingreso_id: dto.ingresoId,
      p_monto_cobrado: dto.montoCobrado,
      p_estado: dto.estado,
      p_notas: dto.notas?.trim() || null,
    });

    if (error) throw new Error(error.message);
    return data as ResultadoTicketDesdeIngreso;
  },

  async registrarSalidaSinTicket(
    dto: SalidaSinTicketDTO,
  ): Promise<IngresoVehiculo> {
    const { data, error } = await supabase.rpc("registrar_salida_sin_ticket", {
      p_ingreso_id: dto.ingresoId,
      p_motivo: dto.motivo,
    });

    if (error) throw new Error(error.message);
    return data as IngresoVehiculo;
  },

  async getColaPublica(): Promise<ColaPublicaItem[]> {
    const { data, error } = await supabase.rpc("obtener_cola_publica");
    if (error) throw new Error(error.message);
    return (data ?? []) as ColaPublicaItem[];
  },

  async getMovimientosPublicos(fecha: string): Promise<MovimientoPublico[]> {
    const { data, error } = await supabase.rpc("obtener_movimientos_publicos", {
      p_fecha: fecha,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as MovimientoPublico[];
  },
};

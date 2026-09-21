import { supabase } from "@/config/supabase";
import type {
  ActualizarAporteDTO,
  Aporte,
  AportePlaca,
  AporteResumen,
  CambiarEstadoAporteDTO,
  CorregirEstadoAporteDTO,
  GuardarAporteDTO,
  RegistrarEstadoAporteDesdeTicketDTO,
  RegistrarEstadoAportePlacaDTO,
  ResultadoCorreccionAporte,
} from "@/core/entities/aporte.entity";

type AporteConResultados = Aporte & {
  aporte_placas: Array<{ estado: string; monto_pagado: number }> | null;
};

export const aporteApi = {
  async listar(): Promise<AporteResumen[]> {
    const { data, error } = await supabase
      .from("aportes")
      .select("*, aporte_placas(estado, monto_pagado)")
      .order("fecha_creacion", { ascending: false });

    if (error) throw new Error(error.message);

    return ((data ?? []) as AporteConResultados[]).map((aporte) => {
      const { aporte_placas, ...base } = aporte;
      const resultados = aporte_placas ?? [];
      return {
        ...base,
        monto: Number(aporte.monto),
        pagados: resultados.filter((item) => item.estado === "PAGADO").length,
        preferenciales: resultados.filter((item) => item.estado === "PREFERENCIAL").length,
        total_recaudado: resultados.reduce(
          (total, item) => total + Number(item.monto_pagado),
          0,
        ),
      };
    });
  },

  async crear(dto: GuardarAporteDTO): Promise<Aporte> {
    const { data, error } = await supabase.rpc("crear_aporte", {
      p_nombre: dto.nombre,
      p_monto: dto.monto,
    });
    if (error) throw new Error(error.message);
    return data as Aporte;
  },

  async actualizar(dto: ActualizarAporteDTO): Promise<Aporte> {
    const { data, error } = await supabase.rpc("actualizar_aporte", {
      p_aporte_id: dto.aporteId,
      p_nombre: dto.nombre,
      p_monto: dto.monto,
    });
    if (error) throw new Error(error.message);
    return data as Aporte;
  },

  async cambiarEstado(dto: CambiarEstadoAporteDTO): Promise<Aporte> {
    const { data, error } = await supabase.rpc("establecer_estado_aporte", {
      p_aporte_id: dto.aporteId,
      p_activo: dto.activo,
    });
    if (error) throw new Error(error.message);
    return data as Aporte;
  },

  async registrarEstadoPlaca(
    dto: RegistrarEstadoAportePlacaDTO,
  ): Promise<AportePlaca> {
    const { data, error } = await supabase.rpc(
      "registrar_estado_aporte_placa",
      {
        p_ingreso_id: dto.ingresoId,
        p_estado: dto.estado,
      },
    );
    if (error) throw new Error(error.message);
    return data as AportePlaca;
  },

  async registrarEstadoDesdeTicket(
    dto: RegistrarEstadoAporteDesdeTicketDTO,
  ): Promise<AportePlaca> {
    const { data, error } = await supabase.rpc(
      "registrar_estado_aporte_desde_ticket",
      {
        p_ticket_id: dto.ticketId,
        p_estado: dto.estado,
      },
    );
    if (error) throw new Error(error.message);
    return data as AportePlaca;
  },

  async corregirEstadoDesdeTicket(
    dto: CorregirEstadoAporteDTO,
  ): Promise<ResultadoCorreccionAporte> {
    const { data, error } = await supabase.rpc(
      "corregir_estado_aporte_desde_ticket",
      {
        p_ticket_id: dto.ticketId,
        p_estado_nuevo: dto.estadoNuevo,
        p_motivo: dto.motivo,
      },
    );
    if (error) throw new Error(error.message);
    return data as ResultadoCorreccionAporte;
  },
};

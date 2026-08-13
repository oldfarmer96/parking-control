import type { Ticket, TicketStatus } from "@/core/entities/ticket.entity";

export type IngresoEstado =
  | "DENTRO"
  | "SALIO_CON_TICKET"
  | "SALIO_SIN_TICKET";

export interface IngresoVehiculo {
  id: string;
  orden_llegada: number;
  placa: string;
  placa_normalizada: string;
  estado: IngresoEstado;
  fecha_entrada: string;
  fecha_salida: string | null;
  ticket_id: string | null;
  motivo_sin_ticket: string | null;
  creado_por: string;
  atendido_por: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ColaPublicaItem {
  posicion: number;
  placa: string;
  fecha_entrada: string;
}

export interface MovimientoPublico {
  clave_publica: string;
  orden_dia: number | null;
  posicion_actual: number | null;
  placa: string;
  estado: IngresoEstado;
  fecha_entrada: string;
  fecha_salida: string | null;
  es_anterior: boolean;
}

export interface CrearIngresoDTO {
  placa: string;
  fechaEntrada: string;
}

export interface GenerarTicketDesdeIngresoDTO {
  ingresoId: string;
  montoCobrado: number;
  estado: TicketStatus;
  notas?: string;
}

export interface SalidaSinTicketDTO {
  ingresoId: string;
  motivo: string;
}

export interface HistorialIngresosFilters {
  placa: string;
  fecha: string;
  estado: "TODOS" | Exclude<IngresoEstado, "DENTRO">;
  page: number;
  pageSize: number;
}

export interface HistorialIngresosResult {
  rows: IngresoVehiculo[];
  total: number;
}

export type ResultadoTicketDesdeIngreso = Ticket;

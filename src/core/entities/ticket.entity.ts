export type TicketStatus = "PAGADO" | "PENDIENTE" | "NO_PAGADO" | "ANULADO";

export interface Ticket {
  id: string;
  numero_ticket: number;
  placa: string;
  monto_cobrado: number;
  estado: TicketStatus;
  notas: string | null;
  operador_id: string;
  fecha_creacion: string;
}

export interface CreateTicketDTO {
  placa: string;
  monto_cobrado: number;
  estado: TicketStatus;
  notas?: string;
}

export interface UpdateTicketDTO {
  placa?: string;
  estado?: TicketStatus;
  notas?: string;
}

export interface AppConfig {
  id: number;
  nombre_empresa: string;
  precio_defecto: number;
  fecha_actualizacion: string;
}

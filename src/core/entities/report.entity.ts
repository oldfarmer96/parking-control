import type { Ticket } from "./ticket.entity";
import type { AportePlacaEstado } from "./aporte.entity";

export interface ReportFilter {
  startDate: string;
  endDate: string;
  status?: Ticket["estado"];
  placa?: string;
}

export interface ReportSummary {
  totalTickets: number;
  totalAmount: number;
  byStatus: Record<Ticket["estado"], number>;
}

export interface ReportData {
  tickets: Ticket[];
  summary: ReportSummary;
  aporteActivo: ReportAporteActivo | null;
  aporteReport: ReportAporteData | null;
}

export interface ReportAporteResultado {
  id: string;
  placa: string;
  placa_normalizada: string;
  estado: AportePlacaEstado;
  monto_pagado: number;
  fecha_registro: string;
  fecha_actualizacion: string;
  ingreso_id: string | null;
  ticket_id: string | null;
  registrado_por: string;
  operador_nombre: string;
}

export interface ReportAporteActivo {
  id: string;
  nombre: string;
  monto: number;
  resultados: ReportAporteResultado[];
}

export interface ReportAporteSummary {
  totalRegistros: number;
  pagados: number;
  preferenciales: number;
  totalRecaudado: number;
}

export interface ReportAporteData {
  aporteId: string;
  nombre: string;
  monto: number;
  resultados: ReportAporteResultado[];
  summary: ReportAporteSummary;
}

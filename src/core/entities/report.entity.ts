import type { Ticket } from "./ticket.entity";

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
}

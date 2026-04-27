import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Ticket } from "@/core/entities/ticket.entity";

export const exportToExcel = (tickets: Ticket[], fileName = "reporte-tickets") => {
  const data = tickets.map(t => ({
    "N° Ticket": t.numero_ticket,
    "Placa": t.placa,
    "Monto": t.estado === "PAGADO" ? t.monto_cobrado : 0,
    "Fecha": format(new Date(t.fecha_creacion), "dd/MM/yyyy HH:mm"),
    "Estado": t.estado,
    "Operador": t.operador_nombre || "Sistema",
    "Notas": t.notas || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
  
  // Download file
  XLSX.writeFile(workbook, `${fileName}-${format(new Date(), "yyyyMMdd-HHmm")}.xlsx`);
};

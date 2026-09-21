import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Ticket } from "@/core/entities/ticket.entity";
import type { ReportAporteData } from "@/core/entities/report.entity";

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

export const exportAportesToExcel = (
  report: ReportAporteData,
  dateRange: { start: string; end: string },
) => {
  const rows = report.resultados.map((item) => ({
    Placa: item.placa,
    Estado: item.estado,
    "Monto pagado (S/)": item.monto_pagado,
    "Fecha/Hora del estado": format(
      new Date(item.fecha_actualizacion),
      "dd/MM/yyyy HH:mm",
    ),
    "Fecha/Hora de registro": format(
      new Date(item.fecha_registro),
      "dd/MM/yyyy HH:mm",
    ),
    Operador: item.operador_nombre,
    Origen: item.ingreso_id ? "Ingresos" : item.ticket_id ? "Reportes" : "Sistema",
  }));

  const detailSheet = XLSX.utils.json_to_sheet(rows);
  detailSheet["!cols"] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
    { wch: 24 },
    { wch: 28 },
    { wch: 14 },
  ];
  if (rows.length > 0) {
    detailSheet["!autofilter"] = { ref: `A1:G${rows.length + 1}` };
  }

  const summaryRows: Array<[string, string | number]> = [
    ["Aporte", report.nombre],
    ["Monto configurado (S/)", report.monto],
    ["Periodo", `${format(new Date(dateRange.start), "dd/MM/yyyy")} al ${format(new Date(dateRange.end), "dd/MM/yyyy")}`],
    ["Registros", report.summary.totalRegistros],
    ["Pagados", report.summary.pagados],
    ["Preferenciales", report.summary.preferenciales],
    ["Total recaudado (S/)", report.summary.totalRecaudado],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["RESUMEN DEL APORTE EN CURSO"],
    [],
    ...summaryRows,
  ]);
  summarySheet["!cols"] = [{ wch: 26 }, { wch: 36 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
  XLSX.utils.book_append_sheet(workbook, detailSheet, "Detalle");
  XLSX.writeFile(
    workbook,
    `reporte-aporte-${format(new Date(), "yyyyMMdd-HHmm")}.xlsx`,
  );
};

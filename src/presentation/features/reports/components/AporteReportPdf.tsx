import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { ReportAporteData } from "@/core/entities/report.entity";

const styles = StyleSheet.create({
  page: { padding: 36, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: { borderBottomWidth: 2, borderBottomColor: "#0f766e", paddingBottom: 12 },
  company: { fontSize: 17, fontWeight: "bold", color: "#134e4a" },
  title: { marginTop: 5, fontSize: 11, color: "#475569" },
  meta: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  metaText: { fontSize: 8, color: "#64748b" },
  summary: { flexDirection: "row", gap: 10, marginVertical: 18 },
  summaryCard: { flex: 1, padding: 9, backgroundColor: "#f0fdfa", borderLeftWidth: 3, borderLeftColor: "#14b8a6" },
  summaryLabel: { fontSize: 7, color: "#64748b", textTransform: "uppercase" },
  summaryValue: { marginTop: 4, fontSize: 12, fontWeight: "bold", color: "#134e4a" },
  tableHeader: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 4, backgroundColor: "#134e4a" },
  tableRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", alignItems: "center" },
  headerText: { fontSize: 7, fontWeight: "bold", color: "#ffffff" },
  rowText: { fontSize: 7, color: "#334155" },
  placa: { width: "14%" },
  estado: { width: "16%" },
  monto: { width: "13%" },
  fecha: { width: "20%" },
  operador: { width: "25%" },
  origen: { width: "12%" },
  empty: { padding: 30, textAlign: "center", fontSize: 9, color: "#64748b" },
  footer: { position: "absolute", bottom: 22, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 7 },
  footerText: { fontSize: 7, color: "#94a3b8" },
});

interface Props {
  report: ReportAporteData;
  dateRange: { start: string; end: string };
}

export const AporteReportPdf = ({ report, dateRange }: Props) => (
  <Document title={`Reporte_aporte_${format(new Date(), "yyyyMMdd")}`}>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.company}>Parqueo Huinchos Pataccocha</Text>
        <Text style={styles.title}>Reporte del aporte en curso: {report.nombre}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            PERIODO: {format(new Date(dateRange.start), "dd/MM/yyyy")} AL {format(new Date(dateRange.end), "dd/MM/yyyy")}
          </Text>
          <Text style={styles.metaText}>GENERADO: {format(new Date(), "dd/MM/yyyy HH:mm")}</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Registros</Text><Text style={styles.summaryValue}>{report.summary.totalRegistros}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Pagados</Text><Text style={styles.summaryValue}>{report.summary.pagados}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Preferenciales</Text><Text style={styles.summaryValue}>{report.summary.preferenciales}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Total recaudado</Text><Text style={styles.summaryValue}>S/ {report.summary.totalRecaudado.toFixed(2)}</Text></View>
      </View>

      <View style={styles.tableHeader} fixed>
        <Text style={[styles.placa, styles.headerText]}>PLACA</Text>
        <Text style={[styles.estado, styles.headerText]}>ESTADO</Text>
        <Text style={[styles.monto, styles.headerText]}>MONTO</Text>
        <Text style={[styles.fecha, styles.headerText]}>FECHA / HORA</Text>
        <Text style={[styles.operador, styles.headerText]}>OPERADOR</Text>
        <Text style={[styles.origen, styles.headerText]}>ORIGEN</Text>
      </View>
      {report.resultados.length === 0 ? (
        <Text style={styles.empty}>No hay movimientos del aporte para los filtros seleccionados.</Text>
      ) : report.resultados.map((item) => (
        <View key={item.id} style={styles.tableRow} wrap={false}>
          <Text style={[styles.placa, styles.rowText]}>{item.placa.toUpperCase()}</Text>
          <Text style={[styles.estado, styles.rowText, { color: item.estado === "PAGADO" ? "#047857" : "#7c3aed" }]}>{item.estado}</Text>
          <Text style={[styles.monto, styles.rowText]}>S/ {Number(item.monto_pagado).toFixed(2)}</Text>
          <Text style={[styles.fecha, styles.rowText]}>{format(new Date(item.fecha_actualizacion), "dd/MM/yyyy HH:mm")}</Text>
          <Text style={[styles.operador, styles.rowText]}>{item.operador_nombre}</Text>
          <Text style={[styles.origen, styles.rowText]}>{item.ingreso_id ? "Ingresos" : item.ticket_id ? "Reportes" : "Sistema"}</Text>
        </View>
      ))}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Sistema de Control parqueo - Huinchos Pataccocha</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

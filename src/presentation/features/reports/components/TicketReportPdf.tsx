import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Ticket } from "@/core/entities/ticket.entity";
import type { ReportSummary } from "@/core/entities/report.entity";

const styles = StyleSheet.create({
  page: { padding: 50, backgroundColor: "#FFFFFF", fontFamily: "Helvetica" },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#1a365d",
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a365d",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reportTitle: {
    fontSize: 12,
    color: "#4a5568",
    marginTop: 5,
    fontWeight: "medium",
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    alignItems: "flex-end",
  },
  periodText: { fontSize: 9, color: "#718096" },

  summaryContainer: { flexDirection: "row", marginBottom: 35, gap: 15 },
  summaryCard: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 2,
    borderLeft: 3,
    borderLeftColor: "#3182ce",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryValue: { fontSize: 14, fontWeight: "bold", color: "#1e293b" },

  table: { marginTop: 10 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1a365d",
    borderTopWidth: 1.5,
    borderTopColor: "#1a365d",
    padding: 8,
    marginBottom: 5,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },

  col1: { width: "12%" },
  col2: { width: "18%" },
  col3: { width: "25%" },
  col4: { width: "20%" },
  col5: { width: "25%" },

  headerText: { fontSize: 9, fontWeight: "bold", color: "#1a365d" },
  rowText: { fontSize: 8, color: "#2d3748" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: "#a0aec0" },
});

interface Props {
  tickets: Ticket[];
  summary: ReportSummary;
  dateRange: { start: string; end: string };
}

export const TicketReportPdf = ({ tickets, summary, dateRange }: Props) => (
  <Document title={`Reporte_${format(new Date(), "yyyyMMdd")}`}>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.companyName}>
          Unidad Minera Huinchos Pataccocha
        </Text>
        <Text style={styles.reportTitle}>
          Control de Accesos y Parqueo - Reporte de Operaciones
        </Text>
        <View style={styles.headerMeta}>
          <Text style={styles.periodText}>
            PERIODO: {format(new Date(dateRange.start), "dd/MM/yyyy")} AL{" "}
            {format(new Date(dateRange.end), "dd/MM/yyyy")}
          </Text>
          <Text style={styles.periodText}>
            GENERADO: {format(new Date(), "dd/MM/yyyy HH:mm")}
          </Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Tickets Procesados</Text>
          <Text style={styles.summaryValue}>
            {summary.totalTickets} Unidades
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#38a169" }]}>
          <Text style={styles.summaryLabel}>Ingresos Totales (Soles)</Text>
          <Text style={styles.summaryValue}>
            S/ {summary.totalAmount.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#e53e3e" }]}>
          <Text style={styles.summaryLabel}>Incidentes / No Pagados</Text>
          <Text style={styles.summaryValue}>
            {summary.byStatus.NO_PAGADO} Casos
          </Text>
        </View>
      </View>

      {/* Data Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.headerText]}>N° TICKET</Text>
          <Text style={[styles.col2, styles.headerText]}>PLACA</Text>
          <Text style={[styles.col3, styles.headerText]}>FECHA / HORA</Text>
          <Text style={[styles.col4, styles.headerText]}>MONTO (S/)</Text>
          <Text style={[styles.col5, styles.headerText]}>ESTADO</Text>
        </View>

        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.tableRow} wrap={false}>
            <Text style={[styles.col1, styles.rowText]}>
              #{ticket.numero_ticket}
            </Text>
            <Text style={[styles.col2, styles.rowText, { fontWeight: "bold" }]}>
              {ticket.placa.toUpperCase()}
            </Text>
            <Text style={[styles.col3, styles.rowText]}>
              {format(new Date(ticket.fecha_creacion), "dd/MM/yy HH:mm")}
            </Text>
            <Text style={[styles.col4, styles.rowText]}>
              S/ {ticket.estado === "PAGADO" ? Number(ticket.monto_cobrado).toFixed(2) : "0.00"}
            </Text>
            <Text
              style={[
                styles.col5,
                styles.rowText,
                {
                  color:
                    ticket.estado === "PAGADO"
                      ? "#2f855a"
                      : ticket.estado === "PENDIENTE"
                        ? "#c05621"
                        : "#c53030",
                },
              ]}
            >
              {ticket.estado}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Sistema de Control parqueo - Huinchos Pataccocha
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);

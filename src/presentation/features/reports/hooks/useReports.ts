import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/infrastructure/api/report.api";
import type { ReportFilter } from "@/core/entities/report.entity";
import { useState } from "react";
import { startOfDay, endOfDay } from "date-fns";

export const useReports = () => {
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: startOfDay(new Date()).toISOString(),
    endDate: endOfDay(new Date()).toISOString(),
  });

  const reportQuery = useQuery({
    queryKey: ["reports", filters],
    queryFn: () => reportApi.getReportData(filters),
  });

  const updateFilters = (newFilters: Partial<ReportFilter>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };

      // Ensure dates are parsed correctly as local time
      if (newFilters.startDate) {
        // e.target.value is YYYY-MM-DD, adding T00:00:00 makes it local
        const date = new Date(newFilters.startDate.split("T")[0] + "T00:00:00");
        updated.startDate = startOfDay(date).toISOString();
      }

      if (newFilters.endDate) {
        const date = new Date(newFilters.endDate.split("T")[0] + "T00:00:00");
        updated.endDate = endOfDay(date).toISOString();
      }

      return updated;
    });
  };

  return {
    ...reportQuery,
    filters,
    updateFilters,
  };
};

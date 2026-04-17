import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/infrastructure/api/dashboard.api";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
};

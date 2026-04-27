import { useQuery } from "@tanstack/react-query";
import { configApi } from "@/infrastructure/api/config.api";

export const useConfig = () => {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => configApi.getConfig(),
    staleTime: 1000 * 60 * 60 * 8, // 8 hours (one shift)
  });
};

import { useQuery } from "@tanstack/react-query";
import { configApi } from "@/infrastructure/api/config.api";

export const useConfig = () => {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => configApi.getConfig(),
    staleTime: Infinity, // Configuration doesn't change often
  });
};

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/infrastructure/api/profile.api";

export const useProfiles = (page: number, search: string) => {
  return useQuery({
    queryKey: ["profiles", page, search],
    queryFn: () => profileApi.getProfiles(page, 10, search),
  });
};

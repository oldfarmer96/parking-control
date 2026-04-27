import { supabase } from "@/config/supabase";
import type { Perfil } from "@/core/entities/auth.entity";

export interface PaginatedProfiles {
  profiles: Perfil[];
  total: number;
}

class ProfileApi {
  async getProfiles(
    page: number = 1,
    pageSize: number = 10,
    search: string = "",
  ): Promise<PaginatedProfiles> {
    let query = supabase.from("perfiles").select("*", { count: "exact" });

    if (search) {
      query = query.ilike("nombre_completo", `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("fecha_creacion", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      profiles: (data as Perfil[]) || [],
      total: count || 0,
    };
  }

  async updateStatus(userId: string, status: boolean): Promise<void> {
    const { error } = await supabase
      .from("perfiles")
      .update({ estado: status })
      .eq("id", userId);

    if (error) throw new Error(error.message);
  }
}

export const profileApi = new ProfileApi();

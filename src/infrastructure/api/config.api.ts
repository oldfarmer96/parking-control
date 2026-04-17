import { supabase } from "@/config/supabase";
import type { AppConfig } from "@/core/entities/ticket.entity";

export const configApi = {
  async getConfig(): Promise<AppConfig> {
    const { data, error } = await supabase
      .from("configuracion")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

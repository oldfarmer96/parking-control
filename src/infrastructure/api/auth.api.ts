import { supabase } from "@/config/supabase";
import type {
  LoginCredentials,
  Perfil,
  RegisterData,
} from "@/core/entities/auth.entity";
import type { AuthRepository } from "@/core/repository/auth.repository";

class AuthApi implements AuthRepository {
  async login(dto: LoginCredentials): Promise<Perfil> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.correo,
      password: dto.contrasena,
    });

    if (error) throw new Error(error.message);

    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles")
      .select("correo, rol, nombre_completo")
      .eq("id", data.user.id)
      .single();

    if (perfilError) throw new Error(perfilError.message);

    return perfil;
  }

  async register(dto: RegisterData): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email: dto.correo,
      password: dto.contrasena,
      options: {
        data: {
          nombre_completo: dto.nombre_completo,
          rol: dto.rol,
        },
      },
    });

    if (error) throw new Error(error.message);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error("No se pudo cerrar sesión.");
  }
}

export const authApi = new AuthApi();

export type UserRole = "admin" | "operador";

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface RegisterData {
  correo: string;
  contrasena: string;
  nombre_completo: string;
  rol: UserRole;
}

export interface Perfil {
  correo: string;
  nombre_completo: string;
  rol: UserRole;
}

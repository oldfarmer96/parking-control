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
  id: string;
  correo: string;
  nombre_completo: string;
  rol: UserRole;
  estado: boolean;
  fecha_creacion: string;
}

import type {
  LoginCredentials,
  Perfil,
  RegisterData,
} from "../entities/auth.entity";

export interface AuthRepository {
  login(dto: LoginCredentials): Promise<Perfil>;
  register(dto: RegisterData): Promise<void>;
  logout(): Promise<void>;
}

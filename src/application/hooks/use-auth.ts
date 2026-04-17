import type {
  LoginCredentials,
  RegisterData,
} from "@/core/entities/auth.entity";
import { authApi } from "@/infrastructure/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth-store";

const TOAST_IDS = {
  login: "toast-login",
  register: "toast-register",
  logout: "toast-logout",
} as const;

export const useLogin = () => {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: (dto: LoginCredentials) => authApi.login(dto),
    onMutate: () => {
      toast.loading("Iniciando sesión...", { id: TOAST_IDS.login });
    },
    onSuccess: (perfil) => {
      setUser(perfil);

      toast.success(`Bienvenido, ${perfil.nombre_completo}`, {
        id: TOAST_IDS.login,
      });
    },
    onError: (err) => {
      toast.error("Error al iniciar sesión", {
        description: err.message,
        id: TOAST_IDS.login,
      });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: (dto: RegisterData) => authApi.register(dto),
    onMutate: () => {
      toast.loading("Registrando usuario...", { id: TOAST_IDS.register });
    },
    onSuccess: () => {
      toast.success("Usuario registrado correctamente.", {
        id: TOAST_IDS.register,
      });
    },
    onError: (err) => {
      toast.error("Error al registrar", {
        description: err.message,
        id: TOAST_IDS.register,
      });
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      toast.loading("Cerrando sesión...", { id: TOAST_IDS.logout });
    },
    onSuccess: () => {
      logout();
      toast.success("Sesión cerrada.", { id: TOAST_IDS.logout });
      // navigate("/login", { replace: true });
    },
    onError: (err) => {
      toast.error("Error al cerrar sesión", {
        description: err.message,
        id: TOAST_IDS.logout,
      });
    },
  });
};

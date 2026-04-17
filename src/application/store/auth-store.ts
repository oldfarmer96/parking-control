import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserRole = "admin" | "operador";

export interface User {
  correo: string;
  rol: UserRole;
  nombre_completo: string;
}

interface AuthStore {
  user: User | null;
  isAuth: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      setUser: (user: User) =>
        set({
          user,
          isAuth: true,
        }),
      logout: () =>
        set({
          user: null,
          isAuth: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

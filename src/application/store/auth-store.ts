import type { Perfil } from "@/core/entities/auth.entity";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: Perfil | null;
  isAuth: boolean;
  setUser: (user: Perfil) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      setUser: (user: Perfil) =>
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

import type { UserRole } from "@/core/entities/auth.entity";

export const roleBasedRedirection = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "operador":
      return "/";
    default:
      return "/login";
  }
};

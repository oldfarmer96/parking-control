import type { UserRole } from "@/core/entities/auth.entity";
import {
  LayoutDashboard,
  Users,
  Ticket,
  PlusCircle,
  List,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to?: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
  role?: UserRole;
  children?: {
    to: string;
    icon: LucideIcon;
    label: string;
    exact?: boolean;
  }[];
}

interface NavGroup {
  role: UserRole;
  children: NavItem[];
}

export const allNavItems: NavGroup[] = [
  {
    role: "admin",
    children: [
      {
        to: "/admin",
        icon: LayoutDashboard,
        label: "Panel de Control",
        exact: true,
      },
      {
        label: "Operadores",
        icon: Users,
        children: [
          {
            to: "/user-register",
            icon: PlusCircle,
            label: "Registrar Nuevo",
          },
          {
            to: "/admin/operators",
            icon: List,
            label: "Lista de Operadores",
          },
        ],
      },
      {
        label: "Reportes",
        icon: Users,
        children: [
          {
            to: "/reports",
            icon: PlusCircle,
            label: "Reportes",
          },
        ],
      },
      // {
      //   to: "/admin/tickets",
      //   icon: Ticket,
      //   label: "Tickets (Global)",
      // },
      // {
      //   to: "/admin/settings",
      //   icon: Settings,
      //   label: "Configuración",
      // },
    ],
  },
  {
    role: "operador",
    children: [
      {
        to: "/",
        icon: Ticket,
        label: "Panel de Tickets",
        exact: true,
      },
      {
        to: "/history",
        icon: List,
        label: "Mi Historial",
      },
    ],
  },
];

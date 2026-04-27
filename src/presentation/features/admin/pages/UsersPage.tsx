import { useState } from "react";
import { useProfiles } from "../hooks/useProfiles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/presentation/components/ui/pagination";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Search, UserPlus, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/presentation/components/ui/alert-dialog";
import { useUpdateProfileStatus } from "../hooks/useUpdateProfileStatus";
import { UserCheck, UserX, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useProfiles(page, search);
  const updateStatus = useUpdateProfileStatus();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateStatus.mutate({ userId, status: !currentStatus });
  };

  const totalPages = data ? Math.ceil(data.total / 10) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los operadores y administradores del sistema.</p>
        </div> */}
        <Button
          onClick={() => navigate("/user-register")}
          className="w-full sm:w-auto h-11"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-none shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-11 px-6">
              Buscar
            </Button>
          </form>

          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Nombre</TableHead>
                  <TableHead className="whitespace-nowrap">Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="whitespace-nowrap">Registro</TableHead>
                  <TableHead className="text-right">Opciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-10 bg-muted animate-pulse rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-destructive"
                    >
                      Error al cargar usuarios
                    </TableCell>
                  </TableRow>
                ) : data?.profiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.profiles.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {user.nombre_completo}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.correo}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
                            user.rol === "admin"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border/50"
                          }`}
                        >
                          {user.rol === "admin" ? "Administrador" : "Operador"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                            user.estado
                              ? "bg-green-500/10 text-green-600 border border-green-500/20"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${user.estado ? "bg-green-500" : "bg-destructive"}`}
                          />
                          {user.estado ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {user.fecha_creacion
                          ? format(
                              new Date(user.fecha_creacion),
                              "dd MMM yyyy",
                              { locale: es },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-9 w-9 rounded-full transition-all",
                                user.estado
                                  ? "hover:bg-destructive/10 hover:text-destructive"
                                  : "hover:bg-green-500/10 hover:text-green-600",
                              )}
                            >
                              {user.estado ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                {user.estado ? (
                                  <ShieldAlert className="h-5 w-5 text-destructive" />
                                ) : (
                                  <ShieldCheck className="h-5 w-5 text-green-600" />
                                )}
                                ¿Confirmar cambio de estado?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Estás a punto de{" "}
                                {user.estado ? "desactivar" : "activar"} la
                                cuenta de{" "}
                                <span className="font-bold text-foreground">
                                  {user.nombre_completo}
                                </span>
                                .
                                {user.estado &&
                                  " El usuario no podrá iniciar sesión hasta que sea reactivado."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleToggleStatus(user.id, user.estado)
                                }
                                className={
                                  user.estado
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }
                              >
                                {user.estado
                                  ? "Desactivar Cuenta"
                                  : "Activar Cuenta"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={page === p}
                            onClick={() => setPage(p)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (p === 2 || p === totalPages - 1) {
                      // Only show ellipsis if there's a gap
                      // const prevP = i;
                      // const nextP = i + 2;
                      if (
                        (p === 2 && page > 3) ||
                        (p === totalPages - 1 && page < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

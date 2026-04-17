import { useRegister } from "@/application/hooks/use-auth";
// import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  Car,
  Loader2,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";

// Zod schema for registration
const registerSchema = z
  .object({
    correo: z.string().email("Correo electrónico inválido"),
    contrasena: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmar_contrasena: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    nombre_completo: z.string().min(2, "El nombre es muy corto"),
    rol: z.enum(["admin", "operador"]),
  })
  .refine((data) => data.contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  // const navigate = useNavigate();
  const {
    mutate: registrar,
    isPending,
    isError,
    isSuccess,
    error,
    reset: resetMutation,
  } = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      rol: "operador",
      nombre_completo: "",
      correo: "",
      contrasena: "",
      confirmar_contrasena: "",
    },
  });

  const rolValue = watch("rol");

  const onSubmit = (data: RegisterFormValues) => {
    registrar(
      {
        correo: data.correo,
        contrasena: data.contrasena,
        nombre_completo: data.nombre_completo,
        rol: data.rol,
      },
      {
        onSuccess: () => {
          resetForm();
          // Stay on the page to allow more registrations
          toast.success("Nuevo operador creado con éxito");
        },
      },
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <PlusCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Operadores
          </h1>
          <p className="text-muted-foreground text-sm">
            Registra nuevos usuarios para el sistema.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />

        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Datos del Nuevo Usuario
          </CardTitle>
          <CardDescription>
            Completa la información para crear una nueva cuenta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium mb-6 flex items-center gap-3 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p>Usuario registrado correctamente.</p>
                <p className="text-xs opacity-80">
                  Ya puede iniciar sesión con sus credenciales.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-emerald-600 hover:bg-emerald-500/10"
                onClick={resetMutation}
              >
                Cerrar
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="nombre_completo"
                  className="text-sm font-medium"
                >
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="nombre_completo"
                    {...register("nombre_completo")}
                    placeholder="Ej. Juan Pérez"
                    className={`pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-primary/10 transition-all ${errors.nombre_completo ? "border-destructive/50" : ""}`}
                  />
                </div>
                {errors.nombre_completo && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.nombre_completo.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="correo" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="correo"
                    {...register("correo")}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className={`pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-primary/10 transition-all ${errors.correo ? "border-destructive/50" : ""}`}
                  />
                </div>
                {errors.correo && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="rol" className="text-sm font-medium">
                  Rol del Sistema
                </Label>
                <Select
                  value={rolValue}
                  onValueChange={(value) =>
                    setValue("rol", value as "admin" | "operador")
                  }
                >
                  <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/40">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operador">
                      Operador (Estándar)
                    </SelectItem>
                    <SelectItem value="admin">Administrador (Total)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground px-1 italic">
                  {rolValue === "admin"
                    ? "Permisos completos de gestión y configuración."
                    : "Acceso limitado a control de entradas y salidas."}
                </p>
              </div>

              <div className="hidden md:block" />

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="contrasena"
                    {...register("contrasena")}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className={`pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-primary/10 transition-all ${errors.contrasena ? "border-destructive/50" : ""}`}
                  />
                </div>
                {errors.contrasena && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.contrasena.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmar_contrasena"
                  className="text-sm font-medium"
                >
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="confirmar_contrasena"
                    {...register("confirmar_contrasena")}
                    type="password"
                    placeholder="Repita la contraseña"
                    className={`pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/40 focus:ring-primary/10 transition-all ${errors.confirmar_contrasena ? "border-destructive/50" : ""}`}
                  />
                </div>
                {errors.confirmar_contrasena && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} />{" "}
                    {errors.confirmar_contrasena.message}
                  </p>
                )}
              </div>
            </div>

            {isError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in shake flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>
                  {error?.message || "Error al conectar con la base de datos"}
                </span>
              </div>
            )}

            <div className="pt-4 flex items-center gap-4">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-12 font-semibold text-base transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Registrar Operador
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 px-8 font-medium hover:bg-muted/50"
                onClick={() => resetForm()}
              >
                Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* <div className="mt-12 p-8 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between overflow-hidden relative group">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-1">Seguridad de la Plataforma</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Todos los operadores registrados tendrán acceso al panel de registro
            de tickets. Recuerde que los Administradores pueden cambiar la
            configuración de precios.
          </p>
        </div>
        <Car className="w-32 h-32 absolute -right-6 -bottom-6 text-primary opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-500" />
      </div> */}
    </div>
  );
};

export default RegisterPage;

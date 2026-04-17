import { useRegister } from "@/application/hooks/use-auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    mutate: registrar,
    isPending,
    isError,
    isSuccess,
    error,
  } = useRegister();

  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
    confirmar_contrasena: "",
    nombre_completo: "",
    rol: "operador" as "admin" | "operador",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.contrasena !== form.confirmar_contrasena) {
      setValidationError("Las contraseñas no coinciden.");
      return;
    }

    if (form.contrasena.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    registrar(
      {
        correo: form.correo,
        contrasena: form.contrasena,
        nombre_completo: form.nombre_completo,
        rol: form.rol,
      },
      {
        onSuccess: () => {
          navigate("/login");
        },
      },
    );
  }

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />

        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Car className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Regístrate para acceder al sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-center mb-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Usuario registrado correctamente</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo" className="text-sm font-medium">
                Nombre completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="nombre_completo"
                  name="nombre_completo"
                  type="text"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                  className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                  className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol" className="text-sm font-medium">
                Rol
              </Label>
              <Select
                value={form.rol}
                onValueChange={(value) => {
                  setForm({ ...form, rol: value as "admin" | "operador" });
                }}
              >
                <SelectTrigger className="h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>

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
                  name="confirmar_contrasena"
                  type="password"
                  value={form.confirmar_contrasena}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                  required
                  className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>

            {(validationError || isError) && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in shake">
                {validationError || error?.message || "Error al registrar"}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 font-medium text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ya tengo cuenta
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground/60 mt-6">
        Sistema de control de estacionamiento
      </p>
    </div>
  );
};
export default RegisterPage;

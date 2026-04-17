import { useLogin } from "@/application/hooks/use-auth";
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
import { Car, Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginT } from "../schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginPage = () => {
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginT>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      contrasena: "",
      correo: "",
    },
  });

  const onSubmit = (data: LoginT) => {
    login(data, {
      onSuccess: () => {
        console.log("inicio existoso");
      },
    });
  };

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/70 to-primary/50" />

        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Car className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Parqueo
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Unidad minera Huinchos Pataccocha
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="correo"
                  type="email"
                  {...register("correo")}
                  placeholder="correo@ejemplo.com"
                  required
                  className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              {errors.correo && (
                <span className="text-red-500/90">{errors.correo.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  id="contrasena"
                  type="password"
                  {...register("contrasena")}
                  placeholder="••••••••"
                  required
                  className="pl-10 h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              {errors.contrasena && (
                <span className="text-red-500/90">
                  {errors.contrasena.message}
                </span>
              )}
            </div>

            {isError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in shake">
                {error?.message || "Credenciales inválidas"}
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
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default LoginPage;

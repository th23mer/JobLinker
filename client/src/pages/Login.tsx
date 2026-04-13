import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Link2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import type { AuthPayload } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Role = "candidat" | "recruteur";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<Role>("candidat");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await api.post<{ token: string }>(`/auth/${role}`, { email, motDePasse });
      login(token, role as AuthPayload["role"]);
      navigate(role === "recruteur" ? "/recruteur" : "/candidat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion. Verifiez vos identifiants et reessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" aria-hidden="true" />
        <div className="absolute top-24 left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-24 right-12 w-96 h-96 bg-primary-dark/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/2 right-1/4 size-3 rounded-full bg-white/20 animate-float" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12" aria-hidden="true">
            <div className="size-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Link2 className="size-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-white">JobLinker</span>
          </div>
          <h2 className="font-heading text-4xl lg:text-[2.75rem] font-extrabold text-white mb-6 leading-tight">
            Accedez a des milliers d'opportunites
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            Connectez-vous pour retrouver vos candidatures, gerer vos offres ou administrer la plateforme.
          </p>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["A", "K", "S", "M"].map((letter) => (
                <div key={letter} className="size-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center backdrop-blur" aria-hidden="true">
                  <span className="text-xs font-bold text-white/80">{letter}</span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-sm">
              <span className="text-white font-semibold">+50K</span> professionnels inscrits
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="size-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Link2 className="size-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold">JobLinker</span>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-extrabold mb-2">Connexion</h1>
            <p className="text-muted-foreground">Accedez a votre espace personnel</p>
          </div>

          {/* Role tabs */}
          <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="mb-8">
            <TabsList>
              <TabsTrigger value="candidat">Candidat</TabsTrigger>
              <TabsTrigger value="recruteur">Recruteur</TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mb-6" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold required">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  required
                  aria-required="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="pl-12 h-12"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold required">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  required
                  aria-required="true"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="pl-12 h-12"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12" size="lg">
              {loading ? "Connexion en cours..." : (
                <>
                  Se connecter
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">
              S'inscrire gratuitement
              <Sparkles className="size-3" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

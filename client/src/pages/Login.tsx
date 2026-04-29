import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Link2, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [role, setRole] = useState<Role>("candidat");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const redirectPath = user.role === "admin"
      ? "/admin"
      : user.role === "recruteur"
        ? "/recruteur"
        : "/candidat";

    navigate(redirectPath, { replace: true });
  }, [isAuthenticated, navigate, user]);

  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validateEmailOnBlur = () => {
    setEmailTouched(true);
    if (!email.trim() || isEmailValid(email)) {
      setEmailError("");
      return;
    }
    setEmailError("Format invalide - ex: nom@domaine.com");
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!isEmailValid(email)) {
      setEmailTouched(true);
      setEmailError("Format invalide - ex: nom@domaine.com");
      return;
    }

    setForgotLoading(true);
    try {
      const { message } = await api.post<{ message: string }>("/auth/forgot-password", { email, role });
      setResetMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer l'email de réinitialisation.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isEmailValid(email)) {
      setEmailTouched(true);
      setEmailError("Format invalide - ex: nom@domaine.com");
      return;
    }

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
    <div className="min-h-[calc(100svh-var(--navbar-height))] flex items-stretch">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:min-h-[calc(100svh-var(--navbar-height))] bg-gradient-to-br from-[#1a3fb5] via-[#1a3aa6] to-[#143083] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" aria-hidden="true" />
        <div className="absolute top-24 left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-24 right-12 w-96 h-96 bg-[#0f2f8f]/30 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/2 right-1/4 size-3 rounded-full bg-white/20 animate-float" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12" aria-hidden="true">
            <div className="size-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Link2 className="size-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-white">JobLinker</span>
          </div>
          <h2 className="font-heading text-4xl lg:text-[2.75rem] font-extrabold text-white mb-6 leading-tight">
            Accédez à des milliers d'opportunités
          </h2>
          <p className="text-white text-lg leading-relaxed max-w-md">
            Connectez-vous pour retrouver vos candidatures, gerer vos offres ou administrer la plateforme.
          </p>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["A", "K", "S", "M"].map((letter) => (
                <div key={letter} className="size-10 rounded-full bg-[#0f2f8f]/75 border-2 border-white/35 flex items-center justify-center backdrop-blur" aria-hidden="true">
                  <span className="text-xs font-bold text-white">{letter}</span>
                </div>
              ))}
            </div>
            <p className="text-white text-sm">
              <span className="text-white font-semibold">+50K</span> professionnels inscrits
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 lg:min-h-[calc(100svh-var(--navbar-height))] flex items-start justify-center px-6 py-8 overflow-y-auto bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-[420px] pt-6 min-h-full flex flex-col">
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
            <TabsList aria-label="Type de compte">
              <TabsTrigger value="candidat" className="data-[state=active]:ring-2 data-[state=active]:ring-primary/50 data-[state=active]:ring-offset-1">Candidat</TabsTrigger>
              <TabsTrigger value="recruteur" className="data-[state=active]:ring-2 data-[state=active]:ring-primary/50 data-[state=active]:ring-offset-1">Recruteur</TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mb-6" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetMessage && (
            <Alert variant="success" className="mb-6" role="status">
              <AlertDescription>{resetMessage}</AlertDescription>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    if (emailTouched) {
                      setEmailError(!value.trim() || isEmailValid(value) ? "" : "Format invalide - ex: nom@domaine.com");
                    }
                  }}
                  onBlur={validateEmailOnBlur}
                  placeholder="votre@email.com"
                  className="pl-12 h-12"
                  autoComplete="email"
                />
              </div>
              {emailTouched && emailError && (
                <p className="text-sm text-destructive" role="alert">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold required">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  aria-required="true"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="pl-12 pr-12 h-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {forgotLoading ? "Envoi en cours..." : "Mot de passe oublié ?"}
                </button>
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

          <p className="text-center text-sm text-muted-foreground mt-auto pt-4">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">
              S'inscrire gratuitement
              <Sparkles className="size-3" aria-hidden="true" />
            </Link>
          </p>

          <p className="mt-4 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
            © 2026 JobLinker{" "}
            <Link to="/conditions-utilisation" className="hover:text-foreground hover:underline">Conditions d'utilisation</Link>
            {" · "}
            <Link to="/politique-confidentialite" className="hover:text-foreground hover:underline">Confidentialité</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

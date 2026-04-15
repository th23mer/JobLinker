import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Link2, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function getPasswordStrength(value: string): { score: number; label: string } {
  if (!value) return { score: 0, label: "Faible" };

  const checks = [
    value.length >= 6,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;

  if (value.length < 6 || checks <= 2) return { score: 1, label: "Faible" };
  if (checks === 3) return { score: 2, label: "Moyen" };
  if (checks === 4) return { score: 3, label: "Fort" };
  return { score: 4, label: "Tres fort" };
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mot de passe trop court (6 caracteres minimum).");
      return;
    }

    if (getPasswordStrength(newPassword).score <= 1) {
      setError("Mot de passe faible. Utilisez une combinaison plus forte.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { message } = await api.post<{ message: string }>("/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccess(message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de réinitialiser le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-background to-muted/30">
      <div className="w-full max-w-[460px]">
        <div className="flex items-center gap-3 mb-10">
          <div className="size-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Link2 className="size-4 text-white" />
          </div>
          <span className="font-heading text-xl font-bold">JobLinker</span>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold mb-2">Réinitialiser le mot de passe</h1>
          <p className="text-muted-foreground">Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-6" role="status">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="required">Nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                required
                aria-required="true"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="pl-12 pr-12 h-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showNewPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Force du mot de passe</span>
                <span className="font-semibold text-foreground">{passwordStrength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200",
                      index < passwordStrength.score
                        ? passwordStrength.score === 1
                          ? "bg-red-400"
                          : passwordStrength.score === 2
                            ? "bg-amber-400"
                            : passwordStrength.score === 3
                              ? "bg-emerald-400"
                              : "bg-teal-500"
                        : "bg-border"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="required">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                aria-required="true"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="pl-12 pr-12 h-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12" size="lg">
            {loading ? "Réinitialisation..." : (
              <>
                Mettre à jour le mot de passe
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Retour à{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

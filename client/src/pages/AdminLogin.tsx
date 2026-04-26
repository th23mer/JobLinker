import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await api.post<{ token: string }>("/auth/admin", { email, motDePasse });
      login(token, "admin");
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-background to-muted/30">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-10">
          <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="size-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold">Administration</h1>
          <p className="text-muted-foreground mt-2">Espace réservé aux administrateurs</p>
        </div>

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
                placeholder="admin@email.com"
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
                placeholder="Mot de passe administrateur"
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
      </div>
    </div>
  );
}

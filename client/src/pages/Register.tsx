import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { Link2, UserPlus, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Role = "candidat" | "recruteur";

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "candidat";
  const [role, setRole] = useState<Role>(initialRole);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [candidat, setCandidat] = useState({
    nom: "", prenom: "", email: "", motDePasse: "", telephone: "",
    cv: "", lettreMotivation: "", niveauEtude: "", experience: "", diplome: "",
  });

  const [recruteur, setRecruteur] = useState({
    nomEntreprise: "", matriculeFiscal: "", adresse: "", description: "",
    email: "", motDePasse: "", telephone: "",
    nomRepresentant: "", prenomRepresentant: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (role === "candidat") {
        await api.post("/candidats/register", candidat);
      } else {
        await api.post("/recruteurs/register", recruteur);
      }
      setSuccess("Compte cree avec succes ! Redirection vers la connexion...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription. Verifiez vos informations et reessayez.");
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" aria-hidden="true" />
        <div className="absolute top-24 left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-24 right-12 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12" aria-hidden="true">
            <div className="size-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Link2 className="size-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-white">JobLinker</span>
          </div>
          <h2 className="font-heading text-4xl lg:text-[2.75rem] font-extrabold text-white mb-6 leading-tight">
            Commencez votre aventure professionnelle
          </h2>
          <p className="text-emerald-100/60 text-lg leading-relaxed max-w-md">
            {role === "candidat"
              ? "Creez votre profil candidat et accedez a des milliers d'offres d'emploi."
              : "Publiez vos offres et trouvez les meilleurs talents pour votre entreprise."}
          </p>

          <ul className="mt-12 space-y-4" aria-label="Avantages">
            {[
              "Inscription gratuite et rapide",
              "Acces immediat a la plateforme",
              role === "candidat" ? "Postulez en quelques clics" : "Publiez des offres illimitees",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-emerald-100/80">
                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <CheckCircle2 className="size-3.5 text-emerald-300" />
                </div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-7/12 flex items-start justify-center px-6 py-12 overflow-y-auto bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-lg pt-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="size-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Link2 className="size-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold">JobLinker</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center" aria-hidden="true">
              <UserPlus className="size-4 text-emerald-600" />
            </div>
            <h1 className="font-heading text-3xl font-extrabold">Inscription</h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">Creez votre compte en quelques minutes</p>

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
          {success && (
            <Alert variant="success" className="mb-6" role="status">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {role === "candidat" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="required">Nom</Label>
                    <Input id="nom" required aria-required="true" value={candidat.nom} onChange={(e) => setCandidat({ ...candidat, nom: e.target.value })} placeholder="Votre nom" autoComplete="family-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom" className="required">Prenom</Label>
                    <Input id="prenom" required aria-required="true" value={candidat.prenom} onChange={(e) => setCandidat({ ...candidat, prenom: e.target.value })} placeholder="Votre prenom" autoComplete="given-name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email" className="required">Email</Label>
                  <Input id="c-email" type="email" required aria-required="true" value={candidat.email} onChange={(e) => setCandidat({ ...candidat, email: e.target.value })} placeholder="votre@email.com" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-pass" className="required">Mot de passe</Label>
                  <Input id="c-pass" type="password" required aria-required="true" minLength={6} value={candidat.motDePasse} onChange={(e) => setCandidat({ ...candidat, motDePasse: e.target.value })} placeholder="Minimum 6 caracteres" autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-tel">Telephone</Label>
                  <Input id="c-tel" type="tel" value={candidat.telephone} onChange={(e) => setCandidat({ ...candidat, telephone: e.target.value })} placeholder="+216 XX XXX XXX" autoComplete="tel" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diplome">Diplome</Label>
                    <Input id="diplome" value={candidat.diplome} onChange={(e) => setCandidat({ ...candidat, diplome: e.target.value })} placeholder="Ex: Licence Info" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveauEtude">Niveau d'etude</Label>
                    <select id="niveauEtude" value={candidat.niveauEtude} onChange={(e) => setCandidat({ ...candidat, niveauEtude: e.target.value })} className={selectClass} aria-label="Niveau d'etude">
                      <option value="">Selectionner</option>
                      <option value="Bac">Bac</option>
                      <option value="Bac+2">Bac+2</option>
                      <option value="Bac+3">Bac+3</option>
                      <option value="Bac+5">Bac+5</option>
                      <option value="Doctorat">Doctorat</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="entreprise" className="required">Nom de l'entreprise</Label>
                  <Input id="entreprise" required aria-required="true" value={recruteur.nomEntreprise} onChange={(e) => setRecruteur({ ...recruteur, nomEntreprise: e.target.value })} placeholder="Nom de l'entreprise" autoComplete="organization" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricule" className="required">Matricule fiscal</Label>
                  <Input id="matricule" required aria-required="true" value={recruteur.matriculeFiscal} onChange={(e) => setRecruteur({ ...recruteur, matriculeFiscal: e.target.value })} placeholder="Matricule fiscal" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="r-rep-nom" className="required">Nom du representant</Label>
                    <Input id="r-rep-nom" required aria-required="true" value={recruteur.nomRepresentant} onChange={(e) => setRecruteur({ ...recruteur, nomRepresentant: e.target.value })} placeholder="Nom" autoComplete="family-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-rep-prenom" className="required">Prenom du representant</Label>
                    <Input id="r-rep-prenom" required aria-required="true" value={recruteur.prenomRepresentant} onChange={(e) => setRecruteur({ ...recruteur, prenomRepresentant: e.target.value })} placeholder="Prenom" autoComplete="given-name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-email" className="required">Email</Label>
                  <Input id="r-email" type="email" required aria-required="true" value={recruteur.email} onChange={(e) => setRecruteur({ ...recruteur, email: e.target.value })} placeholder="contact@entreprise.com" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-pass" className="required">Mot de passe</Label>
                  <Input id="r-pass" type="password" required aria-required="true" minLength={6} value={recruteur.motDePasse} onChange={(e) => setRecruteur({ ...recruteur, motDePasse: e.target.value })} placeholder="Minimum 6 caracteres" autoComplete="new-password" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="r-tel">Telephone</Label>
                    <Input id="r-tel" type="tel" value={recruteur.telephone} onChange={(e) => setRecruteur({ ...recruteur, telephone: e.target.value })} placeholder="+216 XX XXX XXX" autoComplete="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input id="adresse" value={recruteur.adresse} onChange={(e) => setRecruteur({ ...recruteur, adresse: e.target.value })} placeholder="Adresse" autoComplete="street-address" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" rows={3} value={recruteur.description} onChange={(e) => setRecruteur({ ...recruteur, description: e.target.value })} placeholder="Decrivez votre entreprise en quelques mots..." />
                </div>
              </>
            )}

            <Button type="submit" disabled={loading} variant="success" className="w-full h-12" size="lg">
              {loading ? "Creation du compte..." : (
                <>
                  Creer mon compte
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10 pb-8">
            Deja un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

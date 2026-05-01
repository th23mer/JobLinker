import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { OffreEmploi, Candidat, AuthPayload } from "@/types";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Send, CheckCircle, Sparkles, File, Upload, Zap, Eye, Users, ChevronRight, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function OffreDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [offre, setOffre] = useState<OffreEmploi | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPostuler, setShowPostuler] = useState(false);
  const [cvMode, setCvMode] = useState<"default" | "new">("default");
  const [cvFile, setCvFile] = useState<any>(null);
  const [lettreMotivation, setLettreMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await api.post<{ token: string; role: string }>("/auth/candidat", {
        email: loginEmail,
        motDePasse: loginPassword,
      });

      login(result.token, result.role as AuthPayload["role"]);
      setShowAuthModal(false);
      setLoginEmail("");
      setLoginPassword("");
      // L'utilisateur est maintenant connecté, il peut postuler directement
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    api.get<OffreEmploi>(`/offres/${id}`)
      .then(setOffre)
      .catch(() => navigate("/offres"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (user?.role === "candidat") {
      api.get<Candidat>(`/candidats/${user.id}`).then((p) => {
        setProfil(p);
        setCvMode(p.cv ? "default" : "new");
      }).catch(() => {});
    }
  }, [user]);

  const handlePostuler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cvMode === "new" && !cvFile) {
      setError("Veuillez sélectionner un CV.");
      return;
    }
    if (cvMode === "default" && !profil?.cv) {
      setError("Aucun CV par défaut trouvé. Veuillez en téléverser un.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("lettreMotivation", lettreMotivation);
      fd.append("candidatId", String(user!.id));
      fd.append("offreEmploiId", String(id));
      if (cvMode === "new" && cvFile) {
        fd.append("cv", cvFile);
      } else {
        fd.append("cv", profil!.cv);
      }
      await api.upload("/candidatures", fd);
      setSuccess("Candidature envoyée avec succès !");
      setShowCelebrate(true);
      window.setTimeout(() => setShowCelebrate(false), 1800);
      setShowPostuler(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-6 w-32 mb-8" />
          <Card className="p-8">
            <Skeleton className="h-9 w-2/3 mb-6" />
            <div className="flex gap-4 mb-8">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!offre) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non disponible";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Publié aujourd'hui";
    if (diffDays === 1) return "Publié hier";
    if (diffDays < 7) return `Publié il y a ${diffDays} jours`;
    if (diffDays < 30) return `Publié il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Publié il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const contratColors: Record<string, string> = {
    CDI: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CDD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Stage: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Freelance: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  const readingTime = Math.max(1, Math.ceil(((offre.description?.length || 0) + (offre.exigences?.length || 0)) / 200));

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Breadcrumb */}
      <div className="pt-20 pb-6 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight className="size-4" />
            <Link to="/offres" className="hover:text-foreground transition-colors">Offres</Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-semibold line-clamp-1">{offre.titre}</span>
          </div>
        </div>
      </div>

      <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/offres")}
            className="mb-8 group font-semibold"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform mr-2" aria-hidden="true" />
            Retour aux offres
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Header */}
              <Card className="overflow-hidden border border-border/50 shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                
                <CardHeader className="pt-8 pb-0">
                  {/* Company + Contract Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
                        {offre.nomEntreprise || "Entreprise"}
                      </p>
                      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold leading-tight text-foreground mb-4">
                        {offre.titre}
                      </h1>
                    </div>
                    {offre.typeContrat && (
                      <Badge className={`shrink-0 whitespace-nowrap font-bold text-base px-4 py-2 ${contratColors[offre.typeContrat] || "bg-muted"}`}>
                        {offre.typeContrat}
                      </Badge>
                    )}
                  </div>

                  {/* Info Pills - Location, Experience, Level, Salary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {offre.ville && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <MapPin className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">Localisation</p>
                          <p className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">{offre.ville}</p>
                        </div>
                      </div>
                    )}
                    
                    {offre.experienceRequise && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Briefcase className="size-4 text-orange-600 dark:text-orange-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase">Expérience</p>
                          <p className="text-sm font-bold text-orange-900 dark:text-orange-200 truncate">{offre.experienceRequise}</p>
                        </div>
                      </div>
                    )}
                    
                    {offre.niveauEtude && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                        <GraduationCap className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">Niveau</p>
                          <p className="text-sm font-bold text-purple-900 dark:text-purple-200 truncate">{offre.niveauEtude}</p>
                        </div>
                      </div>
                    )}
                    
                    {offre.salaire && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">Salaire</p>
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200 truncate">{offre.salaire}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta Info - Date + Reading Time */}
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDate(offre.dateCreation)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="size-3.5" />
                        Temps de lecture : {readingTime} min
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Application CTA */}
              {!success && (
                <Card className="border-2 border-primary/25 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm">
                  <CardContent className="p-5 sm:p-6">
                    {user?.role === "candidat" ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="font-heading text-xl font-bold text-foreground">Postuler a cette offre</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Envoyez votre CV et votre lettre de motivation au recruteur.
                          </p>
                        </div>
                        <Button
                          size="lg"
                          variant="success"
                          className="h-12 font-bold"
                          onClick={() => setShowPostuler(true)}
                          disabled={showPostuler}
                        >
                          <Send className="size-5 mr-2" aria-hidden="true" />
                          {showPostuler ? "Formulaire ouvert" : "Postuler maintenant"}
                        </Button>
                      </div>
                    ) : !user ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="font-heading text-xl font-bold text-foreground">Postuler à cette offre</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Envoyez votre CV et votre lettre de motivation au recruteur.
                          </p>
                        </div>
                        <Button
                          size="lg"
                          variant="success"
                          className="h-12 font-bold"
                          onClick={() => setShowAuthModal(true)}
                        >
                          <Send className="size-5 mr-2" aria-hidden="true" />
                          Postuler maintenant
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="font-heading text-xl font-bold text-foreground">Postuler avec un compte candidat</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Les candidatures sont reservees aux comptes candidats. Connectez-vous avec un compte candidat ou creez-en un.
                          </p>
                        </div>
                        <Button asChild size="lg" variant="outline" className="h-12 font-bold sm:shrink-0">
                          <Link to="/register?role=candidat">Creer un compte candidat</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Success Message */}
              {success && (
                <div className="space-y-3">
                  <Alert variant="success">
                    <CheckCircle className="size-4" aria-hidden="true" />
                    <AlertDescription className="font-semibold">{success}</AlertDescription>
                  </Alert>

                  {showCelebrate && (
                    <div className="celebrate-wrap" role="status" aria-live="polite" aria-label="Candidature confirmee">
                      <CheckCircle className="celebrate-check" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-1" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-2" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-3" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-4" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-5" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-6" aria-hidden="true" />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Application Form */}
              {user?.role === "candidat" && showPostuler && !success && (
                <Card className="border border-primary/20 bg-primary/5">
                  <CardHeader>
                    <h2 className="font-heading text-lg font-bold">Envoyez votre candidature</h2>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePostuler} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-bold">Votre CV <span className="text-destructive">*</span></Label>

                        {profil?.cv && (
                          <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${cvMode === "default" ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/50"}`}>
                            <input
                              type="radio"
                              name="cvMode"
                              checked={cvMode === "default"}
                              onChange={() => setCvMode("default")}
                              className="accent-primary size-5"
                            />
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <File className="size-5 text-primary" aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">Utiliser mon CV enregistre</p>
                              <a
                                href={profil.cv}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Voir mon CV
                              </a>
                            </div>
                          </label>
                        )}

                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${cvMode === "new" ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/50"}`}>
                          <input
                            type="radio"
                            name="cvMode"
                            checked={cvMode === "new"}
                            onChange={() => setCvMode("new")}
                            className="accent-primary size-5"
                          />
                          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Upload className="size-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <p className="font-semibold text-foreground">Telecharger un nouveau CV</p>
                        </label>

                        {cvMode === "new" && (
                          <div className="pl-4">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                            />
                            {cvFile && (
                              <p className="text-xs text-muted-foreground mt-3 font-medium">OK {cvFile.name}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lm" className="text-base font-bold">Lettre de motivation <span className="text-destructive">*</span></Label>
                        <Textarea
                          id="lm"
                          required
                          aria-required="true"
                          rows={6}
                          value={lettreMotivation}
                          onChange={(e) => setLettreMotivation(e.target.value)}
                          placeholder="Expliquez pourquoi vous etes interesse par ce poste..."
                          className="font-medium resize-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 font-semibold"
                          onClick={() => setShowPostuler(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="success"
                          disabled={submitting}
                          className="flex-1 font-bold h-11"
                        >
                          {submitting ? "Envoi en cours..." : "Envoyer ma candidature"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Quick Summary */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <h2 className="font-heading text-xl font-bold flex items-center gap-3">
                    <TrendingUp className="size-5 text-primary" />
                    Résumé rapide
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {offre.experienceRequise && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Expérience</p>
                        <p className="font-semibold text-foreground">{offre.experienceRequise}</p>
                      </div>
                    )}
                    {offre.niveauEtude && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Niveau d'étude</p>
                        <p className="font-semibold text-foreground">{offre.niveauEtude}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-bold text-primary uppercase mb-2">À propos du rôle</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {offre.description ? offre.description.substring(0, 150) + "..." : "Pas de description disponible"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {offre.description && (
                <Card className="border border-border/50 shadow-sm">
                  <CardHeader>
                    <h2 className="font-heading text-xl font-bold flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-primary" />
                      Description du poste
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{offre.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {offre.exigences && (
                <Card className="border border-border/50 shadow-sm">
                  <CardHeader>
                    <h2 className="font-heading text-xl font-bold flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-primary-light" />
                      Profil recherché
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{offre.exigences}</p>
                  </CardContent>
                </Card>
              )}

              {/* Success Message */}
              {false && success && (
                <div className="space-y-3">
                  <Alert variant="success">
                    <CheckCircle className="size-4" aria-hidden="true" />
                    <AlertDescription className="font-semibold">{success}</AlertDescription>
                  </Alert>

                  {showCelebrate && (
                    <div className="celebrate-wrap" role="status" aria-live="polite" aria-label="Candidature confirmée">
                      <CheckCircle className="celebrate-check" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-1" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-2" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-3" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-4" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-5" aria-hidden="true" />
                      <span className="celebrate-particle celebrate-particle-6" aria-hidden="true" />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {false && error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Application Form */}
              {false && user?.role === "candidat" && !success && (
                <>
                  {!showPostuler ? (
                    <Button
                      size="lg"
                      variant="success"
                      className="w-full h-14 text-base font-bold"
                      onClick={() => setShowPostuler(true)}
                    >
                      <Send className="size-5 mr-2" aria-hidden="true" />
                      Postuler maintenant
                      <Sparkles className="size-4 ml-2" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Card className="border border-primary/20 bg-primary/5">
                      <CardHeader>
                        <h2 className="font-heading text-lg font-bold">Envoyez votre candidature</h2>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePostuler} className="space-y-6">
                          {/* CV Selection */}
                          <div className="space-y-3">
                            <Label className="text-base font-bold">Votre CV <span className="text-destructive">*</span></Label>

                            {profil?.cv && (
                              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${cvMode === "default" ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/50"}`}>
                                <input
                                  type="radio"
                                  name="cvMode"
                                  checked={cvMode === "default"}
                                  onChange={() => setCvMode("default")}
                                  className="accent-primary size-5"
                                />
                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <File className="size-5 text-primary" aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">Utiliser mon CV enregistré</p>
                                  <a
                                    href={profil!.cv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Voir mon CV
                                  </a>
                                </div>
                              </label>
                            )}

                            <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${cvMode === "new" ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/50"}`}>
                              <input
                                type="radio"
                                name="cvMode"
                                checked={cvMode === "new"}
                                onChange={() => setCvMode("new")}
                                className="accent-primary size-5"
                              />
                              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Upload className="size-5 text-muted-foreground" aria-hidden="true" />
                              </div>
                              <p className="font-semibold text-foreground">Télécharger un nouveau CV</p>
                            </label>

                            {cvMode === "new" && (
                              <div className="pl-4">
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                                />
                                {cvFile && (
                                  <p className="text-xs text-muted-foreground mt-3 font-medium">✓ {cvFile.name}</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Cover Letter */}
                          <div className="space-y-2">
                            <Label htmlFor="lm" className="text-base font-bold">Lettre de motivation <span className="text-destructive">*</span></Label>
                            <Textarea
                              id="lm"
                              required
                              aria-required="true"
                              rows={6}
                              value={lettreMotivation}
                              onChange={(e) => setLettreMotivation(e.target.value)}
                              placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
                              className="font-medium resize-none"
                            />
                          </div>

                          {/* Submit Buttons */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 font-semibold"
                              onClick={() => setShowPostuler(false)}
                            >
                              Annuler
                            </Button>
                            <Button
                              type="submit"
                              variant="success"
                              disabled={submitting}
                              className="flex-1 font-bold h-11"
                            >
                              {submitting ? "Envoi en cours..." : "Envoyer ma candidature"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

            </div>

            {/* Sidebar - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Company Info */}
                {offre.nomEntreprise && (
                  <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="size-4 text-primary" />
                        </div>
                        L'entreprise
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Nom</p>
                        <p className="font-semibold text-foreground">{offre.nomEntreprise}</p>
                      </div>
                      {offre.typeContrat && (
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Type de contrat</p>
                          <p className="font-semibold text-foreground">{offre.typeContrat}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Job Stats */}
                <Card className="border border-border/50 shadow-sm bg-muted/30">
                  <CardHeader className="pb-3">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                      <Eye className="size-5 text-primary" />
                      Statistiques
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border/40">
                      <div className="flex items-center gap-2">
                        <Eye className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Vues</span>
                      </div>
                      <span className="font-bold text-foreground">120+</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border/40">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Candidats</span>
                      </div>
                      <span className="font-bold text-foreground">30+</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Call to Action */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-primary-light text-white space-y-2">
                  <p className="text-sm font-bold">Partager cette offre</p>
                  <p className="text-xs opacity-90">Recommandez cette opportunité à vos amis !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Se connecter pour postuler</DialogTitle>
            <DialogDescription>
              Connectez-vous avec votre compte candidat pour postuler à cette offre.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                placeholder="votre.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
              />
            </div>
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAuthModal(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={loginLoading}>
                {loginLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Pas de compte ?{" "}
                <Link
                  to="/register?role=candidat"
                  className="text-primary hover:underline"
                  onClick={() => setShowAuthModal(false)}
                >
                  Créer un compte candidat
                </Link>
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

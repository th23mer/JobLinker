import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { OffreEmploi, Candidat } from "@/types";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Clock, Send, CheckCircle, Sparkles, File, Upload, Zap, Eye, Users, Home, ChevronRight, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function OffreDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [offre, setOffre] = useState<OffreEmploi | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPostuler, setShowPostuler] = useState(false);
  const [cvMode, setCvMode] = useState<"default" | "new">("default");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [lettreMotivation, setLettreMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);

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
      setError(t("detail.errorNoCv"));
      return;
    }
    if (cvMode === "default" && !profil?.cv) {
      setError(t("detail.errorNoDefaultCv"));
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
      setSuccess(t("detail.success"));
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

  const infoPills = [
    offre.ville && { icon: MapPin, label: offre.ville, color: "text-blue-600" },
    offre.typeContrat && { icon: Briefcase, label: offre.typeContrat, color: "text-emerald-600" },
    offre.niveauEtude && { icon: GraduationCap, label: offre.niveauEtude, color: "text-purple-600" },
    offre.experienceRequise && { icon: Clock, label: offre.experienceRequise, color: "text-orange-600" },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; color: string }[];

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
              {success && (
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
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Application Form */}
              {user?.role === "candidat" && !success && (
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

              {/* Login Prompt */}
              {!user && (
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center py-8">
                  <div className="space-y-4">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Zap className="size-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-2">
                        <Link to="/login" className="text-primary hover:underline font-bold">Connectez-vous</Link> pour postuler à cette offre
                      </p>
                      <p className="text-xs text-muted-foreground">Vous n'avez pas de compte ? <Link to="/register?role=candidat" className="text-primary hover:underline font-bold">Créez-en un gratuitement</Link></p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Apply Card */}
                {user?.role === "candidat" && !success && (
                  <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                    <CardHeader className="pb-4">
                      <h3 className="font-heading font-bold text-lg text-foreground">Vous intéresse ?</h3>
                      <p className="text-xs text-muted-foreground font-medium">Postulez maintenant avant que d'autres candidats le fassent !</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="lg"
                        variant="success"
                        className="w-full h-12 font-bold text-base"
                        onClick={() => setShowPostuler(true)}
                        disabled={showPostuler}
                      >
                        <Send className="size-5 mr-2" />
                        Postuler
                      </Button>
                    </CardContent>
                  </Card>
                )}

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
    </div>
  );
}

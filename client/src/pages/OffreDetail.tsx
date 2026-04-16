import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { OffreEmploi, Candidat } from "@/types";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Clock, Send, CheckCircle, Sparkles, File, Upload } from "lucide-react";
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

  const infoPills = [
    offre.ville && { icon: MapPin, label: offre.ville },
    offre.experienceRequise && { icon: Briefcase, label: offre.experienceRequise },
    offre.niveauEtude && { icon: GraduationCap, label: offre.niveauEtude },
    offre.typeContrat && { icon: Clock, label: offre.typeContrat },
  ].filter(Boolean) as { icon: typeof MapPin; label: string }[];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-8 group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          {t("detail.back")}
        </Button>

        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary-dark" aria-hidden="true" />

          <CardHeader className="pb-4 pt-8">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight">
              {offre.titre}
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {infoPills.map((pill) => (
                <Badge key={pill.label} variant="secondary" className="gap-1.5 px-3.5 py-1.5 text-sm">
                  <pill.icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {pill.label}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <div className="px-6"><Separator /></div>

          <CardContent className="pt-8 space-y-8">
            {offre.description && (
              <section>
                <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {t("detail.description")}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-4">{offre.description}</p>
              </section>
            )}

            {offre.exigences && (
              <section>
                <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-primary-light" aria-hidden="true" />
                  {t("detail.requirements")}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-4">{offre.exigences}</p>
              </section>
            )}

            {success && (
              <div className="space-y-3">
                <Alert variant="success">
                  <CheckCircle className="size-4" aria-hidden="true" />
                  <AlertDescription>{success}</AlertDescription>
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{t("detail.errorGeneric")} {error}</AlertDescription>
              </Alert>
            )}

            {user?.role === "candidat" && !success && (
              <>
                {!showPostuler ? (
                  <Button size="lg" variant="success" className="w-full h-14 text-base" onClick={() => setShowPostuler(true)}>
                    <Send className="size-5" aria-hidden="true" />
                    {t("detail.apply")}
                    <Sparkles className="size-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <>
                    <Separator />
                    <form onSubmit={handlePostuler} className="space-y-6 animate-scale-in">
                      <h2 className="font-heading text-lg font-bold">{t("detail.yourApplication")}</h2>

                      <div className="space-y-3">
                        <Label>{t("detail.cv")} <span aria-hidden="true">*</span></Label>

                        {profil?.cv && (
                          <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${cvMode === "default" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                            <input
                              type="radio"
                              name="cvMode"
                              checked={cvMode === "default"}
                              onChange={() => setCvMode("default")}
                              className="accent-primary"
                            />
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <File className="size-4 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{t("detail.defaultCv")}</p>
                              <a
                                href={profil.cv}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t("detail.viewCv")}
                              </a>
                            </div>
                          </label>
                        )}

                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${cvMode === "new" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                          <input
                            type="radio"
                            name="cvMode"
                            checked={cvMode === "new"}
                            onChange={() => setCvMode("new")}
                            className="accent-primary"
                          />
                          <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Upload className="size-4 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <p className="text-sm font-semibold">{t("detail.newCv")}</p>
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
                              <p className="text-xs text-muted-foreground mt-2">{cvFile.name}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lm">{t("detail.coverLetter")} <span aria-hidden="true">*</span></Label>
                        <Textarea
                          id="lm"
                          required
                          aria-required="true"
                          rows={5}
                          value={lettreMotivation}
                          onChange={(e) => setLettreMotivation(e.target.value)}
                          placeholder={t("detail.coverLetterPlaceholder")}
                          autoComplete="on"
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPostuler(false)}>
                          {t("detail.cancel")}
                        </Button>
                        <Button type="submit" variant="success" disabled={submitting} className="flex-1">
                          {submitting ? t("detail.sending") : t("detail.send")}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}

            {!user && (
              <Card className="bg-muted/30 border-dashed text-center py-6">
                <p className="text-muted-foreground text-sm">
                  <Link to="/login" className="text-primary hover:underline font-semibold">{t("detail.loginLink")}</Link> {t("detail.loginPrompt")}
                </p>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

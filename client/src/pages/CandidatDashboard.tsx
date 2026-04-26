import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/services/api";
import type { Candidat, Candidature } from "@/types";
import { User, FileText, Clock, CheckCircle, XCircle, Inbox, TrendingUp, Pencil, Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidatDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", diplome: "", niveauEtude: "", experience: "", lettreMotivation: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get<Candidat>(`/candidats/${user.id}`),
      api.get<Candidature[]>(`/candidatures/candidat/${user.id}`),
    ]).then(([p, c]) => {
      setProfil(p);
      setCandidatures(c);
      setForm({ nom: p.nom, prenom: p.prenom, telephone: p.telephone, diplome: p.diplome, niveauEtude: p.niveauEtude, experience: p.experience, lettreMotivation: p.lettreMotivation || "" });
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    try {
      const updated = await api.put<Candidat>(`/candidats/${user.id}`, form);
      setProfil(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
    }
    setSaving(false);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
      return;
    }
    setUploadingCv(true);
    setSaveSuccess(false);
    setSaveError(false);
    try {
      const fd = new FormData();
      fd.append("cv", file);
      const updated = await api.upload<Candidat>(`/candidats/${user.id}/cv`, fd);
      setProfil(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
    }
    setUploadingCv(false);
    e.target.value = "";
  };

  const statusConfig: Record<string, { icon: typeof Clock; variant: "warning" | "success" | "destructive"; label: string }> = {
    en_attente: { icon: Clock, variant: "warning", label: t("candidatureEnAttente") },
    acceptee: { icon: CheckCircle, variant: "success", label: t("candidatureAcceptee") },
    refusee: { icon: XCircle, variant: "destructive", label: t("candidatureRefusee") },
  };

  const statCards = [
    { label: t("total"), value: candidatures.length, gradient: "from-primary to-primary-light", icon: FileText },
    { label: t("candidatureEnAttente"), value: candidatures.filter((c) => c.statut === "en_attente").length, gradient: "from-amber-500 to-orange-400", icon: Clock },
    { label: t("acceptees"), value: candidatures.filter((c) => c.statut === "acceptee").length, gradient: "from-emerald-500 to-teal-400", icon: TrendingUp },
  ];

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold">
            {t("bonjour")}{profil ? `, ${profil.prenom}` : ""} !
          </h1>
          <p className="text-muted-foreground mt-2">{t("gererCandidatures")}</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden p-6">
                <Skeleton className="h-1 absolute top-0 inset-x-0" />
                <Skeleton className="size-10 rounded-2xl mb-3" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20 mt-1" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statCards.map((s) => (
              <Card key={s.label} className="relative overflow-hidden p-6">
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${s.gradient}`} />
                <div className={`size-10 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="size-5 text-white" aria-hidden="true" />
                </div>
                <p className="text-3xl font-extrabold font-heading">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Save feedback */}
        {saveSuccess && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700" role="status">
            <CheckCircle className="inline size-4 mr-2 align-text-bottom" aria-hidden="true" />
            {t("profilSauvegarde")}
          </div>
        )}
        {saveError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">
            <XCircle className="inline size-4 mr-2 align-text-bottom" aria-hidden="true" />
            {t("erreurSauvegarde")}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="candidatures">
          <TabsList>
            <TabsTrigger value="candidatures">
              <FileText className="size-4" aria-hidden="true" />
              {t("mesCandidatures")}
              <Badge variant="secondary" className="ml-1">{candidatures.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="profil">
              <User className="size-4" aria-hidden="true" />
              {t("monProfil")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidatures">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="size-10 rounded-xl" />
                      <div>
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {candidatures.length === 0 ? (
                  <Card className="p-20 text-center">
                    <div className="size-20 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Inbox className="size-9 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                    <h2 className="font-heading text-lg font-bold mb-2">{t("aucuneCandidature")}</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">{t("parcourezOffres")}</p>
                    <Button asChild>
                      <Link to="/offres">{t("voirOffres")}</Link>
                    </Button>
                  </Card>
                ) : (
                  candidatures.map((c) => {
                    const status = statusConfig[c.statut] || statusConfig.en_attente;
                    const StatusIcon = status.icon;
                    return (
                      <Card key={c.id} className="p-4 flex items-center justify-between hover:shadow-md hover:shadow-black/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-semibold">Candidature #{c.id}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {new Date(c.datePostulation).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={status.variant} className="gap-1.5">
                          <StatusIcon className="size-3.5" aria-hidden="true" />
                          {status.label}
                        </Badge>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profil">
            {loading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-5 w-44" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-10 w-40 mt-8" />
                </CardContent>
              </Card>
            ) : profil && (
              <Card>
                <CardContent className="p-8">
                  {!editing ? (
                    <>
                      <h2 className="font-heading text-xl font-bold mb-6">{t("infoPersonnelles")}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          [t("nom"), profil.nom],
                          [t("prenom"), profil.prenom],
                          [t("email"), profil.email],
                          [t("telephone"), profil.telephone],
                          [t("diplome"), profil.diplome],
                          [t("niveauEtude"), profil.niveauEtude],
                          [t("experience"), profil.experience],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
                            <p className="font-medium text-base">{value || "\u2014"}</p>
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("lettreMotivation")}</p>
                          <p className="font-medium text-sm whitespace-pre-line text-muted-foreground">{profil.lettreMotivation || "\u2014"}</p>
                        </div>
                      </div>
                      {/* CV Section */}
                      <div className="mt-8 p-5 rounded-xl border border-border bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("monCv")}</p>
                        {profil.cv ? (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <File className="size-4 text-primary" aria-hidden="true" />
                            </div>
                            <a
                              href={profil.cv}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline truncate"
                            >
                              {t("voirCv")}
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-3">{t("aucunCv")}</p>
                        )}
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <Button size="sm" variant="outline" asChild disabled={uploadingCv}>
                            <span>
                              <Upload className="size-3.5" aria-hidden="true" />
                              {uploadingCv ? t("envoi") : profil.cv ? t("remplacerCv") : t("ajouterCv")}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="sr-only"
                            onChange={handleCvUpload}
                            disabled={uploadingCv}
                          />
                        </label>
                      </div>

                      <Button onClick={() => setEditing(true)} className="mt-6" aria-label={t("modifierProfil")}>
                        <Pencil className="size-4" aria-hidden="true" />
                        {t("modifierProfil")}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4 animate-scale-in">
                      <h2 className="font-heading text-xl font-bold mb-4">{t("modifierProfil")}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: "e-nom", label: t("nom"), key: "nom" as const, autoComplete: "family-name" },
                          { id: "e-prenom", label: t("prenom"), key: "prenom" as const, autoComplete: "given-name" },
                          { id: "e-tel", label: t("telephone"), key: "telephone" as const, autoComplete: "tel" },
                          { id: "e-diplome", label: t("diplome"), key: "diplome" as const, autoComplete: "off" },
                          { id: "e-niveau", label: t("niveauEtude"), key: "niveauEtude" as const, autoComplete: "off" },
                          { id: "e-exp", label: t("experience"), key: "experience" as const, autoComplete: "off" },
                        ].map((f) => (
                          <div key={f.id} className="space-y-2">
                            <Label htmlFor={f.id}>{f.label}</Label>
                            <Input
                              id={f.id}
                              value={form[f.key]}
                              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                              autoComplete={f.autoComplete}
                            />
                          </div>
                        ))}
                        <div className="sm:col-span-2 space-y-2">
                          <Label htmlFor="e-lettre">{t("lettreMotivation")}</Label>
                          <Textarea
                            id="e-lettre"
                            rows={4}
                            value={form.lettreMotivation}
                            onChange={(e) => setForm({ ...form, lettreMotivation: e.target.value })}
                            placeholder={t("presentezBrievement")}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-3">
                        <Button variant="outline" onClick={() => setEditing(false)}>{t("annuler")}</Button>
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? t("sauvegarde") : t("sauvegarder")}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

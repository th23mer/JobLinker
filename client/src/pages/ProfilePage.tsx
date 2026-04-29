import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/services/api";
import type { Candidat } from "@/types";
import { AlertCircle, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import CVDragDrop from "@/components/CVDragDrop";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // État du profil
  const [profil, setProfil] = useState<Candidat | null>(null);
  
  // États d'édition
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  // Formulaire d'édition
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    diplome: "",
    niveauEtude: "",
    experience: "",
    cv: "",
    lettreMotivation: "",
  });

  // Chargement initial
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get<Candidat>(`/candidats/${user.id}`)
      .then((p) => {
        setProfil(p);
        setForm({
          nom: p.nom || "",
          prenom: p.prenom || "",
          email: p.email || "",
          telephone: p.telephone || "",
          diplome: p.diplome || "",
          niveauEtude: p.niveauEtude || "",
          experience: p.experience || "",
          cv: p.cv || "",
          lettreMotivation: p.lettreMotivation || "",
        });
      })
      .catch((error) => {
        console.error("Erreur lors du chargement:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  // Calcul du pourcentage de complétion
  const completionPercentage = useMemo(() => {
    if (!profil) return 0;
    const fields = [
      profil.nom,
      profil.prenom,
      profil.telephone,
      profil.diplome,
      profil.niveauEtude,
      profil.experience,
      profil.lettreMotivation,
      profil.cv,
    ];
    const filledFields = fields.filter((f) => f && String(f).trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  }, [profil]);

  // Sauvegarde
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    try {
      const updated = await api.put<Candidat>(`/candidats/${user.id}`, form);
      setProfil(updated as Candidat);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
    }
    setSaving(false);
  };

  // Upload CV
  const handleCvUpload = async (file: File) => {
    if (!user) return;
    setUploadingCv(true);
    try {
      const fd = new FormData();
      fd.append("cv", file);
      const updated = await api.upload<Candidat>(`/candidats/${user.id}/cv`, fd);
      setProfil(updated as Candidat);
      setForm({ ...form, cv: updated.cv || "" });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur upload CV:", error);
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
    }
    setUploadingCv(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-8 text-center">
            <AlertCircle className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Erreur lors du chargement du profil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-extrabold text-foreground mb-2">
            {t("monProfil")}
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérifiez et mettez à jour vos informations personnelles
          </p>
        </div>

        {/* Bandeau de complétion */}
        <ProfileCompletionBanner completionPercentage={completionPercentage} />

        {/* Messages de succès/erreur */}
        {saveSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 flex items-center gap-2 animate-scale-in">
            <CheckCircle className="size-5" aria-hidden="true" />
            {t("profilSauvegarde")}
          </div>
        )}
        {saveError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-2 animate-scale-in">
            <AlertCircle className="size-5" aria-hidden="true" />
            Erreur lors de la sauvegarde. Veuillez réessayer.
          </div>
        )}

        {/* Contenu */}
        <div className="space-y-6">
          {!editing ? (
            <>
              {/* Informations personnelles - Consultation */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Informations personnelles</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    ✏️ Éditer
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "nom", label: t("nom"), key: "nom" as const, value: profil.nom },
                    { id: "prenom", label: t("prenom"), key: "prenom" as const, value: profil.prenom },
                    { id: "email", label: t("email"), key: "email" as const, value: profil.email },
                    { id: "telephone", label: t("telephone"), key: "telephone" as const, value: profil.telephone },
                  ].map((field) => (
                    <Card key={field.id} className="border border-border/50 hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {field.label}
                        </p>
                        <p className="text-sm font-medium text-foreground">{field.value || "—"}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Formation - Consultation */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Formation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Diplôme", value: profil.diplome },
                    { label: "Niveau d'études", value: profil.niveauEtude },
                  ].map(({ label, value }) => (
                    <Card key={label} className="border border-border/50 hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {label}
                        </p>
                        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Expérience - Consultation */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Expérience</h3>
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground whitespace-pre-line">{profil.experience || "—"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lettre de motivation - Consultation */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Lettre de motivation</h3>
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground whitespace-pre-line">
                      {profil.lettreMotivation || "—"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CV - Consultation */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Curriculum Vitae</h3>
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    {profil.cv ? (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                        <FileText className="size-5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-900 font-medium flex-1">CV téléchargé</span>
                        <a
                          href={profil.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        >
                          Voir →
                        </a>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Aucun CV téléchargé</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              {/* Infos personnelles - Édition */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "nom", label: t("nom"), key: "nom" as const },
                    { id: "prenom", label: t("prenom"), key: "prenom" as const },
                    { id: "email", label: t("email"), key: "email" as const },
                    { id: "telephone", label: t("telephone"), key: "telephone" as const },
                  ].map((field) => (
                    <Card key={field.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <Label htmlFor={field.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                          {field.label}
                        </Label>
                        <Input
                          id={field.id}
                          type={field.key === "email" ? "email" : field.key === "telephone" ? "tel" : "text"}
                          value={form[field.key]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          disabled={field.key === "email"}
                          className="text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Formation - Édition */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Formation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "diplome", label: "Diplôme", key: "diplome" as const },
                    { id: "niveau", label: "Niveau d'études", key: "niveauEtude" as const },
                  ].map((field) => (
                    <Card key={field.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <Label htmlFor={field.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                          {field.label}
                        </Label>
                        <Input
                          id={field.id}
                          value={form[field.key]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Expérience - Édition */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Expérience</h3>
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <Label htmlFor="experience" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Expérience
                    </Label>
                    <Textarea
                      id="experience"
                      rows={4}
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      placeholder="Décrivez votre expérience professionnelle..."
                      className="text-sm"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Lettre de motivation - Édition */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Lettre de motivation</h3>
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <Label htmlFor="lettre" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Lettre de motivation
                    </Label>
                    <Textarea
                      id="lettre"
                      rows={5}
                      value={form.lettreMotivation}
                      onChange={(e) =>
                        setForm({ ...form, lettreMotivation: e.target.value })
                      }
                      placeholder="Présentez-vous brièvement..."
                      className="text-sm"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* CV - Édition */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Curriculum Vitae</h3>
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <CVDragDrop
                      cvUrl={profil.cv}
                      onUpload={handleCvUpload}
                      disabled={uploadingCv}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="gap-2"
                >
                  ✕ {t("annuler")}
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="gap-2"
                >
                  💾 {saving ? t("sauvegarde") : t("sauvegarder")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

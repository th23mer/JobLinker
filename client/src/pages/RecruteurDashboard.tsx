import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { OffreEmploi, CandidatureWithCandidat, Categorie, Specialite, Recruteur } from "@/types";
import { Plus, Users, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, Inbox, Briefcase, Clock, TrendingUp, Mail, Phone, GraduationCap, FileText, ExternalLink, User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VILLES_TUNISIE = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Bizerte",
  "Djerba",
  "Monastir",
  "Mahdia",
  "Kairouan",
  "Kebili",
  "Tataouine",
  "Kasserine",
  "Sidi Bouzid",
  "Médenine",
  "Tozeur",
  "Gafsa",
  "Ben Arous",
  "Ariana",
  "Nabeul",
  "Manouba",
  "Zaghouan",
];

export default function RecruteurDashboard() {
  const { user } = useAuth();
  const [offres, setOffres] = useState<OffreEmploi[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [selectedOffre, setSelectedOffre] = useState<number | null>(null);
  const [candidatures, setCandidatures] = useState<CandidatureWithCandidat[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    titre: "", description: "", exigences: "", typeContrat: "CDI",
    ville: "", experienceRequise: "", niveauEtude: "", categorieId: "", specialiteId: "",
  });
  const [profil, setProfil] = useState<Recruteur | null>(null);
  const [editingProfil, setEditingProfil] = useState(false);
  const [profilForm, setProfilForm] = useState({
    nomEntreprise: "", matriculeFiscal: "", adresse: "", description: "",
    email: "", telephone: "", nomRepresentant: "", prenomRepresentant: "",
  });
  const [savingProfil, setSavingProfil] = useState(false);

  const selectClass =
    "flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<OffreEmploi[]>(`/offres/recruteur/${user.id}`),
      api.get<Categorie[]>("/categories"),
      api.get<Specialite[]>("/specialites"),
      api.get<Recruteur>(`/recruteurs/${user.id}`),
    ])
      .then(([o, c, s, p]) => {
        setOffres(o);
        setCategories(c);
        setSpecialites(s);
        setProfil(p);
        setProfilForm({
          nomEntreprise: p.nomEntreprise || "",
          matriculeFiscal: p.matriculeFiscal || "",
          adresse: p.adresse || "",
          description: p.description || "",
          email: p.email || "",
          telephone: p.telephone || "",
          nomRepresentant: p.nomRepresentant || "",
          prenomRepresentant: p.prenomRepresentant || "",
        });
      })
      .catch(() => {
        setError("Impossible de charger les donnees. Veuillez reessayer.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const viewCandidatures = async (offreId: number) => {
    if (selectedOffre === offreId) { setSelectedOffre(null); return; }
    setError(null);
    try {
      const c = await api.get<CandidatureWithCandidat[]>(`/candidatures/offre/${offreId}/details`);
      setCandidatures(c);
      setSelectedOffre(offreId);
    } catch {
      setError("Impossible de charger les candidatures.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError(null);
    try {
      const offre = await api.post<OffreEmploi>("/offres", {
        ...form, categorieId: Number(form.categorieId), specialiteId: Number(form.specialiteId), recruteurId: user.id,
      });
      setOffres([offre, ...offres]);
      setShowCreate(false);
      setForm({ titre: "", description: "", exigences: "", typeContrat: "CDI", ville: "", experienceRequise: "", niveauEtude: "", categorieId: "", specialiteId: "" });
      setSuccessMsg("Offre creee avec succes !");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Erreur lors de la creation de l'offre. Veuillez reessayer.");
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Etes-vous sur de vouloir supprimer cette offre ?")) return;
    setError(null);
    try {
      await api.delete(`/offres/${id}`);
      setOffres(offres.filter((o) => o.id !== id));
    } catch {
      setError("Erreur lors de la suppression de l'offre.");
    }
  };

  const handleSaveProfil = async () => {
    if (!user) return;
    setSavingProfil(true);
    setError(null);
    try {
      const updated = await api.put<Recruteur>(`/recruteurs/${user.id}`, profilForm);
      setProfil(updated);
      setEditingProfil(false);
      setSuccessMsg("Profil mis a jour avec succes !");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Erreur lors de la mise a jour du profil.");
    }
    setSavingProfil(false);
  };

  const handleCandidatureAction = async (id: number, action: "accepter" | "refuser") => {
    setError(null);
    try {
      await api.patch(`/candidatures/${id}/${action}`);
      if (selectedOffre) {
        const refreshed = await api.get<CandidatureWithCandidat[]>(`/candidatures/offre/${selectedOffre}/details`);
        setCandidatures(refreshed);
      }
    } catch {
      setError("Erreur lors du traitement de la candidature.");
    }
  };

  const statCards = [
    { label: "Offres publiees", value: offres.length, gradient: "from-primary to-primary-light", icon: Briefcase },
    { label: "En attente", value: offres.filter((o) => o.statutValidation === "en_attente").length, gradient: "from-amber-500 to-orange-400", icon: Clock },
    { label: "Validees", value: offres.filter((o) => o.statutValidation === "validee").length, gradient: "from-emerald-500 to-teal-400", icon: TrendingUp },
  ];

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-heading text-3xl font-extrabold">Espace Recruteur</h1>
            <p className="text-muted-foreground mt-2">Gerez vos offres et les candidatures recues.</p>
          </div>
          <Button variant="success" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="size-4" aria-hidden="true" />
            Nouvelle offre
          </Button>
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success alert */}
        {successMsg && (
          <Alert variant="success" className="mb-8">
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="size-10 rounded-2xl mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-10">
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

        <Tabs defaultValue="offres">
          <TabsList>
            <TabsTrigger value="offres">
              <Briefcase className="size-4" aria-hidden="true" />
              Mes offres
            </TabsTrigger>
            <TabsTrigger value="profil">
              <User className="size-4" aria-hidden="true" />
              Mon profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offres">
        {/* Create form */}
        {showCreate && (
          <Card className="mb-8 animate-scale-in overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-500" />
            <CardHeader>
              <h2 className="font-heading text-xl font-semibold leading-none tracking-tight">Creer une offre</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="required">Titre du poste</Label>
                    <Input required aria-required="true" autoComplete="organization-title" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Developpeur Full Stack" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Decrivez le poste en detail..." />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Exigences</Label>
                    <Textarea rows={2} value={form.exigences} onChange={(e) => setForm({ ...form, exigences: e.target.value })} placeholder="Competences requises..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de contrat</Label>
                    <select aria-label="Type de contrat" value={form.typeContrat} onChange={(e) => setForm({ ...form, typeContrat: e.target.value })} className={selectClass}>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <select value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} className={selectClass} aria-label="Sélectionner une ville">
                      <option value="">-- Choisir une ville --</option>
                      {VILLES_TUNISIE.map((ville) => (
                        <option key={ville} value={ville}>{ville}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input value={form.experienceRequise} onChange={(e) => setForm({ ...form, experienceRequise: e.target.value })} placeholder="Ex: 2-3 ans" />
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau d'etude</Label>
                    <select aria-label="Niveau d'etude" value={form.niveauEtude} onChange={(e) => setForm({ ...form, niveauEtude: e.target.value })} className={selectClass}>
                      <option value="">Selectionner</option>
                      <option value="Bac">Bac</option>
                      <option value="Bac+2">Bac+2</option>
                      <option value="Bac+3">Bac+3</option>
                      <option value="Bac+5">Bac+5</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categorie</Label>
                    <select aria-label="Categorie" value={form.categorieId} onChange={(e) => setForm({ ...form, categorieId: e.target.value })} className={selectClass}>
                      <option value="">Selectionner</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Specialite</Label>
                    <select aria-label="Specialite" value={form.specialiteId} onChange={(e) => setForm({ ...form, specialiteId: e.target.value })} className={selectClass}>
                      <option value="">Selectionner</option>
                      {specialites.filter((s) => !form.categorieId || s.categorieId === Number(form.categorieId)).map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
                  <Button type="submit" variant="success" disabled={creating}>{creating ? "Creation..." : "Publier l'offre"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Offers list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-11 rounded-2xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
              </Card>
            ))}
          </div>
        ) : offres.length === 0 ? (
          <Card className="p-20 text-center">
            <div className="size-20 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Inbox className="size-9 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-lg font-bold mb-2">Aucune offre</h3>
            <p className="text-muted-foreground text-sm mb-6">Creez votre premiere offre d'emploi.</p>
            <Button variant="success" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Creer ma premiere offre
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {offres.map((offre) => (
              <Card key={offre.id} className="overflow-hidden hover:shadow-md hover:shadow-black/[0.03] transition-all">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="size-11 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                      <Briefcase className="size-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading font-bold truncate">{offre.titre}</h3>
                        <Badge variant={offre.statutValidation === "en_attente" ? "warning" : "success"}>
                          {offre.statutValidation === "en_attente" ? "En attente" : "Validee"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{offre.ville} &middot; {offre.typeContrat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => viewCandidatures(offre.id)}>
                      <Users className="size-4" aria-hidden="true" />
                      Candidatures
                      {selectedOffre === offre.id ? <ChevronUp className="size-3.5" aria-hidden="true" /> : <ChevronDown className="size-3.5" aria-hidden="true" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(offre.id)} className="text-muted-foreground hover:text-destructive" aria-label="Supprimer l'offre">
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {selectedOffre === offre.id && (
                  <div className="border-t bg-muted/20 p-6 animate-scale-in">
                    {candidatures.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-6">Aucune candidature recue pour cette offre</p>
                    ) : (
                      <div className="space-y-4">
                        {candidatures.map((c) => (
                          <Card key={c.id} className="overflow-hidden">
                            {/* Candidate header */}
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="font-heading font-bold text-primary text-sm">
                                    {c.candidatPrenom?.[0]}{c.candidatNom?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-bold">{c.candidatPrenom} {c.candidatNom}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Postule le {new Date(c.datePostulation).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {c.statut === "en_attente" ? (
                                  <>
                                    <Button variant="success" size="sm" onClick={() => handleCandidatureAction(c.id, "accepter")} aria-label="Accepter la candidature">
                                      <CheckCircle className="size-4" aria-hidden="true" />
                                      Accepter
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleCandidatureAction(c.id, "refuser")} className="text-destructive border-destructive/30 hover:bg-destructive/5" aria-label="Refuser la candidature">
                                      <XCircle className="size-4" aria-hidden="true" />
                                      Refuser
                                    </Button>
                                  </>
                                ) : (
                                  <Badge variant={c.statut === "acceptee" ? "success" : "destructive"} className="gap-1.5">
                                    {c.statut === "acceptee" ? <CheckCircle className="size-3.5" aria-hidden="true" /> : <XCircle className="size-3.5" aria-hidden="true" />}
                                    {c.statut === "acceptee" ? "Acceptee" : "Refusee"}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Candidate details */}
                            <div className="border-t bg-muted/20 px-4 py-4">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                                  <a href={`mailto:${c.candidatEmail}`} className="text-primary hover:underline truncate">{c.candidatEmail}</a>
                                </div>
                                {c.candidatTelephone && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>{c.candidatTelephone}</span>
                                  </div>
                                )}
                                {c.candidatDiplome && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <GraduationCap className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>{c.candidatDiplome}{c.candidatNiveauEtude ? ` (${c.candidatNiveauEtude})` : ""}</span>
                                  </div>
                                )}
                                {c.candidatExperience && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>{c.candidatExperience}</span>
                                  </div>
                                )}
                              </div>

                              {/* CV + motivation */}
                              <div className="mt-4 flex flex-col gap-3">
                                {(c.cv || c.candidatCv) && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                                    <a
                                      href={c.cv || c.candidatCv}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                                    >
                                      Voir le CV
                                      <ExternalLink className="size-3" aria-hidden="true" />
                                    </a>
                                  </div>
                                )}
                                {c.lettreMotivation && (
                                  <div className="bg-background rounded-xl border border-border/60 p-4">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lettre de motivation</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{c.lettreMotivation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="profil">
            {profil && (
              <Card>
                <CardContent className="p-8">
                  {!editingProfil ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl font-bold">Profil de l'entreprise</h2>
                        <Badge variant={profil.statutValidation === "validee" ? "success" : "warning"}>
                          {profil.statutValidation === "validee" ? "Compte valide" : "En attente de validation"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          ["Nom de l'entreprise", profil.nomEntreprise],
                          ["Matricule fiscal", profil.matriculeFiscal],
                          ["Email", profil.email],
                          ["Telephone", profil.telephone],
                          ["Adresse", profil.adresse],
                          ["Nom du representant", profil.nomRepresentant],
                          ["Prenom du representant", profil.prenomRepresentant],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
                            <p className="font-medium text-base">{value || "\u2014"}</p>
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description de l'activite</p>
                          <p className="font-medium text-base whitespace-pre-line">{profil.description || "\u2014"}</p>
                        </div>
                      </div>
                      <Button onClick={() => setEditingProfil(true)} className="mt-6">
                        <Pencil className="size-4" aria-hidden="true" />
                        Modifier le profil
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4 animate-scale-in">
                      <h2 className="font-heading text-xl font-bold mb-4">Modifier le profil</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="p-nom">Nom de l'entreprise</Label>
                          <Input id="p-nom" value={profilForm.nomEntreprise} onChange={(e) => setProfilForm({ ...profilForm, nomEntreprise: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="p-mat">Matricule fiscal</Label>
                          <Input id="p-mat" value={profilForm.matriculeFiscal} onChange={(e) => setProfilForm({ ...profilForm, matriculeFiscal: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="p-email">Email</Label>
                          <Input id="p-email" type="email" value={profilForm.email} onChange={(e) => setProfilForm({ ...profilForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="p-tel">Telephone</Label>
                          <Input id="p-tel" value={profilForm.telephone} onChange={(e) => setProfilForm({ ...profilForm, telephone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="p-adr">Adresse</Label>
                          <Input id="p-adr" value={profilForm.adresse} onChange={(e) => setProfilForm({ ...profilForm, adresse: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="p-rep-nom">Nom du representant</Label>
                          <Input id="p-rep-nom" value={profilForm.nomRepresentant} onChange={(e) => setProfilForm({ ...profilForm, nomRepresentant: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="p-rep-prenom">Prenom du representant</Label>
                          <Input id="p-rep-prenom" value={profilForm.prenomRepresentant} onChange={(e) => setProfilForm({ ...profilForm, prenomRepresentant: e.target.value })} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="p-desc">Description de l'activite</Label>
                          <Textarea id="p-desc" rows={3} value={profilForm.description} onChange={(e) => setProfilForm({ ...profilForm, description: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-3">
                        <Button variant="outline" onClick={() => setEditingProfil(false)}>Annuler</Button>
                        <Button onClick={handleSaveProfil} disabled={savingProfil} variant="success">
                          {savingProfil ? "Sauvegarde..." : "Sauvegarder"}
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

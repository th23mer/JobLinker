import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { Recruteur, OffreEmploi, Categorie, Specialite } from "@/types";
import { Shield, Building2, Briefcase, Tag, CheckCircle, Plus, Trash2, Pencil, X, Save, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferDetailsDialog } from "@/components/recruiter/OfferDetailsDialog";

type ConfirmDelete = {
  kind: "offre" | "categorie" | "specialite";
  id: number;
  label: string;
};

export default function AdminDashboard() {
  const [recruteurs, setRecruteurs] = useState<Recruteur[]>([]);
  const [offres, setOffres] = useState<OffreEmploi[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; type: "success" | "error"; message: string }>>([]);

  const [newCatName, setNewCatName] = useState("");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecCatId, setNewSpecCatId] = useState("");
  const [editingCat, setEditingCat] = useState<{ id: number; nom: string } | null>(null);
  const [editingSpec, setEditingSpec] = useState<{ id: number; nom: string } | null>(null);
  const [validatingRecruteurId, setValidatingRecruteurId] = useState<number | null>(null);
  const [validatingOffreId, setValidatingOffreId] = useState<number | null>(null);
  const [deletingOffreId, setDeletingOffreId] = useState<number | null>(null);
  const [creatingCat, setCreatingCat] = useState(false);
  const [updatingCatId, setUpdatingCatId] = useState<number | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<number | null>(null);
  const [creatingSpec, setCreatingSpec] = useState(false);
  const [updatingSpecId, setUpdatingSpecId] = useState<number | null>(null);
  const [deletingSpecId, setDeletingSpecId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [detailsOffre, setDetailsOffre] = useState<OffreEmploi | null>(null);

  const selectClass =
    "flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const pushToast = (type: "success" | "error", message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<Recruteur[]>("/recruteurs"),
      api.get<OffreEmploi[]>("/offres/admin"),
      api.get<Categorie[]>("/categories"),
      api.get<Specialite[]>("/specialites"),
    ])
      .then(([r, o, c, s]) => {
        setRecruteurs(r);
        setOffres(o);
        setCategories(c);
        setSpecialites(s);
      })
      .catch(() => {
        setError("Impossible de charger les donnees. Veuillez reessayer.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const validerRecruteur = async (id: number) => {
    setValidatingRecruteurId(id);
    try {
      const updated = await api.patch<Recruteur>(`/recruteurs/${id}/valider`);
      setRecruteurs(recruteurs.map((r) => (r.id === id ? updated : r)));
      showSuccess("Recruteur valide avec succes.");
      pushToast("success", "Recruteur valide avec succes.");
    } catch {
      setError("Erreur lors de la validation du recruteur.");
      pushToast("error", "Impossible de valider ce recruteur.");
    } finally {
      setValidatingRecruteurId(null);
    }
  };

  const validerOffre = async (id: number) => {
    setValidatingOffreId(id);
    try {
      const updated = await api.patch<OffreEmploi>(`/offres/${id}/valider`);
      setOffres(offres.map((o) => (o.id === id ? updated : o)));
      setDetailsOffre((cur) => (cur && cur.id === id ? null : cur));
      showSuccess("Offre validee avec succes.");
      pushToast("success", "Offre validee avec succes.");
    } catch {
      setError("Erreur lors de la validation de l'offre.");
      pushToast("error", "Impossible de valider cette offre.");
    } finally {
      setValidatingOffreId(null);
    }
  };

  const deleteOffre = async (id: number) => {
    setDeletingOffreId(id);
    try {
      await api.delete(`/offres/${id}`);
      setOffres(offres.filter((o) => o.id !== id));
      showSuccess("Offre supprimee avec succes.");
      pushToast("success", "Offre supprimee avec succes.");
    } catch {
      setError("Erreur lors de la suppression de l'offre.");
      pushToast("error", "Impossible de supprimer cette offre.");
    } finally {
      setDeletingOffreId(null);
    }
  };

  const createCat = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const cat = await api.post<Categorie>("/categories", { nom: newCatName });
      setCategories([...categories, cat]);
      setNewCatName("");
      showSuccess("Categorie creee avec succes.");
      pushToast("success", "Categorie creee avec succes.");
    } catch {
      setError("Erreur lors de la creation de la categorie.");
      pushToast("error", "Impossible de creer la categorie.");
    } finally {
      setCreatingCat(false);
    }
  };

  const updateCat = async () => {
    if (!editingCat) return;
    setUpdatingCatId(editingCat.id);
    try {
      const cat = await api.put<Categorie>(`/categories/${editingCat.id}`, { nom: editingCat.nom });
      setCategories(categories.map((c) => (c.id === cat.id ? cat : c)));
      setEditingCat(null);
      showSuccess("Categorie modifiee avec succes.");
      pushToast("success", "Categorie modifiee avec succes.");
    } catch {
      setError("Erreur lors de la modification de la categorie.");
      pushToast("error", "Impossible de modifier la categorie.");
    } finally {
      setUpdatingCatId(null);
    }
  };

  const deleteCat = async (id: number) => {
    setDeletingCatId(id);
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
      setSpecialites(specialites.filter((s) => s.categorieId !== id));
      showSuccess("Categorie supprimee avec succes.");
      pushToast("success", "Categorie supprimee avec succes.");
    } catch {
      setError("Erreur lors de la suppression de la categorie.");
      pushToast("error", "Impossible de supprimer la categorie.");
    } finally {
      setDeletingCatId(null);
    }
  };

  const createSpec = async () => {
    if (!newSpecName.trim() || !newSpecCatId) return;
    setCreatingSpec(true);
    try {
      const spec = await api.post<Specialite>("/specialites", { nom: newSpecName, categorieId: Number(newSpecCatId) });
      setSpecialites([...specialites, spec]);
      setNewSpecName("");
      setNewSpecCatId("");
      showSuccess("Specialite creee avec succes.");
      pushToast("success", "Specialite creee avec succes.");
    } catch {
      setError("Erreur lors de la creation de la specialite.");
      pushToast("error", "Impossible de creer la specialite.");
    } finally {
      setCreatingSpec(false);
    }
  };

  const updateSpec = async () => {
    if (!editingSpec) return;
    setUpdatingSpecId(editingSpec.id);
    try {
      const spec = await api.put<Specialite>(`/specialites/${editingSpec.id}`, { nom: editingSpec.nom });
      setSpecialites(specialites.map((s) => (s.id === spec.id ? spec : s)));
      setEditingSpec(null);
      showSuccess("Specialite modifiee avec succes.");
      pushToast("success", "Specialite modifiee avec succes.");
    } catch {
      setError("Erreur lors de la modification de la specialite.");
      pushToast("error", "Impossible de modifier la specialite.");
    } finally {
      setUpdatingSpecId(null);
    }
  };

  const deleteSpec = async (id: number) => {
    setDeletingSpecId(id);
    try {
      await api.delete(`/specialites/${id}`);
      setSpecialites(specialites.filter((s) => s.id !== id));
      showSuccess("Specialite supprimee avec succes.");
      pushToast("success", "Specialite supprimee avec succes.");
    } catch {
      setError("Erreur lors de la suppression de la specialite.");
      pushToast("error", "Impossible de supprimer la specialite.");
    } finally {
      setDeletingSpecId(null);
    }
  };

  const requestDelete = (kind: ConfirmDelete["kind"], id: number, label: string) => {
    setConfirmDelete({ kind, id, label });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setConfirmingDelete(true);
    try {
      if (confirmDelete.kind === "offre") {
        await deleteOffre(confirmDelete.id);
      }
      if (confirmDelete.kind === "categorie") {
        await deleteCat(confirmDelete.id);
      }
      if (confirmDelete.kind === "specialite") {
        await deleteSpec(confirmDelete.id);
      }
      setConfirmDelete(null);
    } finally {
      setConfirmingDelete(false);
    }
  };

  const statCards = [
    { label: "Recruteurs", value: recruteurs.length, gradient: "from-blue-500 to-cyan-400", icon: Building2, pending: recruteurs.filter((r) => r.statutValidation === "en_attente").length },
    { label: "Offres", value: offres.length, gradient: "from-violet-500 to-purple-400", icon: Briefcase, pending: offres.filter((o) => o.statutValidation === "en_attente").length },
    { label: "Categories", value: categories.length, gradient: "from-emerald-500 to-teal-400", icon: Tag },
    { label: "Specialites", value: specialites.length, gradient: "from-amber-500 to-orange-400", icon: Sparkles },
  ];

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {toasts.length > 0 && (
          <div className="pointer-events-none fixed right-4 top-24 z-[80] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-md ${
                  toast.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-red-300 bg-red-50 text-red-800"
                }`}
                role="status"
                aria-live="polite"
              >
                {toast.message}
              </div>
            ))}
          </div>
        )}

        {/* Feedback banners */}
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between" role="alert">
            <span>{error}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setError(null)} aria-label="Fermer l'erreur">
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {successMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="size-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="size-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold">Administration</h1>
        </div>
        <p className="text-muted-foreground mb-10 ml-16">Gerez la plateforme JobLinker</p>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden p-6">
                <Skeleton className="size-10 rounded-2xl mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {statCards.map((s) => (
              <Card key={s.label} className="relative overflow-hidden p-6">
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${s.gradient}`} />
                <div className={`size-10 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="size-5 text-white" aria-hidden="true" />
                </div>
                <p className="text-3xl font-extrabold font-heading">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
                {"pending" in s && s.pending !== undefined && s.pending > 0 && (
                  <Badge variant="warning" className="absolute top-4 right-4">{s.pending}</Badge>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-80 rounded-xl" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="recruteurs">
            <TabsList>
              <TabsTrigger value="recruteurs">
                <Building2 className="size-4" aria-hidden="true" />
                Recruteurs
                <Badge variant="secondary" className="ml-1">{recruteurs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="offres">
                <Briefcase className="size-4" aria-hidden="true" />
                Offres
                <Badge variant="secondary" className="ml-1">{offres.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Tag className="size-4" aria-hidden="true" />
                Categories
                <Badge variant="secondary" className="ml-1">{categories.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Recruteurs */}
            <TabsContent value="recruteurs">
              <div className="space-y-4">
                {recruteurs.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Building2 className="size-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-muted-foreground text-sm">Aucun recruteur pour le moment.</p>
                  </Card>
                ) : (
                  recruteurs.map((r) => (
                    <Card key={r.id} className="p-4 flex items-center justify-between hover:shadow-md hover:shadow-black/[0.03] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                          <Building2 className="size-5 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-bold">{r.nomEntreprise}</h3>
                          <p className="text-sm text-muted-foreground">{r.email} &middot; {r.telephone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={r.statutValidation === "en_attente" ? "warning" : "success"}>
                          {r.statutValidation === "en_attente" ? "En attente" : "Valide"}
                        </Badge>
                        {r.statutValidation === "en_attente" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => validerRecruteur(r.id)}
                            disabled={validatingRecruteurId === r.id}
                          >
                            <CheckCircle className="size-4" aria-hidden="true" />
                            {validatingRecruteurId === r.id ? "Validation..." : "Valider"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Offres */}
            <TabsContent value="offres">
              <div className="space-y-4">
                {offres.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Briefcase className="size-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-muted-foreground text-sm">Aucune offre pour le moment.</p>
                  </Card>
                ) : (
                  offres.map((o) => (
                    <Card key={o.id} className="p-4 flex items-center justify-between hover:shadow-md hover:shadow-black/[0.03] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                          <Briefcase className="size-5 text-violet-600" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold">{o.titre}</h3>
                            <Badge variant={o.statutValidation === "en_attente" ? "warning" : "success"}>
                              {o.statutValidation === "en_attente" ? "En attente" : "Validee"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{o.ville} &middot; {o.typeContrat}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailsOffre(o)}
                          aria-label="Voir les details de l'offre"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                          Détails
                        </Button>
                        {o.statutValidation === "en_attente" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => validerOffre(o.id)}
                            disabled={validatingOffreId === o.id}
                          >
                            <CheckCircle className="size-4" aria-hidden="true" />
                            {validatingOffreId === o.id ? "Validation..." : "Valider"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => requestDelete("offre", o.id, o.titre)}
                          disabled={deletingOffreId === o.id}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Supprimer l'offre"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Categories */}
            <TabsContent value="categories">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle><h2 className="text-lg font-semibold">Categories</h2></CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Nouvelle categorie..."
                        onKeyDown={(e) => e.key === "Enter" && createCat()}
                        aria-label="Nom de la nouvelle categorie"
                        autoComplete="off"
                      />
                      <Button onClick={createCat} size="icon" aria-label="Ajouter une categorie">
                        {creatingCat ? <span className="text-xs">...</span> : <Plus className="size-4" aria-hidden="true" />}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {categories.length === 0 ? (
                        <div className="text-center py-6">
                          <Tag className="size-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                          <p className="text-muted-foreground text-sm">Aucune categorie pour le moment.</p>
                        </div>
                      ) : (
                        categories.map((c) => (
                          <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border/40 group hover:border-border/80 transition-all">
                            {editingCat?.id === c.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editingCat.nom}
                                  onChange={(e) => setEditingCat({ ...editingCat, nom: e.target.value })}
                                  className="h-9"
                                  onKeyDown={(e) => e.key === "Enter" && updateCat()}
                                  aria-label="Modifier le nom de la categorie"
                                  autoComplete="off"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={updateCat}
                                  disabled={updatingCatId === c.id}
                                  className="text-emerald-600"
                                  aria-label="Enregistrer la categorie"
                                >
                                  <Save className="size-4" aria-hidden="true" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => setEditingCat(null)} aria-label="Annuler la modification">
                                  <X className="size-4" aria-hidden="true" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium text-sm">{c.nom}</h3>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon-sm" onClick={() => setEditingCat({ id: c.id, nom: c.nom })} className="text-muted-foreground hover:text-primary" aria-label={`Modifier la categorie ${c.nom}`}>
                                    <Pencil className="size-3.5" aria-hidden="true" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => requestDelete("categorie", c.id, c.nom)}
                                    disabled={deletingCatId === c.id}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label={`Supprimer la categorie ${c.nom}`}
                                  >
                                    <Trash2 className="size-3.5" aria-hidden="true" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle><h2 className="text-lg font-semibold">Specialites</h2></CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <select
                        value={newSpecCatId}
                        onChange={(e) => setNewSpecCatId(e.target.value)}
                        className={`${selectClass} max-w-[140px]`}
                        aria-label="Categorie de la specialite"
                      >
                        <option value="">Categorie</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                      <Input
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        placeholder="Nouvelle specialite..."
                        onKeyDown={(e) => e.key === "Enter" && createSpec()}
                        aria-label="Nom de la nouvelle specialite"
                        autoComplete="off"
                      />
                      <Button onClick={createSpec} size="icon" aria-label="Ajouter une specialite" disabled={creatingSpec}>
                        {creatingSpec ? <span className="text-xs">...</span> : <Plus className="size-4" aria-hidden="true" />}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {specialites.length === 0 ? (
                        <div className="text-center py-6">
                          <Sparkles className="size-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                          <p className="text-muted-foreground text-sm">Aucune specialite pour le moment.</p>
                        </div>
                      ) : (
                        specialites.map((s) => (
                          <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border/40 group hover:border-border/80 transition-all">
                            {editingSpec?.id === s.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editingSpec.nom}
                                  onChange={(e) => setEditingSpec({ ...editingSpec, nom: e.target.value })}
                                  className="h-9"
                                  onKeyDown={(e) => e.key === "Enter" && updateSpec()}
                                  aria-label="Modifier le nom de la specialite"
                                  autoComplete="off"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={updateSpec}
                                  disabled={updatingSpecId === s.id}
                                  className="text-emerald-600"
                                  aria-label="Enregistrer la specialite"
                                >
                                  <Save className="size-4" aria-hidden="true" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => setEditingSpec(null)} aria-label="Annuler la modification">
                                  <X className="size-4" aria-hidden="true" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <h3 className="font-medium text-sm">{s.nom}</h3>
                                  <Badge variant="secondary" className="ml-2 text-[10px]">{categories.find((c) => c.id === s.categorieId)?.nom}</Badge>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon-sm" onClick={() => setEditingSpec({ id: s.id, nom: s.nom })} className="text-muted-foreground hover:text-primary" aria-label={`Modifier la specialite ${s.nom}`}>
                                    <Pencil className="size-3.5" aria-hidden="true" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => requestDelete("specialite", s.id, s.nom)}
                                    disabled={deletingSpecId === s.id}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label={`Supprimer la specialite ${s.nom}`}
                                  >
                                    <Trash2 className="size-3.5" aria-hidden="true" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <OfferDetailsDialog
          offre={detailsOffre}
          categories={categories}
          specialites={specialites}
          onClose={() => setDetailsOffre(null)}
          onValidate={validerOffre}
          validating={detailsOffre ? validatingOffreId === detailsOffre.id : false}
        />

        {confirmDelete && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
            role="presentation"
            onClick={() => {
              if (!confirmingDelete) setConfirmDelete(null);
            }}
          >
            <Card
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-delete-title"
              aria-describedby="admin-delete-description"
              className="w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-6">
                <h3 id="admin-delete-title" className="font-heading text-lg font-bold text-center">
                  Confirmer la suppression
                </h3>
                <p id="admin-delete-description" className="mt-2 text-sm text-muted-foreground text-center">
                  Cette action est irreversible. L'element
                  <span className="font-semibold text-foreground"> "{confirmDelete.label}"</span>
                  sera supprime definitivement.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    disabled={confirmingDelete}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={confirmingDelete}
                  >
                    {confirmingDelete ? "Suppression..." : "Supprimer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { OffreEmploi, CandidatureWithCandidat, Categorie, Specialite, Recruteur } from "@/types";
import { Plus, Briefcase, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation, useNavigate } from "react-router-dom";

/* ── Sub-components ── */
import { StatsCards } from "@/components/recruiter/StatsCards";
import { FilterBar } from "@/components/recruiter/FilterBar";
import { JobCard, JobCardSkeleton } from "@/components/recruiter/JobCard";
import { OfferFormSheet, type OfferFormData } from "@/components/recruiter/OfferFormSheet";
import { DeleteOfferDialog } from "@/components/recruiter/DeleteOfferDialog";
import { ProfileDialog } from "@/components/recruiter/ProfileDialog";

type ApiSpecialite = Specialite & { categorie_id?: number | string; id: number | string };

const normalizeSpecialites = (items: ApiSpecialite[]): Specialite[] =>
  items
    .map((item) => ({
      ...item,
      id: Number(item.id),
      categorieId: Number(item.categorieId ?? item.categorie_id),
    }))
    .filter((item) => Number.isFinite(item.id) && Number.isFinite(item.categorieId));

/* ══════════════════════════════════════════════════════════
   RecruteurDashboard — orchestrator
   ══════════════════════════════════════════════════════════ */

export default function RecruteurDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profilOpen = new URLSearchParams(location.search).get("profile") === "1";

  /* ── Filters ── */
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "en_cours" | "validee" | "expiree">("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "candidatures">("date");

  /* ── Data ── */
  const [offres, setOffres] = useState<OffreEmploi[]>([]);
  const [candidatureStats, setCandidatureStats] = useState<Record<number, { total: number; nouvelles: number }>>({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [selectedOffre, setSelectedOffre] = useState<number | null>(null);
  const [candidatures, setCandidatures] = useState<CandidatureWithCandidat[]>([]);
  const [candidatureActionLoadingId, setCandidatureActionLoadingId] = useState<number | null>(null);

  /* ── Delete ── */
  const [deleteTarget, setDeleteTarget] = useState<OffreEmploi | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);

  /* ── Offer form ── */
  const [showCreate, setShowCreate] = useState(false);
  const [editingOffre, setEditingOffre] = useState<OffreEmploi | null>(null);
  const [creating, setCreating] = useState(false);
  const emptyOfferForm: OfferFormData = {
    titre: "",
    description: "",
    exigences: "",
    typeContrat: "CDI",
    ville: "",
    experienceRequise: "",
    niveauEtude: "",
    categorieId: "",
    specialiteId: "",
  };
  const [form, setForm] = useState<OfferFormData>({ ...emptyOfferForm });
  const [offerTouched, setOfferTouched] = useState<Record<string, boolean>>({});
  const [offerErrors, setOfferErrors] = useState<Record<string, string>>({});
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const createButtonRef = useRef<HTMLButtonElement | null>(null);

  /* ── Profile ── */
  const [profil, setProfil] = useState<Recruteur | null>(null);
  const [editingProfil, setEditingProfil] = useState(false);
  const [profilForm, setProfilForm] = useState({
    nomEntreprise: "",
    matriculeFiscal: "",
    adresse: "",
    description: "",
    email: "",
    telephone: "",
    nomRepresentant: "",
    prenomRepresentant: "",
  });
  const [savingProfil, setSavingProfil] = useState(false);

  /* ── General UI ── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; type: "success" | "error"; message: string }>>([]);

  /* ════════════════════════════════════════════
     Keyboard shortcut: Escape to close overlays
     ════════════════════════════════════════════ */

  useEffect(() => {
    setEditingProfil(false);
  }, [location.search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDeleteTarget(null);
        setShowCreate(false);
        setEditingOffre(null);
        setEditingProfil(false);
        navigate("/recruteur", { replace: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  /* ════════════════════════════════════════════
     Filter logic
     ════════════════════════════════════════════ */

  const resetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setContractFilter("all");
    setLocationFilter("all");
    setSortBy("date");
  };

  const pushToast = (type: "success" | "error", message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const contractOptions = useMemo(
    () => ["all", ...Array.from(new Set(offres.map((o) => o.typeContrat).filter(Boolean)))],
    [offres]
  );

  const locationOptions = useMemo(
    () => ["all", ...Array.from(new Set(offres.map((o) => o.ville).filter(Boolean)))],
    [offres]
  );

  const filteredOffres = useMemo(() => {
    const bySearch = (offre: OffreEmploi) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        offre.titre.toLowerCase().includes(q) ||
        offre.ville?.toLowerCase().includes(q) ||
        offre.typeContrat?.toLowerCase().includes(q)
      );
    };

    const byStatus = (offre: OffreEmploi) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "en_cours") return offre.statutValidation === "en_attente";
      return offre.statutValidation === statusFilter;
    };

    const byContract = (offre: OffreEmploi) =>
      contractFilter === "all" || offre.typeContrat === contractFilter;
    const byLocation = (offre: OffreEmploi) =>
      locationFilter === "all" || offre.ville === locationFilter;

    const list = offres.filter((offre) => bySearch(offre) && byStatus(offre) && byContract(offre) && byLocation(offre));

    return [...list].sort((a, b) => {
      if (sortBy === "candidatures") {
        return (candidatureStats[b.id]?.total ?? 0) - (candidatureStats[a.id]?.total ?? 0);
      }
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aDate !== bDate) return bDate - aDate;
      return b.id - a.id;
    });
  }, [offres, searchQuery, statusFilter, contractFilter, locationFilter, sortBy, candidatureStats]);

  /* ════════════════════════════════════════════
     Offer form helpers
     ════════════════════════════════════════════ */

  const openCreateForm = () => {
    setEditingOffre(null);
    const draftKey = `joblinker:offer-draft:${user?.id ?? "anonymous"}`;
    const draft = window.localStorage.getItem(draftKey);
    if (draft) {
      try {
        setForm({ ...emptyOfferForm, ...(JSON.parse(draft) as OfferFormData) });
      } catch {
        setForm(emptyOfferForm);
      }
    } else {
      setForm(emptyOfferForm);
    }
    setOfferTouched({});
    setOfferErrors({});
    setDraftStatus("idle");
    setShowCreate(true);
  };

  const openEditForm = (offre: OffreEmploi) => {
    setEditingOffre(offre);
    setForm({
      titre: offre.titre || "",
      description: offre.description || "",
      exigences: offre.exigences || "",
      typeContrat: offre.typeContrat || "CDI",
      ville: offre.ville || "",
      experienceRequise: offre.experienceRequise || "",
      niveauEtude: offre.niveauEtude || "",
      categorieId: offre.categorieId ? String(offre.categorieId) : "",
      specialiteId: offre.specialiteId ? String(offre.specialiteId) : "",
    });
    setOfferTouched({});
    setOfferErrors({});
    setDraftStatus("idle");
    setShowCreate(true);
  };

  const closeOfferForm = () => {
    setShowCreate(false);
    setEditingOffre(null);
    setForm(emptyOfferForm);
    setOfferTouched({});
    setOfferErrors({});
    setDraftStatus("idle");
    createButtonRef.current?.focus();
  };

  const validateOfferField = (
    field: keyof OfferFormData,
    value: string,
    currentForm: OfferFormData
  ) => {
    const trimmed = value.trim();
    if (field === "titre" && !trimmed) return "Le titre du poste est obligatoire.";
    if (field === "description" && trimmed.length < 20) return "Ajoutez une description plus claire (minimum 20 caractères).";
    if (field === "exigences" && trimmed.length < 12) return "Ajoutez des exigences plus précises (minimum 12 caractères).";
    if (field === "typeContrat" && !trimmed) return "Sélectionnez un type de contrat.";
    if (field === "ville" && !trimmed) return "La ville est obligatoire.";
    if (field === "categorieId" && !trimmed) return "Sélectionnez une catégorie.";
    if (field === "specialiteId" && !trimmed) return "Sélectionnez une spécialité.";
    if (field === "specialiteId" && trimmed && currentForm.categorieId) {
      const validSpecialite = specialites.some(
        (item) => item.id === Number(trimmed) && item.categorieId === Number(currentForm.categorieId)
      );
      if (!validSpecialite) return "La spécialité doit appartenir à la catégorie choisie.";
    }
    return "";
  };

  const setOfferField = (field: keyof OfferFormData, value: string) => {
    const nextForm = { ...form, [field]: value };
    if (field === "categorieId") {
      const stillValid = specialites.some(
        (item) => item.id === Number(nextForm.specialiteId) && item.categorieId === Number(value)
      );
      if (!stillValid) nextForm.specialiteId = "";
    }
    setForm(nextForm);
    if (offerTouched[field]) {
      const message = validateOfferField(field, nextForm[field], nextForm);
      setOfferErrors((prev) => ({ ...prev, [field]: message }));
    }
    if (field === "categorieId" && offerTouched.specialiteId) {
      const specialiteMessage = validateOfferField("specialiteId", nextForm.specialiteId, nextForm);
      setOfferErrors((prev) => ({ ...prev, specialiteId: specialiteMessage }));
    }
  };

  const handleOfferBlur = (field: keyof OfferFormData) => {
    setOfferTouched((prev) => ({ ...prev, [field]: true }));
    const message = validateOfferField(field, form[field], form);
    setOfferErrors((prev) => ({ ...prev, [field]: message }));
  };

  const validateOfferFields = (fields: Array<keyof OfferFormData>) => {
    const nextTouched = fields.reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    const nextErrors = fields.reduce<Record<string, string>>((acc, key) => {
      acc[key] = validateOfferField(key, form[key], form);
      return acc;
    }, {});
    setOfferTouched((prev) => ({ ...prev, ...nextTouched }));
    setOfferErrors((prev) => ({ ...prev, ...nextErrors }));
    return fields.every((key) => !nextErrors[key]);
  };

  const validateOfferForm = () =>
    validateOfferFields(["titre", "typeContrat", "ville", "categorieId", "specialiteId", "description", "exigences"]);

  useEffect(() => {
    if (!showCreate || editingOffre || !user) return;
    const draftKey = `joblinker:offer-draft:${user.id}`;
    setDraftStatus("saving");
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(form));
      setDraftStatus("saved");
      window.setTimeout(() => setDraftStatus("idle"), 1200);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [form, showCreate, editingOffre, user]);

  /* ════════════════════════════════════════════
     API calls
     ════════════════════════════════════════════ */

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<OffreEmploi[]>(`/offres/recruteur/${user.id}`),
      api.get<Categorie[]>("/categories"),
      api.get<ApiSpecialite[]>("/specialites"),
      api.get<Recruteur>(`/recruteurs/${user.id}`),
    ])
      .then(([o, c, s, p]) => {
        setOffres(o);
        setCategories(c);
        setSpecialites(normalizeSpecialites(s));
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
        setError("Impossible de charger les données. Veuillez réessayer.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  /* Load candidature stats for all offers */
  useEffect(() => {
    if (offres.length === 0) {
      setCandidatureStats({});
      return;
    }
    let cancelled = false;
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const statsEntries = await Promise.all(
          offres.map(async (offre) => {
            try {
              const details = await api.get<CandidatureWithCandidat[]>(
                `/candidatures/offre/${offre.id}/details`
              );
              return [
                offre.id,
                {
                  total: details.length,
                  nouvelles: details.filter((item) => item.statut === "en_attente").length,
                },
              ] as const;
            } catch {
              return [offre.id, { total: 0, nouvelles: 0 }] as const;
            }
          })
        );
        if (!cancelled) setCandidatureStats(Object.fromEntries(statsEntries));
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };
    void loadStats();
    return () => { cancelled = true; };
  }, [offres]);

  /* ── CRUD handlers ── */

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateOfferForm()) {
      setError("Veuillez corriger les champs obligatoires avant de publier l'offre.");
      pushToast("error", "Le formulaire contient des champs invalides.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const payload = {
        ...form,
        categorieId: Number(form.categorieId),
        specialiteId: Number(form.specialiteId),
        recruteurId: user.id,
      };
      if (editingOffre) {
        const offre = await api.put<OffreEmploi>(`/offres/${editingOffre.id}`, payload);
        setOffres((prev) => prev.map((item) => (item.id === offre.id ? offre : item)));
        setSuccessMsg("Offre modifiée avec succès !");
        pushToast("success", "Offre mise à jour avec succès.");
      } else {
        const offre = await api.post<OffreEmploi>("/offres", payload);
        setOffres((prev) => [offre, ...prev]);
        window.localStorage.removeItem(`joblinker:offer-draft:${user.id}`);
        setSuccessMsg("Offre créée avec succès !");
        pushToast("success", "Nouvelle offre publiée.");
      }
      closeOfferForm();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError(
        editingOffre
          ? "Erreur lors de la modification de l'offre. Veuillez réessayer."
          : "Erreur lors de la création de l'offre. Veuillez réessayer."
      );
      pushToast("error", "Impossible d'enregistrer l'offre.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/offres/${deleteTarget.id}`);
      setOffres((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      if (selectedOffre === deleteTarget.id) {
        setSelectedOffre(null);
        setCandidatures([]);
      }
      setDeleteTarget(null);
      setSuccessMsg("Offre supprimée avec succès.");
      pushToast("success", "Offre supprimée.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Erreur lors de la suppression de l'offre.");
      pushToast("error", "Suppression impossible pour le moment.");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (offre: OffreEmploi, trigger?: HTMLElement | null) => {
    deleteTriggerRef.current = trigger ?? null;
    setDeleteTarget(offre);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    deleteTriggerRef.current?.focus();
  };

  /* ── Candidatures ── */

  const viewCandidatures = async (offreId: number) => {
    if (selectedOffre === offreId) {
      setSelectedOffre(null);
      setCandidatures([]);
      return;
    }
    setSelectedOffre(offreId);
    setError(null);
    try {
      const details = await api.get<CandidatureWithCandidat[]>(
        `/candidatures/offre/${offreId}/details`
      );
      setCandidatures(details);
      const total = details.length;
      const nouvelles = details.filter((item) => item.statut === "en_attente").length;
      setCandidatureStats((prev) => ({
        ...prev,
        [offreId]: { total, nouvelles },
      }));
    } catch {
      setCandidatures([]);
      setError("Erreur lors du chargement des candidatures.");
      pushToast("error", "Impossible de charger les candidatures.");
    }
  };

  const handleCandidatureAction = async (id: number, action: "accepter" | "refuser") => {
    setError(null);
    setCandidatureActionLoadingId(id);
    try {
      await api.patch(`/candidatures/${id}/${action}`);
      pushToast("success", action === "accepter" ? "Candidature acceptée." : "Candidature refusée.");
      if (selectedOffre) {
        const refreshed = await api.get<CandidatureWithCandidat[]>(
          `/candidatures/offre/${selectedOffre}/details`
        );
        setCandidatures(refreshed);
        const total = refreshed.length;
        const nouvelles = refreshed.filter((item) => item.statut === "en_attente").length;
        setCandidatureStats((prev) => ({
          ...prev,
          [selectedOffre]: { total, nouvelles },
        }));
      }
    } catch {
      setError("Erreur lors du traitement de la candidature.");
      pushToast("error", "Action candidature impossible.");
    } finally {
      setCandidatureActionLoadingId(null);
    }
  };

  /* ── Profile ── */

  const handleSaveProfil = async () => {
    if (!user) return;
    setSavingProfil(true);
    setError(null);
    try {
      const updated = await api.put<Recruteur>(`/recruteurs/${user.id}`, profilForm);
      setProfil(updated);
      setEditingProfil(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      pushToast("success", "Profil mis à jour.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Erreur lors de la mise à jour du profil.");
      pushToast("error", "Impossible de mettre à jour le profil.");
    }
    setSavingProfil(false);
  };

  const closeProfilOverlay = () => {
    setEditingProfil(false);
    navigate("/recruteur", { replace: true });
  };

  /* ── Time formatting ── */

  const formatRelativeTime = (rawDate?: string) => {
    if (!rawDate) return "Publiée récemment";
    const value = new Date(rawDate).getTime();
    if (Number.isNaN(value)) return "Publiée récemment";
    const diffMs = Date.now() - value;
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    if (diffMs < hourMs) return "Publiée il y a moins d'une heure";
    if (diffMs < dayMs) {
      const hours = Math.max(1, Math.floor(diffMs / hourMs));
      return `Publiée il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    const days = Math.floor(diffMs / dayMs);
    return `Publiée il y a ${days} jour${days > 1 ? "s" : ""}`;
  };

  /* ════════════════════════════════════════════
     Render
     ════════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-20 pb-16">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,oklch(0.85_0.08_160/0.08),transparent_50%),radial-gradient(circle_at_80%_0%,oklch(0.85_0.08_230/0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.35]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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

        {/* ── Page header ── */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="font-heading text-[28px] font-extrabold tracking-tight text-foreground sm:text-[32px]">
              Espace Recruteur
            </h1>
            <p className="max-w-md text-[14px] text-muted-foreground/70 leading-relaxed">
              Pilotez vos offres, suivez les candidatures et optimisez votre recrutement.
            </p>
          </div>
          <Button
            ref={createButtonRef}
            variant="success"
            onClick={openCreateForm}
            className="w-full sm:w-auto sm:shrink-0 shadow-lg shadow-emerald-600/15"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nouvelle offre
          </Button>
        </div>

        {/* Screen reader announcements */}
        <div aria-live="polite" className="sr-only">
          {error || successMsg || ""}
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" className="mb-6 rounded-xl">
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {/* ── Stats cards ── */}
        <StatsCards
          loading={loading}
          totalOffers={offres.length}
          pendingCount={offres.filter((o) => o.statutValidation === "en_attente").length}
          validatedCount={offres.filter((o) => o.statutValidation === "validee").length}
        />

        {/* ── Filter bar (sticky) ── */}
        {!loading && offres.length > 0 && (
          <FilterBar
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => setStatusFilter(v as typeof statusFilter)}
            contractFilter={contractFilter}
            onContractFilterChange={setContractFilter}
            contractOptions={contractOptions}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            locationOptions={locationOptions}
            sortBy={sortBy}
            onSortByChange={(v) => setSortBy(v as typeof sortBy)}
            onReset={resetFilters}
            resultCount={filteredOffres.length}
            totalCount={offres.length}
          />
        )}

        {/* ── Offers list ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : offres.length === 0 ? (
          /* Empty state: no offers at all */
          <Card className="border-border/30 bg-background/80 backdrop-blur-sm p-10 text-center sm:p-14">
            <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-dashed border-border/50 bg-gradient-to-br from-background to-muted/30">
              <Briefcase className="size-8 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-lg font-bold mb-2 text-foreground/90">
              Aucune offre publiée
            </h3>
            <p className="text-muted-foreground/60 text-[13px] mb-8 max-w-xs mx-auto leading-relaxed">
              Publiez votre première offre pour commencer à recevoir des candidatures qualifiées.
            </p>
            <Button variant="success" onClick={openCreateForm} className="shadow-lg shadow-emerald-600/15">
              <Plus className="size-4" aria-hidden="true" />
              Créer ma première offre
            </Button>
          </Card>
        ) : filteredOffres.length === 0 ? (
          /* Empty state: filters match nothing */
          <Card className="border-border/30 bg-background/80 backdrop-blur-sm p-10 text-center sm:p-14">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/40">
              <Inbox className="size-7 text-muted-foreground/25" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-base font-bold mb-2 text-foreground/90">
              Aucune offre correspondante
            </h3>
            <p className="text-muted-foreground/60 text-[13px] mb-6">
              Ajustez vos filtres ou créez une nouvelle offre.
            </p>
            <Button variant="outline" onClick={resetFilters} className="border-border/50">
              Réinitialiser les filtres
            </Button>
          </Card>
        ) : (
          /* Offer cards */
          <div className="space-y-2.5">
            {filteredOffres.map((offre) => (
              <JobCard
                key={offre.id}
                offre={offre}
                stat={candidatureStats[offre.id]}
                loadingStats={loadingStats}
                isExpanded={selectedOffre === offre.id}
                candidatures={selectedOffre === offre.id ? candidatures : []}
                onToggleCandidatures={viewCandidatures}
                onEdit={openEditForm}
                onDelete={openDeleteModal}
                onCandidatureAction={handleCandidatureAction}
                formatRelativeTime={formatRelativeTime}
                actionLoadingId={candidatureActionLoadingId}
                onView={(id) => navigate(`/offres/${id}`)}
              />
            ))}
          </div>
        )}

        {/* ── Offer form sheet ── */}
        <OfferFormSheet
          open={showCreate}
          onOpenChange={(open) => {
            if (!open) closeOfferForm();
          }}
          editingOffre={editingOffre}
          form={form}
          categories={categories}
          specialites={specialites}
          creating={creating}
          offerTouched={offerTouched}
          offerErrors={offerErrors}
          onFieldChange={setOfferField}
          onFieldBlur={handleOfferBlur}
          onValidateFields={validateOfferFields}
          draftStatus={draftStatus}
          onSubmit={handleCreate}
          onClose={closeOfferForm}
        />

        {/* ── Delete dialog ── */}
        <DeleteOfferDialog
          target={deleteTarget}
          deleting={deleting}
          onConfirm={handleDelete}
          onClose={closeDeleteModal}
        />

        {/* ── Profile dialog ── */}
        <ProfileDialog
          profil={profil}
          open={profilOpen}
          editing={editingProfil}
          profilForm={profilForm}
          saving={savingProfil}
          onEdit={() => setEditingProfil(true)}
          onSave={handleSaveProfil}
          onCancelEdit={() => setEditingProfil(false)}
          onClose={closeProfilOverlay}
          onFormChange={(field, value) =>
            setProfilForm((prev) => ({ ...prev, [field]: value }))
          }
        />
      </div>
    </div>
  );
}

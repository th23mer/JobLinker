import { useEffect, useMemo, useState, useRef } from "react";
import type { Categorie, Specialite, OffreEmploi } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/* ── Types ── */

export interface OfferFormData {
  titre: string;
  description: string;
  exigences: string;
  typeContrat: string;
  ville: string;
  experienceRequise: string;
  niveauEtude: string;
  categorieId: string;
  specialiteId: string;
}

interface OfferFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOffre: OffreEmploi | null;
  offerId?: number | string;
  form: OfferFormData;
  categories: Categorie[];
  specialites: Specialite[];
  creating: boolean;
  offerTouched: Record<string, boolean>;
  offerErrors: Record<string, string>;
  onFieldChange: (field: keyof OfferFormData, value: string) => void;
  onFieldBlur: (field: keyof OfferFormData) => void;
  onValidateFields: (fields: Array<keyof OfferFormData>) => boolean;
  onNotify?: (type: "success" | "error", message: string) => void;
  draftStatus: "idle" | "saving" | "saved";
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onRestoreDraft?: (data: OfferFormData) => void;
}

type SpecialiteLike = Specialite & { categorie_id?: number | string; categorieId?: number | string };
const getSpecialiteCategorieId = (s: SpecialiteLike): number =>
  Number(s.categorieId ?? s.categorie_id);

/* ── Step definitions ── */
const STEPS = [
  { label: "Informations de base",      fields: ["titre","typeContrat","ville","categorieId","specialiteId"] as Array<keyof OfferFormData> },
  { label: "Description du poste",      fields: ["description"] as Array<keyof OfferFormData> },
  { label: "Compétences requises",      fields: ["exigences"] as Array<keyof OfferFormData> },
  { label: "Paramètres de publication", fields: [] as Array<keyof OfferFormData> },
];

/* ── Component ── */

export function OfferFormSheet({
  open, onOpenChange, editingOffre, offerId, form,
  categories, specialites, creating,
  offerTouched, offerErrors,
  onFieldChange, onFieldBlur, onValidateFields, onNotify,
  draftStatus, onSubmit, onClose, onRestoreDraft,
}: OfferFormSheetProps) {
  const [step, setStep]               = useState(0);
  const [draftBanner, setDraftBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<OfferFormData | null>(null);

  const draftKey = `joblinker_draft_${offerId ?? "new"}`;

  const filteredSpecialites = useMemo(() => {
    if (!form.categorieId) return specialites;
    const id = Number(form.categorieId);
    return specialites.filter((s) => getSpecialiteCategorieId(s as SpecialiteLike) === id);
  }, [form.categorieId, specialites]);

  /* Completeness score */
  const completeness = useMemo(() => {
    let pct = 0;
    if (form.titre.trim()) pct += 20;
    if (form.typeContrat && form.ville.trim()) pct += 15;
    if (form.experienceRequise) pct += 15;
    if (form.description.trim().length >= 20) pct += 30;
    if (form.exigences.trim().length >= 12) pct += 20;
    return pct;
  }, [form]);

  /* Reset + draft check on open */
  useEffect(() => {
    if (!open) { setStep(0); setDraftBanner(false); setPendingDraft(null); return; }
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) { setPendingDraft(JSON.parse(raw) as OfferFormData); setDraftBanner(true); }
    } catch { /* ignore */ }
  }, [open, draftKey]);

  /* Focus management */
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        sheetRef.current?.querySelector<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )?.focus();
      }, 50);
    } else { prevFocusRef.current?.focus(); }
  }, [open]);

  /* Focus trap */
  useEffect(() => {
    const el = sheetRef.current;
    if (!el || !open) return;
    const onKD = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ));
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener("keydown", onKD);
    return () => el.removeEventListener("keydown", onKD);
  }, [open]);

  const fieldError = (f: string) => offerTouched[f] && offerErrors[f] ? offerErrors[f] : null;

  /* Navigation */
  const goToStep = (target: number) => {
    localStorage.setItem(draftKey, JSON.stringify(form));
    setStep(target);
  };

  const nextStep = () => {
    const fields = STEPS[step].fields;
    if (fields.length && !onValidateFields(fields)) {
      onNotify?.("error", "Veuillez compléter les champs obligatoires avant de continuer.");
      return;
    }
    goToStep(Math.min(step + 1, STEPS.length - 1));
    onNotify?.("success", `${STEPS[step].label} validée.`);
  };

  const saveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify(form));
    onNotify?.("success", "Brouillon sauvegardé.");
    onClose();
  };

  const handleReprendreDraft = () => {
    if (pendingDraft) onRestoreDraft?.(pendingDraft);
    setDraftBanner(false); setPendingDraft(null);
  };

  const handleIgnorerDraft = () => {
    localStorage.removeItem(draftKey);
    setDraftBanner(false); setPendingDraft(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: Array<keyof OfferFormData> = [
      "titre","typeContrat","ville","categorieId","specialiteId","description","exigences",
    ];
    if (!onValidateFields(required)) {
      setStep(0);
      onNotify?.("error", "Veuillez corriger les erreurs avant de publier l'offre.");
      return;
    }
    localStorage.removeItem(draftKey);
    onSubmit(e);
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-border/50 bg-background/90 px-3 text-[13px] text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8 hover:border-border/80";

  const isLastStep = step === STEPS.length - 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-sheet-title"
        className="w-full sm:max-w-lg overflow-y-auto border-l-border/40"
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <SheetHeader className="mb-4 mt-2">
          <SheetTitle id="offer-sheet-title" className="text-xl font-bold">
            {editingOffre ? "Modifier l'offre" : "Nouvelle offre"}
          </SheetTitle>
          <SheetDescription className="text-[13px]">
            {editingOffre
              ? "Mettez à jour les informations de votre offre d'emploi."
              : "Remplissez les informations pour publier une nouvelle offre."}
          </SheetDescription>

          {/* ── Step progress indicator ── */}
          <div className="mt-5" aria-label="Progression" role="group">
            {/* Dots row */}
            <div className="flex items-start">
              {STEPS.map((s, idx) => {
                const isCompleted = idx < step;
                const isCurrent   = idx === step;
                return (
                  <div key={s.label} className="flex flex-1 items-start last:flex-none">
                    <div className="flex flex-col items-center gap-1 min-w-[44px]">
                      <button
                        type="button"
                        onClick={() => isCompleted ? goToStep(idx) : undefined}
                        disabled={!isCompleted}
                        aria-current={isCurrent ? "step" : undefined}
                        aria-label={`${s.label}${isCompleted ? " — cliquer pour revenir" : ""}`}
                        className={[
                          "flex size-8 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          isCurrent  ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-110"
                          : isCompleted ? "border-emerald-500 bg-emerald-500 text-white cursor-pointer hover:scale-105 hover:shadow-md hover:shadow-emerald-500/20"
                          : "border-border/40 bg-muted/30 text-muted-foreground/50 cursor-not-allowed",
                        ].join(" ")}
                      >
                        {isCompleted ? <Check className="size-3.5 stroke-[2.5]" /> : idx + 1}
                      </button>
                      <span className={[
                        "text-[10px] font-medium text-center leading-tight max-w-[52px] break-words",
                        isCurrent   ? "text-foreground font-semibold"
                        : isCompleted ? "text-muted-foreground"
                        : "text-muted-foreground/40",
                      ].join(" ")}>
                        {/* two-word abbreviation */}
                        {s.label.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                    {/* Connector */}
                    {idx < STEPS.length - 1 && (
                      <div className={[
                        "flex-1 h-[2px] mx-1 mt-4 rounded-full transition-all duration-300",
                        idx < step ? "bg-emerald-400" : "bg-border/25",
                      ].join(" ")} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subtitle */}
            <p className="mt-3 text-[12px] text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">
                Étape {step + 1} sur {STEPS.length}
              </span>
              {" — "}{STEPS[step].label}
            </p>
          </div>

          {/* Draft status chip */}
          {draftStatus !== "idle" && (
            <p className="mt-1 text-[11px] text-muted-foreground" aria-live="polite">
              {draftStatus === "saving" ? "Enregistrement…" : "✓ Brouillon enregistré"}
            </p>
          )}
        </SheetHeader>

        {/* ── Draft banner ── */}
        {draftBanner && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-900/10"
          >
            <span className="text-lg leading-none">📋</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-amber-900 dark:text-amber-200">
                Vous avez un brouillon non publié.
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Reprendre votre progression ou démarrer à zéro.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <button
                type="button"
                onClick={handleReprendreDraft}
                className="text-[12px] font-semibold text-amber-800 hover:underline dark:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              >
                Reprendre
              </button>
              <span className="text-amber-300" aria-hidden>·</span>
              <button
                type="button"
                onClick={handleIgnorerDraft}
                className="text-[12px] text-amber-600 hover:text-amber-900 dark:text-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              >
                Ignorer
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* ── Step 0: Informations de base ── */}
          {step === 0 && (
            <>
              <p className="text-[11px] text-muted-foreground/60 -mt-2">
                Les champs marqués <span className="text-destructive font-medium">*</span> sont obligatoires.
              </p>
              <FormField label="Titre du poste" htmlFor="offre-titre" required
                error={fieldError("titre")} errorId="offre-titre-error"
                helperText="Exemple: Développeur Full Stack React/Node.js">
                <Input
                  id="offre-titre" required
                  aria-required="true"
                  aria-invalid={Boolean(fieldError("titre"))}
                  aria-describedby={fieldError("titre") ? "offre-titre-error" : undefined}
                  autoComplete="organization-title"
                  value={form.titre}
                  onChange={(e) => onFieldChange("titre", e.target.value)}
                  onBlur={() => onFieldBlur("titre")}
                  placeholder="Développeur Full Stack React/Node.js"
                  className="h-10 text-[13px]"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Type de contrat" htmlFor="offre-contrat" required
                  error={fieldError("typeContrat")} errorId="offre-contrat-error">
                  <select
                    id="offre-contrat" required
                    aria-required="true"
                    aria-invalid={Boolean(fieldError("typeContrat"))}
                    aria-describedby={fieldError("typeContrat") ? "offre-contrat-error" : undefined}
                    value={form.typeContrat}
                    onChange={(e) => onFieldChange("typeContrat", e.target.value)}
                    onBlur={() => onFieldBlur("typeContrat")}
                    className={selectClass}
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </FormField>

                <FormField label="Ville" htmlFor="offre-ville" required
                  error={fieldError("ville")} errorId="offre-ville-error"
                  helperText="Exemple: Tunis">
                  <Input
                    id="offre-ville" required
                    aria-required="true"
                    aria-invalid={Boolean(fieldError("ville"))}
                    aria-describedby={fieldError("ville") ? "offre-ville-error" : undefined}
                    autoComplete="address-level2"
                    value={form.ville}
                    onChange={(e) => onFieldChange("ville", e.target.value)}
                    onBlur={() => onFieldBlur("ville")}
                    placeholder="Tunis"
                    className="h-10 text-[13px]"
                  />
                </FormField>
              </div>

              <div className="border-t border-border/30" />

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Catégorie" htmlFor="offre-categorie" required
                  error={fieldError("categorieId")} errorId="offre-categorie-error"
                  helperText="Domaine principal">
                  <select
                    id="offre-categorie" required
                    aria-required="true"
                    aria-invalid={Boolean(fieldError("categorieId"))}
                    aria-describedby={fieldError("categorieId") ? "offre-categorie-error" : undefined}
                    value={form.categorieId}
                    onChange={(e) => onFieldChange("categorieId", e.target.value)}
                    onBlur={() => onFieldBlur("categorieId")}
                    className={selectClass}
                  >
                    <option value="">Sélectionner</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Spécialité" htmlFor="offre-specialite" required
                  error={fieldError("specialiteId")} errorId="offre-specialite-error"
                  helperText="Spécialité liée">
                  <select
                    id="offre-specialite" required
                    aria-required="true"
                    aria-invalid={Boolean(fieldError("specialiteId"))}
                    aria-describedby={fieldError("specialiteId") ? "offre-specialite-error" : undefined}
                    value={form.specialiteId}
                    onChange={(e) => onFieldChange("specialiteId", e.target.value)}
                    onBlur={() => onFieldBlur("specialiteId")}
                    className={selectClass}
                  >
                    <option value="">Sélectionner</option>
                    {filteredSpecialites.map((s) => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </>
          )}

          {/* ── Step 1: Description du poste ── */}
          {step === 1 && (
            <FormField label="Description" required htmlFor="offre-description"
              error={fieldError("description")} errorId="offre-description-error"
              helperText="Mission, contexte et responsabilités clés.">
              <Textarea
                id="offre-description" rows={8}
                value={form.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                onBlur={() => onFieldBlur("description")}
                placeholder="Vous intégrerez l'équipe produit pour concevoir et développer de nouvelles fonctionnalités…"
                className="text-[13px]"
              />
            </FormField>
          )}

          {/* ── Step 2: Compétences requises ── */}
          {step === 2 && (
            <>
              <FormField label="Exigences" required htmlFor="offre-exigences"
                error={fieldError("exigences")} errorId="offre-exigences-error"
                helperText="Compétences requises et attentes du poste.">
                <Textarea
                  id="offre-exigences" rows={5}
                  value={form.exigences}
                  onChange={(e) => onFieldChange("exigences", e.target.value)}
                  onBlur={() => onFieldBlur("exigences")}
                  placeholder="3 ans d'expérience, maîtrise de React, collaboration agile…"
                  className="text-[13px]"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Expérience" htmlFor="offre-experience"
                  helperText="Plage d'expérience">
                  <select
                    id="offre-experience"
                    value={form.experienceRequise}
                    onChange={(e) => onFieldChange("experienceRequise", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Sélectionner</option>
                    <option value="0-1">0-1 ans</option>
                    <option value="1-2">1-2 ans</option>
                    <option value="2-3">2-3 ans</option>
                    <option value="3-5">3-5 ans</option>
                    <option value="5-10">5-10 ans</option>
                    <option value="10+">10+ ans</option>
                  </select>
                </FormField>

                <FormField label="Niveau d'étude" htmlFor="offre-niveau"
                  helperText="Licence, Master…">
                  <select
                    id="offre-niveau"
                    value={form.niveauEtude}
                    onChange={(e) => onFieldChange("niveauEtude", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Sélectionner</option>
                    <option value="Bac">Bac</option>
                    <option value="Bac+2">Bac+2</option>
                    <option value="Bac+3">Bac+3</option>
                    <option value="Bac+5">Bac+5</option>
                  </select>
                </FormField>
              </div>
            </>
          )}

          {/* ── Step 3: Paramètres de publication ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/30 bg-muted/20 p-4 space-y-3">
                <p className="text-[12px] font-semibold text-foreground flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">✓</span>
                  Récapitulatif avant publication
                </p>
                <ul className="space-y-2 text-[12px] text-muted-foreground">
                  <li><span className="font-medium text-foreground">Titre :</span> {form.titre || "—"}</li>
                  <li><span className="font-medium text-foreground">Contrat :</span> {form.typeContrat || "—"}</li>
                  <li><span className="font-medium text-foreground">Ville :</span> {form.ville || "—"}</li>
                  <li>
                    <span className="font-medium text-foreground">Description :</span>{" "}
                    {form.description ? `${form.description.slice(0, 100)}${form.description.length > 100 ? "…" : ""}` : "—"}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Exigences :</span>{" "}
                    {form.exigences ? `${form.exigences.slice(0, 100)}${form.exigences.length > 100 ? "…" : ""}` : "—"}
                  </li>
                  {form.experienceRequise && (
                    <li><span className="font-medium text-foreground">Expérience :</span> {form.experienceRequise} ans</li>
                  )}
                  {form.niveauEtude && (
                    <li><span className="font-medium text-foreground">Niveau d'étude :</span> {form.niveauEtude}</li>
                  )}
                </ul>
              </div>

              <p className="text-[11px] text-muted-foreground/60" aria-live="polite">
                Votre offre sera visible rapidement. Vous pourrez la modifier à tout moment.
              </p>
            </div>
          )}

          {/* ── Completeness indicator ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground/70">Complétude de l'offre</p>
              <p className={`text-[11px] font-semibold tabular-nums ${
                completeness >= 80 ? "text-emerald-600" : completeness >= 40 ? "text-amber-600" : "text-muted-foreground"
              }`}>{completeness} %</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} aria-label={`Offre complète à ${completeness}%`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completeness >= 80 ? "bg-emerald-500" : completeness >= 40 ? "bg-amber-400" : "bg-muted-foreground/30"
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* ── Footer navigation ── */}
          <div className="border-t border-border/30 pt-4 flex items-center justify-between gap-2">
            {/* Left side */}
            {step === 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                className="text-[13px] h-9 px-3 gap-1.5 border-border/50 text-muted-foreground hover:text-foreground"
              >
                Sauvegarder brouillon
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep(step - 1)}
                className="text-[13px] h-9 px-3"
              >
                ← Étape précédente
              </Button>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                aria-label="Fermer sans sauvegarder"
                className="text-[13px] h-9 px-3 text-muted-foreground hover:text-foreground"
              >
                Annuler
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={creating}
                  className="text-[13px] h-9 px-4 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md shadow-emerald-600/20 hover:from-emerald-600 hover:to-teal-700 border-0"
                >
                  {creating
                    ? (editingOffre ? "Modification…" : "Publication…")
                    : (editingOffre ? "Enregistrer les modifications" : "Publier l'offre")}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="text-[13px] h-9 px-4 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Suivant →
                </Button>
              )}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ── Reusable form field wrapper ── */

function FormField({
  label, htmlFor, required, error, errorId, helperText, children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string | null;
  errorId?: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[12px] font-medium text-foreground/80">
        {label} {required ? <span aria-hidden="true" className="text-destructive">*</span> : null}
      </Label>
      {children}
      {helperText && !error && (
        <p className="text-[11px] text-muted-foreground/70">{helperText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

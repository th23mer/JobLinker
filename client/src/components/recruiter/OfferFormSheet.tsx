import { useEffect, useMemo, useState } from "react";
import type { Categorie, Specialite, OffreEmploi } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  form: OfferFormData;
  categories: Categorie[];
  specialites: Specialite[];
  creating: boolean;
  offerTouched: Record<string, boolean>;
  offerErrors: Record<string, string>;
  onFieldChange: (field: keyof OfferFormData, value: string) => void;
  onFieldBlur: (field: keyof OfferFormData) => void;
  onValidateFields: (fields: Array<keyof OfferFormData>) => boolean;
  draftStatus: "idle" | "saving" | "saved";
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

type SpecialiteLike = Specialite & { categorie_id?: number | string; categorieId?: number | string };

const getSpecialiteCategorieId = (specialite: SpecialiteLike): number =>
  Number(specialite.categorieId ?? specialite.categorie_id);

/* ── Component ── */

export function OfferFormSheet({
  open,
  onOpenChange,
  editingOffre,
  form,
  categories,
  specialites,
  creating,
  offerTouched,
  offerErrors,
  onFieldChange,
  onFieldBlur,
  onValidateFields,
  draftStatus,
  onSubmit,
  onClose,
}: OfferFormSheetProps) {
  const [step, setStep] = useState(0);

  const filteredSpecialites = useMemo(() => {
    if (!form.categorieId) return specialites;
    const selectedCategorieId = Number(form.categorieId);
    return specialites.filter(
      (specialite) => getSpecialiteCategorieId(specialite) === selectedCategorieId
    );
  }, [form.categorieId, specialites]);

  const steps = useMemo(
    () => [
      {
        label: "1. Informations",
        fields: ["titre", "typeContrat", "ville", "categorieId", "specialiteId"] as Array<keyof OfferFormData>,
      },
      {
        label: "2. Description",
        fields: ["description"] as Array<keyof OfferFormData>,
      },
      {
        label: "3. Exigences",
        fields: ["exigences"] as Array<keyof OfferFormData>,
      },
      {
        label: "4. Vérification",
        fields: [] as Array<keyof OfferFormData>,
      },
    ],
    []
  );

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  const selectClass =
    "h-10 w-full rounded-lg border border-border/50 bg-background/90 px-3 text-[13px] text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8 hover:border-border/80";

  const fieldError = (field: string) =>
    offerTouched[field] && offerErrors[field] ? offerErrors[field] : null;

  const nextStep = () => {
    const fields = steps[step].fields;
    if (fields.length > 0 && !onValidateFields(fields)) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: Array<keyof OfferFormData> = [
      "titre",
      "typeContrat",
      "ville",
      "categorieId",
      "specialiteId",
      "description",
      "exigences",
    ];
    if (!onValidateFields(requiredFields)) {
      setStep(0);
      return;
    }
    onSubmit(e);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-l-border/40">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <SheetHeader className="mb-8 mt-2">
          <SheetTitle className="text-xl font-bold">
            {editingOffre ? "Modifier l'offre" : "Nouvelle offre"}
          </SheetTitle>
          <SheetDescription className="text-[13px]">
            {editingOffre
              ? "Mettez à jour les informations de votre offre d'emploi."
              : "Remplissez les informations pour publier une nouvelle offre."}
          </SheetDescription>

          <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Progression de création">
            {steps.map((stepItem, index) => (
              <button
                key={stepItem.label}
                type="button"
                onClick={() => {
                  if (index <= step) setStep(index);
                }}
                className={`rounded-md border px-2 py-1 text-[11px] ${
                  index === step
                    ? "border-primary/40 bg-primary/[0.06] text-primary"
                    : index < step
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-border/40 bg-muted/30 text-muted-foreground"
                }`}
                aria-current={index === step ? "step" : undefined}
                title={stepItem.label}
              >
                {stepItem.label}
              </button>
            ))}
            {draftStatus !== "idle" && (
              <p className="ml-auto text-[11px] text-muted-foreground" aria-live="polite">
                {draftStatus === "saving" ? "Enregistrement du brouillon..." : "Brouillon enregistré"}
              </p>
            )}
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Title */}
          {step === 0 && (
          <>
          <FormField label="Titre du poste" htmlFor="offre-titre" required error={fieldError("titre")} errorId="offre-titre-error" helperText="Exemple: Développeur Full Stack React/Node.js">
            <Input
              id="offre-titre"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldError("titre"))}
              aria-describedby={fieldError("titre") ? "offre-titre-error" : undefined}
              autoComplete="organization-title"
              value={form.titre}
              onChange={(e) => onFieldChange("titre", e.target.value)}
              onBlur={() => onFieldBlur("titre")}
              placeholder="Exemple: Développeur Full Stack React/Node.js"
              className="h-10 text-[13px]"
            />
          </FormField>

          {/* Contract + City */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type de contrat" htmlFor="offre-contrat" required error={fieldError("typeContrat")} errorId="offre-contrat-error" helperText="Choisissez le type de collaboration">
              <select
                id="offre-contrat"
                required
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

            <FormField label="Ville" htmlFor="offre-ville" required error={fieldError("ville")} errorId="offre-ville-error" helperText="Exemple: Tunis">
              <Input
                id="offre-ville"
                required
                aria-required="true"
                aria-invalid={Boolean(fieldError("ville"))}
                aria-describedby={fieldError("ville") ? "offre-ville-error" : undefined}
                autoComplete="address-level2"
                value={form.ville}
                onChange={(e) => onFieldChange("ville", e.target.value)}
                onBlur={() => onFieldBlur("ville")}
                placeholder="Exemple: Tunis"
                className="h-10 text-[13px]"
              />
            </FormField>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Category + Specialty */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Catégorie" htmlFor="offre-categorie" required error={fieldError("categorieId")} errorId="offre-categorie-error" helperText="Sélectionnez le domaine principal">
              <select
                id="offre-categorie"
                required
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

            <FormField label="Spécialité" htmlFor="offre-specialite" required error={fieldError("specialiteId")} errorId="offre-specialite-error" helperText="Choisissez la spécialité liée">
              <select
                id="offre-specialite"
                required
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

          {/* Description */}
          {step === 1 && (
          <FormField label="Description" required htmlFor="offre-description" error={fieldError("description")} errorId="offre-description-error" helperText="Décrivez la mission, le contexte et les responsabilités clés.">
            <Textarea
              id="offre-description"
              rows={6}
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              onBlur={() => onFieldBlur("description")}
              placeholder="Exemple: Vous intégrerez l'équipe produit pour concevoir et développer de nouvelles fonctionnalités." 
              className="text-[13px]"
            />
          </FormField>
          )}

          {/* Requirements */}
          {step === 2 && (
          <>
          <FormField label="Exigences" required htmlFor="offre-exigences" error={fieldError("exigences")} errorId="offre-exigences-error" helperText="Listez les compétences requises et les attentes du poste.">
            <Textarea
              id="offre-exigences"
              rows={5}
              value={form.exigences}
              onChange={(e) => onFieldChange("exigences", e.target.value)}
              onBlur={() => onFieldBlur("exigences")}
              placeholder="Exemple: 3 ans d'expérience, maîtrise de React, collaboration agile."
              className="text-[13px]"
            />
          </FormField>

          {/* Experience + Education level */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Expérience" required htmlFor="offre-experience" helperText="Exemple: 2-3 ans">
              <Input
                id="offre-experience"
                value={form.experienceRequise}
                onChange={(e) => onFieldChange("experienceRequise", e.target.value)}
                placeholder="Exemple: 2-3 ans"
                className="h-10 text-[13px]"
              />
            </FormField>
            <FormField label="Niveau d'étude" required htmlFor="offre-niveau" helperText="Exemple: Licence, Master">
              <select
                id="offre-niveau"
                aria-label="Niveau d'étude"
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

          {step === 3 && (
            <div className="space-y-3 rounded-lg border border-border/30 bg-muted/20 p-3">
              <p className="text-[12px] font-semibold text-foreground">Vérifiez les informations avant publication</p>
              <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                <li><span className="font-medium text-foreground">Titre:</span> {form.titre || "-"}</li>
                <li><span className="font-medium text-foreground">Contrat:</span> {form.typeContrat || "-"}</li>
                <li><span className="font-medium text-foreground">Ville:</span> {form.ville || "-"}</li>
                <li><span className="font-medium text-foreground">Description:</span> {(form.description || "-").slice(0, 110)}{form.description.length > 110 ? "..." : ""}</li>
                <li><span className="font-medium text-foreground">Exigences:</span> {(form.exigences || "-").slice(0, 110)}{form.exigences.length > 110 ? "..." : ""}</li>
              </ul>
            </div>
          )}

          <div className="border-t border-border/30 pt-3 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground/70">Étape {step + 1} sur {steps.length}</p>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={previousStep} className="text-[13px] h-8 px-3">
                  Retour
                </Button>
              )}
              {step < steps.length - 1 && (
                <Button type="button" variant="success" onClick={nextStep} className="text-[13px] h-8 px-3">
                  Continuer
                </Button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60" aria-live="polite">
            Votre offre sera visible rapidement et vous pourrez la modifier à tout moment.
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-border/30 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="text-[13px]">
              Annuler
            </Button>
            <Button type="submit" variant="success" disabled={creating || step < steps.length - 1} className="text-[13px]" title={step < steps.length - 1 ? "Complétez toutes les étapes avant publication" : undefined}>
              {creating
                ? editingOffre ? "Modification..." : "Création..."
                : editingOffre ? "Enregistrer" : "Publier l'offre"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ── Reusable form field wrapper ── */

function FormField({
  label,
  htmlFor,
  required,
  error,
  errorId,
  helperText,
  children,
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
        <p id={errorId} className="text-[11px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

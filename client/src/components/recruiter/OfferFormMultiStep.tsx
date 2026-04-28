import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import type { Categorie, Specialite, OffreEmploi } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Check, Circle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/* ── Types ── */

const createEmptyOfferFormData = (): OfferFormData => ({
  titre: '',
  description: '',
  exigences: '',
  typeContrat: 'CDI',
  ville: '',
  experienceRequise: '',
  niveauEtude: '',
  categorieId: '',
  specialiteId: '',
});

const mapOfferToFormData = (offre: OffreEmploi | null): OfferFormData =>
  offre
    ? {
        titre: offre.titre || '',
        description: offre.description || '',
        exigences: offre.exigences || '',
        typeContrat: offre.typeContrat || 'CDI',
        ville: offre.ville || '',
        experienceRequise: offre.experienceRequise || '',
        niveauEtude: offre.niveauEtude || '',
        categorieId: offre.categorieId?.toString() || '',
        specialiteId: offre.specialiteId?.toString() || '',
      }
    : createEmptyOfferFormData();

const DRAFT_PREFIX = 'joblinker_draft_';

const STEP_LABELS = [
  'Informations de base',
  'Description du poste',
  'Compétences requises',
  'Paramètres de publication',
] as const;

const getDraftKey = (offerId: string) => `${DRAFT_PREFIX}${offerId}`;

const hasDraftContent = (formData: OfferFormData) =>
  Boolean(
    formData.titre ||
      formData.description ||
      formData.exigences ||
      formData.ville ||
      formData.experienceRequise ||
      formData.niveauEtude ||
      formData.categorieId ||
      formData.specialiteId
  );

interface OfferDraftSnapshot {
  step: number;
  formData: OfferFormData;
  savedAt: string;
}

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

interface MultiStepFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOffre: OffreEmploi | null;
  categories: Categorie[];
  specialites: Specialite[];
  creating: boolean;
  onSubmit: (formData: OfferFormData) => Promise<void>;
}

interface StepFormBaseProps {
  formData: OfferFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onChange: (field: keyof OfferFormData, value: string) => void;
  onBlur: (field: keyof OfferFormData) => void;
}

interface Step1Props extends StepFormBaseProps {
  selectClass: string;
}

interface Step3Props extends StepFormBaseProps {
  categories: Categorie[];
  specialites: Specialite[];
  selectClass: string;
}

interface Step4Props {
  formData: OfferFormData;
  onEdit: (step: number) => void;
}

/* ── Component ── */

export function OfferFormMultiStep({
  open,
  onOpenChange,
  editingOffre,
  categories,
  specialites,
  creating,
  onSubmit,
}: MultiStepFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>(() => mapOfferToFormData(editingOffre));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState<Date | null>(null);
  const [existingDraft, setExistingDraft] = useState<OfferDraftSnapshot | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const currentDraftKey = getDraftKey(editingOffre?.id ? String(editingOffre.id) : 'new');
  const previousOpenRef = useRef(open);
  const latestStateRef = useRef({ step, formData });
  const initialSnapshotRef = useRef<{ step: number; formData: OfferFormData }>({
    step: 1,
    formData: mapOfferToFormData(editingOffre),
  });
  const skipCloseSaveRef = useRef(false);
  const ignoreDraftRef = useRef(false);
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allowCloseRef = useRef(false);

  const totalSteps = 4;
  const isEditMode = !!editingOffre;
  const currentStepLabel = STEP_LABELS[step - 1] || '';

  const persistDraft = useCallback((nextStep: number, nextFormData: OfferFormData) => {
    if (!hasDraftContent(nextFormData)) {
      localStorage.removeItem(currentDraftKey);
      setDraftSaved(null);
      setExistingDraft(null);
      initialSnapshotRef.current = { step: nextStep, formData: nextFormData };
      return;
    }

    const snapshot: OfferDraftSnapshot = {
      step: nextStep,
      formData: nextFormData,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(currentDraftKey, JSON.stringify(snapshot));
    setDraftSaved(new Date(snapshot.savedAt));
    setExistingDraft(snapshot);
    setShowDraftBanner(false);
    initialSnapshotRef.current = { step: nextStep, formData: nextFormData };
  }, [currentDraftKey]);

  const loadDraft = useCallback(() => {
    const raw = localStorage.getItem(currentDraftKey);
    if (!raw) {
      setExistingDraft(null);
      setShowDraftBanner(false);
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<OfferDraftSnapshot>;
      if (
        typeof parsed.step !== 'number' ||
        !parsed.formData ||
        typeof parsed.savedAt !== 'string'
      ) {
        throw new Error('Invalid draft');
      }

      const normalized: OfferDraftSnapshot = {
        step: Math.min(Math.max(parsed.step, 1), totalSteps),
        formData: parsed.formData,
        savedAt: parsed.savedAt,
      };
      setExistingDraft(normalized);
      setShowDraftBanner(true);
      setDraftSaved(new Date(normalized.savedAt));
      return normalized;
    } catch {
      localStorage.removeItem(currentDraftKey);
      setExistingDraft(null);
      setShowDraftBanner(false);
      setDraftSaved(null);
      return null;
    }
  }, [currentDraftKey, totalSteps]);

  const resetToBaseState = useCallback(() => {
    const baseForm = mapOfferToFormData(editingOffre);
    setStep(1);
    setErrors({});
    setTouched({});
    setFormData(baseForm);
    setDraftSaved(null);
    setShowDraftBanner(false);
    setExistingDraft(null);
    initialSnapshotRef.current = { step: 1, formData: baseForm };
    ignoreDraftRef.current = false;
  }, [editingOffre]);

  useEffect(() => {
    latestStateRef.current = { step, formData };
  }, [step, formData]);

  // Track unsaved changes
  useEffect(() => {
    if (!open) {
      setHasUnsavedChanges(false);
      return;
    }

    const isDirty =
      step !== initialSnapshotRef.current.step ||
      JSON.stringify(formData) !== JSON.stringify(initialSnapshotRef.current.formData);

    setHasUnsavedChanges(isDirty && hasDraftContent(formData));
  }, [open, step, formData]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!open || !hasUnsavedChanges) {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    autoSaveIntervalRef.current = setInterval(() => {
      persistDraft(latestStateRef.current.step, latestStateRef.current.formData);
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [open, hasUnsavedChanges, persistDraft]);

  // Sync local state and draft banner whenever the drawer opens.
  useEffect(() => {
    if (!open) return;

    const storedDraft = loadDraft();
    if (storedDraft) {
      const baseForm = mapOfferToFormData(editingOffre);
      setStep(1);
      setErrors({});
      setTouched({});
      setFormData(baseForm);
      initialSnapshotRef.current = { step: 1, formData: baseForm };
      ignoreDraftRef.current = false;
      previousOpenRef.current = open;
      return;
    }

    resetToBaseState();
    previousOpenRef.current = open;
  }, [open, editingOffre, loadDraft, resetToBaseState]);

  useEffect(() => {
    if (open) return;

    if (!previousOpenRef.current) {
      previousOpenRef.current = open;
      return;
    }

    // Auto-save draft if there are unsaved changes before closing
    if (!skipCloseSaveRef.current && !ignoreDraftRef.current) {
      const currentSnapshot = latestStateRef.current;
      const currentDirty =
        currentSnapshot.step !== initialSnapshotRef.current.step ||
        JSON.stringify(currentSnapshot.formData) !== JSON.stringify(initialSnapshotRef.current.formData);

      if (currentDirty) {
        persistDraft(currentSnapshot.step, currentSnapshot.formData);
      }
    }

    // Reset form state when fully closing
    resetToBaseState();
    skipCloseSaveRef.current = false;
    allowCloseRef.current = false;
    ignoreDraftRef.current = false;
    previousOpenRef.current = open;
  }, [open, persistDraft, resetToBaseState]);

  const saveCurrentDraft = (nextStep: number) => {
    persistDraft(nextStep, formData);
    skipCloseSaveRef.current = false;
    ignoreDraftRef.current = false;
  };

  const handleCancel = () => {
    resetToBaseState();
    setShowUnsavedWarning(false);
    ignoreDraftRef.current = true;
    allowCloseRef.current = true;
    onOpenChange(false);
  };

  // Validation par étape
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.titre.trim()) {
        newErrors.titre = 'Le titre du poste est obligatoire';
      } else if (formData.titre.length < 5) {
        newErrors.titre = 'Le titre doit contenir au moins 5 caractères';
      }

      if (!formData.ville.trim()) {
        newErrors.ville = 'La localisation est obligatoire';
      }

      if (!formData.typeContrat) {
        newErrors.typeContrat = 'Sélectionnez un type de contrat';
      }

      if (!formData.experienceRequise.trim()) {
        newErrors.experienceRequise = 'Spécifiez les années d\'expérience requises';
      }
    }

    if (currentStep === 2) {
      if (!formData.description.trim()) {
        newErrors.description = 'La description est obligatoire';
      } else if (formData.description.length < 50) {
        newErrors.description = 'La description doit faire au moins 50 caractères';
      }
    }

    if (currentStep === 3) {
      if (!formData.exigences.trim()) {
        newErrors.exigences = 'Les exigences sont obligatoires';
      }

      if (!formData.categorieId) {
        newErrors.categorieId = 'Sélectionnez une catégorie';
      }

      if (!formData.specialiteId) {
        newErrors.specialiteId = 'Sélectionnez une spécialité';
      }

      if (!formData.niveauEtude) {
        newErrors.niveauEtude = 'Sélectionnez un niveau d\'étude';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      const nextStep = Math.min(step + 1, totalSteps);
      saveCurrentDraft(nextStep);
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    const nextStep = Math.max(1, step - 1);
    saveCurrentDraft(nextStep);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep = (targetStep: number) => {
    if (targetStep >= step) return;
    saveCurrentDraft(targetStep);
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeDraft = () => {
    if (!existingDraft) return;
    setFormData(existingDraft.formData);
    setStep(existingDraft.step);
    setErrors({});
    setTouched({});
    setShowDraftBanner(false);
    initialSnapshotRef.current = {
      step: existingDraft.step,
      formData: existingDraft.formData,
    };
    ignoreDraftRef.current = false;
  };

  const handleIgnoreDraft = () => {
    localStorage.removeItem(currentDraftKey);
    setExistingDraft(null);
    setShowDraftBanner(false);
    resetToBaseState();
    ignoreDraftRef.current = true;
  };

  const handleManualDraftSave = () => {
    saveCurrentDraft(step);
  };

  const handleSubmit = async () => {
    if (validateStep(totalSteps)) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        skipCloseSaveRef.current = true;
        allowCloseRef.current = true;
        localStorage.removeItem(currentDraftKey);
        setExistingDraft(null);
        setDraftSaved(null);
        onOpenChange(false);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFieldChange = (field: keyof OfferFormData, value: string) => {
    ignoreDraftRef.current = false;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const selectClass =
    'flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 focus-visible:shadow-md focus-visible:shadow-primary/5 cursor-pointer appearance-none bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E\')] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:border-border/80 hover:bg-muted/30';

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Manage focus return and trap for accessibility
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        const el = sheetRef.current;
        if (!el) return;
        const focusable = el.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      }, 50);
    } else {
      previouslyFocusedRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const el = sheetRef.current;
    if (!el || !open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(newOpen) => {
          // If trying to close (newOpen = false) and not forcing close, check for unsaved changes
          if (!newOpen && !allowCloseRef.current && !ignoreDraftRef.current && hasUnsavedChanges) {
            setShowUnsavedWarning(true);
            return;
          }

          // Reset flags and proceed
          allowCloseRef.current = false;
          ignoreDraftRef.current = false;
          setShowUnsavedWarning(false);
          onOpenChange(newOpen);
        }}
      >
      <SheetContent
        side="right"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-form-title"
        className="w-full sm:max-w-lg overflow-y-auto border-l-border/40 flex flex-col"
      >
        {/* Accent line */}
        

        {/* Header */}
        <SheetHeader className="mb-6 mt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold">
                {isEditMode ? "Modifier l'offre" : "Nouvelle offre d'emploi"}
              </SheetTitle>
              <SheetDescription className="text-[13px] mt-1">
                {isEditMode
                  ? "Mettez à jour les informations de votre offre d'emploi."
                  : "Complétez les étapes ci-dessous pour publier votre offre."}
              </SheetDescription>
            </div>
          </div>

          {showDraftBanner && existingDraft && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-950 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Vous avez un brouillon non publié.</p>
                  <p className="text-xs text-amber-900/80">
                    Reprendre votre progression enregistrée à l&apos;étape {existingDraft.step}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleIgnoreDraft}>
                    Ignorer
                  </Button>
                  <Button type="button" size="sm" onClick={handleResumeDraft}>
                    Reprendre
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              {STEP_LABELS.map((label, index) => {
                const stepNumber = index + 1;
                const isCurrent = stepNumber === step;
                const isCompleted = stepNumber < step;

                const StepContent = (
                  <>
                    <span
                      className={[
                        'flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200',
                        isCurrent
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : isCompleted
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                            : 'border-border bg-background text-muted-foreground/50',
                      ].join(' ')}
                    >
                      {isCompleted ? <Check className="size-4" /> : stepNumber}
                    </span>
                    <span
                      className={[
                        'text-[12px] leading-tight',
                        isCurrent
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-muted-foreground/70',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </>
                );

                if (isCompleted) {
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleGoToStep(stepNumber)}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:bg-muted/30"
                    >
                      {StepContent}
                    </button>
                  );
                }

                return (
                  <div key={label} className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1">
                    <span
                      className={[
                        'flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200',
                        isCurrent
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border bg-background text-muted-foreground/50',
                      ].join(' ')}
                    >
                      {isCurrent ? stepNumber : <Circle className="size-3.5" />}
                    </span>
                    <span
                      className={[
                        'text-[12px] leading-tight',
                        isCurrent
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-muted-foreground/55',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="rounded-lg bg-muted/30 px-3 py-2 text-[13px] text-foreground/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">Étape {step} sur {totalSteps}</div>
                  <div className="text-[13px] text-muted-foreground/70">{currentStepLabel}</div>
                </div>
                {draftSaved && (
                  <div className="ml-2 text-xs text-muted-foreground/70">Brouillon enregistré</div>
                )}
              </div>
              {/* Visual progress bar */}
              <div className="w-full h-2 bg-muted/20 rounded-full mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((step / totalSteps) * 100)}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {step === 1 && (
            <Step1BasicInfo
              formData={formData}
              errors={errors}
              touched={touched}
              selectClass={selectClass}
              onChange={handleFieldChange}
              onBlur={handleBlur}
            />
          )}

          {step === 2 && (
            <Step2Description
              formData={formData}
              errors={errors}
              touched={touched}
              onChange={handleFieldChange}
              onBlur={handleBlur}
            />
          )}

          {step === 3 && (
            <Step3Requirements
              formData={formData}
              errors={errors}
              touched={touched}
              categories={categories}
              specialites={specialites}
              selectClass={selectClass}
              onChange={handleFieldChange}
              onBlur={handleBlur}
            />
          )}

          {step === 4 && (
            <Step4Review
              formData={formData}
              onEdit={setStep}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex gap-3 border-t border-border/30 pt-5 mt-6">
          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleManualDraftSave}
              disabled={creating || isSubmitting}
              className="gap-2 transition-all duration-200"
            >
              Sauvegarder brouillon
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={creating || isSubmitting}
              className="gap-2 transition-all duration-200"
            >
              Précédent
            </Button>
          )}

          <div className="flex-1" />

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={creating || isSubmitting}
            className="transition-all duration-200"
          >
            Annuler
          </Button>

          {step < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={creating || isSubmitting}
              className="gap-2 transition-all duration-200"
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={creating || isSubmitting}
              className="gap-2 bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/30"
            >
              {isSubmitting || creating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isEditMode ? 'Enregistrement...' : 'Publication...'}
                </>
              ) : (
                <>
                  {isEditMode ? 'Enregistrer les modifications' : 'Publier l\'offre'}
                </>
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {/* Unsaved changes warning dialog */}
    {showUnsavedWarning && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-sm mx-4 rounded-2xl border border-border/60 bg-background shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">Modifications non enregistrées</h3>
            <p className="text-sm text-muted-foreground/80">
              Vous avez des modifications qui n'ont pas été sauvegardées. Souhaitez-vous continuer sans sauvegarder ?
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUnsavedWarning(false);
              }}
              className="flex-1"
            >
              Continuer l'édition
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowUnsavedWarning(false);
                ignoreDraftRef.current = true;
                allowCloseRef.current = true;
                onOpenChange(false);
              }}
              className="flex-1"
            >
              Fermer sans sauvegarder
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

/* ── Step 1: Basic Information ── */

function Step1BasicInfo({
  formData,
  errors,
  touched,
  selectClass,
  onChange,
  onBlur,
}: Step1Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground/90 mb-4">
          Informations de base
        </h3>
        <p className="text-sm text-muted-foreground/70 mb-5">
          Complétez les détails essentiels de votre offre d'emploi.
        </p>
      </div>

      {/* Title */}
      <FormField
        label="Titre du poste"
        htmlFor="titre"
        required
        error={touched.titre ? errors.titre : undefined}
        errorId="titre-error"
        helperText="Doit être clair et attractif pour les candidats"
      >
        <Input
          id="titre"
          placeholder="Ex: Développeur Senior Full Stack React/Node.js"
          value={formData.titre}
          onChange={(e) => onChange('titre', e.target.value)}
          onBlur={() => onBlur('titre')}
          className={touched.titre && errors.titre ? 'border-destructive' : ''}
          aria-required="true"
          aria-invalid={Boolean(touched.titre && errors.titre)}
          aria-describedby={touched.titre && errors.titre ? 'titre-error' : undefined}
        />
      </FormField>

      {/* Contract Type & Location - Row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Type de contrat"
          htmlFor="contrat"
          required
          error={touched.typeContrat ? errors.typeContrat : undefined}
          errorId="contrat-error"
        >
          <select
            id="contrat"
            value={formData.typeContrat}
            onChange={(e) => onChange('typeContrat', e.target.value)}
            onBlur={() => onBlur('typeContrat')}
            className={selectClass}
            aria-required="true"
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
          </select>
        </FormField>

        <FormField
          label="Localisation"
          htmlFor="ville"
          required
          error={touched.ville ? errors.ville : undefined}
          errorId="ville-error"
          helperText="Ville ou région"
        >
          <Input
            id="ville"
            placeholder="Ex: Tunis"
            value={formData.ville}
            onChange={(e) => onChange('ville', e.target.value)}
            onBlur={() => onBlur('ville')}
            className={touched.ville && errors.ville ? 'border-destructive' : ''}
            aria-required="true"
          />
        </FormField>
      </div>

      {/* Experience */}
      <FormField
        label="Années d'expérience requises"
        htmlFor="experience"
        required
        error={touched.experienceRequise ? errors.experienceRequise : undefined}
        errorId="experience-error"
      >
        <select
          id="experience"
          value={formData.experienceRequise}
          onChange={(e) => onChange('experienceRequise', e.target.value)}
          onBlur={() => onBlur('experienceRequise')}
          className={selectClass}
          aria-required="true"
          aria-describedby={touched.experienceRequise && errors.experienceRequise ? 'experience-error' : undefined}
        >
          <option value="">Sélectionnez une plage</option>
          <option value="0-1">0-1 ans</option>
          <option value="1-2">1-2 ans</option>
          <option value="2-3">2-3 ans</option>
          <option value="3-5">3-5 ans</option>
          <option value="5-10">5-10 ans</option>
          <option value="10+">10+ ans</option>
        </select>
      </FormField>

      {/* Offer completeness indicator */}
      <div className="space-y-2.5">
        {(() => {
          const requiredFields = ['titre', 'ville', 'typeContrat', 'experienceRequise', 'description', 'exigences', 'categorieId', 'specialiteId', 'niveauEtude'];
          const filledCount = requiredFields.filter(field => {
            const value = formData[field as keyof typeof formData];
            return value !== null && value !== undefined && value !== '';
          }).length;
          const percentage = Math.round((filledCount / requiredFields.length) * 100);
          return (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-foreground/80">Complétude de l'offre</span>
                <span className="text-sm font-semibold text-primary">{percentage}%</span>
              </div>
              <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className={[
                    "h-full transition-all duration-300",
                    percentage < 33 ? "bg-amber-500" : percentage < 66 ? "bg-blue-500" : "bg-emerald-600",
                  ].join(" ")}
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Pourcentage de complétude"
                />
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

/* ── Step 2: Description ── */

function Step2Description({
  formData,
  errors,
  touched,
  onChange,
  onBlur,
}: StepFormBaseProps) {
  const descLength = formData.description.length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground/90 mb-4">
          Description du rôle
        </h3>
        <p className="text-sm text-muted-foreground/70 mb-5">
          Décrivez en détail les responsabilités et le contexte du poste.
        </p>
      </div>

      <FormField
        label="Description détaillée"
        htmlFor="description"
        required
        error={touched.description ? errors.description : undefined}
        errorId="description-error"
        helperText="Minimum 50 caractères. Soyez précis et attrayant."
      >
        <Textarea
          id="description"
          rows={6}
          placeholder={`Décrivez en détail:
- Les responsabilités principales
- L'environnement de travail
- Les projets auxquels il participera
- L'équipe et la culture d'entreprise`}
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          onBlur={() => onBlur('description')}
          className={touched.description && errors.description ? 'border-destructive' : ''}
          aria-required="true"
          aria-invalid={Boolean(touched.description && errors.description)}
          aria-describedby={touched.description && errors.description ? 'description-error' : undefined}
        />
      </FormField>

      {/* Character counter */}
      <div className="flex justify-between items-center px-3 py-2 bg-muted/40 rounded-lg text-xs text-muted-foreground/70">
        <span>{descLength} caractères</span>
        {descLength < 50 && (
          <span className="text-orange-500 font-medium">
            Minimum 50 caractères requis (+{50 - descLength})
          </span>
        )}
        {descLength >= 50 && (
          <span className="text-emerald-600 font-medium flex items-center gap-1">
             Complétée
          </span>
        )}
      </div>

      {/* Tips */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground/80">Conseils pour une bonne description :</p>
        <ul className="text-xs text-muted-foreground/70 space-y-1.5 ml-2">
          <li>✓ Soyez clair et concis</li>
          <li>✓ Mettez en avant les opportunités d'apprentissage</li>
          <li>✓ Mentionnez les avantages du poste</li>
          <li>✓ Utilisez un ton accueillant et professionnel</li>
        </ul>
      </div>
    </div>
  );
}

/* ── Step 3: Requirements ── */

function Step3Requirements({
  formData,
  errors,
  touched,
  categories,
  specialites,
  selectClass,
  onChange,
  onBlur,
}: Step3Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground/90 mb-4">
          Exigences et classification
        </h3>
        <p className="text-sm text-muted-foreground/70 mb-5">
          Précisez les compétences requises et classifiez le poste.
        </p>
      </div>

      {/* Requirements */}
      <FormField
        label="Compétences et exigences"
        htmlFor="exigences"
        required
        error={touched.exigences ? errors.exigences : undefined}
        errorId="exigences-error"
        helperText="Listez les compétences requises, séparées par des virgules"
      >
        <Textarea
          id="exigences"
          rows={4}
          placeholder={`Ex: React, Node.js, PostgreSQL, Git, Docker,
Communication, Travail en équipe...`}
          value={formData.exigences}
          onChange={(e) => onChange('exigences', e.target.value)}
          onBlur={() => onBlur('exigences')}
          className={touched.exigences && errors.exigences ? 'border-destructive' : ''}
          aria-required="true"
        />
      </FormField>

      {/* Category & Specialty */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Catégorie"
          htmlFor="categorie"
          required
          error={touched.categorieId ? errors.categorieId : undefined}
          errorId="categorie-error"
        >
          <select
            id="categorie"
            value={formData.categorieId}
            onChange={(e) => onChange('categorieId', e.target.value)}
            onBlur={() => onBlur('categorieId')}
            className={selectClass}
            aria-required="true"
          >
            <option value="">Sélectionner</option>
            {categories.map((c: Categorie) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Spécialité"
          htmlFor="specialite"
          required
          error={touched.specialiteId ? errors.specialiteId : undefined}
          errorId="specialite-error"
        >
          <select
            id="specialite"
            value={formData.specialiteId}
            onChange={(e) => onChange('specialiteId', e.target.value)}
            onBlur={() => onBlur('specialiteId')}
            className={selectClass}
            aria-required="true"
          >
            <option value="">Sélectionner</option>
            {specialites
              .filter((s: Specialite) => !formData.categorieId || s.categorieId === Number(formData.categorieId))
              .map((s: Specialite) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
          </select>
        </FormField>
      </div>

      {/* Education level */}
      <FormField
        label="Niveau d'études minimum"
        htmlFor="niveau"
        required
        error={touched.niveauEtude ? errors.niveauEtude : undefined}
        errorId="niveau-error"
      >
        <select
          id="niveau"
          value={formData.niveauEtude}
          onChange={(e) => onChange('niveauEtude', e.target.value)}
          onBlur={() => onBlur('niveauEtude')}
          className={selectClass}
          aria-required="true"
        >
          <option value="">Sélectionner</option>
          <option value="Bac">Bac</option>
          <option value="Bac+2">Bac+2</option>
          <option value="Bac+3">Bac+3</option>
          <option value="Bac+5">Bac+5</option>
        </select>
      </FormField>

      {/* Info */}
      <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20"><p className="text-[12.5px] font-medium text-muted-foreground/80 leading-relaxed">La classification aide les candidats à trouver votre offre et améliore le matching.</p></div>
    </div>
  );
}

/* ── Step 4: Review ── */

function Step4Review({ formData, onEdit }: Step4Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground/90 mb-4">
          Aperçu et publication
        </h3>
        <p className="text-sm text-muted-foreground/70 mb-5">
          Vérifiez que toutes les informations sont correctes avant de publier.
        </p>
      </div>

      {/* Review card */}
      <div className="space-y-4 border border-border/30 rounded-lg p-5 bg-muted/20">
        {/* Title */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Titre du poste
          </p>
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-bold text-foreground">{formData.titre}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="text-xs text-primary hover:bg-primary/10"
            >
              Modifier
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/20" />

        {/* Meta info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground/70 mb-1">Type de contrat</p>
            <Badge variant="secondary" className="bg-background">
              {formData.typeContrat}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/70 mb-1">Localisation</p>
            <Badge variant="secondary" className="bg-background">
              {formData.ville}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/70 mb-1">Expérience</p>
            <Badge variant="secondary" className="bg-background">
              {formData.experienceRequise}
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/20" />

        {/* Description preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Description
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="text-xs text-primary hover:bg-primary/10"
            >
              Modifier
            </Button>
          </div>
          <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
            {formData.description}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border/20" />

        {/* Requirements preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Compétences requises
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="text-xs text-primary hover:bg-primary/10"
            >
              Modifier
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.exigences
              .split(',')
              .map((skill: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill.trim()}
                </Badge>
              ))
              .slice(0, 5)}
            {formData.exigences.split(',').length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{formData.exigences.split(',').length - 5} plus
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Final check */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-800">
        
        <p className="text-sm">
          ✓ Votre offre sera publiée immédiatement et visible par les candidats.
        </p>
      </div>
    </div>
  );
}

/* ── Reusable FormField Component ── */

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
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground/90">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {helperText && (
          <div
            className="group relative cursor-help"
            role="tooltip"
            aria-label={helperText}
          >
            
            <div className="absolute hidden group-hover:block left-0 top-full mt-1 w-48 p-2 bg-foreground/90 text-background text-[11px] rounded-md shadow-lg z-10 pointer-events-none">
              {helperText}
            </div>
          </div>
        )}
      </div>

      {children}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-1.5 p-2 rounded-md bg-destructive/5 border border-destructive/20">
          
          <p id={errorId} className="text-[11px] font-medium text-destructive">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

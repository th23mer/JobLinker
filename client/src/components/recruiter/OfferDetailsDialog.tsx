import { useRef, useEffect } from "react";
import type { OffreEmploi, Categorie, Specialite } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Briefcase, GraduationCap, Clock, Tag, CheckCircle, DollarSign } from "lucide-react";

interface OfferDetailsDialogProps {
  offre: OffreEmploi | null;
  categories: Categorie[];
  specialites: Specialite[];
  onClose: () => void;
  onValidate?: (id: number) => void;
  validating?: boolean;
}

export function OfferDetailsDialog({
  offre,
  categories,
  specialites,
  onClose,
  onValidate,
  validating,
}: OfferDetailsDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Focus management
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !offre) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
    const first = focusables[0] ?? dialog;
    const last = focusables[focusables.length - 1] ?? dialog;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
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

    dialog.addEventListener("keydown", onKeyDown);
    first.focus();
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [offre]);

  if (!offre) return null;

  const categorie = categories.find((c) => c.id === offre.categorieId);
  const specialite = specialites.find((s) => s.id === offre.specialiteId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-details-title"
        className="w-full max-w-2xl mx-4 rounded-2xl border border-border/60 bg-background shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border/30 bg-background/95 backdrop-blur-sm p-6">
          <div className="flex-1 min-w-0">
            <h2 id="offer-details-title" className="text-xl font-bold text-foreground truncate">
              {offre.titre}
            </h2>
            <p className="text-sm text-muted-foreground/70 mt-1">{categorie?.nom}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 size-10 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick info badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={offre.statutValidation === "en_attente" ? "warning" : "success"} className="gap-1.5">
              {offre.statutValidation === "en_attente" ? "En attente" : "Validée"}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Briefcase className="size-3" />
              {offre.typeContrat}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="size-3" />
              {offre.ville}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="size-3" />
              {offre.experienceRequise}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <GraduationCap className="size-3" />
              {offre.niveauEtude}
            </Badge>
            {specialite && (
              <Badge variant="secondary" className="gap-1.5">
                <Tag className="size-3" />
                {specialite.nom}
              </Badge>
            )}
            {offre.salaire && (
              <Badge variant="secondary" className="gap-1.5">
                <DollarSign className="size-3" />
                {offre.salaire}
              </Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground/90 mb-2">Description du poste</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
              {offre.description}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-foreground/90 mb-2">Exigences et compétences</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
              {offre.exigences}
            </p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/30">
            <div>
              <p className="text-xs text-muted-foreground/70 mb-1">Catégorie</p>
              <p className="text-sm font-medium text-foreground">{categorie?.nom || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70 mb-1">Spécialité</p>
              <p className="text-sm font-medium text-foreground">{specialite?.nom || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70 mb-1">Type de contrat</p>
              <p className="text-sm font-medium text-foreground">{offre.typeContrat}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70 mb-1">Localisation</p>
              <p className="text-sm font-medium text-foreground">{offre.ville}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70 mb-1">Expérience requise</p>
              <p className="text-sm font-medium text-foreground">{offre.experienceRequise}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70 mb-1">Niveau d'étude</p>
              <p className="text-sm font-medium text-foreground">{offre.niveauEtude}</p>
            </div>
            {offre.salaire && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground/70 mb-1">Salaire</p>
                <p className="text-sm font-medium text-foreground">{offre.salaire}</p>
              </div>
            )}
            {offre.nomEntreprise && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground/70 mb-1">Entreprise</p>
                <p className="text-sm font-medium text-foreground">{offre.nomEntreprise}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border/30 bg-background/95 backdrop-blur-sm p-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="transition-all duration-200"
          >
            Fermer
          </Button>
          {onValidate && offre.statutValidation === "en_attente" && (
            <Button
              type="button"
              variant="success"
              onClick={() => onValidate(offre.id)}
              disabled={validating}
            >
              <CheckCircle className="size-4" aria-hidden="true" />
              {validating ? "Validation..." : "Valider l'offre"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

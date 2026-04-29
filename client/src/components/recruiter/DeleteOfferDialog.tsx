import type { OffreEmploi } from "@/types";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";

interface DeleteOfferDialogProps {
  target: OffreEmploi | null;
  deleting: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function DeleteOfferDialog({ target, deleting, onConfirm, onClose }: DeleteOfferDialogProps) {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md mx-4 rounded-2xl border border-border/60 bg-background shadow-lg overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-border/30">
          <div>
            <h3 className="text-lg font-bold text-foreground">Supprimer l'offre</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 truncate">{target.titre}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground/80">Êtes-vous sûr de vouloir supprimer définitivement cette offre ? Cette action est irréversible.</p>
          <div className="text-sm text-muted-foreground/70">Titre : <span className="font-medium text-foreground">{target.titre}</span></div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border/30 p-4 bg-background/95">
          <Button type="button" variant="ghost" onClick={onClose} className="">
            Annuler
          </Button>
          <Button type="button" variant="destructive" onClick={() => void onConfirm()} disabled={deleting}>
            <Trash2 className="size-4 mr-2" />
            {deleting ? "Suppression…" : "Supprimer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteOfferDialog;

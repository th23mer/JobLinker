import { useRef, useEffect } from "react";
import type { Recruteur } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ProfileDialogProps {
  profil: Recruteur | null;
  open: boolean;
  editing: boolean;
  profilForm: Record<string, string>;
  saving: boolean;
  onEdit: () => void;
  onSave: () => Promise<void> | void;
  onCancelEdit: () => void;
  onClose: () => void;
  onFormChange: (field: string, value: string) => void;
}

export function ProfileDialog({ profil, open, editing, profilForm, saving, onEdit, onSave, onCancelEdit, onClose, onFormChange }: ProfileDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el || !open) return;
    const focusable = el.querySelector<HTMLElement>("button, input, [tabindex]:not([tabindex=\"-1\"])");
    focusable?.focus();
  }, [open]);

  if (!open || !profil) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" className="w-full max-w-xl mx-4 rounded-2xl border border-border/60 bg-background shadow-lg overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-border/30">
          <div>
            <h3 className="text-lg font-bold text-foreground">Profil recruteur</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">{profil.nomEntreprise || "Profil"}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button variant="outline" onClick={onEdit}>Modifier</Button>
            )}
            <button type="button" onClick={onClose} className="size-10 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Fermer">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground/70">Nom de l'entreprise</label>
              <Input value={profilForm.nomEntreprise} onChange={(e) => onFormChange('nomEntreprise', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70">Matricule fiscal</label>
              <Input value={profilForm.matriculeFiscal} onChange={(e) => onFormChange('matriculeFiscal', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70">Adresse</label>
              <Input value={profilForm.adresse} onChange={(e) => onFormChange('adresse', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70">Téléphone</label>
              <Input value={profilForm.telephone} onChange={(e) => onFormChange('telephone', e.target.value)} disabled={!editing} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground/70">Description</label>
              <Input value={profilForm.description} onChange={(e) => onFormChange('description', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70">Nom représentant</label>
              <Input value={profilForm.nomRepresentant} onChange={(e) => onFormChange('nomRepresentant', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70">Prénom représentant</label>
              <Input value={profilForm.prenomRepresentant} onChange={(e) => onFormChange('prenomRepresentant', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70">Email</label>
              <Input value={profilForm.email} onChange={(e) => onFormChange('email', e.target.value)} disabled={!editing} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border/30 p-4 bg-background/95">
          {editing ? (
            <>
              <Button variant="ghost" onClick={onCancelEdit} disabled={saving}>Annuler</Button>
              <Button variant="success" onClick={() => void onSave()} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDialog;

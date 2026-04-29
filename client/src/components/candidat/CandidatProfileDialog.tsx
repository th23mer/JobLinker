import { useRef, useEffect, useState } from "react";
import type { Candidat } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, File, Pencil, Download, Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidatProfileDialogProps {
  profil: Candidat | null;
  open: boolean;
  editing: boolean;
  profilForm: Record<string, string>;
  saving: boolean;
  uploadingCv: boolean;
  selectedCvName: string | null;
  profileLoading?: boolean;
  profileError?: string;
  onEdit: () => void;
  onSave: () => Promise<void> | void;
  onCancelEdit: () => void;
  onClose: () => void;
  onFormChange: (field: string, value: string) => void;
  onCvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CandidatProfileDialog({
  profil,
  open,
  editing,
  profilForm,
  saving,
  uploadingCv,
  selectedCvName,
  profileLoading = false,
  profileError = "",
  onEdit,
  onSave,
  onCancelEdit,
  onClose,
  onFormChange,
  onCvUpload,
}: CandidatProfileDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el || !open) return;
    const focusable = el.querySelector<HTMLElement>("button, input, [tabindex]:not([tabindex=\"-1\"])");
    focusable?.focus();
  }, [open]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const changeEvent = new Event("change", { bubbles: true }) as any;
      changeEvent.target = { files };
      onCvUpload(changeEvent);
    }
  };

  const getFileName = (path: string): string => {
    return path.split("/").pop() || "CV";
  };

  const visibleCvName = selectedCvName ?? (profilForm.cv ? getFileName(profilForm.cv) : null);
  const hasCvReady = Boolean(visibleCvName);

  const downloadCv = () => {
    if (profilForm.cv) {
      const cvUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${profilForm.cv}`;
      window.open(cvUrl, "_blank");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-4 rounded-2xl border border-border/60 bg-background shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 p-5 border-b border-border/30 bg-background shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground">Profil candidat</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {profil ? `${profil.prenom} ${profil.nom}` : "Chargement..."}
            </p>
          </div>
          <div className="relative z-40 flex items-center gap-2 shrink-0">
            {!editing && profil && (
              <Button variant="outline" onClick={onEdit}>Modifier</Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="size-10 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {!profil ? (
          <div className="p-5">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
              {profileError || (profileLoading ? "Chargement du profil..." : "Profil indisponible.")}
            </div>
          </div>
        ) : (
          <>
        <div className="p-5 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Informations personnelles</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground/70">Nom</label>
                <div className={cn("relative mt-1", editing && "has-[input:focus]:ring-2 has-[input:focus]:ring-primary/30")}>
                  <Input
                    value={profilForm.nom}
                    onChange={(e) => onFormChange("nom", e.target.value)}
                    disabled={!editing}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary",
                      !editing && "bg-muted/30 cursor-default"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/70">Prénom</label>
                <div className={cn("relative mt-1", editing && "has-[input:focus]:ring-2 has-[input:focus]:ring-primary/30")}>
                  <Input
                    value={profilForm.prenom}
                    onChange={(e) => onFormChange("prenom", e.target.value)}
                    disabled={!editing}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary",
                      !editing && "bg-muted/30 cursor-default"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/70">Email</label>
                <div className="relative mt-1">
                  <Input
                    value={profilForm.email}
                    onChange={(e) => onFormChange("email", e.target.value)}
                    disabled={true}
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/70">Téléphone</label>
                <div className={cn("relative mt-1", editing && "has-[input:focus]:ring-2 has-[input:focus]:ring-primary/30")}>
                  <Input
                    value={profilForm.telephone}
                    onChange={(e) => onFormChange("telephone", e.target.value)}
                    disabled={!editing}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary",
                      !editing && "bg-muted/30 cursor-default"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
            </div>
          </div>

          {/* Formation et expérience */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Formation et expérience</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground/70">Diplôme</label>
                <div className={cn("relative mt-1", editing && "has-[input:focus]:ring-2 has-[input:focus]:ring-primary/30")}>
                  <Input
                    value={profilForm.diplome}
                    onChange={(e) => onFormChange("diplome", e.target.value)}
                    disabled={!editing}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary",
                      !editing && "bg-muted/30 cursor-default"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/70">Niveau d'études</label>
                <div className={cn("relative mt-1", editing && "has-[input:focus]:ring-2 has-[input:focus]:ring-primary/30")}>
                  <Input
                    value={profilForm.niveauEtude}
                    onChange={(e) => onFormChange("niveauEtude", e.target.value)}
                    disabled={!editing}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary",
                      !editing && "bg-muted/30 cursor-default"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground/70">Expérience professionnelle</label>
                <div className={cn("relative mt-1", editing && "has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-primary/30")}>
                  <Textarea
                    value={profilForm.experience}
                    onChange={(e) => onFormChange("experience", e.target.value)}
                    disabled={!editing}
                    rows={3}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary resize-none",
                      !editing && "bg-muted/30 cursor-default resize-none"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-3 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Documents</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground/70">Curriculum Vitae</label>
                <div className="mt-2">
                  {editing ? (
                    <>
                      {hasCvReady ? (
                        <div className={cn(
                          "relative border-2 rounded-lg p-4 transition-colors",
                          uploadingCv ? "border-blue-300 bg-blue-50" : "border-emerald-300 bg-emerald-50"
                        )}>
                          <div className="flex items-center gap-3">
                            {uploadingCv ? (
                              <>
                                <div className="animate-spin">
                                  <Upload className="size-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-blue-700">Envoi du CV...</p>
                                  <p className="text-xs text-blue-600 break-all">{visibleCvName}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="size-5 text-emerald-600 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-emerald-700">CV sélectionné ✓</p>
                                  <p className="text-xs text-emerald-600 break-all">{visibleCvName}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={uploadingCv}
                                  className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                                >
                                  Changer
                                </button>
                              </>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={onCvUpload}
                            disabled={uploadingCv}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                            dragActive ? "border-primary bg-primary/5" : "border-primary/30 bg-primary/2",
                            uploadingCv && "opacity-50 cursor-not-allowed"
                          )}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={onCvUpload}
                            disabled={uploadingCv}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-3 pointer-events-none">
                            <Upload className="size-6 text-primary" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">Glissez un PDF ici</p>
                              <p className="text-xs text-muted-foreground">ou cliquez pour sélectionner</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingCv}
                            className="absolute inset-0 cursor-pointer"
                            aria-label="Sélectionner un CV"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                        📎 PDF uniquement, max 5MB
                      </p>
                    </>
                  ) : (
                    <>
                      {profilForm.cv ? (
                        <button
                          type="button"
                          onClick={downloadCv}
                          className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors w-full cursor-pointer group"
                        >
                          <File className="size-4 text-emerald-600 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <p className="text-sm text-emerald-700 font-medium group-hover:underline">
                              {getFileName(profilForm.cv)}
                            </p>
                          </div>
                          <Download className="size-4 text-emerald-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun CV</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/70">Lettre de motivation</label>
                <div className={cn("relative mt-1", editing && "has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-primary/30")}>
                  <Textarea
                    value={profilForm.lettreMotivation}
                    onChange={(e) => onFormChange("lettreMotivation", e.target.value)}
                    disabled={!editing}
                    rows={3}
                    className={cn(
                      editing && "border-primary/50 hover:border-primary cursor-pointer focus:border-primary resize-none",
                      !editing && "bg-muted/30 cursor-default resize-none"
                    )}
                  />
                  {editing && <Pencil className="absolute right-3 top-3 size-4 text-primary/60 pointer-events-none" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-30 flex justify-end gap-3 border-t border-border/30 p-4 bg-background/95 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
          {editing ? (
            <>
              <Button variant="secondary" onClick={onCancelEdit} disabled={saving}>
                Annuler
              </Button>
              <Button variant="success" onClick={() => void onSave()} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CandidatProfileDialog;

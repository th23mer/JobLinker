import { useState, type DragEvent } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CVDragDropProps {
  cvUrl?: string;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export default function CVDragDrop({ cvUrl, onUpload, disabled }: CVDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const currentFileName = selectedFileName ?? (cvUrl ? cvUrl.split("/").pop() || "CV" : null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleFile = async (file: File) => {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier ne doit pas depasser 5 MB");
      return;
    }
    setIsUploading(true);
    try {
      await onUpload(file);
      setSelectedFileName(file.name);
    } catch {
      setError("Erreur lors du telechargement");
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 sm:p-8 transition-all duration-200 text-center",
          isDragging && !disabled
            ? "border-primary bg-primary/5"
            : "border-border/40 bg-muted/20 hover:border-border/70",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={cn("size-12 rounded-full flex items-center justify-center", isDragging && !disabled ? "bg-primary/20" : "bg-muted")}>
            <Upload className={cn("size-5", isDragging && !disabled ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isDragging && !disabled ? "Deposez votre CV ici" : "Glissez votre CV ici"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">ou</p>
          </div>
          <label>
            <Button
              size="sm"
              variant="outline"
              asChild
              disabled={disabled || isUploading}
              className="cursor-pointer"
            >
              <span>{isUploading ? "Envoi..." : "Selectionner un fichier"}</span>
            </Button>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={disabled || isUploading}
              className="hidden"
              aria-label="Telecharger un CV en PDF"
            />
          </label>
          <p className="text-xs text-muted-foreground">PDF, max 5 MB</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
          <X className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {currentFileName && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3 text-sm">
          <CheckCircle className="size-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <span className="text-emerald-900 font-medium block">CV pret</span>
            <span className="text-emerald-700 text-xs break-all">{currentFileName}</span>
          </div>
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-medium underline shrink-0"
            >
              Voir
            </a>
          )}
        </div>
      )}
    </div>
  );
}

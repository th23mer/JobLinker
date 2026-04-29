import { useEffect } from "react";
import type { CandidatureWithCandidat } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X, Mail, Phone, GraduationCap, Briefcase, FileText, ExternalLink,
  CheckCircle, XCircle, User as UserIcon, Calendar,
} from "lucide-react";

interface CandidatDetailsDialogProps {
  candidature: CandidatureWithCandidat | null;
  onClose: () => void;
  onAction?: (id: number, action: "accepter" | "refuser") => void;
  pendingActionId?: number | null;
}

export function CandidatDetailsDialog({
  candidature,
  onClose,
  onAction,
  pendingActionId,
}: CandidatDetailsDialogProps) {
  useEffect(() => {
    if (!candidature) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [candidature, onClose]);

  if (!candidature) return null;
  const c = candidature;
  const cvUrl = c.cv || c.candidatCv;
  const isPending = c.statut === "en_attente";
  const acting = pendingActionId === c.id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidat-details-title"
      className="fixed inset-0 z-50 bg-background overflow-y-auto animate-in fade-in duration-150"
    >
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border/40 bg-background/95 backdrop-blur-md px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 shrink-0">
            <span className="font-heading text-base font-bold text-primary/85">
              {c.candidatPrenom?.[0]}{c.candidatNom?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <h2 id="candidat-details-title" className="text-lg sm:text-xl font-bold text-foreground truncate">
              {c.candidatPrenom} {c.candidatNom}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-0.5">
              <Calendar className="size-3" aria-hidden="true" />
              Postulé le {new Date(c.datePostulation).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={isPending ? "warning" : c.statut === "acceptee" ? "success" : "destructive"}
            className="gap-1"
          >
            {isPending ? "En attente" : c.statut === "acceptee" ? (
              <><CheckCircle className="size-3" /> Acceptée</>
            ) : (
              <><XCircle className="size-3" /> Refusée</>
            )}
          </Badge>
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* Main content — scrolls with the page */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28">
        {/* Candidate info */}
        <section>
          <h3 className="text-sm font-semibold text-foreground/90 mb-3 flex items-center gap-2">
            <UserIcon className="size-4 text-muted-foreground/70" aria-hidden="true" />
            Coordonnées et profil
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoRow icon={Mail} label="Email" value={c.candidatEmail} href={c.candidatEmail ? `mailto:${c.candidatEmail}` : undefined} />
            {c.candidatTelephone && <InfoRow icon={Phone} label="Téléphone" value={c.candidatTelephone} href={`tel:${c.candidatTelephone}`} />}
            {c.candidatDiplome && <InfoRow icon={GraduationCap} label="Diplôme" value={c.candidatDiplome} />}
            {c.candidatNiveauEtude && <InfoRow icon={GraduationCap} label="Niveau d'étude" value={c.candidatNiveauEtude} />}
            {c.candidatExperience && <InfoRow icon={Briefcase} label="Expérience" value={c.candidatExperience} />}
          </div>
        </section>

        {/* Motivation letter */}
        {c.lettreMotivation && (
          <section>
            <h3 className="text-sm font-semibold text-foreground/90 mb-3">Lettre de motivation</h3>
            <div className="rounded-xl border border-border/40 bg-muted/15 p-5">
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">
                {c.lettreMotivation}
              </p>
            </div>
          </section>
        )}

        {/* CV preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground/70" aria-hidden="true" />
              Curriculum Vitae
            </h3>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 hover:underline"
              >
                Ouvrir dans un nouvel onglet <ExternalLink className="size-3" />
              </a>
            )}
          </div>
          {cvUrl ? (
            <div className="rounded-xl border border-border/40 overflow-hidden bg-muted/20">
              <iframe
                src={cvUrl}
                title={`CV de ${c.candidatPrenom} ${c.candidatNom}`}
                className="block w-full h-[80vh] bg-background"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 p-10 text-center">
              <FileText className="size-10 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground/80">Aucun CV transmis avec cette candidature.</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Le candidat n'a pas joint de CV à cette demande.</p>
            </div>
          )}
        </section>
      </main>

      {/* Sticky footer */}
      <footer className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-border/40 bg-background/95 backdrop-blur-md px-5 sm:px-8 py-4">
        <Button type="button" variant="outline" onClick={onClose}>Fermer</Button>
        {onAction && isPending && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAction(c.id, "refuser")}
              disabled={acting}
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <XCircle className="size-4" aria-hidden="true" />
              {acting ? "Traitement..." : "Refuser"}
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={() => onAction(c.id, "accepter")}
              disabled={acting}
            >
              <CheckCircle className="size-4" aria-hidden="true" />
              {acting ? "Traitement..." : "Accepter"}
            </Button>
          </>
        )}
      </footer>
    </div>
  );
}

function InfoRow({
  icon: Icon, label, value, href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/30 bg-background/60 p-3">
      <Icon className="size-4 text-muted-foreground/60 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{label}</p>
        {href ? (
          <a href={href} className="text-sm text-foreground hover:text-primary hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

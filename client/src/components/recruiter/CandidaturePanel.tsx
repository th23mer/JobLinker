import {
  CheckCircle, XCircle, Mail, Phone,
  GraduationCap, Briefcase, FileText, ExternalLink, UserX,
} from "lucide-react";
import type { CandidatureWithCandidat } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CandidaturePanelProps {
  candidatures: CandidatureWithCandidat[];
  onAction: (id: number, action: "accepter" | "refuser") => void;
  pendingActionId?: number | null;
}

export function CandidaturePanel({ candidatures, onAction, pendingActionId }: CandidaturePanelProps) {
  return (
    <div className="border-t border-border/30 bg-gradient-to-b from-muted/15 to-transparent p-4 animate-scale-in">
      {candidatures.length === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted/40">
            <UserX className="size-6 text-muted-foreground/30" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-muted-foreground/80">Aucune candidature reçue</p>
          <p className="mt-1 text-[12px] text-muted-foreground/50">
            Les candidatures apparaîtront ici dès qu'un candidat postulera.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary/60" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
              {candidatures.length} candidature{candidatures.length > 1 ? "s" : ""}
            </p>
          </div>

          {candidatures.map((c) => (
            <Card key={c.id} className="overflow-hidden border-border/30 bg-background/90 shadow-none hover:shadow-sm transition-shadow duration-200">
              {/* Candidate header */}
              <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/12 to-primary/4 shrink-0">
                    <span className="font-heading text-[12px] font-bold text-primary/80">
                      {c.candidatPrenom?.[0]}
                      {c.candidatNom?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-tight">
                      {c.candidatPrenom} {c.candidatNom}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      {new Date(c.datePostulation).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.statut === "en_attente" ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onAction(c.id, "accepter")}
                        disabled={pendingActionId === c.id}
                        aria-label="Accepter la candidature"
                        className="h-7 gap-1 rounded-lg text-[11px] px-2.5 shadow-none"
                      >
                        <CheckCircle className="size-3" aria-hidden="true" />
                        {pendingActionId === c.id ? "Traitement..." : "Accepter"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction(c.id, "refuser")}
                        disabled={pendingActionId === c.id}
                        aria-label="Refuser la candidature"
                        className="h-7 gap-1 rounded-lg text-[11px] px-2.5 text-destructive border-destructive/20 hover:bg-destructive/5 shadow-none"
                      >
                        <XCircle className="size-3" aria-hidden="true" />
                        {pendingActionId === c.id ? "Traitement..." : "Refuser"}
                      </Button>
                    </>
                  ) : (
                    <Badge
                      variant={c.statut === "acceptee" ? "success" : "destructive"}
                      className="gap-1 text-[10px] px-2 py-0.5"
                    >
                      {c.statut === "acceptee" ? (
                        <CheckCircle className="size-2.5" aria-hidden="true" />
                      ) : (
                        <XCircle className="size-2.5" aria-hidden="true" />
                      )}
                      {c.statut === "acceptee" ? "Acceptée" : "Refusée"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Candidate details */}
              <div className="border-t border-border/20 bg-muted/[0.04] px-3.5 py-3">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem icon={Mail} href={`mailto:${c.candidatEmail}`} linkText={c.candidatEmail} />
                  {c.candidatTelephone && <DetailItem icon={Phone} text={c.candidatTelephone} />}
                  {c.candidatDiplome && (
                    <DetailItem
                      icon={GraduationCap}
                      text={`${c.candidatDiplome}${c.candidatNiveauEtude ? ` (${c.candidatNiveauEtude})` : ""}`}
                    />
                  )}
                  {c.candidatExperience && <DetailItem icon={Briefcase} text={c.candidatExperience} />}
                </div>

                {/* CV + motivation */}
                {((c.cv || c.candidatCv) || c.lettreMotivation) && (
                  <div className="mt-3 flex flex-col gap-2">
                    {(c.cv || c.candidatCv) && (
                      <a
                        href={c.cv || c.candidatCv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/[0.06] hover:border-primary/25"
                      >
                        <FileText className="size-3" aria-hidden="true" />
                        Voir le CV
                        <ExternalLink className="size-2.5 opacity-60" aria-hidden="true" />
                      </a>
                    )}
                    {c.lettreMotivation && (
                      <div className="rounded-lg border border-border/25 bg-background/80 p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                          Lettre de motivation
                        </p>
                        <p className="text-[12px] leading-relaxed text-muted-foreground/80 whitespace-pre-line">
                          {c.lettreMotivation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Detail item helper ── */

function DetailItem({
  icon: Icon,
  text,
  href,
  linkText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text?: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
      <Icon className="size-3 shrink-0 text-muted-foreground/40" aria-hidden="true" />
      {href ? (
        <a href={href} className="text-primary/80 hover:text-primary hover:underline truncate">
          {linkText || href}
        </a>
      ) : (
        <span className="truncate">{text}</span>
      )}
    </div>
  );
}

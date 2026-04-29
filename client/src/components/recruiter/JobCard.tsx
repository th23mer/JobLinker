import {
  Briefcase, Users, Clock, MapPin, Pencil, Trash2, Eye,
  CheckCircle, AlertTriangle, BarChart3,
} from "lucide-react";
import type { OffreEmploi } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidaturePanel } from "./CandidaturePanel";
import type { CandidatureWithCandidat } from "@/types";

/* ── Types ── */

interface CandidatureStat {
  total: number;
  nouvelles: number;
  repondues?: number;
}

interface JobCardProps {
  offre: OffreEmploi;
  stat: CandidatureStat | undefined;
  loadingStats: boolean;
  isExpanded: boolean;
  candidatures: CandidatureWithCandidat[];
  onToggleCandidatures: (offreId: number) => void;
  onEdit: (offre: OffreEmploi) => void;
  onDelete: (offre: OffreEmploi, trigger?: HTMLElement | null) => void;
  onCandidatureAction: (id: number, action: "accepter" | "refuser") => void;
  actionLoadingId: number | null;
  onViewDetails: (offre: OffreEmploi) => void;
  formatRelativeTime: (date?: string) => string;
  selected?: boolean;
  onSelectToggle?: (offreId: number) => void;
  showPerformance?: boolean;
}

/* ── Status helpers ── */

function getStatusConfig(status: string) {
  switch (status) {
    case "validee":
      return {
        label: "Validée",
        icon: CheckCircle,
        borderColor: "border-l-emerald-500",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
      };
    case "en_attente":
      return {
        label: "En cours",
        icon: Clock,
        borderColor: "border-l-amber-500",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/50",
      };
    case "expiree":
      return {
        label: "Expirée",
        icon: AlertTriangle,
        borderColor: "border-l-red-400",
        badgeClass: "bg-red-50 text-red-700 border-red-200/50",
      };
    default:
      return {
        label: status,
        icon: Briefcase,
        borderColor: "border-l-slate-300",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200/50",
      };
  }
}

/* ── Loading skeleton ── */

export function JobCardSkeleton() {
  return (
    <Card className="border-border/40 bg-background/80 backdrop-blur-sm p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </Card>
  );
}

/* ── Main component ── */

export function JobCard({
  offre,
  stat,
  loadingStats,
  isExpanded,
  candidatures,
  onToggleCandidatures,
  onEdit,
  onDelete,
  onCandidatureAction,
  actionLoadingId,
  onViewDetails,
  formatRelativeTime,
  selected = false,
  onSelectToggle,
  showPerformance = false,
}: JobCardProps) {
  const status = getStatusConfig(offre.statutValidation);
  const StatusIcon = status.icon;
  const totalCandidatures = stat?.total ?? 0;
  const newCandidatures = stat?.nouvelles ?? 0;
  const repondues = stat?.repondues ?? 0;
  const responseRate = totalCandidatures > 0 ? Math.round((repondues / totalCandidatures) * 100) : 0;

  return (
    <Card
      className={[
        "group relative overflow-hidden bg-white/90 backdrop-blur-sm transition-all duration-200 rounded-xl border border-border/30 border-l-4",
        status.borderColor,
        selected ? "ring-2 ring-primary/40 border-primary/30 bg-primary/[0.02]" : "",
        isExpanded
          ? "shadow-lg shadow-primary/[0.06] ring-1 ring-primary/10"
          : "hover:shadow-md hover:shadow-black/[0.04] hover:-translate-y-px",
      ].join(" ")}
    >
      {/* Main row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: checkbox + info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Bulk selection checkbox */}
          {onSelectToggle && (
            <label className="flex items-center shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelectToggle(offre.id)}
                className="size-4 rounded border-border/60 text-primary focus:ring-primary/30 cursor-pointer accent-[var(--primary)]"
                aria-label={`Sélectionner l'offre "${offre.titre}"`}
              />
            </label>
          )}

          {/* Offer info */}
          <div className="min-w-0 flex-1">
            {/* Title + status badge row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-heading text-[15px] font-medium leading-snug text-foreground truncate">
                {offre.titre}
              </h3>
              <Badge
                className={[
                  "gap-1.5 text-[10px] px-2 py-0.5 font-semibold shrink-0 rounded-full border shadow-none",
                  status.badgeClass
                ].join(" ")}
                role="status"
                aria-label={`Statut: ${status.label}`}
              >
                <StatusIcon className="size-3" aria-hidden="true" />
                {status.label}
              </Badge>
            </div>

            {/* Metadata — single clean line */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground/60">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground/40" aria-hidden="true" />
                {offre.ville || "—"}
              </span>
              <span className="size-[3px] rounded-full bg-border/60" aria-hidden="true" />
              <span className="font-medium text-foreground/50">{offre.typeContrat}</span>
              <span className="size-[3px] rounded-full bg-border/60" aria-hidden="true" />
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground/40" aria-hidden="true" />
                {formatRelativeTime(offre.dateCreation)}
              </span>
            </div>

            {/* Optional performance stats row */}
            {showPerformance && (
              <div className="flex items-center gap-3 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50">
                  <BarChart3 className="size-3" aria-hidden="true" />
                  Taux de réponse: <span className="font-semibold text-foreground/60 tabular-nums">{responseRate}%</span>
                </span>
                {totalCandidatures > 0 && (
                  <span className="text-[11px] text-muted-foreground/50">
                    {repondues}/{totalCandidatures} traitées
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: candidatures + inline actions */}
        <div className="flex items-center gap-1.5 sm:ml-3 shrink-0">
          {/* Candidatures button */}
          <Button
            type="button"
            variant={isExpanded ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleCandidatures(offre.id)}
            className={[
              "h-8 gap-1.5 rounded-lg text-[12px] font-medium px-3",
              !isExpanded
                ? "border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/[0.03]"
                : "shadow-sm",
            ].join(" ")}
            aria-label={`${totalCandidatures} candidatures pour "${offre.titre}"${newCandidatures > 0 ? `, dont ${newCandidatures} non lues` : ""}`}
            title="Afficher les candidatures"
          >
            <Users className="size-3.5" aria-hidden="true" />
            <span className="tabular-nums">{loadingStats ? "…" : totalCandidatures}</span>
            {newCandidatures > 0 && !loadingStats && (
              <span
                className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white shadow-sm shadow-amber-600/30"
                aria-label={`${newCandidatures} candidature${newCandidatures > 1 ? "s" : ""} non lue${newCandidatures > 1 ? "s" : ""}`}
                title={`${newCandidatures} non lue${newCandidatures > 1 ? "s" : ""}`}
              >
                {newCandidatures}
              </span>
            )}
          </Button>

          {/* Inline primary actions */}
          <div className="flex items-center bg-muted/20 rounded-xl p-1 border border-border/10 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onViewDetails(offre)}
              className="size-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
              aria-label={`Voir les détails de "${offre.titre}"`}
              title="Voir l'offre"
            >
              <Eye className="size-4" aria-hidden="true" />
            </Button>

            <div className="w-px h-4 bg-border/20 mx-0.5" aria-hidden="true" />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(offre)}
              className="size-8 text-muted-foreground/50 hover:text-amber-600 hover:bg-amber-50 transition-all rounded-lg"
              aria-label={`Modifier "${offre.titre}"`}
              title="Modifier"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>

            <div className="w-px h-4 bg-border/20 mx-0.5" aria-hidden="true" />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(offre)}
              className="size-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-all rounded-lg"
              aria-label={`Supprimer "${offre.titre}"`}
              title="Supprimer"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded: candidatures panel */}
      {isExpanded && (
        <CandidaturePanel
          candidatures={candidatures}
          onAction={onCandidatureAction}
          pendingActionId={actionLoadingId}
        />
      )}
    </Card>
  );
}

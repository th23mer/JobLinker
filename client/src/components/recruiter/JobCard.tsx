import {
  Briefcase, Users, Clock, MapPin, Pencil, Trash2, Eye,
  MoreHorizontal, CheckCircle, AlertTriangle,
} from "lucide-react";
import type { OffreEmploi } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CandidaturePanel } from "./CandidaturePanel";
import type { CandidatureWithCandidat } from "@/types";

/* ── Types ── */

interface CandidatureStat {
  total: number;
  nouvelles: number;
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
  onView: (offreId: number) => void;
  formatRelativeTime: (date?: string) => string;
}

/* ── Status helpers ── */

function getStatusConfig(status: string) {
  switch (status) {
    case "validee":
      return {
        label: "Validée",
        variant: "success" as const,
        icon: CheckCircle,
        borderColor: "border-l-emerald-500",
        dotColor: "bg-emerald-500",
      };
    case "en_attente":
      return {
        label: "En attente",
        variant: "warning" as const,
        icon: Clock,
        borderColor: "border-l-amber-500",
        dotColor: "bg-amber-500",
      };
    case "expiree":
      return {
        label: "Expirée",
        variant: "destructive" as const,
        icon: AlertTriangle,
        borderColor: "border-l-red-400",
        dotColor: "bg-red-400",
      };
    default:
      return {
        label: status,
        variant: "secondary" as const,
        icon: Briefcase,
        borderColor: "border-l-slate-300",
        dotColor: "bg-slate-400",
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
  onView,
  formatRelativeTime,
}: JobCardProps) {
  const status = getStatusConfig(offre.statutValidation);
  const StatusIcon = status.icon;
  const totalCandidatures = stat?.total ?? 0;
  const newCandidatures = stat?.nouvelles ?? 0;

  return (
    <Card
      className={[
        "group overflow-hidden border-l-[3px] border-border/40 bg-background/80 backdrop-blur-sm transition-all duration-200",
        status.borderColor,
        isExpanded
          ? "shadow-lg shadow-primary/[0.06] ring-1 ring-primary/10"
          : "hover:shadow-md hover:shadow-black/[0.04] hover:-translate-y-px",
      ].join(" ")}
    >
      {/* Main row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted/50 shrink-0 transition-colors group-hover:bg-muted/80">
            <Briefcase className="size-4 text-muted-foreground/70" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title + status */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="font-heading text-[14px] font-semibold leading-snug text-foreground">
                {offre.titre}
              </h3>
              <Badge variant={status.variant} className="gap-1 text-[10px] px-2 py-0.5 font-medium">
                <StatusIcon className="size-2.5" aria-hidden="true" />
                {status.label}
              </Badge>
            </div>

            {/* Metadata — single clean line */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground/70">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground/50" aria-hidden="true" />
                {offre.ville || "—"}
              </span>
              <span className="size-[3px] rounded-full bg-border/80" />
              <span className="font-medium text-foreground/60">{offre.typeContrat}</span>
              <span className="size-[3px] rounded-full bg-border/80" />
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground/50" aria-hidden="true" />
                {formatRelativeTime(offre.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: candidatures + actions */}
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
            aria-label={`Voir les candidatures de ${offre.titre}`}
            title="Afficher les candidatures"
          >
            <Users className="size-3.5" aria-hidden="true" />
            <span className="tabular-nums">{loadingStats ? "…" : totalCandidatures}</span>
            {newCandidatures > 0 && !loadingStats && (
              <span className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-sm shadow-amber-500/30">
                {newCandidatures}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(offre.id)}
            className="size-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
            aria-label="Voir l'offre"
            title="Voir l'offre"
          >
            <Eye className="size-4" aria-hidden="true" />
          </Button>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground/50 hover:text-foreground hover:bg-muted/60"
                aria-label="Actions pour cette offre"
                title="Modifier ou supprimer"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(offre)} className="gap-2 text-[13px]">
                <Pencil className="size-3.5 text-muted-foreground" aria-hidden="true" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  const trigger = (e.target as HTMLElement).closest("button");
                  onDelete(offre, trigger);
                }}
                className="gap-2 text-[13px] text-destructive focus:text-destructive focus:bg-destructive/5"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

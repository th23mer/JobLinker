import { Briefcase, Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATS_CONFIG = [
  {
    key: "all" as const,
    label: "Offres publiées",
    sublabel: "Total de vos offres",
    icon: Briefcase,
    gradient: "from-primary/80 to-primary-light/80",
    iconBg: "bg-gradient-to-br from-primary/15 to-primary/5 text-primary",
    glowColor: "group-hover:shadow-primary/10",
    tooltip: undefined,
  },
  {
    key: "pending" as const,
    label: "En attente de validation",
    sublabel: "En cours de révision",
    icon: Clock,
    gradient: "from-amber-500/80 to-orange-400/80",
    iconBg: "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600",
    glowColor: "group-hover:shadow-amber-500/10",
    tooltip: "En cours de révision par notre équipe. Délai habituel\u00a0: 24h ouvrables.",
  },
  {
    key: "validated" as const,
    label: "Offres actives",
    sublabel: "Publiées et visibles",
    icon: TrendingUp,
    gradient: "from-emerald-500/80 to-teal-400/80",
    iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600",
    glowColor: "group-hover:shadow-emerald-500/10",
    tooltip: undefined,
  },
];

interface StatsCardsProps {
  loading: boolean;
  totalOffers: number;
  pendingCount: number;
  validatedCount: number;
  onCardClick?: (filter: "all" | "pending" | "validated") => void;
}

export function StatsCards({ loading, totalOffers, pendingCount, validatedCount, onCardClick }: StatsCardsProps) {
  const values = [totalOffers, pendingCount, validatedCount];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="size-11 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-8 w-14 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
      {STATS_CONFIG.map((s, idx) => (
        <Card
          key={s.key}
          role="button"
          tabIndex={0}
          title={s.tooltip}
          onClick={() => onCardClick?.(s.key)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCardClick?.(s.key); }
          }}
          aria-label={`${s.label}\u00a0: ${values[idx]}. Cliquer pour filtrer.`}
          className={`group relative overflow-hidden border-border/30 bg-white/90 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${s.glowColor} ${s.tooltip ? "cursor-help" : "cursor-pointer"}`}
        >
          <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${s.gradient} opacity-80`} />
          <div className={`pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.07]`} />

          <div className="relative flex items-center gap-4">
            <div className={`flex size-12 items-center justify-center rounded-xl ${s.iconBg} shadow-sm`}>
              <s.icon className="size-[20px] text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
                {values[idx]}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-muted-foreground/80 leading-tight">
                {s.label}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{s.sublabel}</p>
            </div>
          </div>


        </Card>
      ))}
    </div>
  );
}

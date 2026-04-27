import React from "react";
import { Search, SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  contractFilter: string;
  onContractFilterChange: (value: string) => void;
  contractOptions: string[];
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  locationOptions: string[];
  sortBy: string;
  onSortByChange: (value: string) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  contractFilter,
  onContractFilterChange,
  contractOptions,
  locationFilter,
  onLocationFilterChange,
  locationOptions,
  sortBy,
  onSortByChange,
  onReset,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    contractFilter !== "all" ||
    locationFilter !== "all" ||
    sortBy !== "date";

  const selectClass =
    "h-9 w-full rounded-lg border border-border/50 bg-background/80 px-3 text-[13px] text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8 hover:border-border/80";

  const activeChips = [
    statusFilter !== "all"
      ? {
          key: "status",
          label: statusFilter === "en_cours" ? "En attente" : statusFilter === "validee" ? "Validée" : "Expirée",
          clear: () => onStatusFilterChange("all"),
        }
      : null,
    contractFilter !== "all"
      ? { key: "contract", label: contractFilter, clear: () => onContractFilterChange("all") }
      : null,
    locationFilter !== "all"
      ? { key: "location", label: locationFilter, clear: () => onLocationFilterChange("all") }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

  return (
    <div className="mb-6">
      {/* Sticky filter bar */}
      <div className="sticky top-20 z-20 rounded-xl border border-border/40 bg-background/85 p-3 shadow-sm shadow-black/[0.03] backdrop-blur-xl">
        {/* Search + filters row */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          {/* Search input */}
          <div className="relative flex-1 min-w-0 lg:max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
            <Input
              aria-label="Rechercher une offre"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par titre, ville ou contrat..."
              className="h-9 rounded-lg border-border/50 bg-background/80 pl-8 pr-3 text-[13px] placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Separator */}
          <div className="hidden lg:block h-5 w-px bg-border/40" />

          {/* Filter selects — desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-2 lg:flex-1">
            <select aria-label="Filtrer par statut" className={selectClass} value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="en_cours">En attente</option>
              <option value="validee">Validée</option>
              <option value="expiree">Expirée</option>
            </select>

            <select aria-label="Filtrer par type de contrat" className={selectClass} value={contractFilter} onChange={(e) => onContractFilterChange(e.target.value)}>
              <option value="all">Type de contrat</option>
              {contractOptions.filter((v) => v !== "all").map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select aria-label="Filtrer par localisation" className={selectClass} value={locationFilter} onChange={(e) => onLocationFilterChange(e.target.value)}>
              <option value="all">Localisation</option>
              {locationOptions.filter((v) => v !== "all").map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select aria-label="Trier les offres" className={selectClass} value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
              <option value="date">Trier: Date</option>
              <option value="candidatures">Trier: Candidatures</option>
            </select>

            {hasActiveFilters && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-9 shrink-0 gap-1 px-2.5 text-[11px] text-muted-foreground/70 hover:text-foreground"
                onClick={onReset}
              >
                <RotateCcw className="size-3" aria-hidden="true" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <MobileFilters
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            contractFilter={contractFilter}
            onContractFilterChange={onContractFilterChange}
            contractOptions={contractOptions}
            locationFilter={locationFilter}
            onLocationFilterChange={onLocationFilterChange}
            locationOptions={locationOptions}
            sortBy={sortBy}
            onSortByChange={onSortByChange}
            onReset={onReset}
            hasActiveFilters={hasActiveFilters}
            selectClass={selectClass}
          />
        </div>

        {/* Result count + active filter chips */}
        {(resultCount !== totalCount || activeChips.length > 0) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/30 pt-2.5">
            <p className="text-[11px] text-muted-foreground/70 mr-1" aria-live="polite">
              <span className="font-semibold text-foreground/80 tabular-nums">{resultCount}</span>{" "}
              résultat{resultCount > 1 ? "s" : ""} sur {totalCount}
            </p>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground/80 transition-all duration-150 hover:bg-destructive/8 hover:border-destructive/25 hover:text-destructive"
                aria-label={`Retirer le filtre ${chip.label}`}
              >
                {chip.label}
                <X className="size-2.5 opacity-50" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mobile Filters (collapsible) ── */

function MobileFilters({
  statusFilter,
  onStatusFilterChange,
  contractFilter,
  onContractFilterChange,
  contractOptions,
  locationFilter,
  onLocationFilterChange,
  locationOptions,
  sortBy,
  onSortByChange,
  onReset,
  hasActiveFilters,
  selectClass,
}: {
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  contractFilter: string;
  onContractFilterChange: (v: string) => void;
  contractOptions: string[];
  locationFilter: string;
  onLocationFilterChange: (v: string) => void;
  locationOptions: string[];
  sortBy: string;
  onSortByChange: (v: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  selectClass: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2 border-border/50 text-[13px]"
        onClick={() => setOpen((p) => !p)}
      >
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        Filtres et tri
      </Button>

      {open && (
        <div className="mt-2.5 grid grid-cols-1 gap-2 animate-scale-in sm:grid-cols-2">
          <select aria-label="Filtrer par statut" className={selectClass} value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="en_cours">En attente</option>
            <option value="validee">Validée</option>
            <option value="expiree">Expirée</option>
          </select>
          <select aria-label="Filtrer par type de contrat" className={selectClass} value={contractFilter} onChange={(e) => onContractFilterChange(e.target.value)}>
            <option value="all">Type de contrat</option>
            {contractOptions.filter((v) => v !== "all").map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select aria-label="Filtrer par localisation" className={selectClass} value={locationFilter} onChange={(e) => onLocationFilterChange(e.target.value)}>
            <option value="all">Localisation</option>
            {locationOptions.filter((v) => v !== "all").map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select aria-label="Trier les offres" className={selectClass} value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
            <option value="date">Trier: Date</option>
            <option value="candidatures">Trier: Candidatures</option>
          </select>
          {hasActiveFilters && (
            <Button type="button" size="sm" variant="outline" className="sm:col-span-2 gap-1.5 text-[13px]" onClick={onReset}>
              <RotateCcw className="size-3" aria-hidden="true" />
              Réinitialiser
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

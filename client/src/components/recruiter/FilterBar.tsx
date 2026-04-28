import React from "react";
import { Search, SlidersHorizontal, RotateCcw, X, BarChart3, Trash2, ArrowDownUp } from "lucide-react";
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
  /* bulk + toolbar */
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  bulkDeleting: boolean;
  showPerformance: boolean;
  onTogglePerformance: () => void;
}

export function FilterBar({
  searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange,
  contractFilter, onContractFilterChange, contractOptions,
  locationFilter, onLocationFilterChange, locationOptions,
  sortBy, onSortByChange,
  onReset,
  resultCount, totalCount,
  selectedCount, totalFilteredCount,
  onSelectAll, onClearSelection,
  onBulkDelete, bulkDeleting,
  showPerformance, onTogglePerformance,
}: FilterBarProps) {
  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    contractFilter !== "all" ||
    locationFilter !== "all" ||
    sortBy !== "date";

  const allSelected = selectedCount === totalFilteredCount && totalFilteredCount > 0;

  const selectClass =
    "h-9 w-full rounded-lg border border-border/50 bg-background/80 px-3 text-[13px] text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8 hover:border-border/80";

  const activeChips = [
    statusFilter !== "all"
      ? { key: "status", label: statusFilter === "en_cours" ? "En attente" : statusFilter === "validee" ? "Validée" : "Expirée", clear: () => onStatusFilterChange("all") }
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
      <div className="sticky top-20 z-20 rounded-xl border border-border/40 bg-background/85 p-3 shadow-sm shadow-black/[0.03] backdrop-blur-xl">

        {/* ── Row 1: search + filter selects ── */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0 lg:max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
            <Input
              aria-label="Rechercher une offre"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par titre ou ville…"
              className="h-9 rounded-lg border-border/50 bg-background/80 pl-8 pr-3 text-[13px] placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="hidden lg:block h-5 w-px bg-border/40" />

          {/* Filter selects — desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-2 lg:flex-1">
            <select
              aria-label="Filtrer par statut"
              className={`${selectClass} ${statusFilter !== "all" ? "ring-2 ring-primary/30 border-primary" : ""}`}
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="all">Statut</option>
              <option value="en_cours">En attente</option>
              <option value="validee">Validée</option>
              <option value="expiree">Expirée</option>
            </select>

            <select
              aria-label="Filtrer par type de contrat"
              className={`${selectClass} ${contractFilter !== "all" ? "ring-2 ring-primary/30 border-primary" : ""}`}
              value={contractFilter}
              onChange={(e) => onContractFilterChange(e.target.value)}
            >
              <option value="all">Contrat</option>
              {contractOptions.filter((v) => v !== "all").map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select
              aria-label="Filtrer par localisation"
              className={`${selectClass} ${locationFilter !== "all" ? "ring-2 ring-primary/30 border-primary" : ""}`}
              value={locationFilter}
              onChange={(e) => onLocationFilterChange(e.target.value)}
            >
              <option value="all">Localisation</option>
              {locationOptions.filter((v) => v !== "all").map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select
              aria-label="Trier les offres"
              className={`${selectClass} ml-2`}
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
            >
              <option value="date">Date ↓</option>
              <option value="candidatures">Candidatures ↓</option>
            </select>

            {hasActiveFilters && (
              <Button
                type="button" size="sm" variant="ghost"
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
            statusFilter={statusFilter} onStatusFilterChange={onStatusFilterChange}
            contractFilter={contractFilter} onContractFilterChange={onContractFilterChange}
            contractOptions={contractOptions}
            locationFilter={locationFilter} onLocationFilterChange={onLocationFilterChange}
            locationOptions={locationOptions}
            sortBy={sortBy} onSortByChange={onSortByChange}
            onReset={onReset} hasActiveFilters={hasActiveFilters}
            selectClass={selectClass}
          />
        </div>

        {/* ── Row 2: toolbar — select-all · stats · bulk actions + result chips ── */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border/30 pt-2.5">
          {/* Select-all toggle button */}
          <button
            type="button"
            onClick={allSelected ? onClearSelection : onSelectAll}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all duration-200 shadow-sm",
              allSelected
                ? "border-primary bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50",
            ].join(" ")}
            aria-label={allSelected ? "Tout désélectionner" : "Sélectionner toutes les offres"}
          >
            <span className={[
              "inline-flex size-3.5 items-center justify-center rounded-[4px] border transition-colors",
              allSelected
                ? "border-white bg-white text-primary"
                : selectedCount > 0
                  ? "border-primary bg-primary/20"
                  : "border-primary/40 bg-transparent",
            ].join(" ")} aria-hidden="true">
              {allSelected && <svg viewBox="0 0 10 10" className="size-2.5 stroke-primary stroke-[2.5] fill-none"><path d="M2 5l2 2 4-4"/></svg>}
              {!allSelected && selectedCount > 0 && <span className="block size-1.5 rounded-sm bg-primary"/>}
            </span>
            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>

          {/* Performances toggle button */}
          <button
            type="button"
            onClick={onTogglePerformance}
            aria-pressed={showPerformance}
            title={showPerformance ? "Masquer les performances" : "Afficher les indicateurs de performance"}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all duration-200 shadow-sm",
              showPerformance
                ? "border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20"
                : "border-indigo-200 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300",
            ].join(" ")}
          >
            <BarChart3 className="size-3.5" aria-hidden="true" />
            {showPerformance ? "Masquer performances" : "Performances"}
          </button>

          {/* Separator */}
          {(selectedCount > 0 || resultCount !== totalCount || activeChips.length > 0) && (
            <div className="h-4 w-px bg-border/40" />
          )}

          {/* Bulk actions (when items selected) */}
          {selectedCount > 0 && (
            <>
              <span className="text-[11px] font-medium text-foreground/70 tabular-nums">
                <span className="font-semibold text-foreground">{selectedCount}</span>
                {" "}sélectionnée{selectedCount > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={onBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/[0.06] px-2.5 py-1 text-[11px] font-medium text-destructive transition-all hover:bg-destructive/[0.12] disabled:opacity-60"
                aria-label={`Supprimer ${selectedCount} offre${selectedCount > 1 ? "s" : ""} sélectionnée${selectedCount > 1 ? "s" : ""}`}
              >
                {bulkDeleting ? (
                  <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <Trash2 className="size-3" aria-hidden="true" />
                )}
                {bulkDeleting ? "Suppression…" : `Supprimer (${selectedCount})`}
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                aria-label="Annuler la sélection"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Result count */}
          {resultCount !== totalCount && selectedCount === 0 && (
            <p className="text-[11px] text-muted-foreground/70" aria-live="polite">
              <span className="font-semibold text-foreground/80 tabular-nums">{resultCount}</span>
              {" "}résultat{resultCount > 1 ? "s" : ""} sur {totalCount}
            </p>
          )}

          {/* Active filter chips */}
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
      </div>
    </div>
  );
}

/* ── Mobile Filters (collapsible) ── */

function MobileFilters({
  statusFilter, onStatusFilterChange,
  contractFilter, onContractFilterChange, contractOptions,
  locationFilter, onLocationFilterChange, locationOptions,
  sortBy, onSortByChange,
  onReset, hasActiveFilters, selectClass,
}: {
  statusFilter: string; onStatusFilterChange: (v: string) => void;
  contractFilter: string; onContractFilterChange: (v: string) => void;
  contractOptions: string[];
  locationFilter: string; onLocationFilterChange: (v: string) => void;
  locationOptions: string[];
  sortBy: string; onSortByChange: (v: string) => void;
  onReset: () => void; hasActiveFilters: boolean; selectClass: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="lg:hidden">
      <Button
        type="button" variant="outline" size="sm"
        className="w-full gap-2 border-border/50 text-[13px]"
        onClick={() => setOpen((p) => !p)}
      >
        <ArrowDownUp className="size-3.5" aria-hidden="true" />
        Filtres et tri
      </Button>
      {open && (
        <div className="mt-2.5 grid grid-cols-1 gap-2 animate-scale-in sm:grid-cols-2">
          <select aria-label="Filtrer par statut" className={selectClass} value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
            <option value="all">Statut</option>
            <option value="en_cours">En attente</option>
            <option value="validee">Validée</option>
            <option value="expiree">Expirée</option>
          </select>
          <select aria-label="Filtrer par type de contrat" className={selectClass} value={contractFilter} onChange={(e) => onContractFilterChange(e.target.value)}>
            <option value="all">Contrat</option>
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
            <option value="date">Date ↓</option>
            <option value="candidatures">Candidatures ↓</option>
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

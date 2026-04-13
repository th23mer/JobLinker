import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import type { OffreEmploi, Categorie } from "@/types";
import { Search, MapPin, Briefcase, GraduationCap, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Offres() {
  const [offres, setOffres] = useState<OffreEmploi[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    categorieId: "", typeContrat: "", ville: "", niveauEtude: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<OffreEmploi[]>("/offres"),
      api.get<Categorie[]>("/categories"),
    ]).then(([o, c]) => {
      setOffres(o);
      setCategories(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (search) {
        const results = await api.get<OffreEmploi[]>(`/offres/search?titre=${encodeURIComponent(search)}`);
        setOffres(results);
      } else {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
        const url = params.toString() ? `/offres/search/advanced?${params}` : "/offres";
        const results = await api.get<OffreEmploi[]>(url);
        setOffres(results);
      }
    } catch { /* keep existing */ }
    setLoading(false);
  };

  const handleResetSearch = async () => {
    setSearch("");
    setFilters({ categorieId: "", typeContrat: "", ville: "", niveauEtude: "" });
    setLoading(true);
    try {
      const results = await api.get<OffreEmploi[]>("/offres");
      setOffres(results);
    } catch { /* keep existing */ }
    setLoading(false);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const contratVariant: Record<string, "success" | "info" | "warning" | "purple" | "secondary"> = {
    CDI: "success",
    CDD: "info",
    Stage: "warning",
    Freelance: "purple",
  };

  const selectClass =
    "flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";

  return (
    <section className="pt-20 pb-16 min-h-screen">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-b from-muted/60 to-transparent">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <Badge variant="info" className="mb-4">Explorez</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold mb-3">
            Offres d'emploi
          </h1>
          <p className="text-muted-foreground text-lg">
            {loading ? "Chargement..." : `${offres.length} offre${offres.length !== 1 ? "s" : ""} disponible${offres.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search bar */}
        <Card className="p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher par titre de poste..."
                className="pl-11 h-12 bg-muted/30 border-0 focus-visible:bg-background"
              />
            </div>
            <Button
              variant={showFilters || activeFilterCount > 0 ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filtres avances"
              className="h-12"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 size-5 p-0 justify-center text-[10px]">{activeFilterCount}</Badge>
              )}
            </Button>
            <Button onClick={handleSearch} className="h-12 px-6">
              <Search className="size-4" aria-hidden="true" />
              Rechercher
            </Button>
          </div>
        </Card>

        {/* Filters panel */}
        {showFilters && (
          <Card className="p-6 mb-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Filtres avances</h2>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ categorieId: "", typeContrat: "", ville: "", niveauEtude: "" })}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Reinitialiser
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Categorie</Label>
                <select value={filters.categorieId} onChange={(e) => setFilters({ ...filters, categorieId: e.target.value })} className={selectClass} aria-label="Filtrer par categorie">
                  <option value="">Toutes</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contrat</Label>
                <select value={filters.typeContrat} onChange={(e) => setFilters({ ...filters, typeContrat: e.target.value })} className={selectClass} aria-label="Filtrer par type de contrat">
                  <option value="">Tous</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ville</Label>
                <Input value={filters.ville} onChange={(e) => setFilters({ ...filters, ville: e.target.value })} placeholder="Ex: Tunis" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Niveau</Label>
                <select value={filters.niveauEtude} onChange={(e) => setFilters({ ...filters, niveauEtude: e.target.value })} className={selectClass} aria-label="Filtrer par niveau d'etude">
                  <option value="">Tous</option>
                  <option value="Bac">Bac</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+5">Bac+5</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-8">
                <Skeleton className="h-5 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : offres.length === 0 ? (
          <div className="text-center py-24">
            <div className="size-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="size-10 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-xl font-bold mb-2">Aucune offre trouvee</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">Essayez de modifier vos criteres de recherche ou explorez toutes les offres.</p>
            <Button onClick={handleResetSearch}>
              <Search className="size-4" aria-hidden="true" />
              Voir toutes les offres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offres.map((offre) => (
              <Link key={offre.id} to={`/offres/${offre.id}`}>
                <Card className="group relative p-8 hover:shadow-xl hover:shadow-black/[0.05] hover:-translate-y-1 cursor-pointer h-full overflow-hidden">
                  {/* Accent bar on hover */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-primary-dark rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors pr-3 leading-snug">
                      {offre.titre}
                    </h3>
                    {offre.typeContrat && (
                      <Badge variant={contratVariant[offre.typeContrat] || "secondary"} className="shrink-0">
                        {offre.typeContrat}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                    {offre.description || "Pas de description disponible"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {offre.ville && (
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                          <MapPin className="size-3" aria-hidden="true" /> {offre.ville}
                        </span>
                      )}
                      {offre.niveauEtude && (
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                          <GraduationCap className="size-3" aria-hidden="true" /> {offre.niveauEtude}
                        </span>
                      )}
                      {offre.experienceRequise && (
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                          <Briefcase className="size-3" aria-hidden="true" /> {offre.experienceRequise}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" aria-hidden="true" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

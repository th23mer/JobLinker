import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/services/api";
import type { OffreEmploi, Categorie } from "@/types";
import { Search, MapPin, Briefcase, GraduationCap, SlidersHorizontal, X, ArrowRight, Clock, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const VILLES_TUNISIE = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Bizerte",
  "Djerba",
  "Monastir",
  "Mahdia",
  "Kairouan",
  "Kebili",
  "Tataouine",
  "Kasserine",
  "Sidi Bouzid",
  "Médenine",
  "Tozeur",
  "Gafsa",
  "Ben Arous",
  "Ariana",
  "Nabeul",
  "Manouba",
  "Zaghouan",
];

const OFFRES_PAR_PAGE = 6;

export default function Offres() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [offres, setOffres] = useState<OffreEmploi[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || searchParams.get("titre") || "");
  const [filters, setFilters] = useState({
    categorieId: searchParams.get("categorieId") || "",
    typeContrat: searchParams.get("typeContrat") || "",
    ville: searchParams.get("ville") || "",
    niveauEtude: searchParams.get("niveauEtude") || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    const hasSearch = !!(searchParams.get("search") || searchParams.get("titre"));
    const hasFilters = !!(searchParams.get("categorieId") || searchParams.get("typeContrat") || searchParams.get("ville") || searchParams.get("niveauEtude"));

    if (hasSearch || hasFilters) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(1);
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
    setCurrentPage(1);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non disponible";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Publié aujourd'hui";
    if (diffDays === 1) return "Publié hier";
    if (diffDays < 7) return `Publié il y a ${diffDays} jours`;
    if (diffDays < 30) return `Publié il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Publié il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const selectClass =
    "flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";

  // Pagination
  const totalPages = Math.ceil(offres.length / OFFRES_PAR_PAGE);
  const startIndex = (currentPage - 1) * OFFRES_PAR_PAGE;
  const endIndex = startIndex + OFFRES_PAR_PAGE;
  const offresPaginees = offres.slice(startIndex, endIndex);

  // Pagination pages to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section className="pt-20 pb-16 min-h-screen">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-b from-muted/60 to-transparent py-12">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="info" className="mb-4 font-semibold">{t("explorez")}</Badge>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4 text-foreground tracking-tight">
            {t("titreOffres")}
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            {loading ? (
              <span>{t("chargement")}</span>
            ) : (
              <span className="text-foreground font-semibold">
                {offres.length} {t("offres_disponibles")}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search bar */}
        <Card className="p-4 mb-8 shadow-sm border border-border/50">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("recherherParTitre")}
                className="pl-11 h-12 bg-muted/40 border-0 focus-visible:bg-background font-medium"
              />
            </div>
            <Button
              variant={showFilters || activeFilterCount > 0 ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              aria-label={t("filtres")}
              className="h-12 font-semibold"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("filtres")}</span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2 size-5 p-0 justify-center text-[10px] font-bold">{activeFilterCount}</Badge>
              )}
            </Button>
            <Button onClick={handleSearch} className="h-12 px-6 font-semibold bg-primary hover:bg-primary/90">
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("rechercher")}</span>
            </Button>
          </div>
        </Card>

        {/* Filters panel */}
        {showFilters && (
          <Card className="p-6 mb-8 animate-scale-in shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-lg text-foreground tracking-tight">Filtres avancés</h2>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilters({ categorieId: "", typeContrat: "", ville: "", niveauEtude: "" }); setCurrentPage(1); }}
                  className="text-destructive hover:text-destructive font-semibold"
                >
                  <X className="size-3.5 mr-1.5" aria-hidden="true" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Catégorie</Label>
                <select value={filters.categorieId} onChange={(e) => { setFilters({ ...filters, categorieId: e.target.value }); setCurrentPage(1); }} className={selectClass} aria-label="Filtrer par catégorie">
                  <option value="">Toutes les catégories</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Type de contrat</Label>
                <select value={filters.typeContrat} onChange={(e) => { setFilters({ ...filters, typeContrat: e.target.value }); setCurrentPage(1); }} className={selectClass} aria-label="Filtrer par type de contrat">
                  <option value="">Tous les contrats</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Localisation</Label>
                <select value={filters.ville} onChange={(e) => { setFilters({ ...filters, ville: e.target.value }); setCurrentPage(1); }} className={selectClass} aria-label="Filtrer par ville">
                  <option value="">Toutes les villes</option>
                  {VILLES_TUNISIE.map((ville) => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Niveau d'étude</Label>
                <select value={filters.niveauEtude} onChange={(e) => { setFilters({ ...filters, niveauEtude: e.target.value }); setCurrentPage(1); }} className={selectClass} aria-label="Filtrer par niveau d'étude">
                  <option value="">Tous les niveaux</option>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-8">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : offres.length === 0 ? (
          <div className="text-center py-24">
            <div className="size-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="size-10 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">Aucune offre trouvée</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6 font-medium">Essayez de modifier vos critères de recherche ou explorez toutes les offres.</p>
            <Button onClick={handleResetSearch} className="font-semibold">
              <Search className="size-4 mr-2" aria-hidden="true" />
              Voir toutes les offres
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {offresPaginees.map((offre) => (
                <Link key={offre.id} to={`/offres/${offre.id}`}>
                  <Card className="group relative p-6 hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-1 cursor-pointer h-full overflow-hidden transition-all duration-300 flex flex-col border border-border/40">
                    {/* Accent bar on hover */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-primary-dark rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Header with badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base font-bold group-hover:text-primary transition-colors leading-snug line-clamp-2 text-foreground">
                          {offre.titre}
                        </h3>
                        <p className="text-sm text-muted-foreground font-semibold mt-2 line-clamp-1">
                          {offre.nomEntreprise || "Entreprise non spécifiée"}
                        </p>
                      </div>
                      {offre.typeContrat && (
                        <Badge variant={contratVariant[offre.typeContrat] || "secondary"} className="shrink-0 whitespace-nowrap font-bold">
                          {offre.typeContrat}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed flex-grow">
                      {offre.description || "Pas de description disponible"}
                    </p>

                    {/* Location and Salary */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-border/40">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="size-4 text-primary/70 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-foreground">{offre.ville || "Localisation non spécifiée"}</span>
                      </div>
                      
                      {offre.salaire && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="size-4 text-emerald-500/70 shrink-0" aria-hidden="true" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{offre.salaire}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {offre.categorieName && (
                        <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold rounded-full px-3 py-1">
                          <Tag className="size-3 mr-1.5" aria-hidden="true" />
                          {offre.categorieName}
                        </Badge>
                      )}
                      {offre.niveauEtude && (
                        <Badge variant="secondary" className="text-xs font-semibold">
                          <GraduationCap className="size-3 mr-1" aria-hidden="true" />
                          {offre.niveauEtude}
                        </Badge>
                      )}
                      {offre.experienceRequise && (
                        <Badge variant="secondary" className="text-xs font-semibold">
                          <Clock className="size-3 mr-1" aria-hidden="true" />
                          {offre.experienceRequise}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                      <p className="text-xs text-muted-foreground/70 font-medium">
                        {formatDate(offre.dateCreation)}
                      </p>
                      <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" aria-hidden="true" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center gap-6 py-8">
                <div className="text-sm text-muted-foreground font-semibold">
                  Page <span className="font-bold text-foreground">{currentPage}</span> sur <span className="font-bold text-foreground">{totalPages}</span> • {offres.length} offres
                </div>
                
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="font-semibold"
                  >
                    <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
                    Précédent
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                      page === "..." ? (
                        <span key={`dots-${idx}`} className="px-2 text-muted-foreground font-bold">…</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className={`w-10 h-10 font-bold ${currentPage === page ? "bg-primary hover:bg-primary/90" : ""}`}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>

                  {/* Next button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="font-semibold"
                  >
                    Suivant
                    <ChevronRight className="size-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

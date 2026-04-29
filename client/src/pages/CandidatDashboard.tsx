import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useCandidatProfileModal } from "@/context/CandidatProfileModalContext";
import { api } from "@/services/api";
import type { Candidat, Candidature } from "@/types";
import { FileText, Clock, CheckCircle, XCircle, Inbox, TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const CANDIDATURES_PAR_PAGE = 6;

export default function CandidatDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { openProfile } = useCandidatProfileModal();
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const calculateProfileCompletion = (p: Candidat | null) => {
    if (!p) return 0;
    const fields = [
      p.nom,
      p.prenom,
      p.email,
      p.telephone,
      p.diplome,
      p.niveauEtude,
      p.experience,
      p.cv,
      p.lettreMotivation,
    ];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(profil);
  const isProfileComplete = profileCompletion === 100;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get<Candidat>(`/candidats/${user.id}`),
      api.get<Candidature[]>(`/candidatures/candidat/${user.id}`),
    ])
      .then(([p, c]) => {
        setProfil(p);
        setCandidatures(c);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const statusConfig: Record<string, { icon: typeof Clock; variant: "warning" | "success" | "destructive"; label: string }> = {
    en_attente: { icon: Clock, variant: "warning", label: t("candidatureEnAttente") },
    acceptee: { icon: CheckCircle, variant: "success", label: t("candidatureAcceptee") },
    refusee: { icon: XCircle, variant: "destructive", label: t("candidatureRefusee") },
  };

  const statCards = [
    { label: t("total"), value: candidatures.length, gradient: "from-primary to-primary-light", icon: FileText },
    { label: t("candidatureEnAttente"), value: candidatures.filter((c) => c.statut === "en_attente").length, gradient: "from-amber-500 to-orange-400", icon: Clock },
    { label: t("acceptees"), value: candidatures.filter((c) => c.statut === "acceptee").length, gradient: "from-emerald-500 to-teal-400", icon: TrendingUp },
  ];

  // Pagination
  const totalPages = Math.ceil(candidatures.length / CANDIDATURES_PAR_PAGE);
  const startIndex = (currentPage - 1) * CANDIDATURES_PAR_PAGE;
  const endIndex = startIndex + CANDIDATURES_PAR_PAGE;
  const candidaturesPaginees = candidatures.slice(startIndex, endIndex);

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
    <div className="pb-16 min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Profil incomplet</AlertTitle>
            <AlertDescription className="text-amber-800 mt-2">
              <p className="mb-3">Complétez votre profil pour augmenter vos chances d'être contacté par les recruteurs.</p>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{profileCompletion}% complété</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              <Button size="sm" onClick={openProfile} variant="outline" className="border-amber-600 text-amber-900 hover:bg-amber-100">
                Compléter mon profil
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold">
            {t("bonjour")}{profil ? `, ${profil.prenom}` : ""} !
          </h1>
          <p className="text-muted-foreground mt-2">{t("gererCandidatures")}</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="relative overflow-hidden p-6">
                <Skeleton className="h-1 absolute top-0 inset-x-0" />
                <Skeleton className="size-10 rounded-2xl mb-3" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20 mt-1" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statCards.map((s) => (
              <Card key={s.label} className="relative overflow-hidden p-6">
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${s.gradient}`} />
                <div className={`size-10 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="size-5 text-white" aria-hidden="true" />
                </div>
                <p className="text-3xl font-extrabold font-heading">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Candidatures Tab */}
        <Tabs defaultValue="candidatures">
          <TabsList>
            <TabsTrigger value="candidatures">
              <FileText className="size-4" aria-hidden="true" />
              {t("mesCandidatures")}
              <Badge variant="secondary" className="ml-1">{candidatures.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidatures">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Skeleton className="size-12 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {candidatures.length === 0 ? (
                  <Card className="p-20 text-center">
                    <div className="size-20 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Inbox className="size-9 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                    <h2 className="font-heading text-lg font-bold mb-2">{t("aucuneCandidature")}</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">{t("parcourezOffres")}</p>
                    <Button asChild>
                      <Link to="/offres">{t("voirOffres")}</Link>
                    </Button>
                  </Card>
                ) : (
                  candidaturesPaginees.map((c) => {
                    const status = statusConfig[c.statut] || statusConfig.en_attente;
                    const StatusIcon = status.icon;
                    return (
                      <Card key={c.id} className="p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="size-5 text-primary" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {c.offreTitre || `Candidature #${c.id}`}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {c.nomEntreprise && (
                                  <span className="font-medium text-foreground">{c.nomEntreprise}</span>
                                )}
                                {c.nomEntreprise && c.ville && <span className="mx-1.5">•</span>}
                                {c.ville && <span>{c.ville}</span>}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3.5" />
                                  {new Date(c.datePostulation).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                {c.typeContrat && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
                                    {c.typeContrat}
                                  </Badge>
                                )}
                                {c.salaire && (
                                  <span className="font-medium text-foreground">
                                    {c.salaire}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge variant={status.variant} className="gap-1.5 whitespace-nowrap">
                              <StatusIcon className="size-3.5" aria-hidden="true" />
                              {status.label}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Link to={`/offres/${c.offreEmploiId}`}>
                                Voir l'offre
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

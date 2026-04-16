import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Briefcase,
  MessageSquareQuote,
  BadgeCheck,
  Clock3,
  SlidersHorizontal,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import ScrollProgress from "@/components/ScrollProgress";
import {
  getHeroContent,
  getCandidateFeatureCards,
  getRecruiterFeatureCards,
  getSteps,
  getLandingFaqItems,
  getTestimonials,
  getQuickFilters,
} from "@/lib/translations";
import type { OffreEmploi } from "@/types";

type Audience = "candidate" | "recruiter";
type HeroVariant = "benefit" | "action";
type MarqueeOffer = {
  id: number;
  title: string;
  company: string;
  location: string;
  contract: string;
  time: string;
  signal: string;
};

const featureIcons = [Search, ShieldCheck, FileCheck, TrendingUp, BadgeCheck];
const recruiterFeatureIcons = [BadgeCheck, ShieldCheck, TrendingUp, FileCheck, Users];

const heroStats = [
  {
    target: 50000,
    labelKey: "landing.statProfiles",
    icon: Users,
    format: (value: number) => `${Math.round(value / 1000)}K+`,
  },
  {
    target: 1200,
    labelKey: "landing.statCompanies",
    icon: Building2,
    format: (value: number) => `${(value / 1000).toFixed(1)}K+`,
  },
  {
    target: 4.8,
    labelKey: "landing.statRating",
    icon: Star,
    format: (value: number) => `${value.toFixed(1)}/5`,
  },
];

const partnerLogos = ["Attijari", "Biat", "Telnet", "Deloitte", "Ooredoo", "OneTech", "Poulina", "Vermeg"];

const fallbackLiveOffers: MarqueeOffer[] = [
  { id: 0, title: "Developpeur Full-Stack React/Node", company: "DigitalWave", location: "Tunis", contract: "CDI", time: "2h", signal: "Nouveau" },
  { id: 0, title: "Charge(e) de recrutement digital", company: "GrowthLab", location: "Sousse", contract: "Stage", time: "1j", signal: "En hausse" },
  { id: 0, title: "Product Designer UI/UX", company: "PixelNorth", location: "Sfax", contract: "CDD", time: "12 min", signal: "Chaude" },
  { id: 0, title: "Responsable RH / Talent Acquisition", company: "Atlas People", location: "Tunis", contract: "CDI", time: "3h", signal: "Tres vue" },
];

function SearchChip({ label, value, onClick }: { label: string; value: string; onClick: (value: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className="landing-filter-chip inline-flex items-center justify-center rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      aria-label={`Filtre rapide ${label}`}
    >
      {label}
    </button>
  );
}

function detectAudience(searchParams: URLSearchParams, referrer: string): Audience {
  const queryValue = [
    searchParams.get("audience"),
    searchParams.get("role"),
    searchParams.get("utm_source"),
    searchParams.get("utm_campaign"),
    searchParams.get("utm_content"),
    searchParams.get("utm_term"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const referrerValue = referrer.toLowerCase();
  const recruiterSignals = ["recruteur", "recruiter", "employeur", "talent acquisition", "hiring"];
  const candidateSignals = ["candidat", "candidate", "jobseeker"];

  if (recruiterSignals.some((signal) => queryValue.includes(signal)) || referrerValue.includes("/recruteur")) {
    return "recruiter";
  }

  if (candidateSignals.some((signal) => queryValue.includes(signal)) || referrerValue.includes("/candidat")) {
    return "candidate";
  }

  return "candidate";
}

function useHeroVariant(search: string): HeroVariant {
  const [variant, setVariant] = useState<HeroVariant>("benefit");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(search);
    const forcedVariant = searchParams.get("heroVariant") || searchParams.get("ab");
    const storageKey = "joblinker-hero-variant";

    if (forcedVariant === "benefit" || forcedVariant === "action") {
      setVariant(forcedVariant);
      window.localStorage.setItem(storageKey, forcedVariant);
      return;
    }

    const storedVariant = window.localStorage.getItem(storageKey);
    if (storedVariant === "benefit" || storedVariant === "action") {
      setVariant(storedVariant);
      return;
    }

    const nextVariant: HeroVariant = Math.random() < 0.5 ? "benefit" : "action";
    window.localStorage.setItem(storageKey, nextVariant);
    setVariant(nextVariant);
  }, [search]);

  return variant;
}

function AnimatedStatCard({
  target,
  label,
  icon: Icon,
  format,
}: {
  target: number;
  label: string;
  icon: import("react").ComponentType<{ className?: string }>;
  format: (value: number) => string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;

    let frameId = 0;
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);
      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [hasAnimated, target]);

  return (
    <div ref={cardRef} className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div>
          <div className="font-heading text-2xl font-extrabold leading-none text-foreground">{format(displayValue)}</div>
          <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FAQAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background shadow-sm overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="font-semibold text-foreground text-base sm:text-[1.02rem]">{question}</span>
        <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden px-5 pb-5 text-sm sm:text-base text-foreground/75 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const heroRef = useRef<HTMLElement | null>(null);
  const searchPreviewRef = useRef<HTMLDivElement | null>(null);
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [recommendedOffers, setRecommendedOffers] = useState<OffreEmploi[]>([]);
  const [audience, setAudience] = useState<Audience>("candidate");
  const [audienceSelected, setAudienceSelected] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const heroVariant = useHeroVariant(location.search);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const queryAudience = searchParams.get("audience") || searchParams.get("role");
    const storedAudience = window.localStorage.getItem("joblinker-audience");

    if (queryAudience === "candidate" || queryAudience === "candidat") {
      setAudience("candidate");
      setAudienceSelected(true);
    } else if (queryAudience === "recruiter" || queryAudience === "recruteur") {
      setAudience("recruiter");
      setAudienceSelected(true);
    } else if (storedAudience === "candidate" || storedAudience === "recruiter") {
      setAudience(storedAudience);
      setAudienceSelected(true);
    } else {
      setAudience(detectAudience(searchParams, document.referrer || ""));
      setAudienceSelected(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (audienceSelected) {
      window.localStorage.setItem("joblinker-audience", audience);
    }
  }, [audience, audienceSelected]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const fold = hero.offsetTop + hero.offsetHeight - 80;
      setShowStickyCta(window.scrollY > fold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .get<OffreEmploi[]>("/offres")
      .then((offres) => { if (mounted) setRecommendedOffers(offres.slice(0, 8)); })
      .catch(() => { if (mounted) setRecommendedOffers([]); });
    return () => { mounted = false; };
  }, []);

  const liveOffers = useMemo<MarqueeOffer[]>(() => {
    if (recommendedOffers.length === 0) return fallbackLiveOffers;

    const freshness = ["5 min", "20 min", "1h", "3h"];
    const momentum = ["Recommandee", "Tendance", "Tres consultee", "Nouveau"];

    return recommendedOffers.map((offer, index) => ({
      id: offer.id,
      title: offer.titre,
      company: `Entreprise #${offer.recruteurId}`,
      location: offer.ville || "Tunisie",
      contract: offer.typeContrat || "Contrat non precise",
      time: freshness[index % freshness.length],
      signal: momentum[index % momentum.length],
    }));
  }, [recommendedOffers]);

  const heroContent = useMemo(() => {
    return getHeroContent(language)(audience, heroVariant);
  }, [audience, heroVariant, language]);

  const selectedFeatureCards = useMemo(() => {
    const icons = audience === "recruiter" ? recruiterFeatureIcons : featureIcons;
    const cards = audience === "recruiter"
      ? getRecruiterFeatureCards(language)
      : getCandidateFeatureCards(language);
    return cards.map((card, i) => ({ ...card, icon: icons[i] }));
  }, [audience, language]);

  const steps = useMemo(() => getSteps(language), [language]);
  const faqItems = useMemo(() => getLandingFaqItems(language), [language]);
  const testimonials = useMemo(() => getTestimonials(language), [language]);
  const quickFilters = useMemo(() => getQuickFilters(language), [language]);

  const searchPreviewOffer = useMemo(() => recommendedOffers[0] ?? null, [recommendedOffers]);

  const goToOffers = (query?: string) => {
    if (audience === "recruiter") {
      navigate("/register?role=recruteur");
      return;
    }
    const params = new URLSearchParams();
    const trimmedQuery = query?.trim() || searchQuery.trim();
    if (trimmedQuery) params.set("search", trimmedQuery);
    if (activeFilter) {
      if (["CDI", "CDD", "Stage", "Freelance"].includes(activeFilter)) {
        params.set("typeContrat", activeFilter);
      } else if (activeFilter === "Télétravail") {
        params.set("ville", "Télétravail");
      } else {
        params.set("search", activeFilter);
      }
    }
    navigate(`/offres${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onQuickFilter = (value: string) => {
    setActiveFilter(value);
    if (["CDI", "CDD", "Stage", "Freelance"].includes(value)) {
      navigate(`/offres?typeContrat=${encodeURIComponent(value)}`);
      return;
    }
    if (["Tunis", "Télétravail"].includes(value)) {
      navigate(`/offres?ville=${encodeURIComponent(value)}`);
      return;
    }
    navigate(`/offres?search=${encodeURIComponent(value)}`);
  };

  const chooseAudience = (nextAudience: Audience) => {
    setAudience(nextAudience);
    setAudienceSelected(true);
  };

  const discoverText = audience === "recruiter" ? t("landing.discoverRecruiter") : t("landing.discoverCandidate");
  const browseText = audience === "recruiter" ? t("landing.browseRecruiter") : t("landing.browseCandidate");

  return (
    <div className="overflow-hidden">
      <ScrollProgress />

      {/* ─── HERO ─── */}
      <section ref={heroRef} aria-labelledby="hero-heading" className="relative min-h-[calc(100svh-var(--navbar-height))] flex items-center bg-background">
        <div className="absolute bottom-10 left-[4%] w-[240px] h-[240px] bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 items-center">
            <div className="relative z-20">
              {!audienceSelected && (
                <div className="mb-5 rounded-2xl border border-border/70 bg-background/90 p-3 sm:p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-foreground">{t("landing.audienceQuestion")}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button type="button" variant="outline" className="h-11 justify-start" onClick={() => chooseAudience("candidate")}>
                      {t("landing.audienceCandidate")}
                    </Button>
                    <Button type="button" variant="outline" className="h-11 justify-start" onClick={() => chooseAudience("recruiter")}>
                      {t("landing.audienceRecruiter")}
                    </Button>
                  </div>
                </div>
              )}

              <h1 id="hero-heading" className="font-heading text-[2.7rem] sm:text-5xl lg:text-[4.6rem] font-extrabold tracking-tight mb-5 leading-[1.04] max-w-3xl text-balance">
                {heroContent.headline}
              </h1>

              <p className="text-lg sm:text-xl text-foreground/78 max-w-2xl leading-relaxed mb-6">
                {heroContent.description}
              </p>

              <form
                className="relative z-20 space-y-4 max-w-2xl"
                onSubmit={(e) => { e.preventDefault(); goToOffers(); }}
                role="search"
                aria-label={t("landing.searchLabel")}
              >
                <div className="flex flex-col md:flex-row gap-3 rounded-3xl border border-border/70 bg-background/85 p-3 shadow-md shadow-black/[0.02] backdrop-blur">
                  <div
                    ref={searchPreviewRef}
                    className="relative flex-1"
                    onMouseEnter={() => setShowSearchPreview(true)}
                    onMouseLeave={() => setShowSearchPreview(false)}
                    onTouchStart={() => setShowSearchPreview(true)}
                    onFocusCapture={() => setShowSearchPreview(true)}
                    onBlurCapture={(e) => {
                      if (!searchPreviewRef.current?.contains(e.relatedTarget as Node)) setShowSearchPreview(false);
                    }}
                  >
                    <label htmlFor="landing-search" className="mb-1.5 block px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t("landing.searchLabel")}
                    </label>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                    <Input
                      id="landing-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("landing.searchPlaceholder")}
                      className="h-14 rounded-2xl border-0 bg-muted/35 pl-12 text-base focus-visible:bg-background"
                      aria-label={t("landing.searchLabel")}
                    />

                    {showSearchPreview && searchPreviewOffer && (
                      <Card className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 border-border/70 bg-background p-4 shadow-xl">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("landing.openOffer")}</p>
                          {searchPreviewOffer.typeContrat && <Badge variant="secondary">{searchPreviewOffer.typeContrat}</Badge>}
                        </div>
                        <h3 className="text-sm font-bold text-foreground leading-snug mb-1">{searchPreviewOffer.titre}</h3>
                        <p className="line-clamp-2 text-xs text-muted-foreground mb-3">{searchPreviewOffer.description || ""}</p>
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          {searchPreviewOffer.ville && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                              <MapPin className="size-3" aria-hidden="true" />
                              {searchPreviewOffer.ville}
                            </span>
                          )}
                          {searchPreviewOffer.experienceRequise && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                              <Briefcase className="size-3" aria-hidden="true" />
                              {searchPreviewOffer.experienceRequise}
                            </span>
                          )}
                        </div>
                        <Button size="sm" variant="secondary" className="w-full" asChild>
                          <Link to={`/offres/${searchPreviewOffer.id}`}>{t("landing.viewThisOffer")}</Link>
                        </Button>
                      </Card>
                    )}
                  </div>
                  <Button size="lg" className="h-14 rounded-2xl px-6" type="submit" aria-label={discoverText}>
                    {discoverText}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {quickFilters.map((filter) => (
                    <SearchChip key={filter.label} label={filter.label} value={filter.value} onClick={onQuickFilter} />
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <Button variant="ghost" asChild className="h-12 rounded-2xl border border-border/70 px-5 text-sm font-semibold text-foreground hover:bg-muted/60">
                      <Link to={audience === "recruiter" ? "/login" : "/offres"}>{browseText}</Link>
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <AnimatedStatCard key={stat.labelKey} target={stat.target} label={t(stat.labelKey)} icon={stat.icon} format={stat.format} />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">{t("landing.partners")}</span>
                {partnerLogos.map((logo) => (
                  <span key={logo} className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground/60">
                    {logo}
                  </span>
                ))}
              </div>
            </div>

            {/* Right column - Live offers card */}
            <div className="relative">
              <Card className="relative overflow-hidden rounded-[2rem] border-border/60 bg-background/92 shadow-lg shadow-black/[0.05] p-5 sm:p-6 backdrop-blur max-w-[540px] ml-auto">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{t("landing.previewHint")}</p>
                    <h2 className="font-heading text-2xl font-bold text-foreground">{t("landing.previewTitle")}</h2>
                  </div>
                  <Badge variant="info">{t("landing.liveBadge")}</Badge>
                </div>

                <button
                  type="button"
                  className="mb-4 w-full rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-primary/5"
                  onClick={() => navigate("/offres")}
                >
                  <Search className="size-4 text-primary" aria-hidden="true" />
                  <span className="text-sm text-foreground/75">{t("landing.activityLabel")}</span>
                </button>

                <div className="relative h-[360px] overflow-hidden rounded-[1.5rem] border border-border/50 bg-background/60">
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background to-transparent" />
                  <div className="offer-marquee-track space-y-4 p-4">
                    {[...liveOffers, ...liveOffers].map((offer, index) => (
                      <div key={`${offer.title}-${offer.id}-${index}`} className="rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors duration-200 hover:bg-primary/5">
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground leading-snug">{offer.title}</h3>
                            <p className="text-sm text-muted-foreground">{offer.company}</p>
                          </div>
                          <Badge variant={offer.contract === "CDI" ? "success" : "warning"}>{offer.contract}</Badge>
                        </div>
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
                            <MapPin className="size-3" aria-hidden="true" />
                            {offer.location}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
                            <Clock3 className="size-3" aria-hidden="true" />
                            {offer.time}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                            {offer.signal}
                          </span>
                        </div>
                        <Button size="sm" variant="secondary" className="w-full rounded-xl" asChild>
                          <Link to={offer.id > 0 ? `/offres/${offer.id}` : "/offres"}>{t("landing.viewOffer")}</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
                  {t("landing.autoRefresh")}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className={`fixed left-1/2 top-[calc(var(--navbar-height)+10px)] z-[70] -translate-x-1/2 transition-all duration-300 ${showStickyCta ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}>
        <Button size="lg" className="h-12 rounded-full px-6 shadow-lg shadow-black/15" asChild>
          <Link to="/register?role=candidat">{t("landing.startFree")}</Link>
        </Button>
      </div>

      {/* ─── FEATURES ─── */}
      <section aria-labelledby="features-heading" className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">{t("landing.featuresWhy")}</Badge>
            <h2 id="features-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-foreground/75 text-lg">
              {t("landing.featuresDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedFeatureCards.map((feature) => (
              <Card key={feature.title} className="group relative p-7 sm:p-8 hover:shadow-xl hover:shadow-primary/[0.05] hover:-translate-y-1 cursor-default overflow-hidden border-border/70 bg-gradient-to-br from-primary/8 to-primary/3">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" aria-hidden="true" />
                <div className="size-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-background/80 text-primary" aria-hidden="true">
                  <feature.icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-[1.1rem] sm:text-xl font-extrabold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-base leading-relaxed text-foreground/75">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USER FLOW ─── */}
      <section aria-labelledby="flow-heading" className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          <div>
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">{t("landing.flowBadge")}</Badge>
            <h2 id="flow-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              {t("landing.flowTitle")}
            </h2>
            <p className="text-foreground/75 text-lg leading-relaxed mb-6">
              {t("landing.flowDesc")}
            </p>

            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.step} className="rounded-2xl border border-border/70 bg-background p-5 flex gap-4">
                  <div className="size-12 rounded-2xl bg-primary text-primary-foreground font-heading font-bold grid place-items-center shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-base sm:text-[1.05rem]">{step.title}</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <Search className="size-5 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">{t("landing.flowCard1Title")}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{t("landing.flowCard1Desc")}</p>
            </Card>
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <SlidersHorizontal className="size-5 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">{t("landing.flowCard2Title")}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{t("landing.flowCard2Desc")}</p>
            </Card>
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <Briefcase className="size-5 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">{t("landing.flowCard3Title")}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{t("landing.flowCard3Desc")}</p>
            </Card>
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <Users className="size-5 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">{t("landing.flowCard4Title")}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{t("landing.flowCard4Desc")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CONFIDENTIALITY ─── */}
      <section aria-labelledby="confidentiality-heading" className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="rounded-3xl border-border/70 bg-background p-6 sm:p-7 shadow-sm">
            <h2 id="confidentiality-heading" className="mb-3 font-heading text-xl sm:text-2xl font-extrabold text-foreground">
              {t("landing.confidentialityQ")}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/80">{t("landing.confidentialityA")}</p>
          </Card>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section aria-labelledby="social-proof-heading" className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">{t("landing.credibility")}</Badge>
            <h2 id="social-proof-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              {t("landing.socialProofTitle")}
            </h2>
            <p className="text-foreground/75 text-lg">
              {t("landing.socialProofDesc")}
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 mb-5">
            <Card className="p-7 rounded-[2rem] border-border/70 bg-background shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2" aria-hidden="true">
                  {["AB", "MK", "SR"].map((name, index) => (
                    <div key={name} className={`size-10 rounded-full border-2 border-background grid place-items-center text-[10px] font-bold text-white ${index === 0 ? "bg-primary" : index === 1 ? "bg-primary-light" : "bg-primary-dark"}`}>
                      {name}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t("landing.socialProofRating")}</div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t("landing.socialProofUsers") }} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-primary/8 p-4">
                  <div className="font-heading text-xl font-extrabold">+50K</div>
                  <div className="text-[11px] text-muted-foreground">{t("landing.socialProofStat1")}</div>
                </div>
                <div className="rounded-2xl bg-primary/8 p-4">
                  <div className="font-heading text-xl font-extrabold">4.8/5</div>
                  <div className="text-[11px] text-muted-foreground">{t("landing.socialProofStat2")}</div>
                </div>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-5">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="p-8 rounded-[2rem] border-border/70 bg-background shadow-sm">
                  <MessageSquareQuote className="size-6 text-primary mb-4" aria-hidden="true" />
                  <div className="flex items-center gap-1 text-amber-500 mb-4" aria-label={`${testimonial.rating} stars`}>
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed mb-6 text-foreground/80">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-primary text-white grid place-items-center font-bold" aria-hidden="true">{testimonial.name.split(" ")[0][0]}{testimonial.name.split(" ")[1][0]}</div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section aria-labelledby="faq-heading" className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">{t("landing.faqBadge")}</Badge>
            <h2 id="faq-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              {t("landing.faqTitle")}
            </h2>
            <p className="text-foreground/75 text-lg">
              {t("landing.faqDesc")}
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQAccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={faqOpenIndex === index}
                onToggle={() => setFaqOpenIndex((current) => (current === index ? -1 : index))}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section aria-labelledby="final-cta-heading" className="py-12 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden border border-border/60">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground" />
            <div className="absolute inset-0 dot-pattern opacity-10" aria-hidden="true" />

            <div className="relative z-10 p-10 sm:p-12 md:p-14 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 mb-6">
                <Clock3 className="size-4" aria-hidden="true" />
                {t("landing.ctaTimeline")}
              </div>
              <h2 id="final-cta-heading" className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white mb-5 leading-tight">
                {t("landing.ctaTitle")}
              </h2>
              <p className="text-white/60 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
                {t("landing.ctaDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" className="bg-white text-slate-900 hover:bg-white/95 shadow-xl shadow-black/25" asChild>
                  <Link to="/register?role=candidat">
                    <Users className="size-4" aria-hidden="true" />
                    {t("landing.ctaButton")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/10 hover:text-white bg-transparent" asChild>
                  <Link to="/offres">
                    <Search className="size-4" aria-hidden="true" />
                    {t("landing.ctaExplore")}
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-white/45">
                {t("landing.ctaFootnote")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

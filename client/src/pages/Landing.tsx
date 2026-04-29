import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search, FileCheck, ShieldCheck, TrendingUp, Users, MapPin, BadgeCheck,
  Clock3, Briefcase, Monitor, Megaphone, Calculator, HeartPulse,
  ShoppingBag, Paintbrush, Wrench, GraduationCap, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";
import ScrollProgress from "@/components/ScrollProgress";
import {
  getHeroContent, getCandidateFeatureCards, getRecruiterFeatureCards, getQuickFilters,
} from "@/lib/translations";
import heroImage from "@/assets/hero.jpg";
import type { OffreEmploi, Categorie } from "@/types";

type Audience = "candidate" | "recruiter";
type HeroVariant = "benefit" | "action";

const featureColors = [
  { bg: "from-blue-50 to-blue-50/50", iconBg: "bg-blue-100", iconText: "text-blue-600", bar: "from-blue-500 to-blue-400" },
  { bg: "from-emerald-50 to-emerald-50/50", iconBg: "bg-emerald-100", iconText: "text-emerald-600", bar: "from-emerald-500 to-emerald-400" },
  { bg: "from-amber-50 to-amber-50/50", iconBg: "bg-amber-100", iconText: "text-amber-600", bar: "from-amber-500 to-amber-400" },
  { bg: "from-violet-50 to-violet-50/50", iconBg: "bg-violet-100", iconText: "text-violet-600", bar: "from-violet-500 to-violet-400" },
];
const featureIcons = [Search, ShieldCheck, FileCheck, TrendingUp];
const recruiterFeatureIcons = [BadgeCheck, ShieldCheck, TrendingUp, FileCheck];

const categoryMeta: Record<string, { icon: React.ComponentType<{ className?: string }>; img: string }> = {
  tech: { icon: Monitor, img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=75" },
  info: { icon: Monitor, img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=75" },
  dev: { icon: Monitor, img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=75" },
  market: { icon: Megaphone, img: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=75" },
  comm: { icon: Megaphone, img: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=75" },
  financ: { icon: Calculator, img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=75" },
  compta: { icon: Calculator, img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=75" },
  ressource: { icon: Users, img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=75" },
  rh: { icon: Users, img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=75" },
  sant: { icon: HeartPulse, img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=75" },
  medic: { icon: HeartPulse, img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=75" },
  commer: { icon: ShoppingBag, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=75" },
  vent: { icon: ShoppingBag, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=75" },
  design: { icon: Paintbrush, img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=75" },
  creat: { icon: Paintbrush, img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=75" },
  ingeni: { icon: Wrench, img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=75" },
  indust: { icon: Wrench, img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=75" },
  educ: { icon: GraduationCap, img: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&q=75" },
  forma: { icon: GraduationCap, img: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&q=75" },
};
const defaultMeta = { icon: Briefcase, img: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&q=75" };
function getCategoryMeta(name: string) {
  const lower = name.toLowerCase();
  for (const [key, meta] of Object.entries(categoryMeta)) { if (lower.includes(key)) return meta; }
  return defaultMeta;
}

function detectAudience(sp: URLSearchParams, ref: string): Audience {
  const qv = [sp.get("audience"), sp.get("role")].filter(Boolean).join(" ").toLowerCase();
  if (["recruteur", "recruiter", "hiring"].some((s) => qv.includes(s)) || ref.includes("/recruteur")) return "recruiter";
  return "candidate";
}

function useHeroVariant(search: string): HeroVariant {
  const [v, setV] = useState<HeroVariant>("benefit");
  useEffect(() => {
    const sp = new URLSearchParams(search);
    const f = sp.get("heroVariant") || sp.get("ab");
    const k = "joblinker-hero-variant";
    if (f === "benefit" || f === "action") { setV(f); localStorage.setItem(k, f); return; }
    const s = localStorage.getItem(k);
    if (s === "benefit" || s === "action") { setV(s); return; }
    const n: HeroVariant = Math.random() < 0.5 ? "benefit" : "action";
    localStorage.setItem(k, n); setV(n);
  }, [search]);
  return v;
}

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchPreviewRef = useRef<HTMLDivElement>(null);
  const locationPreviewRef = useRef<HTMLDivElement>(null);
  const { language, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [offers, setOffers] = useState<OffreEmploi[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [audience, setAudience] = useState<Audience>("candidate");
  const [audienceSelected, setAudienceSelected] = useState(false);
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const [showLocationPreview, setShowLocationPreview] = useState(false);
  const heroVariant = useHeroVariant(location.search);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qa = sp.get("audience") || sp.get("role");
    const sa = localStorage.getItem("joblinker-audience");
    if (qa === "candidate" || qa === "candidat") { setAudience("candidate"); setAudienceSelected(true); }
    else if (qa === "recruiter" || qa === "recruteur") { setAudience("recruiter"); setAudienceSelected(true); }
    else if (sa === "candidate" || sa === "recruiter") { setAudience(sa); setAudienceSelected(true); }
    else { setAudience(detectAudience(sp, document.referrer || "")); }
  }, [location.search]);

  useEffect(() => { if (audienceSelected) localStorage.setItem("joblinker-audience", audience); }, [audience, audienceSelected]);

  useEffect(() => {
    let m = true;
    Promise.all([api.get<OffreEmploi[]>("/offres"), api.get<Categorie[]>("/categories")])
      .then(([o, c]) => { if (m) { setOffers(o); setCategories(c); } }).catch(() => {});
    return () => { m = false; };
  }, []);

  const categoriesWithCounts = useMemo(() =>
    categories.map((c) => ({ ...c, count: offers.filter((o) => o.categorieId === c.id).length, ...getCategoryMeta(c.nom) })).filter((c) => c.count > 0),
    [categories, offers]);
  const liveOffers = useMemo(() => offers.slice(0, 10).map((o) => ({ id: o.id, title: o.titre, location: o.ville || "Tunisie", contract: o.typeContrat || "CDI" })), [offers]);

  const heroContent = useMemo(() => getHeroContent(language)(audience, heroVariant), [audience, heroVariant, language]);
  const selectedFeatureCards = useMemo(() => {
    const icons = audience === "recruiter" ? recruiterFeatureIcons : featureIcons;
    return (audience === "recruiter" ? getRecruiterFeatureCards(language) : getCandidateFeatureCards(language)).slice(0, 4).map((c, i) => ({ ...c, icon: icons[i], color: featureColors[i] }));
  }, [audience, language]);
  const quickFilters = useMemo(() => getQuickFilters(language), [language]);
  const searchPreviewOffer = useMemo(() => offers[0] ?? null, [offers]);
  const uniqueLocations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of offers) {
      const v = o.ville?.trim();
      if (!v) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [offers]);
  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return uniqueLocations.slice(0, 8);
    return uniqueLocations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8);
  }, [uniqueLocations, locationQuery]);

  const goToOffers = () => {
    if (audience === "recruiter") { navigate("/register?role=recruteur"); return; }
    const p = new URLSearchParams();
    if (searchQuery.trim()) p.set("search", searchQuery.trim());
    if (locationQuery.trim()) p.set("ville", locationQuery.trim());
    navigate(`/offres${p.toString() ? `?${p}` : ""}`);
  };

  const onQuickFilter = (value: string) => {
    if (["CDI", "CDD", "Stage", "Freelance"].includes(value)) navigate(`/offres?typeContrat=${encodeURIComponent(value)}`);
    else if (["Tunis", "Télétravail"].includes(value)) navigate(`/offres?ville=${encodeURIComponent(value)}`);
    else navigate(`/offres?search=${encodeURIComponent(value)}`);
  };

  const discoverText = audience === "recruiter" ? t("landing.discoverRecruiter") : t("landing.discoverCandidate");

  return (
    <div>
      <ScrollProgress />

      {/* ═══ HERO ═══ */}
      <section className="relative h-[calc(100svh-var(--navbar-height))] bg-background overflow-hidden">
        {/* Background image — right side, blended into background */}
        <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block">
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        {/* Content — centered vertically */}
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {!audienceSelected && (
            <div className="inline-flex items-center gap-1 mb-5 rounded-full border border-border/70 bg-muted/40 p-1 self-start">
              <button type="button" onClick={() => { setAudience("candidate"); setAudienceSelected(true); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${audience === "candidate" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t("landing.audienceCandidate")}
              </button>
              <button type="button" onClick={() => { setAudience("recruiter"); setAudienceSelected(true); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${audience === "recruiter" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t("landing.audienceRecruiter")}
              </button>
            </div>
          )}

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] mb-4 max-w-xl">
            {heroContent.headlineBefore}
            <span className="text-primary">{heroContent.headlineAccent}</span>
            {heroContent.headlineAfter}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
            {heroContent.description}
          </p>

          {/* Search bar — wider, centered feel */}
          <form className="relative z-20 mb-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); goToOffers(); }} role="search" aria-label={t("landing.searchLabel")}>
            <div className="flex flex-col sm:flex-row items-stretch rounded-2xl border border-border bg-background/95 backdrop-blur p-2 shadow-lg shadow-black/[0.05]">
              <div ref={searchPreviewRef} className="relative flex-1"
                onFocusCapture={() => setShowSearchPreview(true)}
                onBlurCapture={(e) => { if (!searchPreviewRef.current?.contains(e.relatedTarget as Node)) setShowSearchPreview(false); }}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                <Input id="landing-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("landing.searchPlaceholder")} className="h-11 rounded-xl sm:rounded-r-none border-0 bg-transparent pl-11 text-sm focus-visible:ring-0" />
                {showSearchPreview && searchPreviewOffer && (
                  <Card className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 border-border bg-background p-3 shadow-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t("landing.openOffer")}</p>
                    <h3 className="text-sm font-bold text-foreground leading-snug mb-2">{searchPreviewOffer.titre}</h3>
                    <Button size="sm" variant="secondary" className="w-full" asChild>
                      <Link to={`/offres/${searchPreviewOffer.id}`}>{t("landing.viewThisOffer")}</Link>
                    </Button>
                  </Card>
                )}
              </div>
              <div className="hidden sm:block w-px bg-border my-2.5 shrink-0" />
              <div className="sm:hidden h-px bg-border mx-3 shrink-0" />
              <div ref={locationPreviewRef} className="relative flex-1 sm:max-w-[35%]"
                onFocusCapture={() => setShowLocationPreview(true)}
                onBlurCapture={(e) => { if (!locationPreviewRef.current?.contains(e.relatedTarget as Node)) setShowLocationPreview(false); }}>
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                <Input id="landing-location" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder={t("landing.locationPlaceholder")} className="h-11 rounded-xl sm:rounded-l-none border-0 bg-transparent pl-11 text-sm focus-visible:ring-0"
                  autoComplete="off" />
                {showLocationPreview && filteredLocations.length > 0 && (
                  <Card className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 border-border bg-background p-1 shadow-xl">
                    <ul role="listbox" aria-label={t("landing.locationPlaceholder")} className="max-h-64 overflow-auto py-1">
                      {filteredLocations.map((loc) => (
                        <li key={loc.name}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={locationQuery === loc.name}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setLocationQuery(loc.name); setShowLocationPreview(false); }}
                            className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60"
                          >
                            <span className="flex items-center gap-2 text-foreground">
                              <MapPin className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
                              {loc.name}
                            </span>
                            <span className="text-[11px] font-medium text-muted-foreground/70">{loc.count}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
              <Button className="h-11 rounded-xl px-6 text-sm ml-2 shrink-0" type="submit">
                {discoverText}
              </Button>
            </div>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 max-w-2xl">
            <span className="text-sm text-muted-foreground">{language === "fr" ? "Populaire :" : "Popular:"}</span>
            {quickFilters.slice(0, 5).map((f, i) => (
              <span key={f.label} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-border">,</span>}
                <button type="button" onClick={() => onQuickFilter(f.value)}
                  className="text-sm text-foreground/60 underline underline-offset-4 decoration-border hover:text-primary hover:decoration-primary transition-colors">
                  {f.label}
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LIVE OFFERS TICKER ═══ */}
      {liveOffers.length > 0 && (
        <div className="border-y border-border/50 bg-muted/20 py-2.5 overflow-hidden">
          <div className="offer-marquee-track-h flex gap-5 whitespace-nowrap px-4">
            {[...liveOffers, ...liveOffers, ...liveOffers].map((o, i) => (
              <Link key={`${o.id}-${i}`} to={`/offres/${o.id}`}
                className="inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-sm shrink-0 hover:border-primary/30 transition-colors">
                <Badge variant={o.contract === "CDI" ? "success" : "warning"} className="text-[10px] px-2 py-0.5">{o.contract}</Badge>
                <span className="font-medium text-foreground">{o.title}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{o.location}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ JOB CATEGORIES ═══ */}
      {categoriesWithCounts.length > 0 && (
        <section aria-labelledby="categories-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 id="categories-heading" className="font-heading text-3xl sm:text-4xl font-extrabold mb-3">{t("landing.categoriesTitle")}</h2>
              <p className="text-muted-foreground text-lg">{t("landing.categoriesDesc")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoriesWithCounts.map((cat) => (
                <Link key={cat.id} to={`/offres?categorieId=${cat.id}`} className="group relative overflow-hidden rounded-2xl h-44 bg-muted">
                  <img src={cat.img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent group-hover:from-black/85 transition-colors duration-300" />
                  <div className="relative z-10 flex flex-col justify-end h-full p-5">
                    <cat.icon className="size-5 text-white/90 mb-2" aria-hidden="true" />
                    <h3 className="font-heading text-base font-bold text-white leading-snug">{cat.nom}</h3>
                    <p className="text-xs text-white/60 mt-0.5">{cat.count} {t("landing.categoryOffers")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FEATURES ═══ */}
      <section aria-labelledby="features-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 id="features-heading" className="font-heading text-3xl sm:text-4xl font-extrabold mb-3">{t("landing.featuresTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("landing.featuresDesc")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {selectedFeatureCards.map((f) => (
              <Card key={f.title} className={`group relative p-6 sm:p-7 hover:shadow-lg hover:-translate-y-0.5 cursor-default overflow-hidden border-border/70 bg-gradient-to-br ${f.color.bg}`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.color.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} aria-hidden="true" />
                <div className={`size-12 rounded-xl flex items-center justify-center mb-4 ${f.color.iconBg} ${f.color.iconText}`} aria-hidden="true"><f.icon className="size-5" /></div>
                <h3 className="font-heading text-lg font-bold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section aria-labelledby="cta-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-foreground" />
            <div className="relative z-10 p-10 sm:p-14 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white/80 mb-6">
                <Clock3 className="size-4" aria-hidden="true" /> {t("landing.ctaTimeline")}
              </div>
              <h2 id="cta-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">{t("landing.ctaTitle")}</h2>
              <p className="text-white/60 mb-8 text-lg max-w-xl mx-auto leading-relaxed">{t("landing.ctaDesc")}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-xl" asChild>
                  <Link to="/register?role=candidat"><Users className="size-4" aria-hidden="true" /> {t("landing.ctaButton")}</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 hover:text-white bg-transparent" asChild>
                  <Link to="/offres"><ArrowRight className="size-4" aria-hidden="true" /> {t("landing.ctaExplore")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

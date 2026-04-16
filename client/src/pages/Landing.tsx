import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  Building2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
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
import type { OffreEmploi } from "@/types";

type Audience = "candidate" | "recruiter";
type HeroVariant = "benefit" | "action";
type Language = "fr" | "en";
type MarqueeOffer = {
  id: number;
  title: string;
  company: string;
  location: string;
  contract: string;
  time: string;
  signal: string;
};

const candidateFeatureCards = [
  {
    icon: Search,
    title: "Recherche par pertinence",
    desc: "Trouvez des offres réellement adaptées à votre profil grâce à des filtres rapides et précis.",
    tone: "from-cyan-500/10 to-primary/5",
    accent: "text-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "Recruteurs vérifiés",
    desc: "Postulez uniquement sur des annonces publiées par des entreprises crédibles et actives.",
    tone: "from-emerald-500/10 to-emerald-500/5",
    accent: "text-emerald-600",
  },
  {
    icon: FileCheck,
    title: "Candidature simplifiée",
    desc: "Envoyez votre profil en quelques clics sans friction ni formulaires interminables.",
    tone: "from-violet-500/10 to-primary/5",
    accent: "text-violet-600",
    featured: true,
  },
  {
    icon: TrendingUp,
    title: "Suivi transparent",
    desc: "Gardez le contrôle sur vos candidatures et voyez leur statut en temps réel.",
    tone: "from-amber-500/10 to-amber-500/5",
    accent: "text-amber-600",
  },
  {
    icon: BadgeCheck,
    title: "Espace recruteur clair",
    desc: "Publiez, triez et suivez les candidatures depuis un tableau de bord conçu pour agir vite.",
    tone: "from-sky-500/10 to-sky-500/5",
    accent: "text-sky-600",
  },
];

const recruiterFeatureCards = [
  {
    icon: BadgeCheck,
    title: "Publication rapide",
    desc: "Diffusez vos offres en quelques minutes avec un formulaire clair et orienté conversion.",
    tone: "from-sky-500/10 to-primary/5",
    accent: "text-sky-600",
  },
  {
    icon: ShieldCheck,
    title: "Profils plus fiables",
    desc: "Recevez des candidatures mieux ciblées grâce à des informations structurées et vérifiées.",
    tone: "from-emerald-500/10 to-emerald-500/5",
    accent: "text-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Suivi d’avancement",
    desc: "Visualisez l’état des candidatures et accélérez la prise de décision avec une vue unique.",
    tone: "from-amber-500/10 to-amber-500/5",
    accent: "text-amber-600",
    featured: true,
  },
  {
    icon: FileCheck,
    title: "Tri simplifié",
    desc: "Évaluez rapidement les profils grâce à un format de candidature homogène et lisible.",
    tone: "from-violet-500/10 to-primary/5",
    accent: "text-violet-600",
  },
  {
    icon: Users,
    title: "Pipeline talent",
    desc: "Constituez un flux de talents continu pour réduire le délai entre besoin et embauche.",
    tone: "from-cyan-500/10 to-primary/5",
    accent: "text-cyan-600",
  },
];

const heroStats = [
  {
    target: 50000,
    label: "profils inscrits",
    icon: Users,
    format: (value: number) => `${Math.round(value / 1000)}K+`,
  },
  {
    target: 1200,
    label: "entreprises actives",
    icon: Building2,
    format: (value: number) => `${(value / 1000).toFixed(1)}K+`,
  },
  {
    target: 4.8,
    label: "note moyenne",
    icon: Star,
    format: (value: number) => `${value.toFixed(1)}/5`,
  },
];

const quickFilters = [
  { label: "CDI", value: "CDI" },
  { label: "CDD", value: "CDD" },
  { label: "Stage", value: "Stage" },
  { label: "Télétravail", value: "Télétravail" },
  { label: "Tunis", value: "Tunis" },
  { label: "Développeur", value: "Développeur" },
];

const confidentialityFaq = {
  question: "Mes candidatures restent-elles confidentielles ?",
  answer:
    "Oui. Les informations partagées servent uniquement au processus de recrutement et sont protégées pour limiter la diffusion non désirée de vos données.",
};

const partnerLogos = ["Attijari", "Biat", "Telnet", "Deloitte", "Ooredoo", "OneTech", "Poulina", "Vermeg"];

const fallbackLiveOffers: MarqueeOffer[] = [
  {
    id: 0,
    title: "Développeur Full-Stack React/Node",
    company: "DigitalWave",
    location: "Tunis",
    contract: "CDI",
    time: "Publié il y a 2h",
    signal: "Nouveau",
  },
  {
    id: 0,
    title: "Chargé(e) de recrutement digital",
    company: "GrowthLab",
    location: "Sousse",
    contract: "Stage",
    time: "Publié hier",
    signal: "En hausse",
  },
  {
    id: 0,
    title: "Product Designer UI/UX",
    company: "PixelNorth",
    location: "Sfax",
    contract: "CDD",
    time: "Il y a 12 min",
    signal: "Chaude",
  },
  {
    id: 0,
    title: "Responsable RH / Talent Acquisition",
    company: "Atlas People",
    location: "Tunis",
    contract: "CDI",
    time: "Publié ce matin",
    signal: "Très vue",
  },
];

const faqItems = [
  {
    question: "Puis-je parcourir les offres sans créer de compte ?",
    answer: "Oui. Vous pouvez explorer les offres et filtrer les résultats librement. Le compte devient utile quand vous voulez postuler, suivre vos candidatures ou enregistrer vos recherches.",
  },
  {
    question: "Comment savez-vous si une entreprise est vérifiée ?",
    answer: "Les recruteurs sont contrôlés via leurs informations de contact, leur activité et la cohérence de leurs annonces. L'objectif est de réduire les annonces peu fiables et les doublons.",
  },
  {
    question: "La plateforme est-elle adaptée aux candidats et aux recruteurs ?",
    answer: "Oui. La landing adapte son message selon le contexte d’arrivée, puis la navigation reste pensée pour les deux parcours: trouver une offre ou publier un besoin de recrutement.",
  },
  {
    question: "Combien de temps faut-il pour postuler ?",
    answer: "En pratique, quelques clics suffisent pour les offres qui correspondent à votre profil. L'objectif est d'éliminer les étapes inutiles et d'accélérer le passage à l'action.",
  },
  {
    question: "Puis-je revenir plus tard pour terminer une candidature ?",
    answer: "Oui, vous pouvez reprendre votre parcours plus tard sans perdre le contexte principal de recherche et de sélection.",
  },
];

const testimonials = [
  {
    quote: "J’ai trouvé des offres pertinentes en moins de 10 minutes, et j’ai décroché deux entretiens la même semaine.",
    name: "Leila B.",
    role: "Candidate marketing — Tunis",
    rating: 5,
  },
  {
    quote: "Le suivi des candidatures est clair. On gagne du temps et on reçoit des profils mieux qualifiés.",
    name: "Yassine K.",
    role: "Recruteur RH — Sfax",
    rating: 5,
  },
];

const steps = [
  {
    step: "01",
    title: "Cherchez rapidement",
    desc: "Tapez un métier, une ville ou un contrat et trouvez des offres utiles immédiatement.",
  },
  {
    step: "02",
    title: "Prévisualisez avant de cliquer",
    desc: "Consultez les détails essentiels d’une offre avant d’ouvrir la fiche complète.",
  },
  {
    step: "03",
    title: "Postulez sans friction",
    desc: "Envoyez votre candidature en gardant une expérience simple, rapide et rassurante.",
  },
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

  if (referrerValue.includes("linkedin") && recruiterSignals.some((signal) => queryValue.includes(signal))) {
    return "recruiter";
  }

  return "candidate";
}

function useHeroVariant(search: string): HeroVariant {
  const [variant, setVariant] = useState<HeroVariant>("benefit");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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

function detectLanguage(search: string): Language {
  const searchParams = new URLSearchParams(search);
  const forcedLanguage = searchParams.get("lang")?.toLowerCase();

  if (forcedLanguage === "fr" || forcedLanguage === "en") {
    return forcedLanguage;
  }

  if (typeof window !== "undefined") {
    const storedLanguage = window.localStorage.getItem("joblinker-language");
    if (storedLanguage === "fr" || storedLanguage === "en") {
      return storedLanguage;
    }

    if (window.navigator.language.toLowerCase().startsWith("en")) {
      return "en";
    }
  }

  return "fr";
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
    if (!element) {
      return;
    }

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
    if (!hasAnimated) {
      return;
    }

    let frameId = 0;
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
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
  const { language } = useLanguage();
  const heroRef = useRef<HTMLElement | null>(null);
  const searchPreviewRef = useRef<HTMLDivElement | null>(null);
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
    if (typeof window === "undefined") {
      return;
    }

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
    if (typeof window === "undefined") {
      return;
    }

    if (audienceSelected) {
      window.localStorage.setItem("joblinker-audience", audience);
    }
  }, [audience, audienceSelected]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) {
        return;
      }

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
      .then((offres) => {
        if (!mounted) {
          return;
        }
        setRecommendedOffers(offres.slice(0, 8));
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setRecommendedOffers([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const liveOffers = useMemo<MarqueeOffer[]>(() => {
    if (recommendedOffers.length === 0) {
      return fallbackLiveOffers;
    }

    const freshness = ["Publié il y a 5 min", "Publié il y a 20 min", "Publié il y a 1h", "Publié aujourd'hui"];
    const momentum = ["Recommandée", "Tendance", "Très consultée", "Nouveau"];

    return recommendedOffers.map((offer, index) => ({
      id: offer.id,
      title: offer.titre,
      company: `Entreprise #${offer.recruteurId}`,
      location: offer.ville || "Tunisie",
      contract: offer.typeContrat || "Contrat non précisé",
      time: freshness[index % freshness.length],
      signal: momentum[index % momentum.length],
    }));
  }, [recommendedOffers]);

  const heroContent = useMemo(() => {
    const content = {
      candidate: {
        benefit: {
          fr: {
            headline: "Des offres pertinentes en quelques clics",
            description:
              "JobLinker aide les candidats à trouver plus vite les bonnes opportunités et à postuler sans friction, avec des entreprises vérifiées et des filtres utiles.",
          },
          en: {
            headline: "Relevant jobs in just a few clicks",
            description:
              "JobLinker helps candidates find better opportunities faster and apply with less friction, through verified employers and practical filters.",
          },
        },
        action: {
          fr: {
            headline: "Trouvez votre prochain emploi en Tunisie — en moins de 24h.",
            description:
              "Passez de la recherche à l’action en quelques clics, avec des offres locales, claires et vraiment adaptées à votre profil.",
          },
          en: {
            headline: "Find your next job in Tunisia in under 24 hours.",
            description:
              "Move from search to action in a few clicks with local, clear opportunities that match your profile.",
          },
        },
      },
      recruiter: {
        benefit: {
          fr: {
            headline: "Des talents qualifiés en 24h",
            description:
              "JobLinker aide les recruteurs à publier plus vite, à recevoir des profils plus ciblés et à accélérer chaque prise de contact.",
          },
          en: {
            headline: "Qualified talent within 24 hours",
            description:
              "JobLinker helps recruiters publish faster, receive better-targeted profiles, and speed up first contact.",
          },
        },
        action: {
          fr: {
            headline: "Trouvez votre prochain talent en Tunisie — en moins de 24h.",
            description:
              "Publiez une offre, recevez des candidatures ciblées et réduisez le délai entre le besoin et le premier contact utile.",
          },
          en: {
            headline: "Find your next hire in Tunisia in under 24 hours.",
            description:
              "Publish a job, receive targeted applications, and reduce time to first meaningful contact.",
          },
        },
      },
    } as const;

    return content[audience][heroVariant][language];
  }, [audience, heroVariant, language]);

  const uiText = useMemo(() => {
    if (language === "en") {
      return {
        trustBadge: "Faster, clearer, more reliable hiring",
        modeRecruiter: "Recruiter mode",
        modeCandidate: "Candidate mode",
        audienceQuestion: "What brings you here?",
        audienceCandidate: "I am looking for a job",
        audienceRecruiter: "I am hiring",
        searchLabel: "Job search",
        searchPlaceholder: "Search by role, city, or contract...",
        discoverOffers: audience === "recruiter" ? "Start recruiting" : "Discover jobs",
        browseWithoutAccount: audience === "recruiter" ? "Open recruiter space" : "Browse without account",
        startFree: "Commencer gratuitement",
        previewHint: "Preview a trending job",
        previewTitle: "Jobs that make users click",
        liveBadge: "Live",
        activityLabel: "Real-time activity on today’s top opportunities",
        viewOffer: "View job",
        stepTitle: "3 steps",
        stepOne: "Profile",
        stepTwo: "Match",
        stepThree: "Apply",
      };
    }

    return {
      trustBadge: "Recrutement plus rapide, plus clair, plus fiable",
      modeRecruiter: "Mode recruteur",
      modeCandidate: "Mode candidat",
      audienceQuestion: "Quel est votre objectif ?",
      audienceCandidate: "Je cherche un emploi",
      audienceRecruiter: "Je recrute",
      searchLabel: "Recherche d'offres",
      searchPlaceholder: "Rechercher un métier, une ville, un contrat...",
      discoverOffers: audience === "recruiter" ? "Commencer à recruter" : "Découvrir les offres",
      browseWithoutAccount: audience === "recruiter" ? "Accéder à l'espace recruteur" : "Parcourir sans compte",
      startFree: "Commencer gratuitement",
      previewHint: "Aperçu d’une offre populaire",
      previewTitle: "Offres qui donnent envie de cliquer",
      liveBadge: "En direct",
      activityLabel: "Activité en temps réel sur les meilleures opportunités du jour",
      viewOffer: "Voir l’offre",
      stepTitle: "3 étapes",
      stepOne: "Profil",
      stepTwo: "Match",
      stepThree: "Postuler",
    };
  }, [audience, language]);

  const selectedFeatureCards = useMemo(
    () => (audience === "recruiter" ? recruiterFeatureCards : candidateFeatureCards),
    [audience]
  );

  const searchPreviewOffer = useMemo(() => recommendedOffers[0] ?? null, [recommendedOffers]);

  const goToOffers = (query?: string) => {
    if (audience === "recruiter") {
      navigate("/register?role=recruteur");
      return;
    }

    const params = new URLSearchParams();
    const trimmedQuery = query?.trim() || searchQuery.trim();

    if (trimmedQuery) {
      params.set("search", trimmedQuery);
    }

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

  const progressSteps = [uiText.stepOne, uiText.stepTwo, uiText.stepThree];

  return (
    <div className="overflow-hidden">
      <section ref={heroRef} aria-labelledby="hero-heading" className="relative min-h-[calc(100svh-var(--navbar-height))] flex items-center bg-gradient-to-br from-background via-background to-muted/40">
        <div className="absolute inset-0 -z-10 dot-pattern opacity-30" />
        <div className="absolute top-20 right-[8%] w-[460px] h-[460px] bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 left-[4%] w-[360px] h-[360px] bg-primary-light/10 rounded-full blur-3xl" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 items-center">
            <div className="relative z-20">
              <div className="mb-5">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium border-primary/20 text-primary bg-primary/5">
                  <Sparkles className="size-3.5 mr-2" aria-hidden="true" />
                  {uiText.trustBadge}
                </Badge>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur">
                {audience === "recruiter" ? uiText.modeRecruiter : uiText.modeCandidate}
              </div>

              {!audienceSelected && (
                <div className="mb-5 rounded-2xl border border-border/70 bg-background/90 p-3 sm:p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-foreground">{uiText.audienceQuestion}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button type="button" variant="outline" className="h-11 justify-start" onClick={() => chooseAudience("candidate")}>
                      {uiText.audienceCandidate}
                    </Button>
                    <Button type="button" variant="outline" className="h-11 justify-start" onClick={() => chooseAudience("recruiter")}>
                      {uiText.audienceRecruiter}
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

              <div className="mb-6 rounded-2xl border border-border/70 bg-background/85 px-4 py-3 shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{uiText.stepTitle}</div>
                <div className="mb-3 grid grid-cols-3 gap-2 text-xs sm:text-sm font-semibold text-foreground">
                  {progressSteps.map((step, index) => (
                    <div key={step} className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-2.5 py-1.5">
                      <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{index + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="h-2 rounded-full bg-muted/70">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-primary-light" />
                </div>
              </div>

              <form
                className="relative z-20 space-y-4 max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  goToOffers();
                }}
                role="search"
                aria-label="Recherche d'offres"
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
                      if (!searchPreviewRef.current?.contains(e.relatedTarget as Node)) {
                        setShowSearchPreview(false);
                      }
                    }}
                  >
                    <label htmlFor="landing-search" className="mb-1.5 block px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {uiText.searchLabel}
                    </label>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" aria-hidden="true" />
                    <Input
                      id="landing-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={uiText.searchPlaceholder}
                      className="h-14 rounded-2xl border-0 bg-muted/35 pl-12 text-base focus-visible:bg-background"
                      aria-label={uiText.searchLabel}
                    />

                    {showSearchPreview && searchPreviewOffer && (
                      <Card className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 border-border/70 bg-background p-4 shadow-xl">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Offre ouverte</p>
                          {searchPreviewOffer.typeContrat && <Badge variant="secondary">{searchPreviewOffer.typeContrat}</Badge>}
                        </div>
                        <h3 className="text-sm font-bold text-foreground leading-snug mb-1">{searchPreviewOffer.titre}</h3>
                        <p className="line-clamp-2 text-xs text-muted-foreground mb-3">{searchPreviewOffer.description || "Description disponible sur la fiche complète."}</p>
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
                          <Link to={`/offres/${searchPreviewOffer.id}`}>Voir cette offre</Link>
                        </Button>
                      </Card>
                    )}
                  </div>
                  <Button size="lg" className="h-14 rounded-2xl px-6" type="submit" aria-label={uiText.discoverOffers}>
                    {uiText.discoverOffers}
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
                      <Link to={audience === "recruiter" ? "/login" : "/offres"}>{uiText.browseWithoutAccount}</Link>
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <AnimatedStatCard key={stat.label} target={stat.target} label={stat.label} icon={stat.icon} format={stat.format} />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">Ils nous font confiance</span>
                {partnerLogos.map((logo) => (
                  <span key={logo} className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground grayscale opacity-70">
                    {logo}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary-light/5 blur-xl" aria-hidden="true" />
              <Card className="relative overflow-hidden rounded-[2rem] border-border/60 bg-background/92 shadow-lg shadow-black/[0.05] p-5 sm:p-6 backdrop-blur max-w-[540px] ml-auto">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{uiText.previewHint}</p>
                    <h2 className="font-heading text-2xl font-bold text-foreground">{uiText.previewTitle}</h2>
                  </div>
                  <Badge variant="info">{uiText.liveBadge}</Badge>
                </div>

                <button
                  type="button"
                  className="mb-4 w-full rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-primary/5"
                  onClick={() => navigate("/offres")}
                >
                  <Search className="size-4 text-primary" aria-hidden="true" />
                  <span className="text-sm text-foreground/75">{uiText.activityLabel}</span>
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
                          <Link to={offer.id > 0 ? `/offres/${offer.id}` : "/offres"}>{uiText.viewOffer}</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
                  Actualisation automatique des annonces les plus vues toutes les quelques secondes.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className={`fixed left-1/2 top-[calc(var(--navbar-height)+10px)] z-[70] -translate-x-1/2 transition-all duration-300 ${showStickyCta ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}>
        <Button size="lg" className="h-12 rounded-full px-6 shadow-lg shadow-black/15" asChild>
          <Link to="/register?role=candidat">{uiText.startFree}</Link>
        </Button>
      </div>

      <section aria-labelledby="features-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/25 to-background" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">Pourquoi choisir</Badge>
            <h2 id="features-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              Une expérience conçue pour convertir sans friction
            </h2>
            <p className="text-foreground/75 text-lg">
              Moins d’effort, plus de pertinence, et une progression naturelle vers l’action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedFeatureCards.map((feature) => (
              <Card key={feature.title} className={`group relative p-7 sm:p-8 hover:shadow-xl hover:shadow-primary/[0.05] hover:-translate-y-1 cursor-default overflow-hidden border-border/70 bg-gradient-to-br ${feature.tone} ${feature.featured ? "md:scale-[1.02] md:-translate-y-1 border-primary/20 shadow-lg" : ""}`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" aria-hidden="true" />
                <div className={`size-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-background/80 ${feature.accent}`} aria-hidden="true">
                  <feature.icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-[1.1rem] sm:text-xl font-extrabold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-base leading-relaxed text-foreground/75">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="flow-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          <div>
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">User flow</Badge>
            <h2 id="flow-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              Chercher, filtrer, prévisualiser, postuler
            </h2>
            <p className="text-foreground/75 text-lg leading-relaxed mb-6">
              L’utilisateur doit voir la valeur immédiatement: une recherche claire, des filtres rapides, puis un aperçu d’offre avant l’ouverture du détail.
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
              <Search className="size-5 text-cyan-600 mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Recherche visible</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">Placez la recherche en haut de la page offres et répétez-la dans le hero.</p>
            </Card>
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <SlidersHorizontal className="size-5 text-emerald-600 mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Filtres rapides</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">Chips de filtres instantanés pour réduire le temps de navigation.</p>
            </Card>
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <Briefcase className="size-5 text-violet-600 mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Aperçu d’offre</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">Afficher les données clés avant la page détail pour aider la décision.</p>
            </Card>
            <Card className="p-6 rounded-3xl border-border/70 bg-background shadow-sm">
              <Users className="size-5 text-amber-600 mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Preuve sociale</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">Montrer qu’une vraie communauté active utilise déjà la plateforme.</p>
            </Card>
          </div>
        </div>
      </section>

      <section aria-labelledby="confidentiality-heading" className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="rounded-3xl border-border/70 bg-background p-6 sm:p-7 shadow-sm">
            <h2 id="confidentiality-heading" className="mb-3 font-heading text-xl sm:text-2xl font-extrabold text-foreground">
              {confidentialityFaq.question}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/80">{confidentialityFaq.answer}</p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="social-proof-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">Crédibilité</Badge>
            <h2 id="social-proof-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              Les utilisateurs veulent de la confiance avant le clic
            </h2>
            <p className="text-foreground/75 text-lg">
              Rendez la plateforme rassurante avec des chiffres précis, des visages réels et des retours concrets.
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 mb-5">
            <Card className="p-7 rounded-[2rem] border-border/70 bg-background shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2" aria-hidden="true">
                  {["AB", "MK", "SR"].map((name, index) => (
                    <div key={name} className={`size-10 rounded-full border-2 border-background grid place-items-center text-[10px] font-bold text-white ${index === 0 ? "bg-primary" : index === 1 ? "bg-sky-500" : "bg-emerald-500"}`}>
                      {name}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">4.8/5 sur 120+ avis</div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed mb-4">
                Plus de <strong className="text-foreground">50K</strong> profils inscrits et des recruteurs qui reviennent chaque semaine.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-primary/8 p-4">
                  <div className="font-heading text-xl font-extrabold">+50K</div>
                  <div className="text-[11px] text-muted-foreground">utilisateurs inscrits</div>
                </div>
                <div className="rounded-2xl bg-primary/8 p-4">
                  <div className="font-heading text-xl font-extrabold">4.8/5</div>
                  <div className="text-[11px] text-muted-foreground">note moyenne</div>
                </div>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-5">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="p-8 rounded-[2rem] border-border/70 bg-background shadow-sm">
                  <MessageSquareQuote className="size-6 text-primary mb-4" aria-hidden="true" />
                  <div className="flex items-center gap-1 text-amber-500 mb-4" aria-label={`${testimonial.rating} étoiles`}>
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed mb-6 text-foreground/80">“{testimonial.quote}”</p>
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

      <section aria-labelledby="faq-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">FAQ</Badge>
            <h2 id="faq-heading" className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold mb-4 text-balance">
              Les dernières questions avant de passer à l’action
            </h2>
            <p className="text-foreground/75 text-lg">
              Répondre aux objections au bon moment réduit la friction juste avant la conversion.
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

      <section aria-labelledby="final-cta-heading" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden border border-border/60">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground" />
            <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl" aria-hidden="true" />

            <div className="relative z-10 p-10 sm:p-12 md:p-14 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 mb-6">
                <Clock3 className="size-4" aria-hidden="true" />
                Créez votre compte en quelques minutes
              </div>
              <h2 id="final-cta-heading" className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white mb-5 leading-tight">
                Ne laissez pas la bonne opportunité passer.
              </h2>
              <p className="text-white/60 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
                Inscription gratuite, rapide et sans engagement. Commencez maintenant et accédez aux offres qui correspondent vraiment à votre profil.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" className="bg-white text-slate-900 hover:bg-white/95 shadow-xl shadow-black/25" asChild>
                  <Link to="/register?role=candidat">
                    <Users className="size-4" aria-hidden="true" />
                    Commencer gratuitement
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/10 hover:text-white bg-transparent" asChild>
                  <Link to="/offres">
                    <Search className="size-4" aria-hidden="true" />
                    Explorer les offres
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-white/45">
                Recruteurs vérifiés, données protégées et possibilité d’annuler à tout moment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

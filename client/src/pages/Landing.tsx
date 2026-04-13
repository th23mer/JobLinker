import { Link } from "react-router-dom";
import {
  Search, Building2, FileCheck, ShieldCheck, ArrowRight,
  Sparkles, TrendingUp, Users, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Search,
    title: "Recherche intelligente",
    desc: "Filtres avances par categorie, ville, contrat et niveau d'experience pour trouver l'offre parfaite.",
  },
  {
    icon: ShieldCheck,
    title: "Entreprises verifiees",
    desc: "Chaque recruteur est valide par notre equipe pour garantir des offres fiables et serieuses.",
  },
  {
    icon: FileCheck,
    title: "Candidature simplifiee",
    desc: "Postulez en quelques clics avec votre CV et lettre de motivation directement sur la plateforme.",
  },
  {
    icon: TrendingUp,
    title: "Suivi en temps reel",
    desc: "Suivez l'etat de vos candidatures : en attente, acceptee ou refusee — tout est transparent.",
  },
];

const stats = [
  { value: "5K+", label: "Offres actives", icon: Sparkles },
  { value: "1.2K+", label: "Entreprises", icon: Building2 },
  { value: "50K+", label: "Candidats", icon: Users },
  { value: "95%", label: "Satisfaction", icon: Zap },
];

const steps = [
  { step: "01", title: "Creez votre compte", desc: "Inscrivez-vous en tant que candidat ou recruteur en quelques secondes." },
  { step: "02", title: "Explorez les offres", desc: "Parcourez des milliers d'opportunites adaptees a votre profil." },
  { step: "03", title: "Postulez facilement", desc: "Envoyez votre candidature et suivez son evolution en temps reel." },
];

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section aria-labelledby="hero-heading" className="relative min-h-screen flex items-center gradient-mesh">
        <div className="absolute inset-0 -z-10 dot-pattern opacity-40" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/6 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] bg-primary-light/6 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/3 left-[15%] size-3 rounded-full bg-primary/20 animate-float" aria-hidden="true" />
        <div className="absolute top-[20%] right-[25%] size-2 rounded-full bg-primary/15 animate-float" style={{ animationDelay: "2s" }} aria-hidden="true" />
        <div className="absolute bottom-1/3 right-[15%] size-4 rounded-full bg-primary-light/15 animate-float" style={{ animationDelay: "4s" }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium border-primary/20 text-primary">
                <Sparkles className="size-3.5 mr-2" aria-hidden="true" />
                La plateforme #1 de recrutement en Tunisie
              </Badge>
            </div>

            <h1 id="hero-heading" className="animate-fade-in-up-delay-1 font-heading text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight mb-8 leading-[1.1]">
              Trouvez votre{" "}
              <span className="gradient-text">emploi ideal</span>{" "}
              en quelques clics
            </h1>

            <p className="animate-fade-in-up-delay-2 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              JobLinker connecte les meilleurs talents aux entreprises qui recrutent.
              Recherchez, postulez et decrochez le poste de vos reves.
            </p>

            <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" asChild>
                <Link to="/offres">
                  <Search className="size-4" aria-hidden="true" />
                  Parcourir les offres
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/register">Creer un compte gratuit</Link>
              </Button>
            </div>
          </div>

          {/* Stats - single color family with opacity variations */}
          <div className="mt-24 max-w-5xl mx-auto animate-fade-in-up-delay-3">
            <Card className="glass-strong border-border/40 shadow-xl shadow-black/[0.04] p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-primary/[0.03] transition-colors duration-200">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                      <stat.icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-foreground font-heading leading-none">{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FEATURES - same primary blue tints ─── */}
      <section aria-labelledby="features-heading" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">Fonctionnalites</Badge>
            <h2 id="features-heading" className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold mb-4">
              Pourquoi choisir <span className="gradient-text">JobLinker</span> ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Une plateforme pensee pour simplifier le recrutement pour tous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="group relative p-8 hover:shadow-xl hover:shadow-primary/[0.04] hover:-translate-y-1 cursor-default overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" aria-hidden="true" />
                <div className="size-14 bg-primary/8 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                  <f.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS - proper stepper layout ─── */}
      <section aria-labelledby="steps-heading" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border-primary/20 text-primary">Comment ca marche</Badge>
            <h2 id="steps-heading" className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold">
              Trois etapes simples
            </h2>
          </div>

          {/* Stepper: circles connected by lines, text below */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-0">
            {steps.map((s, i) => (
              <div key={s.step} className="flex-1 flex flex-col items-center text-center">
                {/* Circle + connector row */}
                <div className="flex items-center w-full mb-8">
                  {/* Left connector */}
                  {i > 0 ? (
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-border to-primary/30" aria-hidden="true" />
                  ) : (
                    <div className="hidden md:block flex-1" />
                  )}

                  {/* Step circle */}
                  <div className="size-16 rounded-2xl bg-primary text-primary-foreground font-heading text-xl font-extrabold flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    {s.step}
                  </div>

                  {/* Right connector */}
                  {i < steps.length - 1 ? (
                    <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-primary/30 to-border" aria-hidden="true" />
                  ) : (
                    <div className="hidden md:block flex-1" />
                  )}
                </div>

                {/* Text */}
                <h3 className="font-heading text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section aria-labelledby="cta-heading" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground" />
            <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl" aria-hidden="true" />

            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 id="cta-heading" className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white mb-6 leading-tight">
                Prêt à décrocher votre prochain emploi ?
              </h2>
              <p className="text-white/50 mb-12 text-lg max-w-md mx-auto leading-relaxed">
                Rejoignez des milliers de professionnels qui font confiance à JobLinker.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to="/register?role=candidat">
                    <Users className="size-4" aria-hidden="true" />
                    Je suis candidat
                  </Link>
                </Button>
                <Button size="xl" asChild>
                  <Link to="/register?role=recruteur">
                    <Building2 className="size-4" aria-hidden="true" />
                    Je suis recruteur
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

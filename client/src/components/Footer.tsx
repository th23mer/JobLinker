import { Link2, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-foreground via-foreground to-foreground/95 text-background mt-auto overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-light/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Link2 className="size-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold">JobLinker</span>
            </div>
            <p className="text-background/50 text-sm leading-relaxed max-w-xs">
              La plateforme de recrutement qui connecte les talents aux meilleures opportunites professionnelles en Tunisie.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-[0.2em] text-background/40 mb-5">
              Navigation
            </h4>
            <ul className="space-y-3.5">
              {[
                { to: "/", label: "Accueil" },
                { to: "/offres", label: "Offres d'emploi" },
                { to: "/register?role=candidat", label: "Espace candidat" },
                { to: "/register?role=recruteur", label: "Espace recruteur" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group text-background/45 hover:text-background text-sm transition-colors duration-200 flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-[0.2em] text-background/40 mb-5">
              Ressources
            </h4>
            <ul className="space-y-3.5">
              {["Aide & Support", "Conditions d'utilisation", "Politique de confidentialite", "FAQ"].map((item) => (
                <li key={item}>
                  <span className="text-background/45 hover:text-background text-sm transition-colors duration-200 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-[0.2em] text-background/40 mb-5">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-background/45">
              <li className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-background/5 flex items-center justify-center shrink-0">
                  <Mail className="size-3.5 text-primary" />
                </div>
                contact@joblinker.tn
              </li>
              <li className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-background/5 flex items-center justify-center shrink-0">
                  <Phone className="size-3.5 text-primary" />
                </div>
                +216 71 000 000
              </li>
              <li className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-background/5 flex items-center justify-center shrink-0">
                  <MapPin className="size-3.5 text-primary" />
                </div>
                Tunis, Tunisie
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/30">
            &copy; {new Date().getFullYear()} JobLinker. Tous droits reserves.
          </p>
          <div className="flex gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <span key={s} className="text-xs text-background/30 hover:text-background/60 cursor-pointer transition-colors duration-200 px-2 py-1 rounded-md hover:bg-background/5">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

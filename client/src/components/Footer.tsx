import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative bg-gradient-to-b from-foreground via-foreground to-foreground/95 text-background mt-auto overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-light/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 font-heading font-extrabold text-base text-white">
                J
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading text-xl font-bold">JobLinker</span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-background/45">{t("nav.subtitle")}</span>
              </div>
            </div>
            <p className="text-background/50 text-sm leading-relaxed max-w-md">
              {t("footer.description")}
            </p>

            <div className="mt-6 flex items-center gap-4 text-sm text-background/60">
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-background transition-colors" aria-label="LinkedIn">
                in
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-background transition-colors" aria-label="X">
                X
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-background transition-colors" aria-label="GitHub">
                gh
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-[0.2em] text-background/40 mb-5">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-3.5">
              {[
                { to: "/", label: t("footer.home") },
                { to: "/offres", label: t("footer.offers") },
                { to: "/register?role=candidat", label: t("footer.candidateSpace") },
                { to: "/register?role=recruteur", label: t("footer.recruiterSpace") },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-background/45 hover:text-background text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="md:col-span-4">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-[0.2em] text-background/40 mb-5">
              {t("footer.help")}
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                { href: "mailto:contact@joblinker.tn", label: t("footer.support") },
                { href: "/fqas", label: t("footer.faq"), internal: true },
                { href: "/conditions-utilisation", label: t("footer.terms"), internal: true },
                { href: "/politique-confidentialite", label: t("footer.privacy"), internal: true },
              ].map((item) => (
                <li key={item.label}>
                  {item.internal ? (
                    <Link to={item.href} className="text-background/45 hover:text-background transition-colors duration-200">
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className="text-background/45 hover:text-background transition-colors duration-200">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs text-background/30">
            &copy; {new Date().getFullYear()} JobLinker. {t("footer.rights")}
          </p>
          <p className="text-xs text-background/30">Tunis, Tunisie · contact@joblinker.tn</p>
        </div>
      </div>
    </footer>
  );
}

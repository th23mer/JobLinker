import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, HelpCircle } from "lucide-react";

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
      <Link
        to="/fqas"
        className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/35 transition-transform duration-200 hover:scale-[1.03]"
        aria-label="Ouvrir la page FAQ"
      >
        <HelpCircle className="size-4" aria-hidden="true" />
      </Link>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Retour en haut"
        className={[
          "inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/95 text-foreground shadow-md transition-all duration-300",
          showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        ].join(" ")}
      >
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useProfileModal } from "@/context/ProfileModalContext";
import { useCandidatProfileModal } from "@/context/CandidatProfileModalContext";
import { Link2, LogOut, LayoutDashboard, Menu, Sparkles, Globe, User } from "lucide-react";
import { api } from "@/services/api";
import type { Recruteur, Candidat } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { setLanguage } = useLanguage();
  const { language, t } = useTranslation();
  const { openProfile } = useProfileModal();
  const { openProfile: openCandidatProfile } = useCandidatProfileModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  const displayName = profileName ?? (user?.role === "admin" ? "Administrateur" : "Utilisateur");

  const handleProfileClick = () => {
    setAvatarOpen(false);
    if (user?.role === "recruteur") {
      openProfile();
    } else if (user?.role === "candidat") {
      openCandidatProfile();
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  const dashboardPath =
    user?.role === "admin" ? "/admin"
    : user?.role === "recruteur" ? "/recruteur"
    : "/candidat";

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  // close avatar menu on outside click or navigation
  useEffect(() => {
    const onDocClick = () => setAvatarOpen(false);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const load = async () => {
      try {
        if (user.role === "recruteur") {
          const p = await api.get<Recruteur>(`/recruteurs/${user.id}`);
          setProfileName([p.prenomRepresentant, p.nomRepresentant].filter(Boolean).join(" ") || p.nomEntreprise || null);
        } else if (user.role === "candidat") {
          const p = await api.get<Candidat>(`/candidats/${user.id}`);
          setProfileName([p.prenom, p.nom].filter(Boolean).join(" ") || null);
        } else {
          // admin or unknown — no profile endpoint, leave null
          setProfileName(null);
        }
      } catch {
        setProfileName(null);
      }
    };
    void load();
  }, [isAuthenticated, user]);

  const getInitials = (name?: string | null) => {
    if (!name) return (user?.role ?? "U").toString().charAt(0).toUpperCase();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarHue = (name?: string | null) => {
    const source = name ?? user?.id?.toString() ?? "joblinker";
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash * 31 + source.charCodeAt(i)) % 360;
    }
    return hash;
  };

  const avatarStyle = {
    background: `linear-gradient(135deg, hsl(${getAvatarHue(profileName)} 85% 58%), hsl(${(getAvatarHue(profileName) + 35) % 360} 85% 48%))`,
    boxShadow: `0 10px 25px hsla(${getAvatarHue(profileName)}, 85%, 45%, 0.28)`,
  };

  return (
    <nav
      aria-label="Navigation principale"
      style={{ position: "sticky", top: 0 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 border-b border-border/50 backdrop-blur-xl",
        scrolled
          ? "bg-background/92 shadow-lg shadow-black/[0.04]"
          : "bg-background/80 shadow-sm shadow-black/[0.02]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="JobLinker - Accueil">
            <div className="relative size-10 rounded-2xl bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              <Link2 className="size-4 text-white" aria-hidden="true" />
              <div className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary-light border-2 border-background animate-pulse-soft" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground leading-none">
                JobLinker
              </span>
              <span className="text-[10px] font-medium text-muted-foreground/70 tracking-wider uppercase">{t("nav.subtitle")}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(isActive("/offres") && "bg-accent text-accent-foreground")}
            >
              <Link to="/offres" aria-current={isActive("/offres") ? "page" : undefined}>
                {t("nav.offers")}
              </Link>
            </Button>

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-muted-foreground gap-1.5"
              aria-label={language === "fr" ? "Switch to English" : "Basculer en francais"}
            >
              <Globe className="size-4" />
              <span className="text-xs font-semibold uppercase">{language === "fr" ? "FR" : "EN"}</span>
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(isActive(dashboardPath) && "bg-accent text-accent-foreground")}
                >
                  <Link to={dashboardPath} aria-current={isActive(dashboardPath) ? "page" : undefined}>
                    <LayoutDashboard className="size-4" />
                    {t("nav.dashboard")}
                  </Link>
                </Button>
                {/* Avatar dropdown */}
                <div className="relative flex items-center gap-3">
                  
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={avatarOpen}
                    onClick={(e) => { e.stopPropagation(); setAvatarOpen((v) => !v); }}
                    className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-background"
                    onMouseDown={(e) => e.preventDefault()}
                    style={avatarStyle}
                  >
                    <span className="select-none">{getInitials(profileName)}</span>
                  </button>
                  {avatarOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border/40 bg-background shadow-xl z-40">
                      <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3 bg-muted/20">
                        <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-background" style={avatarStyle}>
                          {getInitials(profileName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                          <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground/70">{user?.role}</p>
                        </div>
                      </div>
                      {(user?.role === "recruteur" || user?.role === "candidat") && (
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/30"
                          onClick={handleProfileClick}
                        >
                          <User className="size-4 text-muted-foreground/80" />
                          <span>Mon profil</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setAvatarOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted/30"
                      >
                        <LogOut className="size-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(isActive("/login") && "bg-accent text-accent-foreground")}
                >
                  <Link to="/login" aria-current={isActive("/login") ? "page" : undefined}>
                    {t("nav.login")}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    {t("nav.register")}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu de navigation">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-l-border/40">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <Link2 className="size-4 text-white" aria-hidden="true" />
                  </div>
                  JobLinker
                </SheetTitle>
                <SheetDescription>{t("nav.subtitle")}</SheetDescription>
              </SheetHeader>
              <nav aria-label="Menu mobile" className="flex flex-col gap-1 mt-8">
                <Button
                  variant="ghost"
                  className={cn("justify-start h-12 text-base", isActive("/offres") && "bg-accent")}
                  asChild
                >
                  <Link to="/offres" onClick={() => setMobileOpen(false)} aria-current={isActive("/offres") ? "page" : undefined}>
                    {t("nav.offers")}
                  </Link>
                </Button>

                {/* Language toggle mobile */}
                <Button
                  variant="ghost"
                  className="justify-start h-12 text-base"
                  onClick={() => { toggleLanguage(); setMobileOpen(false); }}
                >
                  <Globe className="size-4" />
                  {language === "fr" ? "English" : "Francais"}
                </Button>

                {isAuthenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      className={cn("justify-start h-12 text-base", isActive(dashboardPath) && "bg-accent")}
                      asChild
                    >
                      <Link to={dashboardPath} onClick={() => setMobileOpen(false)} aria-current={isActive(dashboardPath) ? "page" : undefined}>
                        <LayoutDashboard className="size-4" />
                        {t("nav.dashboard")}
                      </Link>
                    </Button>
                    {(user?.role === "recruteur" || user?.role === "candidat") && (
                      <Button
                        variant="ghost"
                        className="justify-start h-12 text-base"
                        onClick={() => { setMobileOpen(false); handleProfileClick(); }}
                      >
                        <User className="size-4" />
                        Mon profil
                      </Button>
                    )}
                    <Separator className="my-3" />
                    <Button
                      variant="ghost"
                      className="justify-start h-12 text-base text-destructive hover:text-destructive"
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      aria-label={t("nav.logout")}
                    >
                      <LogOut className="size-4" />
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start h-12 text-base" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        {t("nav.login")}
                      </Link>
                    </Button>
                    <div className="mt-4">
                      <Button className="w-full" size="lg" asChild>
                        <Link to="/register" onClick={() => setMobileOpen(false)}>
                          <Sparkles className="size-4" aria-hidden="true" />
                          {t("nav.register")}
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

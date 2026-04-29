import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { LogOut, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

export default function UserAvatar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profil } = useProfile();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = `${profil?.prenom?.[0] || "U"}${profil?.nom?.[0] || ""}`.toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold hover:shadow-lg transition-all duration-200"
        aria-label={`${profil?.prenom || ""} ${profil?.nom || ""}`}
        title={`${profil?.prenom || ""} ${profil?.nom || ""}`}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/70 bg-background shadow-lg shadow-black/10 z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 p-4 border-b border-border/50">
            <p className="font-semibold text-foreground">{profil?.prenom} {profil?.nom}</p>
            <p className="text-xs text-muted-foreground mt-1">{profil?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              to="/profil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              <User className="size-4" aria-hidden="true" />
              {t("monProfil")}
            </Link>
            <Link
              to="/candidat"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              <FileText className="size-4" aria-hidden="true" />
              {t("mesCandidatures")}
            </Link>
          </div>

          <Separator className="my-1" />

          {/* Logout */}
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("deconnexion")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

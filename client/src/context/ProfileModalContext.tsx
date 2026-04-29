import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import type { Recruteur } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { ProfileDialog } from "@/components/recruiter/ProfileDialog";

type ProfileForm = {
  nomEntreprise: string;
  matriculeFiscal: string;
  adresse: string;
  description: string;
  email: string;
  telephone: string;
  nomRepresentant: string;
  prenomRepresentant: string;
};

const emptyForm: ProfileForm = {
  nomEntreprise: "", matriculeFiscal: "", adresse: "", description: "",
  email: "", telephone: "", nomRepresentant: "", prenomRepresentant: "",
};

interface ProfileModalContextType {
  openProfile: () => void;
  closeProfile: () => void;
}

const ProfileModalContext = createContext<ProfileModalContextType | undefined>(undefined);

export function ProfileModalProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [profil, setProfil] = useState<Recruteur | null>(null);
  const [profilForm, setProfilForm] = useState<ProfileForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fillForm = (p: Recruteur) => setProfilForm({
    nomEntreprise: p.nomEntreprise || "",
    matriculeFiscal: p.matriculeFiscal || "",
    adresse: p.adresse || "",
    description: p.description || "",
    email: p.email || "",
    telephone: p.telephone || "",
    nomRepresentant: p.nomRepresentant || "",
    prenomRepresentant: p.prenomRepresentant || "",
  });

  const openProfile = useCallback(() => {
    if (!isAuthenticated || user?.role !== "recruteur") return;
    setOpen(true);
  }, [isAuthenticated, user]);

  const closeProfile = useCallback(() => {
    setEditing(false);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open || !user || user.role !== "recruteur") return;
    let cancelled = false;
    api.get<Recruteur>(`/recruteurs/${user.id}`)
      .then((p) => {
        if (cancelled) return;
        setProfil(p);
        fillForm(p);
      })
      .catch(() => { if (!cancelled) setOpen(false); });
    return () => { cancelled = true; };
  }, [open, user]);

  const handleSave = async () => {
    if (!user || user.role !== "recruteur") return;
    setSaving(true);
    try {
      const updated = await api.put<Recruteur>(`/recruteurs/${user.id}`, profilForm);
      setProfil(updated);
      fillForm(updated);
      setEditing(false);
    } catch {
      // swallow; dialog stays open so user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileModalContext.Provider value={{ openProfile, closeProfile }}>
      {children}
      <ProfileDialog
        profil={profil}
        open={open}
        editing={editing}
        profilForm={profilForm}
        saving={saving}
        onEdit={() => setEditing(true)}
        onSave={handleSave}
        onCancelEdit={() => { setEditing(false); if (profil) fillForm(profil); }}
        onClose={closeProfile}
        onFormChange={(field, value) => setProfilForm((prev) => ({ ...prev, [field]: value }))}
      />
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal() {
  const ctx = useContext(ProfileModalContext);
  if (!ctx) throw new Error("useProfileModal must be used within ProfileModalProvider");
  return ctx;
}

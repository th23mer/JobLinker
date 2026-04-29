import { createContext, useCallback, useContext, useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { api } from "@/services/api";
import type { Candidat } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { CandidatProfileDialog } from "@/components/candidat/CandidatProfileDialog";

type ProfileForm = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  diplome: string;
  niveauEtude: string;
  experience: string;
  lettreMotivation: string;
  cv: string;
};

const emptyForm: ProfileForm = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  diplome: "",
  niveauEtude: "",
  experience: "",
  lettreMotivation: "",
  cv: "",
};

interface CandidatProfileModalContextType {
  openProfile: () => void;
  closeProfile: () => void;
}

const CandidatProfileModalContext = createContext<CandidatProfileModalContextType | undefined>(undefined);

export function CandidatProfileModalProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [profilForm, setProfilForm] = useState<ProfileForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [selectedCvName, setSelectedCvName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const fillForm = (p: Candidat) => setProfilForm({
    nom: p.nom || "",
    prenom: p.prenom || "",
    email: p.email || "",
    telephone: p.telephone || "",
    diplome: p.diplome || "",
    niveauEtude: p.niveauEtude || "",
    experience: p.experience || "",
    lettreMotivation: p.lettreMotivation || "",
    cv: p.cv || "",
  });

  const openProfile = useCallback(() => {
    if (!isAuthenticated || user?.role !== "candidat") return;
    setProfileError("");
    setOpen(true);
  }, [isAuthenticated, user]);

  const closeProfile = useCallback(() => {
    setEditing(false);
    setSelectedCvName(null);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open || !user || user.role !== "candidat") return;
    let cancelled = false;
    setProfileLoading(true);
    setProfileError("");
    api.get<Candidat>(`/candidats/${user.id}`)
      .then((p) => {
        if (cancelled) return;
        setProfil(p);
        fillForm(p);
      })
      .catch(() => {
        if (!cancelled) setProfileError("Impossible de charger le profil. Veuillez reessayer.");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, user]);

  const handleSave = async () => {
    if (!user || user.role !== "candidat") return;
    setSaving(true);
    try {
      const updated = await api.put<Candidat>(`/candidats/${user.id}`, profilForm);
      setProfil(updated);
      fillForm(updated);
      setEditing(false);
      setSelectedCvName(null);
    } catch {
      // The dialog stays open so the user can retry.
    } finally {
      setSaving(false);
    }
  };

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") return;

    setSelectedCvName(file.name);
    setUploadingCv(true);

    try {
      const fd = new FormData();
      fd.append("cv", file);
      const updated = await api.upload<Candidat>(`/candidats/${user.id}/cv`, fd);
      setProfil(updated);
      setProfilForm((prev) => ({ ...prev, cv: updated.cv || "" }));
      setSelectedCvName(file.name);
    } catch {
      console.error("Erreur lors de l'upload du CV");
    } finally {
      setUploadingCv(false);
    }
    e.target.value = "";
  };

  return (
    <CandidatProfileModalContext.Provider value={{ openProfile, closeProfile }}>
      {children}
      <CandidatProfileDialog
        profil={profil}
        open={open}
        editing={editing}
        profilForm={profilForm}
        saving={saving}
        uploadingCv={uploadingCv}
        selectedCvName={selectedCvName}
        profileLoading={profileLoading}
        profileError={profileError}
        onEdit={() => setEditing(true)}
        onSave={handleSave}
        onCancelEdit={() => { setEditing(false); setSelectedCvName(null); if (profil) fillForm(profil); }}
        onClose={closeProfile}
        onFormChange={(field, value) => setProfilForm((prev) => ({ ...prev, [field]: value }))}
        onCvUpload={handleCvUpload}
      />
    </CandidatProfileModalContext.Provider>
  );
}

export function useCandidatProfileModal() {
  const ctx = useContext(CandidatProfileModalContext);
  if (!ctx) throw new Error("useCandidatProfileModal must be used within CandidatProfileModalProvider");
  return ctx;
}

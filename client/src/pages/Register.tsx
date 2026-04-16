import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Link2, UserPlus, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Role = "candidat" | "recruteur";
type CandidateField = "nom" | "prenom" | "email" | "motDePasse" | "telephone" | "diplome" | "niveauEtude";
type RecruiterField = "nomEntreprise" | "matriculeFiscal" | "adresse" | "description" | "email" | "motDePasse" | "telephone" | "nomRepresentant" | "prenomRepresentant";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+?\d[\d\s().-]{7,})$/;

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "candidat";
  const [role, setRole] = useState<Role>(initialRole);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"account" | "profile">("account");
  const [showCandidatePassword, setShowCandidatePassword] = useState(false);
  const [showRecruiterPassword, setShowRecruiterPassword] = useState(false);
  const [candidateTouched, setCandidateTouched] = useState<Record<string, boolean>>({});
  const [candidateErrors, setCandidateErrors] = useState<Record<string, string>>({});
  const [recruiterTouched, setRecruiterTouched] = useState<Record<string, boolean>>({});
  const [recruiterErrors, setRecruiterErrors] = useState<Record<string, string>>({});
  const [registeredCandidateId, setRegisteredCandidateId] = useState<number | null>(null);
  const [registeredRecruiterId, setRegisteredRecruiterId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const redirectPath = user.role === "admin" ? "/admin" : user.role === "recruteur" ? "/recruteur" : "/candidat";
    navigate(redirectPath, { replace: true });
  }, [isAuthenticated, navigate, user]);

  const [candidat, setCandidat] = useState({
    nom: "", prenom: "", email: "", motDePasse: "", telephone: "", cv: "", lettreMotivation: "", niveauEtude: "", experience: "", diplome: "",
  });

  const [recruteur, setRecruteur] = useState({
    nomEntreprise: "", matriculeFiscal: "", adresse: "", description: "", email: "", motDePasse: "", telephone: "", nomRepresentant: "", prenomRepresentant: "",
  });

  useEffect(() => {
    setStage("account");
    setError("");
    setSuccess("");
    setRegisteredCandidateId(null);
    setRegisteredRecruiterId(null);
    setShowCandidatePassword(false);
    setShowRecruiterPassword(false);
    setCandidateTouched({});
    setCandidateErrors({});
    setRecruiterTouched({});
    setRecruiterErrors({});
  }, [role]);

  const selectClass =
    "flex h-11 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm shadow-sm shadow-black/[0.03] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50";

  function validateEmail(value: string): string {
    if (!value.trim()) return t("validation.emailRequired");
    if (!emailPattern.test(value.trim())) return t("validation.emailInvalid");
    return "";
  }

  function validatePassword(value: string): string {
    if (!value) return t("validation.passwordRequired");
    if (value.length < 6) return t("validation.passwordTooShort");
    const checks = [/[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
    if (checks <= 2) return t("validation.passwordWeak");
    return "";
  }

  function validatePhone(value: string): string {
    if (!value.trim()) return "";
    if (!phonePattern.test(value.trim())) return t("validation.phoneInvalid");
    return "";
  }

  function validateRequired(value: string, label: string): string {
    return value.trim() ? "" : `${label} ${t("validation.required")}`;
  }

  function getPasswordStrength(value: string): { score: number; label: string } {
    if (!value) return { score: 0, label: t("validation.strengthWeak") };
    const checks = [value.length >= 6, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
    if (value.length < 6 || checks <= 2) return { score: 1, label: t("validation.strengthWeak") };
    if (checks === 3) return { score: 2, label: t("validation.strengthMedium") };
    if (checks === 4) return { score: 3, label: t("validation.strengthStrong") };
    return { score: 4, label: t("validation.strengthVeryStrong") };
  }

  function FieldStatus({ touched, error: fieldError, value }: { touched: boolean; error: string; value: string }) {
    if (!touched || !value.trim()) return null;
    if (fieldError) {
      return (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {fieldError}
        </p>
      );
    }
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600" role="status">
        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
        {t("register.fieldValid")}
      </p>
    );
  }

  const validateCandidateField = (field: CandidateField, value: string): string => {
    switch (field) {
      case "nom": return validateRequired(value, t("register.nom"));
      case "prenom": return validateRequired(value, t("register.prenom"));
      case "email": return validateEmail(value);
      case "motDePasse": return validatePassword(value);
      case "telephone": return validatePhone(value);
      default: return "";
    }
  };

  const validateRecruiterField = (field: RecruiterField, value: string): string => {
    switch (field) {
      case "nomEntreprise": return validateRequired(value, t("register.companyName"));
      case "matriculeFiscal": return validateRequired(value, t("register.matriculeFiscal"));
      case "adresse": return validateRequired(value, t("register.adresse"));
      case "email": return validateEmail(value);
      case "motDePasse": return validatePassword(value);
      case "telephone": return validatePhone(value);
      case "nomRepresentant": return validateRequired(value, t("register.repLastName"));
      case "prenomRepresentant": return validateRequired(value, t("register.repFirstName"));
      default: return "";
    }
  };

  const updateCandidateField = <K extends keyof typeof candidat>(field: K, value: (typeof candidat)[K]) => {
    setCandidat((current) => ({ ...current, [field]: value }));
    if (candidateTouched[String(field)]) {
      setCandidateErrors((current) => ({ ...current, [field]: validateCandidateField(field as CandidateField, String(value)) }));
    }
  };

  const updateRecruiterField = <K extends keyof typeof recruteur>(field: K, value: (typeof recruteur)[K]) => {
    setRecruteur((current) => ({ ...current, [field]: value }));
    if (recruiterTouched[String(field)]) {
      setRecruiterErrors((current) => ({ ...current, [field]: validateRecruiterField(field as RecruiterField, String(value)) }));
    }
  };

  const markCandidateField = (field: CandidateField) => {
    setCandidateTouched((current) => ({ ...current, [field]: true }));
    setCandidateErrors((current) => ({ ...current, [field]: validateCandidateField(field, String(candidat[field])) }));
  };

  const markRecruiterField = (field: RecruiterField) => {
    setRecruiterTouched((current) => ({ ...current, [field]: true }));
    setRecruiterErrors((current) => ({ ...current, [field]: validateRecruiterField(field, String(recruteur[field])) }));
  };

  const validateCandidateAccount = () => {
    const nextErrors: Record<string, string> = {
      nom: validateRequired(candidat.nom, t("register.nom")),
      prenom: validateRequired(candidat.prenom, t("register.prenom")),
      email: validateEmail(candidat.email),
      motDePasse: validatePassword(candidat.motDePasse),
    };
    setCandidateTouched((c) => ({ ...c, nom: true, prenom: true, email: true, motDePasse: true }));
    setCandidateErrors((c) => ({ ...c, ...nextErrors }));
    return Object.values(nextErrors).every((v) => !v);
  };

  const validateRecruiterAccount = () => {
    const nextErrors: Record<string, string> = {
      nomEntreprise: validateRequired(recruteur.nomEntreprise, t("register.companyName")),
      nomRepresentant: validateRequired(recruteur.nomRepresentant, t("register.repLastName")),
      prenomRepresentant: validateRequired(recruteur.prenomRepresentant, t("register.repFirstName")),
      email: validateEmail(recruteur.email),
      motDePasse: validatePassword(recruteur.motDePasse),
    };
    setRecruiterTouched((c) => ({ ...c, nomEntreprise: true, nomRepresentant: true, prenomRepresentant: true, email: true, motDePasse: true }));
    setRecruiterErrors((c) => ({ ...c, ...nextErrors }));
    return Object.values(nextErrors).every((v) => !v);
  };

  const validateRecruiterProfile = () => {
    const nextErrors: Record<string, string> = {
      matriculeFiscal: validateRequired(recruteur.matriculeFiscal, t("register.matriculeFiscal")),
      telephone: validatePhone(recruteur.telephone),
      adresse: validateRequired(recruteur.adresse, t("register.adresse")),
    };
    setRecruiterTouched((c) => ({ ...c, matriculeFiscal: true, telephone: true, adresse: true }));
    setRecruiterErrors((c) => ({ ...c, ...nextErrors }));
    return Object.values(nextErrors).every((v) => !v);
  };

  const validateProfileCompletion = () => {
    const nextErrors: Record<string, string> = { telephone: validatePhone(candidat.telephone) };
    setCandidateTouched((c) => ({ ...c, telephone: true, diplome: true, niveauEtude: true }));
    setCandidateErrors((c) => ({ ...c, ...nextErrors }));
    return Object.values(nextErrors).every((v) => !v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (role === "candidat" && stage === "account" && !validateCandidateAccount()) return;
    if (role === "candidat" && stage === "profile" && !validateProfileCompletion()) return;
    if (role === "recruteur" && stage === "account" && !validateRecruiterAccount()) return;
    if (role === "recruteur" && stage === "profile" && !validateRecruiterProfile()) return;

    setLoading(true);
    try {
      if (role === "candidat") {
        if (stage === "account") {
          const created = await api.post<{ id: number }>("/candidats/register", {
            ...candidat, telephone: "", diplome: "", niveauEtude: "", cv: "", lettreMotivation: "", experience: "",
          });
          const { token } = await api.post<{ token: string }>("/auth/candidat", { email: candidat.email, motDePasse: candidat.motDePasse });
          login(token, "candidat");
          setRegisteredCandidateId(created.id);
          setStage("profile");
          setSuccess(t("register.successCandidate"));
          return;
        }
        const candidateId = registeredCandidateId ?? user?.id;
        if (!candidateId) throw new Error(t("register.errorAccountNotFound"));
        await api.put(`/candidats/${candidateId}`, { telephone: candidat.telephone, diplome: candidat.diplome, niveauEtude: candidat.niveauEtude });
        setSuccess(t("register.profileCompleteCandidate"));
        setTimeout(() => navigate("/candidat"), 1200);
      } else {
        if (stage === "account") {
          const created = await api.post<{ id: number }>("/recruteurs/register", {
            ...recruteur, matriculeFiscal: "", telephone: "", adresse: "", description: "",
          });
          const { token } = await api.post<{ token: string }>("/auth/recruteur", { email: recruteur.email, motDePasse: recruteur.motDePasse });
          login(token, "recruteur");
          setRegisteredRecruiterId(created.id);
          setStage("profile");
          setSuccess(t("register.successRecruiter"));
          return;
        }
        const recruiterId = registeredRecruiterId ?? user?.id;
        if (!recruiterId) throw new Error(t("register.errorRecruiterAccountNotFound"));
        await api.put(`/recruteurs/${recruiterId}`, {
          matriculeFiscal: recruteur.matriculeFiscal, telephone: recruteur.telephone, adresse: recruteur.adresse, description: recruteur.description,
        });
        setSuccess(t("register.profileCompleteRecruiter"));
        setTimeout(() => navigate("/recruteur"), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.errorDefault"));
    } finally {
      setLoading(false);
    }
  };

  const candidateStrength = getPasswordStrength(candidat.motDePasse);
  const recruiterStrength = getPasswordStrength(recruteur.motDePasse);
  const profileCompletion = Math.round(([candidat.telephone, candidat.diplome, candidat.niveauEtude].filter((v) => v.trim()).length / 3) * 100);
  const recruiterProfileCompletion = Math.round(([recruteur.matriculeFiscal, recruteur.telephone, recruteur.adresse, recruteur.description].filter((v) => v.trim()).length / 4) * 100);

  const candidateAccountReady = !validateRequired(candidat.nom, t("register.nom"))
    && !validateRequired(candidat.prenom, t("register.prenom"))
    && !validateEmail(candidat.email)
    && !validatePassword(candidat.motDePasse);

  const recruiterAccountReady = !validateRequired(recruteur.nomEntreprise, t("register.companyName"))
    && !validateRequired(recruteur.nomRepresentant, t("register.repLastName"))
    && !validateRequired(recruteur.prenomRepresentant, t("register.repFirstName"))
    && !validateEmail(recruteur.email)
    && !validatePassword(recruteur.motDePasse);

  const recruiterProfileReady = !validateRequired(recruteur.matriculeFiscal, t("register.matriculeFiscal"))
    && !validateRequired(recruteur.adresse, t("register.adresse"))
    && !validatePhone(recruteur.telephone);

  const isReadyToSubmit = role === "candidat"
    ? (stage === "account" ? candidateAccountReady : true)
    : (stage === "account" ? recruiterAccountReady : recruiterProfileReady);

  const heroDesc = role === "candidat" ? t("register.heroDescCandidate") : t("register.heroDescRecruiter");
  const benefit3 = role === "candidat" ? t("register.benefit3Candidate") : t("register.benefit3Recruiter");

  return (
    <div className="min-h-[calc(100svh-var(--navbar-height))] flex items-stretch">
      <div className="hidden lg:flex lg:w-5/12 lg:min-h-[calc(100svh-var(--navbar-height))] bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" aria-hidden="true" />
        <div className="absolute top-24 left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-24 right-12 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12" aria-hidden="true">
            <div className="size-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Link2 className="size-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-white">JobLinker</span>
          </div>
          <h2 className="font-heading text-4xl lg:text-[2.75rem] font-extrabold text-white mb-6 leading-tight">
            {t("register.heroTitle")}
          </h2>
          <p className="text-emerald-100/60 text-lg leading-relaxed max-w-md">
            {heroDesc}
          </p>

          <ul className="mt-12 space-y-4" aria-label="Avantages">
            {[t("register.benefit1"), t("register.benefit2"), benefit3].map((item) => (
              <li key={item} className="flex items-center gap-3 text-emerald-100/80">
                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <CheckCircle2 className="size-3.5 text-emerald-300" />
                </div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full lg:w-7/12 lg:min-h-[calc(100svh-var(--navbar-height))] flex items-start justify-center px-6 py-8 overflow-y-auto bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-lg pt-6 min-h-full flex flex-col">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="size-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Link2 className="size-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold">JobLinker</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center" aria-hidden="true">
              <UserPlus className="size-4 text-emerald-600" />
            </div>
            <h1 className="font-heading text-3xl font-extrabold">{t("register.title")}</h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">{t("register.subtitle")}</p>

          <Tabs value={role} onValueChange={(value) => setRole(value as Role)} className="mb-8">
            <TabsList aria-label={t("register.accountType")}>
              <TabsTrigger value="candidat" className="data-[state=active]:ring-2 data-[state=active]:ring-primary/50 data-[state=active]:ring-offset-1">{t("register.candidate")}</TabsTrigger>
              <TabsTrigger value="recruteur" className="data-[state=active]:ring-2 data-[state=active]:ring-primary/50 data-[state=active]:ring-offset-1">{t("register.recruiter")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {error && <Alert variant="destructive" className="mb-6" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert variant="success" className="mb-6" role="status"><AlertDescription>{success}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {role === "candidat" ? (
              stage === "account" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="required">{t("register.nom")}</Label>
                      <Input id="nom" required aria-required="true" value={candidat.nom} onChange={(e) => updateCandidateField("nom", e.target.value)} onBlur={() => markCandidateField("nom")} placeholder={t("register.nomPlaceholder")} autoComplete="family-name" />
                      <FieldStatus touched={!!candidateTouched.nom} error={candidateErrors.nom || ""} value={candidat.nom} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="required">{t("register.prenom")}</Label>
                      <Input id="prenom" required aria-required="true" value={candidat.prenom} onChange={(e) => updateCandidateField("prenom", e.target.value)} onBlur={() => markCandidateField("prenom")} placeholder={t("register.prenomPlaceholder")} autoComplete="given-name" />
                      <FieldStatus touched={!!candidateTouched.prenom} error={candidateErrors.prenom || ""} value={candidat.prenom} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email" className="required">{t("register.email")}</Label>
                    <Input id="c-email" type="email" required aria-required="true" value={candidat.email} onChange={(e) => updateCandidateField("email", e.target.value)} onBlur={() => markCandidateField("email")} placeholder="votre@email.com" autoComplete="email" />
                    <FieldStatus touched={!!candidateTouched.email} error={candidateErrors.email || ""} value={candidat.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-pass" className="required">{t("register.password")}</Label>
                    <div className="relative">
                      <Input id="c-pass" type={showCandidatePassword ? "text" : "password"} required aria-required="true" minLength={6} value={candidat.motDePasse} onChange={(e) => updateCandidateField("motDePasse", e.target.value)} onBlur={() => markCandidateField("motDePasse")} placeholder={t("register.passwordPlaceholder")} autoComplete="new-password" className="pr-12" />
                      <button type="button" onClick={() => setShowCandidatePassword((c) => !c)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground" aria-label={showCandidatePassword ? t("login.hidePassword") : t("login.showPassword")}>
                        {showCandidatePassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                      </button>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">{t("register.passwordStrength")}</span>
                        <span className="font-semibold text-foreground">{candidateStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className={cn("h-2 rounded-full transition-all duration-200", i < candidateStrength.score ? candidateStrength.score === 1 ? "bg-red-400" : candidateStrength.score === 2 ? "bg-amber-400" : candidateStrength.score === 3 ? "bg-emerald-400" : "bg-teal-500" : "bg-border")} />
                        ))}
                      </div>
                      <FieldStatus touched={!!candidateTouched.motDePasse} error={candidateErrors.motDePasse || ""} value={candidat.motDePasse} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-heading text-lg font-bold text-emerald-950">{t("register.completeProfile")}</p>
                        <p className="text-xs text-emerald-900/70">{t("register.profileHintCandidate")}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{profileCompletion}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style={{ width: `${profileCompletion}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-tel">{t("register.phone")} <span className="font-normal text-muted-foreground">{t("register.optional")}</span></Label>
                    <Input id="c-tel" type="tel" value={candidat.telephone} onChange={(e) => updateCandidateField("telephone", e.target.value)} onBlur={() => markCandidateField("telephone")} placeholder="+216 XX XXX XXX" autoComplete="tel" aria-label={t("register.phone")} />
                    <FieldStatus touched={!!candidateTouched.telephone} error={candidateErrors.telephone || ""} value={candidat.telephone} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="diplome">{t("register.diplome")} <span className="font-normal text-muted-foreground">{t("register.optional")}</span></Label>
                      <Input id="diplome" value={candidat.diplome} onChange={(e) => updateCandidateField("diplome", e.target.value)} onBlur={() => markCandidateField("diplome")} placeholder={t("register.diplomePlaceholder")} autoComplete="organization-title" aria-label={t("register.diplome")} />
                      <FieldStatus touched={!!candidateTouched.diplome} error={candidateErrors.diplome || ""} value={candidat.diplome} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="niveauEtude">{t("register.niveauEtude")} <span className="font-normal text-muted-foreground">{t("register.optional")}</span></Label>
                      <select id="niveauEtude" value={candidat.niveauEtude} onChange={(e) => updateCandidateField("niveauEtude", e.target.value)} onBlur={() => markCandidateField("niveauEtude")} className={selectClass} aria-label={t("register.niveauEtude")}>
                        <option value="">{t("register.select")}</option>
                        <option value="Bac">Bac</option>
                        <option value="Bac+2">Bac+2</option>
                        <option value="Bac+3">Bac+3</option>
                        <option value="Bac+5">Bac+5</option>
                        <option value="Doctorat">Doctorat</option>
                      </select>
                      <FieldStatus touched={!!candidateTouched.niveauEtude} error={candidateErrors.niveauEtude || ""} value={candidat.niveauEtude} />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-900/70">{t("register.profileVisibility")}</p>
                </div>
              )
            ) : stage === "account" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="entreprise" className="required">{t("register.companyName")}</Label>
                  <Input id="entreprise" required aria-required="true" value={recruteur.nomEntreprise} onChange={(e) => updateRecruiterField("nomEntreprise", e.target.value)} onBlur={() => markRecruiterField("nomEntreprise")} placeholder={t("register.companyNamePlaceholder")} autoComplete="organization" />
                  <FieldStatus touched={!!recruiterTouched.nomEntreprise} error={recruiterErrors.nomEntreprise || ""} value={recruteur.nomEntreprise} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="r-rep-nom" className="required">{t("register.repLastName")}</Label>
                    <Input id="r-rep-nom" required aria-required="true" value={recruteur.nomRepresentant} onChange={(e) => updateRecruiterField("nomRepresentant", e.target.value)} onBlur={() => markRecruiterField("nomRepresentant")} placeholder={t("register.nom")} autoComplete="family-name" />
                    <FieldStatus touched={!!recruiterTouched.nomRepresentant} error={recruiterErrors.nomRepresentant || ""} value={recruteur.nomRepresentant} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-rep-prenom" className="required">{t("register.repFirstName")}</Label>
                    <Input id="r-rep-prenom" required aria-required="true" value={recruteur.prenomRepresentant} onChange={(e) => updateRecruiterField("prenomRepresentant", e.target.value)} onBlur={() => markRecruiterField("prenomRepresentant")} placeholder={t("register.prenom")} autoComplete="given-name" />
                    <FieldStatus touched={!!recruiterTouched.prenomRepresentant} error={recruiterErrors.prenomRepresentant || ""} value={recruteur.prenomRepresentant} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-email" className="required">{t("register.email")}</Label>
                  <Input id="r-email" type="email" required aria-required="true" value={recruteur.email} onChange={(e) => updateRecruiterField("email", e.target.value)} onBlur={() => markRecruiterField("email")} placeholder="contact@entreprise.com" autoComplete="email" />
                  <FieldStatus touched={!!recruiterTouched.email} error={recruiterErrors.email || ""} value={recruteur.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-pass" className="required">{t("register.password")}</Label>
                  <div className="relative">
                    <Input id="r-pass" type={showRecruiterPassword ? "text" : "password"} required aria-required="true" minLength={6} value={recruteur.motDePasse} onChange={(e) => updateRecruiterField("motDePasse", e.target.value)} onBlur={() => markRecruiterField("motDePasse")} placeholder={t("register.passwordPlaceholder")} autoComplete="new-password" className="pr-12" />
                    <button type="button" onClick={() => setShowRecruiterPassword((c) => !c)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground" aria-label={showRecruiterPassword ? t("login.hidePassword") : t("login.showPassword")}>
                      {showRecruiterPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                  <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">{t("register.passwordStrength")}</span>
                      <span className="font-semibold text-foreground">{recruiterStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={cn("h-2 rounded-full transition-all duration-200", i < recruiterStrength.score ? recruiterStrength.score === 1 ? "bg-red-400" : recruiterStrength.score === 2 ? "bg-amber-400" : recruiterStrength.score === 3 ? "bg-emerald-400" : "bg-teal-500" : "bg-border")} />
                      ))}
                    </div>
                    <FieldStatus touched={!!recruiterTouched.motDePasse} error={recruiterErrors.motDePasse || ""} value={recruteur.motDePasse} />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-heading text-lg font-bold text-emerald-950">{t("register.completeProfile")}</p>
                      <p className="text-xs text-emerald-900/70">{t("register.profileHintRecruiter")}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{recruiterProfileCompletion}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style={{ width: `${recruiterProfileCompletion}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricule" className="required">{t("register.matriculeFiscal")}</Label>
                    <Input id="matricule" required aria-required="true" value={recruteur.matriculeFiscal} onChange={(e) => updateRecruiterField("matriculeFiscal", e.target.value)} onBlur={() => markRecruiterField("matriculeFiscal")} placeholder={t("register.matriculeFiscal")} autoComplete="off" aria-label={t("register.matriculeFiscal")} />
                    <FieldStatus touched={!!recruiterTouched.matriculeFiscal} error={recruiterErrors.matriculeFiscal || ""} value={recruteur.matriculeFiscal} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-tel">{t("register.phone")} <span className="font-normal text-muted-foreground">{t("register.optional")}</span></Label>
                    <Input id="r-tel" type="tel" value={recruteur.telephone} onChange={(e) => updateRecruiterField("telephone", e.target.value)} onBlur={() => markRecruiterField("telephone")} placeholder="+216 XX XXX XXX" autoComplete="tel" aria-label={t("register.phone")} />
                    <FieldStatus touched={!!recruiterTouched.telephone} error={recruiterErrors.telephone || ""} value={recruteur.telephone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adresse" className="required">{t("register.adresse")}</Label>
                    <Input id="adresse" required aria-required="true" value={recruteur.adresse} onChange={(e) => updateRecruiterField("adresse", e.target.value)} onBlur={() => markRecruiterField("adresse")} placeholder={t("register.adresse")} autoComplete="street-address" aria-label={t("register.adresse")} />
                    <FieldStatus touched={!!recruiterTouched.adresse} error={recruiterErrors.adresse || ""} value={recruteur.adresse} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">{t("register.description")}</Label>
                  <Textarea id="desc" rows={3} value={recruteur.description} onChange={(e) => updateRecruiterField("description", e.target.value)} placeholder={t("register.descriptionPlaceholder")} aria-label={t("register.description")} />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {[
                    { initials: "SM", color: "bg-emerald-500" },
                    { initials: "NB", color: "bg-sky-500" },
                    { initials: "AR", color: "bg-amber-500" },
                    { initials: "YM", color: "bg-violet-500" },
                  ].map((avatar) => (
                    <div key={avatar.initials} className={cn("size-8 rounded-full border-2 border-white text-[10px] font-bold text-white grid place-items-center", avatar.color)}>
                      {avatar.initials}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-foreground">{t("register.joinProfessionals")}</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="success"
              className={cn("w-full h-12", isReadyToSubmit && !loading && "animate-pulse-soft shadow-[0_0_0_3px_rgba(16,185,129,0.2)]")}
              size="lg"
            >
              {loading ? t("register.creating") : (
                <>
                  {stage === "profile" ? t("register.completeMyProfile") : t("register.createAccount")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>

            {stage === "account" && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                {t("register.termsNotice")}
              </p>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-auto pt-4 pb-4">
            {t("register.hasAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">{t("register.loginLink")}</Link>
          </p>

          <p className="pb-4 text-center text-xs text-muted-foreground">
            &copy; 2026 JobLinker{" "}
            <Link to="/conditions-utilisation" className="hover:text-foreground hover:underline">{t("common.terms")}</Link>
            {" · "}
            <Link to="/politique-confidentialite" className="hover:text-foreground hover:underline">{t("common.privacy")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

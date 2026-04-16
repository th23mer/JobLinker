export type Language = "fr" | "en";

export const translations: Record<string, Record<Language, string>> = {
  // App
  "app.skipToContent": { fr: "Aller au contenu principal", en: "Skip to main content" },

  // Navbar
  "nav.subtitle": { fr: "Plateforme de recrutement", en: "Recruitment Platform" },
  "nav.offers": { fr: "Offres d'emploi", en: "Job Offers" },
  "nav.dashboard": { fr: "Dashboard", en: "Dashboard" },
  "nav.logout": { fr: "Deconnexion", en: "Log out" },
  "nav.login": { fr: "Connexion", en: "Sign in" },
  "nav.register": { fr: "S'inscrire", en: "Sign up" },
  "nav.switchLang": { fr: "English", en: "Francais" },

  // Footer
  "footer.description": {
    fr: "La plateforme de recrutement qui connecte les talents aux meilleures opportunites professionnelles en Tunisie.",
    en: "The recruitment platform connecting talent to the best professional opportunities in Tunisia.",
  },
  "footer.navigation": { fr: "Navigation", en: "Navigation" },
  "footer.home": { fr: "Accueil", en: "Home" },
  "footer.offers": { fr: "Offres d'emploi", en: "Job Offers" },
  "footer.candidateSpace": { fr: "Espace candidat", en: "Candidate Space" },
  "footer.recruiterSpace": { fr: "Espace recruteur", en: "Recruiter Space" },
  "footer.help": { fr: "Aide", en: "Help" },
  "footer.support": { fr: "Aide & Support", en: "Help & Support" },
  "footer.faq": { fr: "FAQ", en: "FAQ" },
  "footer.terms": { fr: "Conditions d'utilisation", en: "Terms of Use" },
  "footer.privacy": { fr: "Confidentialite", en: "Privacy" },
  "footer.rights": { fr: "Tous droits reserves.", en: "All rights reserved." },

  // Login
  "login.title": { fr: "Connexion", en: "Sign In" },
  "login.subtitle": { fr: "Accedez a votre espace personnel", en: "Access your personal space" },
  "login.heroTitle": { fr: "Accedez a des milliers d'opportunites", en: "Access thousands of opportunities" },
  "login.heroDesc": {
    fr: "Connectez-vous pour retrouver vos candidatures, gerer vos offres ou administrer la plateforme.",
    en: "Sign in to find your applications, manage your offers, or administer the platform.",
  },
  "login.professionals": { fr: "professionnels inscrits", en: "registered professionals" },
  "login.email": { fr: "Adresse email", en: "Email address" },
  "login.emailPlaceholder": { fr: "votre@email.com", en: "your@email.com" },
  "login.emailInvalid": { fr: "Format invalide - ex: nom@domaine.com", en: "Invalid format - e.g. name@domain.com" },
  "login.password": { fr: "Mot de passe", en: "Password" },
  "login.passwordPlaceholder": { fr: "Votre mot de passe", en: "Your password" },
  "login.showPassword": { fr: "Afficher le mot de passe", en: "Show password" },
  "login.hidePassword": { fr: "Masquer le mot de passe", en: "Hide password" },
  "login.forgot": { fr: "Mot de passe oublie ?", en: "Forgot password?" },
  "login.forgotLoading": { fr: "Envoi en cours...", en: "Sending..." },
  "login.submit": { fr: "Se connecter", en: "Sign in" },
  "login.loading": { fr: "Connexion en cours...", en: "Signing in..." },
  "login.noAccount": { fr: "Pas encore de compte ?", en: "No account yet?" },
  "login.registerLink": { fr: "S'inscrire gratuitement", en: "Sign up for free" },
  "login.candidate": { fr: "Candidat", en: "Candidate" },
  "login.recruiter": { fr: "Recruteur", en: "Recruiter" },
  "login.errorDefault": {
    fr: "Erreur de connexion. Verifiez vos identifiants et reessayez.",
    en: "Login error. Check your credentials and try again.",
  },
  "login.resetError": {
    fr: "Impossible d'envoyer l'email de reinitialisation.",
    en: "Unable to send reset email.",
  },

  // Register
  "register.title": { fr: "Inscription", en: "Sign Up" },
  "register.subtitle": { fr: "Creez votre compte en quelques minutes", en: "Create your account in minutes" },
  "register.heroTitle": { fr: "Commencez votre aventure professionnelle", en: "Start your professional journey" },
  "register.heroDescCandidate": {
    fr: "Creez votre profil candidat et accedez a des milliers d'offres d'emploi.",
    en: "Create your candidate profile and access thousands of job offers.",
  },
  "register.heroDescRecruiter": {
    fr: "Publiez vos offres et trouvez les meilleurs talents pour votre entreprise.",
    en: "Post your offers and find the best talent for your company.",
  },
  "register.benefit1": { fr: "Inscription gratuite et rapide", en: "Free and fast registration" },
  "register.benefit2": { fr: "Acces immediat a la plateforme", en: "Immediate platform access" },
  "register.benefit3Candidate": { fr: "Postulez en quelques clics", en: "Apply in a few clicks" },
  "register.benefit3Recruiter": { fr: "Publiez des offres illimitees", en: "Post unlimited offers" },
  "register.candidate": { fr: "Candidat", en: "Candidate" },
  "register.recruiter": { fr: "Recruteur", en: "Recruiter" },
  "register.accountType": { fr: "Type de compte", en: "Account type" },
  "register.nom": { fr: "Nom", en: "Last name" },
  "register.nomPlaceholder": { fr: "Votre nom", en: "Your last name" },
  "register.prenom": { fr: "Prenom", en: "First name" },
  "register.prenomPlaceholder": { fr: "Votre prenom", en: "Your first name" },
  "register.email": { fr: "Email", en: "Email" },
  "register.password": { fr: "Mot de passe", en: "Password" },
  "register.passwordPlaceholder": { fr: "Minimum 6 caracteres", en: "Minimum 6 characters" },
  "register.passwordStrength": { fr: "Force du mot de passe", en: "Password strength" },
  "register.companyName": { fr: "Nom de l'entreprise", en: "Company name" },
  "register.companyNamePlaceholder": { fr: "Nom de l'entreprise", en: "Company name" },
  "register.repLastName": { fr: "Nom du representant", en: "Representative last name" },
  "register.repFirstName": { fr: "Prenom du representant", en: "Representative first name" },
  "register.completeProfile": { fr: "Completer votre profil (2 min)", en: "Complete your profile (2 min)" },
  "register.profileHintCandidate": {
    fr: "Telephone, diplome et niveau d'etude pour rendre votre compte plus visible.",
    en: "Phone, degree, and education level to make your account more visible.",
  },
  "register.profileHintRecruiter": {
    fr: "Ajoutez vos informations d'entreprise pour renforcer votre credibilite.",
    en: "Add your company information to strengthen your credibility.",
  },
  "register.phone": { fr: "Telephone", en: "Phone" },
  "register.optional": { fr: "(Optionnel)", en: "(Optional)" },
  "register.diplome": { fr: "Diplome", en: "Degree" },
  "register.diplomePlaceholder": { fr: "Ex: Licence Info", en: "E.g. BSc CS" },
  "register.niveauEtude": { fr: "Niveau d'etude", en: "Education level" },
  "register.select": { fr: "Selectionner", en: "Select" },
  "register.profileVisibility": {
    fr: "Votre profil sera plus complet et plus visible pour les recruteurs.",
    en: "Your profile will be more complete and more visible to recruiters.",
  },
  "register.matriculeFiscal": { fr: "Matricule fiscal", en: "Tax ID" },
  "register.adresse": { fr: "Adresse", en: "Address" },
  "register.description": { fr: "Description", en: "Description" },
  "register.descriptionPlaceholder": {
    fr: "Decrivez votre entreprise en quelques mots...",
    en: "Describe your company in a few words...",
  },
  "register.joinProfessionals": { fr: "Rejoignez +50K professionnels inscrits", en: "Join 50K+ registered professionals" },
  "register.createAccount": { fr: "Creer mon compte", en: "Create my account" },
  "register.completeMyProfile": { fr: "Completer mon profil", en: "Complete my profile" },
  "register.creating": { fr: "Creation du compte...", en: "Creating account..." },
  "register.termsNotice": {
    fr: "En creant un compte, vous acceptez nos Conditions d'utilisation. Vos donnees ne sont jamais vendues.",
    en: "By creating an account, you accept our Terms of Use. Your data is never sold.",
  },
  "register.hasAccount": { fr: "Deja un compte ?", en: "Already have an account?" },
  "register.loginLink": { fr: "Se connecter", en: "Sign in" },
  "register.fieldValid": { fr: "Champ valide", en: "Field valid" },
  "register.successCandidate": {
    fr: "Compte cree avec succes. Completez votre profil (2 min).",
    en: "Account created successfully. Complete your profile (2 min).",
  },
  "register.successRecruiter": {
    fr: "Compte recruteur cree avec succes. Completez votre profil (2 min).",
    en: "Recruiter account created successfully. Complete your profile (2 min).",
  },
  "register.profileCompleteCandidate": {
    fr: "Profil complete avec succes ! Redirection vers votre espace...",
    en: "Profile completed successfully! Redirecting to your space...",
  },
  "register.profileCompleteRecruiter": {
    fr: "Profil recruteur complete avec succes ! Redirection vers votre espace...",
    en: "Recruiter profile completed successfully! Redirecting to your space...",
  },
  "register.errorDefault": {
    fr: "Erreur lors de l'inscription. Verifiez vos informations et reessayez.",
    en: "Registration error. Check your information and try again.",
  },
  "register.errorAccountNotFound": {
    fr: "Impossible de retrouver votre compte. Reconnectez-vous puis terminez le profil.",
    en: "Unable to find your account. Sign in again and complete your profile.",
  },
  "register.errorRecruiterAccountNotFound": {
    fr: "Impossible de retrouver votre compte recruteur. Reconnectez-vous puis terminez le profil.",
    en: "Unable to find your recruiter account. Sign in again and complete your profile.",
  },

  // Validation
  "validation.emailRequired": { fr: "L'email est obligatoire.", en: "Email is required." },
  "validation.emailInvalid": { fr: "Format email invalide - ex: nom@domaine.com", en: "Invalid email format - e.g. name@domain.com" },
  "validation.passwordRequired": { fr: "Le mot de passe est obligatoire.", en: "Password is required." },
  "validation.passwordTooShort": { fr: "Mot de passe trop court - 6 caracteres minimum.", en: "Password too short - 6 characters minimum." },
  "validation.passwordWeak": {
    fr: "Mot de passe faible - ajoutez majuscule, chiffre ou caractere special.",
    en: "Weak password - add uppercase, digit, or special character.",
  },
  "validation.phoneInvalid": { fr: "Format telephone invalide - ex: +216 71 123 456", en: "Invalid phone format - e.g. +216 71 123 456" },
  "validation.required": { fr: "est obligatoire.", en: "is required." },
  "validation.strengthWeak": { fr: "Faible", en: "Weak" },
  "validation.strengthMedium": { fr: "Moyen", en: "Medium" },
  "validation.strengthStrong": { fr: "Fort", en: "Strong" },
  "validation.strengthVeryStrong": { fr: "Tres fort", en: "Very strong" },

  // Offres
  "offres.explore": { fr: "Explorez", en: "Explore" },
  "offres.title": { fr: "Offres d'emploi", en: "Job Offers" },
  "offres.loading": { fr: "Chargement...", en: "Loading..." },
  "offres.available": { fr: "disponible", en: "available" },
  "offres.availablePlural": { fr: "disponibles", en: "available" },
  "offres.offer": { fr: "offre", en: "offer" },
  "offres.offerPlural": { fr: "offres", en: "offers" },
  "offres.searchPlaceholder": { fr: "Rechercher par titre de poste...", en: "Search by job title..." },
  "offres.filters": { fr: "Filtres", en: "Filters" },
  "offres.advancedFilters": { fr: "Filtres avances", en: "Advanced Filters" },
  "offres.reset": { fr: "Reinitialiser", en: "Reset" },
  "offres.category": { fr: "Categorie", en: "Category" },
  "offres.contract": { fr: "Contrat", en: "Contract" },
  "offres.city": { fr: "Ville", en: "City" },
  "offres.cityPlaceholder": { fr: "Ex: Tunis", en: "E.g. Tunis" },
  "offres.level": { fr: "Niveau", en: "Level" },
  "offres.allF": { fr: "Toutes", en: "All" },
  "offres.allM": { fr: "Tous", en: "All" },
  "offres.search": { fr: "Rechercher", en: "Search" },
  "offres.noResults": { fr: "Aucune offre trouvee", en: "No offers found" },
  "offres.noResultsDesc": {
    fr: "Essayez de modifier vos criteres de recherche ou explorez toutes les offres.",
    en: "Try changing your search criteria or browse all offers.",
  },
  "offres.seeAll": { fr: "Voir toutes les offres", en: "See all offers" },
  "offres.noDescription": { fr: "Pas de description disponible", en: "No description available" },

  // OffreDetail
  "detail.back": { fr: "Retour aux offres", en: "Back to offers" },
  "detail.description": { fr: "Description du poste", en: "Job Description" },
  "detail.requirements": { fr: "Exigences", en: "Requirements" },
  "detail.apply": { fr: "Postuler maintenant", en: "Apply now" },
  "detail.yourApplication": { fr: "Votre candidature", en: "Your Application" },
  "detail.cv": { fr: "CV (PDF)", en: "Resume (PDF)" },
  "detail.defaultCv": { fr: "Utiliser mon CV par defaut", en: "Use my default resume" },
  "detail.viewCv": { fr: "Voir le CV", en: "View resume" },
  "detail.newCv": { fr: "Televerser un nouveau CV", en: "Upload a new resume" },
  "detail.coverLetter": { fr: "Lettre de motivation", en: "Cover Letter" },
  "detail.coverLetterPlaceholder": {
    fr: "Expliquez pourquoi vous etes le candidat ideal...",
    en: "Explain why you are the ideal candidate...",
  },
  "detail.cancel": { fr: "Annuler", en: "Cancel" },
  "detail.send": { fr: "Envoyer ma candidature", en: "Send my application" },
  "detail.sending": { fr: "Envoi en cours...", en: "Sending..." },
  "detail.success": { fr: "Candidature envoyee avec succes !", en: "Application sent successfully!" },
  "detail.errorNoCv": { fr: "Veuillez selectionner un fichier PDF.", en: "Please select a PDF file." },
  "detail.errorNoDefaultCv": { fr: "Aucun CV par defaut. Veuillez en televerser un.", en: "No default resume. Please upload one." },
  "detail.errorGeneric": {
    fr: "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez verifier vos informations et reessayer.",
    en: "An error occurred while sending your application. Please check your information and try again.",
  },
  "detail.loginPrompt": {
    fr: "Connectez-vous en tant que candidat pour postuler a cette offre.",
    en: "Sign in as a candidate to apply for this offer.",
  },
  "detail.loginLink": { fr: "Connectez-vous", en: "Sign in" },

  // Faqs
  "faqs.title": { fr: "FAQ", en: "FAQ" },
  "faqs.subtitle": { fr: "Questions frequentes et assistance rapide.", en: "Frequently asked questions and quick help." },
  "faqs.back": { fr: "Retour", en: "Back" },

  // Landing - Hero
  "landing.trustBadge": { fr: "Recrutement plus rapide, plus clair, plus fiable", en: "Faster, clearer, more reliable hiring" },
  "landing.modeRecruiter": { fr: "Mode recruteur", en: "Recruiter mode" },
  "landing.modeCandidate": { fr: "Mode candidat", en: "Candidate mode" },
  "landing.audienceQuestion": { fr: "Quel est votre objectif ?", en: "What brings you here?" },
  "landing.audienceCandidate": { fr: "Je cherche un emploi", en: "I am looking for a job" },
  "landing.audienceRecruiter": { fr: "Je recrute", en: "I am hiring" },
  "landing.searchLabel": { fr: "Recherche d'offres", en: "Job search" },
  "landing.searchPlaceholder": { fr: "Rechercher un metier, une ville, un contrat...", en: "Search by role, city, or contract..." },
  "landing.discoverCandidate": { fr: "Decouvrir les offres", en: "Discover jobs" },
  "landing.discoverRecruiter": { fr: "Commencer a recruter", en: "Start recruiting" },
  "landing.browseCandidate": { fr: "Parcourir sans compte", en: "Browse without account" },
  "landing.browseRecruiter": { fr: "Acceder a l'espace recruteur", en: "Open recruiter space" },
  "landing.startFree": { fr: "Commencer gratuitement", en: "Get started for free" },
  "landing.previewHint": { fr: "Apercu d'une offre populaire", en: "Preview a trending job" },
  "landing.previewTitle": { fr: "Offres qui donnent envie de cliquer", en: "Jobs that make users click" },
  "landing.liveBadge": { fr: "En direct", en: "Live" },
  "landing.activityLabel": {
    fr: "Activite en temps reel sur les meilleures opportunites du jour",
    en: "Real-time activity on today's top opportunities",
  },
  "landing.viewOffer": { fr: "Voir l'offre", en: "View job" },
  "landing.partners": { fr: "Ils nous font confiance", en: "They trust us" },
  "landing.autoRefresh": {
    fr: "Actualisation automatique des annonces les plus vues toutes les quelques secondes.",
    en: "Automatic refresh of the most viewed listings every few seconds.",
  },

  // Landing - Features
  "landing.featuresWhy": { fr: "Pourquoi choisir", en: "Why choose" },
  "landing.featuresTitle": {
    fr: "Une experience concue pour convertir sans friction",
    en: "An experience designed to convert without friction",
  },
  "landing.featuresDesc": {
    fr: "Moins d'effort, plus de pertinence, et une progression naturelle vers l'action.",
    en: "Less effort, more relevance, and a natural progression toward action.",
  },

  // Landing - Flow
  "landing.flowBadge": { fr: "User flow", en: "User flow" },
  "landing.flowTitle": {
    fr: "Chercher, filtrer, previsualiser, postuler",
    en: "Search, filter, preview, apply",
  },
  "landing.flowDesc": {
    fr: "L'utilisateur doit voir la valeur immediatement: une recherche claire, des filtres rapides, puis un apercu d'offre avant l'ouverture du detail.",
    en: "Users should see the value immediately: a clear search, fast filters, then an offer preview before opening the details.",
  },
  "landing.flowCard1Title": { fr: "Recherche visible", en: "Visible search" },
  "landing.flowCard1Desc": {
    fr: "Placez la recherche en haut de la page offres et repetez-la dans le hero.",
    en: "Place search at the top of the offers page and repeat it in the hero.",
  },
  "landing.flowCard2Title": { fr: "Filtres rapides", en: "Quick filters" },
  "landing.flowCard2Desc": {
    fr: "Chips de filtres instantanes pour reduire le temps de navigation.",
    en: "Instant filter chips to reduce browsing time.",
  },
  "landing.flowCard3Title": { fr: "Apercu d'offre", en: "Offer preview" },
  "landing.flowCard3Desc": {
    fr: "Afficher les donnees cles avant la page detail pour aider la decision.",
    en: "Show key data before the detail page to help decision-making.",
  },
  "landing.flowCard4Title": { fr: "Preuve sociale", en: "Social proof" },
  "landing.flowCard4Desc": {
    fr: "Montrer qu'une vraie communaute active utilise deja la plateforme.",
    en: "Show that a real active community already uses the platform.",
  },

  // Landing - Confidentiality
  "landing.confidentialityQ": {
    fr: "Mes candidatures restent-elles confidentielles ?",
    en: "Are my applications kept confidential?",
  },
  "landing.confidentialityA": {
    fr: "Oui. Les informations partagees servent uniquement au processus de recrutement et sont protegees pour limiter la diffusion non desiree de vos donnees.",
    en: "Yes. Shared information is used solely for the recruitment process and is protected to limit unwanted distribution of your data.",
  },

  // Landing - Social Proof
  "landing.credibility": { fr: "Credibilite", en: "Credibility" },
  "landing.socialProofTitle": {
    fr: "Les utilisateurs veulent de la confiance avant le clic",
    en: "Users want trust before they click",
  },
  "landing.socialProofDesc": {
    fr: "Rendez la plateforme rassurante avec des chiffres precis, des visages reels et des retours concrets.",
    en: "Make the platform reassuring with precise numbers, real faces, and concrete feedback.",
  },
  "landing.socialProofRating": { fr: "4.8/5 sur 120+ avis", en: "4.8/5 on 120+ reviews" },
  "landing.socialProofUsers": {
    fr: "Plus de <strong>50K</strong> profils inscrits et des recruteurs qui reviennent chaque semaine.",
    en: "More than <strong>50K</strong> registered profiles and recruiters coming back every week.",
  },
  "landing.socialProofStat1": { fr: "utilisateurs inscrits", en: "registered users" },
  "landing.socialProofStat2": { fr: "note moyenne", en: "average rating" },

  // Landing - FAQ
  "landing.faqBadge": { fr: "FAQ", en: "FAQ" },
  "landing.faqTitle": {
    fr: "Les dernieres questions avant de passer a l'action",
    en: "Last questions before taking action",
  },
  "landing.faqDesc": {
    fr: "Repondre aux objections au bon moment reduit la friction juste avant la conversion.",
    en: "Answering objections at the right time reduces friction just before conversion.",
  },

  // Landing - Final CTA
  "landing.ctaTimeline": { fr: "Creez votre compte en quelques minutes", en: "Create your account in minutes" },
  "landing.ctaTitle": {
    fr: "Ne laissez pas la bonne opportunite passer.",
    en: "Don't let the right opportunity pass.",
  },
  "landing.ctaDesc": {
    fr: "Inscription gratuite, rapide et sans engagement. Commencez maintenant et accedez aux offres qui correspondent vraiment a votre profil.",
    en: "Free, fast, and no-commitment registration. Start now and access offers that truly match your profile.",
  },
  "landing.ctaButton": { fr: "Commencer gratuitement", en: "Get started for free" },
  "landing.ctaExplore": { fr: "Explorer les offres", en: "Explore offers" },
  "landing.ctaFootnote": {
    fr: "Recruteurs verifies, donnees protegees et possibilite d'annuler a tout moment.",
    en: "Verified recruiters, protected data, and cancel anytime.",
  },

  // Landing - Hero stats
  "landing.statProfiles": { fr: "profils inscrits", en: "registered profiles" },
  "landing.statCompanies": { fr: "entreprises actives", en: "active companies" },
  "landing.statRating": { fr: "note moyenne", en: "average rating" },

  // Landing - Open offer preview
  "landing.openOffer": { fr: "Offre ouverte", en: "Open offer" },
  "landing.viewThisOffer": { fr: "Voir cette offre", en: "View this offer" },

  // Common
  "common.terms": { fr: "Conditions d'utilisation", en: "Terms of Use" },
  "common.privacy": { fr: "Confidentialite", en: "Privacy" },

  // CandidatDashboard (flat keys used by remote branch)
  "bonjour": { fr: "Bonjour", en: "Hello" },
  "gererCandidatures": { fr: "Gerez vos candidatures et votre profil depuis votre espace personnel.", en: "Manage your applications and profile from your personal space." },
  "mesCandidatures": { fr: "Mes candidatures", en: "My Applications" },
  "monProfil": { fr: "Mon profil", en: "My Profile" },
  "aucuneCandidature": { fr: "Aucune candidature", en: "No applications" },
  "parcourezOffres": { fr: "Parcourez les offres et postulez pour commencer votre parcours.", en: "Browse job offers and apply to start your journey." },
  "voirOffres": { fr: "Voir les offres", en: "View offers" },
  "infoPersonnelles": { fr: "Informations personnelles", en: "Personal Information" },
  "nom": { fr: "Nom", en: "Name" },
  "prenom": { fr: "Prenom", en: "First Name" },
  "email": { fr: "Email", en: "Email" },
  "telephone": { fr: "Telephone", en: "Phone" },
  "diplome": { fr: "Diplome", en: "Degree" },
  "niveauEtude": { fr: "Niveau d'etude", en: "Education Level" },
  "experience": { fr: "Experience", en: "Experience" },
  "lettreMotivation": { fr: "Lettre de motivation", en: "Cover Letter" },
  "monCv": { fr: "Mon CV (PDF)", en: "My Resume (PDF)" },
  "aucunCv": { fr: "Aucun CV enregistre.", en: "No resume on file." },
  "voirCv": { fr: "Voir mon CV", en: "View my resume" },
  "remplacerCv": { fr: "Remplacer le CV", en: "Replace resume" },
  "ajouterCv": { fr: "Ajouter un CV", en: "Add resume" },
  "envoi": { fr: "Envoi...", en: "Sending..." },
  "modifierProfil": { fr: "Modifier le profil", en: "Edit profile" },
  "candidatureAcceptee": { fr: "Acceptee", en: "Accepted" },
  "candidatureEnAttente": { fr: "En attente", en: "Pending" },
  "candidatureRefusee": { fr: "Refusee", en: "Rejected" },
  "profilSauvegarde": { fr: "Profil sauvegarde avec succes.", en: "Profile saved successfully." },
  "erreurSauvegarde": { fr: "Erreur lors de la sauvegarde. Veuillez reessayer.", en: "Error saving profile. Please try again." },
  "total": { fr: "Total", en: "Total" },
  "acceptees": { fr: "Acceptees", en: "Accepted" },
  "presentezBrievement": { fr: "Presentez-vous brievement...", en: "Tell us about yourself..." },
  "sauvegarder": { fr: "Sauvegarder", en: "Save" },
  "sauvegarde": { fr: "Sauvegarde...", en: "Saving..." },
  "annuler": { fr: "Annuler", en: "Cancel" },
};

// --- Array-based translations (for lists that vary by language) ---

export function getHeroContent(language: Language) {
  const content = {
    candidate: {
      benefit: {
        fr: {
          headline: "Des offres pertinentes en quelques clics",
          description: "JobLinker aide les candidats a trouver plus vite les bonnes opportunites et a postuler sans friction, avec des entreprises verifiees et des filtres utiles.",
        },
        en: {
          headline: "Relevant jobs in just a few clicks",
          description: "JobLinker helps candidates find better opportunities faster and apply with less friction, through verified employers and practical filters.",
        },
      },
      action: {
        fr: {
          headline: "Trouvez votre prochain emploi en Tunisie — en moins de 24h.",
          description: "Passez de la recherche a l'action en quelques clics, avec des offres locales, claires et vraiment adaptees a votre profil.",
        },
        en: {
          headline: "Find your next job in Tunisia in under 24 hours.",
          description: "Move from search to action in a few clicks with local, clear opportunities that match your profile.",
        },
      },
    },
    recruiter: {
      benefit: {
        fr: {
          headline: "Des talents qualifies en 24h",
          description: "JobLinker aide les recruteurs a publier plus vite, a recevoir des profils plus cibles et a accelerer chaque prise de contact.",
        },
        en: {
          headline: "Qualified talent within 24 hours",
          description: "JobLinker helps recruiters publish faster, receive better-targeted profiles, and speed up first contact.",
        },
      },
      action: {
        fr: {
          headline: "Trouvez votre prochain talent en Tunisie — en moins de 24h.",
          description: "Publiez une offre, recevez des candidatures ciblees et reduisez le delai entre le besoin et le premier contact utile.",
        },
        en: {
          headline: "Find your next hire in Tunisia in under 24 hours.",
          description: "Publish a job, receive targeted applications, and reduce time to first meaningful contact.",
        },
      },
    },
  } as const;

  return (audience: "candidate" | "recruiter", variant: "benefit" | "action") =>
    content[audience][variant][language];
}

export function getCandidateFeatureCards(language: Language) {
  if (language === "en") {
    return [
      { title: "Relevance-based search", desc: "Find offers truly suited to your profile with fast, precise filters." },
      { title: "Verified recruiters", desc: "Apply only to listings from credible, active companies." },
      { title: "Simplified application", desc: "Send your profile in a few clicks without friction or endless forms." },
      { title: "Transparent tracking", desc: "Stay in control of your applications and see their status in real time." },
      { title: "Clear recruiter space", desc: "Post, sort, and track applications from a dashboard designed for speed." },
    ];
  }
  return [
    { title: "Recherche par pertinence", desc: "Trouvez des offres reellement adaptees a votre profil grace a des filtres rapides et precis." },
    { title: "Recruteurs verifies", desc: "Postulez uniquement sur des annonces publiees par des entreprises credibles et actives." },
    { title: "Candidature simplifiee", desc: "Envoyez votre profil en quelques clics sans friction ni formulaires interminables." },
    { title: "Suivi transparent", desc: "Gardez le controle sur vos candidatures et voyez leur statut en temps reel." },
    { title: "Espace recruteur clair", desc: "Publiez, triez et suivez les candidatures depuis un tableau de bord concu pour agir vite." },
  ];
}

export function getRecruiterFeatureCards(language: Language) {
  if (language === "en") {
    return [
      { title: "Quick publishing", desc: "Post your offers in minutes with a clear, conversion-oriented form." },
      { title: "More reliable profiles", desc: "Receive better-targeted applications with structured, verified information." },
      { title: "Progress tracking", desc: "Visualize application status and speed up decision-making with a single view." },
      { title: "Simplified sorting", desc: "Quickly evaluate profiles with a uniform, readable application format." },
      { title: "Talent pipeline", desc: "Build a continuous talent flow to reduce time between need and hire." },
    ];
  }
  return [
    { title: "Publication rapide", desc: "Diffusez vos offres en quelques minutes avec un formulaire clair et oriente conversion." },
    { title: "Profils plus fiables", desc: "Recevez des candidatures mieux ciblees grace a des informations structurees et verifiees." },
    { title: "Suivi d'avancement", desc: "Visualisez l'etat des candidatures et accelerez la prise de decision avec une vue unique." },
    { title: "Tri simplifie", desc: "Evaluez rapidement les profils grace a un format de candidature homogene et lisible." },
    { title: "Pipeline talent", desc: "Constituez un flux de talents continu pour reduire le delai entre besoin et embauche." },
  ];
}

export function getSteps(language: Language) {
  if (language === "en") {
    return [
      { step: "01", title: "Search quickly", desc: "Type a job, city, or contract and find useful offers immediately." },
      { step: "02", title: "Preview before clicking", desc: "Check essential details of an offer before opening the full listing." },
      { step: "03", title: "Apply without friction", desc: "Send your application keeping a simple, fast, and reassuring experience." },
    ];
  }
  return [
    { step: "01", title: "Cherchez rapidement", desc: "Tapez un metier, une ville ou un contrat et trouvez des offres utiles immediatement." },
    { step: "02", title: "Previsualisez avant de cliquer", desc: "Consultez les details essentiels d'une offre avant d'ouvrir la fiche complete." },
    { step: "03", title: "Postulez sans friction", desc: "Envoyez votre candidature en gardant une experience simple, rapide et rassurante." },
  ];
}

export function getLandingFaqItems(language: Language) {
  if (language === "en") {
    return [
      { question: "Can I browse offers without creating an account?", answer: "Yes. You can explore offers and filter results freely. An account is useful when you want to apply, track applications, or save searches." },
      { question: "How do you know if a company is verified?", answer: "Recruiters are checked via their contact information, activity, and listing consistency. The goal is to reduce unreliable listings and duplicates." },
      { question: "Is the platform suitable for both candidates and recruiters?", answer: "Yes. The landing page adapts its message based on arrival context, then navigation is designed for both paths: finding an offer or posting a recruitment need." },
      { question: "How long does it take to apply?", answer: "In practice, a few clicks are enough for offers matching your profile. The goal is to eliminate unnecessary steps and speed up action." },
      { question: "Can I come back later to finish an application?", answer: "Yes, you can resume your journey later without losing the main search and selection context." },
    ];
  }
  return [
    { question: "Puis-je parcourir les offres sans creer de compte ?", answer: "Oui. Vous pouvez explorer les offres et filtrer les resultats librement. Le compte devient utile quand vous voulez postuler, suivre vos candidatures ou enregistrer vos recherches." },
    { question: "Comment savez-vous si une entreprise est verifiee ?", answer: "Les recruteurs sont controles via leurs informations de contact, leur activite et la coherence de leurs annonces. L'objectif est de reduire les annonces peu fiables et les doublons." },
    { question: "La plateforme est-elle adaptee aux candidats et aux recruteurs ?", answer: "Oui. La landing adapte son message selon le contexte d'arrivee, puis la navigation reste pensee pour les deux parcours: trouver une offre ou publier un besoin de recrutement." },
    { question: "Combien de temps faut-il pour postuler ?", answer: "En pratique, quelques clics suffisent pour les offres qui correspondent a votre profil. L'objectif est d'eliminer les etapes inutiles et d'accelerer le passage a l'action." },
    { question: "Puis-je revenir plus tard pour terminer une candidature ?", answer: "Oui, vous pouvez reprendre votre parcours plus tard sans perdre le contexte principal de recherche et de selection." },
  ];
}

export function getTestimonials(language: Language) {
  if (language === "en") {
    return [
      { quote: "I found relevant offers in less than 10 minutes and landed two interviews the same week.", name: "Leila B.", role: "Marketing Candidate — Tunis", rating: 5 },
      { quote: "Application tracking is clear. We save time and receive better-qualified profiles.", name: "Yassine K.", role: "HR Recruiter — Sfax", rating: 5 },
    ];
  }
  return [
    { quote: "J'ai trouve des offres pertinentes en moins de 10 minutes, et j'ai decroche deux entretiens la meme semaine.", name: "Leila B.", role: "Candidate marketing — Tunis", rating: 5 },
    { quote: "Le suivi des candidatures est clair. On gagne du temps et on recoit des profils mieux qualifies.", name: "Yassine K.", role: "Recruteur RH — Sfax", rating: 5 },
  ];
}

export function getFaqPageItems(language: Language) {
  if (language === "en") {
    return [
      { question: "How do I create an account on JobLinker?", answer: "Click Sign up, choose your profile (candidate or recruiter), and fill in the required fields." },
      { question: "I forgot my password, what should I do?", answer: "On the login page, click Forgot password and follow the link sent by email." },
      { question: "How do I apply for an offer?", answer: "Sign in as a candidate, open an offer, then click Apply." },
      { question: "How do I contact support?", answer: "Write to us at contact@joblinker.tn. We will respond as soon as possible." },
    ];
  }
  return [
    { question: "Comment creer un compte sur JobLinker ?", answer: "Cliquez sur S'inscrire, choisissez votre profil (candidat ou recruteur) et completez les champs demandes." },
    { question: "J'ai oublie mon mot de passe, que faire ?", answer: "Sur la page de connexion, cliquez sur Mot de passe oublie et suivez le lien recu par email." },
    { question: "Comment postuler a une offre ?", answer: "Connectez-vous en tant que candidat, ouvrez une offre puis cliquez sur Postuler." },
    { question: "Comment contacter le support ?", answer: "Ecrivez-nous a contact@joblinker.tn. Nous vous repondrons dans les meilleurs delais." },
  ];
}

export function getQuickFilters(language: Language) {
  if (language === "en") {
    return [
      { label: "Permanent", value: "CDI" },
      { label: "Fixed-term", value: "CDD" },
      { label: "Internship", value: "Stage" },
      { label: "Remote", value: "Télétravail" },
      { label: "Tunis", value: "Tunis" },
      { label: "Developer", value: "Développeur" },
    ];
  }
  return [
    { label: "CDI", value: "CDI" },
    { label: "CDD", value: "CDD" },
    { label: "Stage", value: "Stage" },
    { label: "Teletravail", value: "Télétravail" },
    { label: "Tunis", value: "Tunis" },
    { label: "Developpeur", value: "Développeur" },
  ];
}

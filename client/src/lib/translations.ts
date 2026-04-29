export type Language = "fr" | "en";

export const translations = {
  fr: {
    // Navbar
    offres: "Offres d'emploi",
    dashboard: "Dashboard",
    deconnexion: "Déconnexion",
    connexion: "Connexion",
    sinscrire: "S'inscrire",

    // Footer
    tousDroits: "Tous droits réservés.",

    // Navbar - dotted keys
    "nav.subtitle": "Plateforme de recrutement",
    "nav.offers": "Offres d'emploi",
    "nav.dashboard": "Dashboard",
    "nav.login": "Connexion",
    "nav.register": "S'inscrire",
    "nav.logout": "Déconnexion",

    // Offres page
    explorez: "Explorez",
    titreOffres: "Offres d'emploi",
    offres_disponibles: "offre",
    recherherParTitre: "Rechercher par titre de poste...",
    filtres: "Filtres",
    rechercher: "Rechercher",
    filtresAvances: "Filtres avancés",
    categorie: "Catégorie",
    typeContrat: "Type de contrat",
    ville: "Ville",
    niveau: "Niveau d'études",
    cdi: "CDI",
    cdd: "CDD",
    stage: "Stage",
    freelance: "Freelance",

    // Landing page
    trustBadge: "Recrutement plus rapide, plus clair, plus fiable",
    modeCandidat: "MODE CANDIDAT",
    modeRecruteur: "MODE RECRUTEUR",
    audienceQuestion: "Vous êtes plutôt...",
    audienceCandidat: "En recherche d'emploi",
    audienceRecruteur: "Recruteur",
    
    // Buttons and actions
    decouvrir: "Découvrir",
    postuler: "Postuler",
    publier: "Publier",
    editer: "Éditer",
    supprimer: "Supprimer",
    enregistrer: "Enregistrer",
    annuler: "Annuler",
    plus: "Plus",

    // Status
    nouveau: "Nouveau",
    tendance: "Tendance",
    recommande: "Recommandée",
    enattente: "En attente",
    accepte: "Accepté",
    rejete: "Rejeté",

    // Dashboard (Candidat/Recruteur/Admin)
    bonjour: "Bonjour",
    gererCandidatures: "Gérez vos candidatures et votre profil depuis votre espace personnel.",
    mesCandidatures: "Mes candidatures",
    monProfil: "Mon profil",
    aucuneCandidature: "Aucune candidature",
    parcourezOffres: "Parcourez les offres et postulez pour commencer votre parcours.",
    voirOffres: "Voir les offres",
    infoPersonnelles: "Informations personnelles",
    nom: "Nom",
    prenom: "Prénom",
    email: "Email",
    telephone: "Téléphone",
    diplome: "Diplôme",
    niveauEtude: "Niveau d'étude",
    experience: "Expérience",
    lettreMotivation: "Lettre de motivation",
    monCv: "Mon CV (PDF)",
    aucunCv: "Aucun CV enregistré.",
    voirCv: "Voir mon CV",
    remplacerCv: "Remplacer le CV",
    ajouterCv: "Ajouter un CV",
    envoi: "Envoi...",
    modifierProfil: "Modifier le profil",
    candidatureAcceptee: "Candidature acceptée",
    candidatureEnAttente: "En attente",
    candidatureRefusee: "Refusée",
    profilSauvegarde: "Profil sauvegardé avec succès.",
    erreurSauvegarde: "Erreur lors de la sauvegarde. Veuillez réessayer.",
    total: "Total",
    acceptees: "Acceptées",
    presentezBrievement: "Présentez-vous brièvement...",
    sauvegarder: "Sauvegarder",
    sauvegarde: "Sauvegarde...",

    // Landing page - Features
    recherchePertinence: "Recherche par pertinence",
    trouvezOffres: "Trouvez des offres réellement adaptées à votre profil grâce à des filtres rapides et précis.",
    recruteursVerifies: "Recruteurs vérifiés",
    postulez: "Postulez uniquement sur des annonces publiées par des entreprises crédibles et actives.",
    candidatureSimplifiee: "Candidature simplifiée",
    envoyezProfil: "Envoyez votre profil en quelques clics sans friction ni formulaires interminables.",
    suiviTransparent: "Suivi transparent",
    gardezControle: "Gardez le contrôle sur vos candidatures et voyez leur statut en temps réel.",
    espaceRecruteur: "Tableau de bord recruteur",
    publiez: "Publiez, triez et suivez les candidatures depuis un tableau de bord conçu pour agir vite.",
    publicationRapide: "Publication rapide",
    diffusezOffres: "Diffusez vos offres en quelques minutes avec un formulaire clair et orienté conversion.",
    profilsFiables: "Profils plus fiables",
    recevezCandidatures: "Recevez des candidatures mieux ciblées grâce à des informations structurées et vérifiées.",
    suiviAvancement: "Suivi d'avancement",
    visualisez: "Visualisez l'état des candidatures et accélérez la prise de décision avec une vue unique.",
    triSimplifie: "Tri simplifié",
    evalrez: "Évaluez rapidement les profils grâce à un format de candidature homogène et lisible.",
    pipelineTalent: "Pipeline talent",
    constituent: "Constituez un flux de talents continu pour réduire le délai entre besoin et embauche.",

    // Landing page - Stats
    profilesInscrits: "profils inscrits",
    entreprisesActives: "entreprises actives",
    noteMoyenne: "note moyenne",

    // Landing page - Steps
    cherchezRapidement: "Cherchez rapidement",
    tapezMetier: "Tapez un métier, une ville ou un contrat et trouvez des offres utiles immédiatement.",
    previsualisez: "Prévisualisez avant de cliquer",
    consultezDetails: "Consultez les détails essentiels d'une offre avant d'ouvrir la fiche complète.",
    postulez2: "Postulez sans friction",
    envoyezCandidature: "Envoyez votre candidature en gardant une expérience simple, rapide et rassurante.",

    // Landing page - FAQ
    parcoururOffres: "Puis-je parcourir les offres sans créer de compte ?",
    ouiParcourir: "Oui. Vous pouvez explorer les offres et filtrer les résultats librement. Le compte devient utile quand vous voulez postuler, suivre vos candidatures ou enregistrer vos recherches.",
    entrepriseVerifiee: "Comment savez-vous si une entreprise est vérifiée ?",
    lesRecruteurs: "Les recruteurs sont contrôlés via leurs informations de contact, leur activité et la cohérence de leurs annonces. L'objectif est de réduire les annonces peu fiables et les doublons.",
    adapteeAux: "La plateforme est-elle adaptée aux candidats et aux recruteurs ?",
    ouiAdaptee: "Oui. La landing adapte son message selon le contexte d'arrivée, puis la navigation reste pensée pour les deux parcours: trouver une offre ou publier un besoin de recrutement.",
    combienTemps: "Combien de temps faut-il pour postuler ?",
    enpratique: "En pratique, quelques clics suffisent pour les offres qui correspondent à votre profil. L'objectif est d'éliminer les étapes inutiles et d'accélérer le passage à l'action.",
    pouvezRevenir: "Puis-je revenir plus tard pour terminer une candidature ?",
    ouiRevenir: "Oui, vous pouvez reprendre votre parcours plus tard sans perdre le contexte principal de recherche et de sélection.",
    restentConfidentielles: "Mes candidatures restent-elles confidentielles ?",
    ouiConfidentielles: "Oui. Les informations partagées servent uniquement au processus de recrutement et sont protégées pour limiter la diffusion non désirée de vos données.",

    // Landing page - Testimonials
    temoignage1: "J'ai trouvé des offres pertinentes en moins de 10 minutes, et j'ai décroché deux entretiens la même semaine.",
    temoignage2: "Le suivi des candidatures est clair. On gagne du temps et on reçoit des profils mieux qualifiés.",

    // Offres page
    chargement: "Chargement...",
    disponibles: "disponible",
    toutes: "Toutes",
    tous: "Tous",

    // Landing - dotted keys (kept verbatim from stashed work)
    "landing.audienceCandidate": "Je cherche un emploi",
    "landing.audienceRecruiter": "Je recrute",
    "landing.searchLabel": "Recherche d'offres",
    "landing.searchPlaceholder": "Poste, metier, mot-cle...",
    "landing.locationPlaceholder": "Ville, region...",
    "landing.discoverCandidate": "Decouvrir les offres",
    "landing.discoverRecruiter": "Commencer a recruter",
    "landing.openOffer": "Offre ouverte",
    "landing.viewThisOffer": "Voir cette offre",
    "landing.featuresTitle": "Une experience concue pour convertir sans friction",
    "landing.featuresDesc": "Moins d'effort, plus de pertinence, et une progression naturelle vers l'action.",
    "landing.categoriesTitle": "Explorez par secteur",
    "landing.categoriesDesc": "Trouvez des opportunites dans votre domaine d'expertise",
    "landing.categoryOffers": "offres",
    "landing.ctaTimeline": "Creez votre compte en quelques minutes",
    "landing.ctaTitle": "Ne laissez pas la bonne opportunite passer.",
    "landing.ctaDesc": "Inscription gratuite, rapide et sans engagement. Commencez maintenant et accedez aux offres qui correspondent vraiment a votre profil.",
    "landing.ctaButton": "Commencer gratuitement",
    "landing.ctaExplore": "Explorer les offres",
  },
  en: {
    // Navbar
    offres: "Job Offers",
    dashboard: "Dashboard",
    deconnexion: "Sign Out",
    connexion: "Sign In",
    sinscrire: "Sign Up",

    // Footer
    tousDroits: "All rights reserved.",

    // Navbar - dotted keys
    "nav.subtitle": "Recruitment Platform",
    "nav.offers": "Job Offers",
    "nav.dashboard": "Dashboard",
    "nav.login": "Sign in",
    "nav.register": "Sign up",
    "nav.logout": "Sign out",

    // Offres page
    explorez: "Explore",
    titreOffres: "Job Offers",
    offres_disponibles: "offer",
    recherherParTitre: "Search by job title...",
    filtres: "Filters",
    rechercher: "Search",
    filtresAvances: "Advanced Filters",
    categorie: "Category",
    typeContrat: "Contract Type",
    ville: "City",
    niveau: "Education Level",
    cdi: "Permanent",
    cdd: "Fixed-term",
    stage: "Internship",
    freelance: "Freelance",

    // Landing page
    trustBadge: "Faster, clearer, more reliable recruitment",
    modeCandidat: "CANDIDATE MODE",
    modeRecruteur: "RECRUITER MODE",
    audienceQuestion: "You are a...",
    audienceCandidat: "Job seeker",
    audienceRecruteur: "Recruiter",
    
    // Buttons and actions
    decouvrir: "Discover",
    postuler: "Apply",
    publier: "Publish",
    editer: "Edit",
    supprimer: "Delete",
    enregistrer: "Save",
    annuler: "Cancel",
    plus: "More",

    // Status
    nouveau: "New",
    tendance: "Trending",
    recommande: "Recommended",
    enattente: "Pending",
    accepte: "Accepted",
    rejete: "Rejected",

    // Dashboard (Candidat/Recruteur/Admin)
    bonjour: "Hello",
    gererCandidatures: "Manage your applications and profile from your personal space.",
    mesCandidatures: "My Applications",
    monProfil: "My Profile",
    aucuneCandidature: "No applications",
    parcourezOffres: "Browse job offers and apply to start your journey.",
    voirOffres: "View offers",
    infoPersonnelles: "Personal Information",
    nom: "Name",
    prenom: "First Name",
    email: "Email",
    telephone: "Phone",
    diplome: "Degree",
    niveauEtude: "Education Level",
    experience: "Experience",
    lettreMotivation: "Cover Letter",
    monCv: "My Resume (PDF)",
    aucunCv: "No resume on file.",
    voirCv: "View my resume",
    remplacerCv: "Replace resume",
    ajouterCv: "Add resume",
    envoi: "Sending...",
    modifierProfil: "Edit profile",
    candidatureAcceptee: "Application accepted",
    candidatureEnAttente: "Pending",
    candidatureRefusee: "Rejected",
    profilSauvegarde: "Profile saved successfully.",
    erreurSauvegarde: "Error saving profile. Please try again.",
    total: "Total",
    acceptees: "Accepted",
    presentezBrievement: "Tell us about yourself...",
    sauvegarder: "Save",
    sauvegarde: "Saving...",

    // Landing page - Features
    recherchePertinence: "Search by relevance",
    trouvezOffres: "Find offers truly suited to your profile with quick and accurate filters.",
    recruteursVerifies: "Verified recruiters",
    postulez: "Apply only to job postings from credible and active companies.",
    candidatureSimplifiee: "Simplified application",
    envoyezProfil: "Send your profile in just a few clicks with no friction or endless forms.",
    suiviTransparent: "Transparent tracking",
    gardezControle: "Keep control of your applications and see their status in real time.",
    espaceRecruteur: "Recruiter dashboard",
    publiez: "Post, sort and track applications from a dashboard designed for quick action.",
    publicationRapide: "Fast publication",
    diffusezOffres: "Launch your offers in minutes with a clear conversion-focused form.",
    profilsFiables: "More reliable profiles",
    recevezCandidatures: "Receive better targeted applications thanks to structured and verified information.",
    suiviAvancement: "Progress tracking",
    visualisez: "View application status and accelerate decision-making with a unified view.",
    triSimplifie: "Simplified sorting",
    evalrez: "Quickly evaluate profiles thanks to a uniform and readable application format.",
    pipelineTalent: "Talent pipeline",
    constituent: "Build a continuous talent flow to reduce time between need and hire.",

    // Landing page - Stats
    profilesInscrits: "registered profiles",
    entreprisesActives: "active companies",
    noteMoyenne: "average rating",

    // Landing page - Steps
    cherchezRapidement: "Search quickly",
    tapezMetier: "Type a job title, city or contract type and find useful offers instantly.",
    previsualisez: "Preview before clicking",
    consultezDetails: "Check the key details of an offer before opening the full card.",
    postulez2: "Apply without friction",
    envoyezCandidature: "Send your application while maintaining a simple, fast and reassuring experience.",

    // Landing page - FAQ
    parcoururOffres: "Can I browse job offers without creating an account?",
    ouiParcourir: "Yes. You can explore offers and filter results freely. Creating an account is useful when you want to apply, track your applications or save your searches.",
    entrepriseVerifiee: "How do you know if a company is verified?",
    lesRecruteurs: "Recruiters are checked through their contact information, activity and consistency of their postings. The goal is to reduce unreliable ads and duplicates.",
    adapteeAux: "Is the platform suited for both candidates and recruiters?",
    ouiAdaptee: "Yes. The landing adapts its message based on your arrival context, and navigation is designed for both paths: find a job offer or post a recruitment need.",
    combienTemps: "How long does it take to apply?",
    enpratique: "In practice, just a few clicks for offers matching your profile. The goal is to eliminate unnecessary steps and accelerate action.",
    pouvezRevenir: "Can I come back later to finish an application?",
    ouiRevenir: "Yes, you can resume your journey later without losing the main search and selection context.",
    restentConfidentielles: "Do my applications remain confidential?",
    ouiConfidentielles: "Yes. Information shared is used only for the recruitment process and is protected to limit unwanted data sharing.",

    // Landing page - Testimonials
    temoignage1: "I found relevant offers in less than 10 minutes and got two interviews the same week.",
    temoignage2: "Application tracking is clear. We save time and receive better qualified profiles.",

    // Offres page
    chargement: "Loading...",
    disponibles: "available",
    toutes: "All",
    tous: "All",

    // Landing - dotted keys (kept verbatim from stashed work)
    "landing.audienceCandidate": "I am looking for a job",
    "landing.audienceRecruiter": "I am hiring",
    "landing.searchLabel": "Job search",
    "landing.searchPlaceholder": "Job title, keyword...",
    "landing.locationPlaceholder": "City, region...",
    "landing.discoverCandidate": "Discover jobs",
    "landing.discoverRecruiter": "Start recruiting",
    "landing.openOffer": "Open offer",
    "landing.viewThisOffer": "View this offer",
    "landing.featuresTitle": "An experience designed to convert without friction",
    "landing.featuresDesc": "Less effort, more relevance, and a natural progression toward action.",
    "landing.categoriesTitle": "Explore by sector",
    "landing.categoriesDesc": "Find opportunities in your field of expertise",
    "landing.categoryOffers": "offers",
    "landing.ctaTimeline": "Create your account in minutes",
    "landing.ctaTitle": "Don't let the right opportunity pass.",
    "landing.ctaDesc": "Free, fast, and no-commitment registration. Start now and access offers that truly match your profile.",
    "landing.ctaButton": "Get started for free",
    "landing.ctaExplore": "Explore offers",
  },
};

export type TranslationKey = keyof typeof translations.fr;

export function getHeroContent(language: Language) {
  const content = {
    candidate: {
      benefit: {
        fr: {
          headlineBefore: "Trouvez l'emploi qui ",
          headlineAccent: "vous ressemble",
          headlineAfter: "",
          description: "Des centaines d'offres vous attendent dans tous les secteurs en Tunisie. Postulez en toute confiance, on s'occupe du reste.",
        },
        en: {
          headlineBefore: "Find a job that ",
          headlineAccent: "feels right",
          headlineAfter: "",
          description: "Hundreds of offers are waiting for you across every sector in Tunisia. Apply with confidence, we take care of the rest.",
        },
      },
      action: {
        fr: {
          headlineBefore: "Votre prochain chapitre ",
          headlineAccent: "commence maintenant",
          headlineAfter: "",
          description: "Dites-nous ce que vous recherchez et decouvrez les offres faites pour vous. Pas de bruit, juste les bonnes opportunites.",
        },
        en: {
          headlineBefore: "Your next chapter ",
          headlineAccent: "starts now",
          headlineAfter: "",
          description: "Tell us what you're looking for and discover offers made for you. No noise, just the right opportunities.",
        },
      },
    },
    recruiter: {
      benefit: {
        fr: {
          headlineBefore: "Attirez les talents qui feront ",
          headlineAccent: "la difference",
          headlineAfter: "",
          description: "Publiez vos offres en quelques minutes et recevez des candidatures de personnes motivees, pretes a contribuer.",
        },
        en: {
          headlineBefore: "Attract talent that makes ",
          headlineAccent: "the difference",
          headlineAfter: "",
          description: "Post your offers in minutes and receive applications from motivated people, ready to contribute.",
        },
      },
      action: {
        fr: {
          headlineBefore: "Votre prochaine recrue est ",
          headlineAccent: "deja ici",
          headlineAfter: "",
          description: "Un outil simple pour publier, trier et choisir. Concentrez-vous sur les personnes, pas sur la paperasse.",
        },
        en: {
          headlineBefore: "Your next hire is ",
          headlineAccent: "already here",
          headlineAfter: "",
          description: "A simple tool to post, sort, and choose. Focus on people, not paperwork.",
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

export function getQuickFilters(language: Language) {
  if (language === "en") {
    return [
      { label: "Permanent", value: "CDI" },
      { label: "Remote", value: "Télétravail" },
      { label: "Tech", value: "Développeur" },
      { label: "Marketing", value: "Marketing" },
      { label: "Finance", value: "Finance" },
      { label: "Healthcare", value: "Santé" },
      { label: "Internship", value: "Stage" },
    ];
  }
  return [
    { label: "CDI", value: "CDI" },
    { label: "Teletravail", value: "Télétravail" },
    { label: "Tech", value: "Développeur" },
    { label: "Marketing", value: "Marketing" },
    { label: "Finance", value: "Finance" },
    { label: "Sante", value: "Santé" },
    { label: "Stage", value: "Stage" },
  ];
}

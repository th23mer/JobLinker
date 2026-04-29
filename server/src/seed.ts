import { pool } from "./db";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  // Make sure salaire / date_creation exist on offre_emploi (idempotent, autocommit)
  await pool.query("ALTER TABLE offre_emploi ADD COLUMN IF NOT EXISTS salaire TEXT");
  await pool.query("ALTER TABLE offre_emploi ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Wipe existing data in reverse dependency order
    await client.query("DELETE FROM candidature");
    await client.query("DELETE FROM offre_emploi");
    await client.query("DELETE FROM candidat");
    await client.query("DELETE FROM recruteur");
    await client.query("DELETE FROM specialite");
    await client.query("DELETE FROM categorie");
    await client.query("DELETE FROM administrateur");

    // Reset sequences so IDs start at 1
    await client.query("ALTER SEQUENCE administrateur_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE categorie_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE specialite_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE recruteur_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE offre_emploi_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE candidat_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE candidature_id_seq RESTART WITH 1");

    const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

    // ── Administrateur ──
    await client.query(
      `INSERT INTO administrateur (email, mot_de_passe) VALUES ($1, $2)`,
      ["admin@jobportal.tn", hashedPassword]
    );

    // ── Categories (10) ──
    const categories = [
      "Informatique",            // 1
      "Finance",                 // 2
      "Marketing",               // 3
      "Ingénierie",              // 4
      "Ressources Humaines",     // 5
      "Santé",                   // 6
      "Éducation",               // 7
      "Logistique & Supply Chain", // 8
      "Design",                  // 9
      "Vente & Commerce",        // 10
    ];
    for (const nom of categories) {
      await client.query(`INSERT INTO categorie (nom) VALUES ($1)`, [nom]);
    }

    // ── Specialites ──
    const specialites: { nom: string; categorie_id: number }[] = [
      // Informatique (1)
      { nom: "Développement Web",       categorie_id: 1 }, // 1
      { nom: "Développement Mobile",    categorie_id: 1 }, // 2
      { nom: "Data Science",            categorie_id: 1 }, // 3
      { nom: "DevOps & Cloud",          categorie_id: 1 }, // 4
      { nom: "Cybersécurité",           categorie_id: 1 }, // 5
      { nom: "QA & Test",               categorie_id: 1 }, // 6
      // Finance (2)
      { nom: "Comptabilité",            categorie_id: 2 }, // 7
      { nom: "Audit",                   categorie_id: 2 }, // 8
      { nom: "Contrôle de Gestion",     categorie_id: 2 }, // 9
      // Marketing (3)
      { nom: "Marketing Digital",       categorie_id: 3 }, // 10
      { nom: "Community Management",    categorie_id: 3 }, // 11
      { nom: "Growth & SEO",            categorie_id: 3 }, // 12
      // Ingénierie (4)
      { nom: "Génie Civil",             categorie_id: 4 }, // 13
      { nom: "Génie Mécanique",         categorie_id: 4 }, // 14
      { nom: "Génie Électrique",        categorie_id: 4 }, // 15
      { nom: "Industrialisation",       categorie_id: 4 }, // 16
      // Ressources Humaines (5)
      { nom: "Recrutement",             categorie_id: 5 }, // 17
      { nom: "Formation",               categorie_id: 5 }, // 18
      { nom: "Paie & Administration",   categorie_id: 5 }, // 19
      // Santé (6)
      { nom: "Médecine Générale",       categorie_id: 6 }, // 20
      { nom: "Pharmacie",               categorie_id: 6 }, // 21
      { nom: "Soins Infirmiers",        categorie_id: 6 }, // 22
      // Éducation (7)
      { nom: "Enseignement Primaire",   categorie_id: 7 }, // 23
      { nom: "Formation Professionnelle", categorie_id: 7 }, // 24
      // Logistique (8)
      { nom: "Supply Chain",            categorie_id: 8 }, // 25
      { nom: "Transport & Distribution", categorie_id: 8 }, // 26
      // Design (9)
      { nom: "UI/UX Design",            categorie_id: 9 }, // 27
      { nom: "Graphisme",               categorie_id: 9 }, // 28
      // Vente (10)
      { nom: "Commercial Terrain",      categorie_id: 10 }, // 29
      { nom: "Service Client",          categorie_id: 10 }, // 30
    ];
    for (const s of specialites) {
      await client.query(
        `INSERT INTO specialite (nom, categorie_id) VALUES ($1, $2)`,
        [s.nom, s.categorie_id]
      );
    }

    // ── Recruteurs (15) ──
    const recruteurs = [
      { nom_entreprise: "TechnoSoft",        matricule_fiscal: "TS123456", adresse: "Tunis, Centre Urbain Nord",   description: "Editeur logiciel B2B specialise dans les solutions metier.",         statut_validation: "validee",    email: "contact@technosoft.tn",   telephone: "+216 71 000 001", nom_representant: "Bouzid",   prenom_representant: "Karim" },
      { nom_entreprise: "FinancePlus",       matricule_fiscal: "FP789012", adresse: "Sfax, Route de Tunis",         description: "Cabinet de conseil en finance et audit.",                             statut_validation: "validee",    email: "rh@financeplus.tn",       telephone: "+216 74 000 002", nom_representant: "Jaziri",   prenom_representant: "Amira" },
      { nom_entreprise: "MarketPro",         matricule_fiscal: "MP345678", adresse: "Sousse, Zone Industrielle",    description: "Agence de marketing digital pour PME tunisiennes.",                   statut_validation: "en_attente", email: "info@marketpro.tn",       telephone: "+216 73 000 003", nom_representant: "Sassi",    prenom_representant: "Nadia" },
      { nom_entreprise: "NeoBank Tunisia",   matricule_fiscal: "NB901234", adresse: "Tunis, Lac 2",                 description: "Fintech specialisee dans les services bancaires digitaux.",           statut_validation: "validee",    email: "talents@neobank.tn",      telephone: "+216 71 000 004", nom_representant: "Masmoudi", prenom_representant: "Rim" },
      { nom_entreprise: "MedCare Group",     matricule_fiscal: "MC567890", adresse: "Monastir, Zone Clinique",      description: "Groupe sante prive engage sur la qualite des soins.",                 statut_validation: "validee",    email: "rh@medcare.tn",           telephone: "+216 73 000 005", nom_representant: "Khelifi",  prenom_representant: "Sami" },
      { nom_entreprise: "DigitalWave",       matricule_fiscal: "DW246810", adresse: "Tunis, Les Berges du Lac",     description: "Studio de developpement produit web et mobile.",                      statut_validation: "validee",    email: "hr@digitalwave.tn",       telephone: "+216 71 000 006", nom_representant: "Gharbi",   prenom_representant: "Mehdi" },
      { nom_entreprise: "CloudStack Tunisia",matricule_fiscal: "CS135791", adresse: "Tunis, Charguia",              description: "Integrateur cloud et services manages AWS et Azure.",                 statut_validation: "validee",    email: "jobs@cloudstack.tn",      telephone: "+216 71 000 007", nom_representant: "Abidi",    prenom_representant: "Yosra" },
      { nom_entreprise: "PixelNorth",        matricule_fiscal: "PN862419", adresse: "Sfax, Sakiet Ezzit",           description: "Agence design produit et identite de marque.",                        statut_validation: "validee",    email: "team@pixelnorth.tn",      telephone: "+216 74 000 008", nom_representant: "Ben Salah",prenom_representant: "Lina" },
      { nom_entreprise: "Atlas People",      matricule_fiscal: "AP374859", adresse: "Tunis, Manouba",               description: "Cabinet de recrutement et talent acquisition.",                       statut_validation: "validee",    email: "contact@atlaspeople.tn",  telephone: "+216 71 000 009", nom_representant: "Trabelsi", prenom_representant: "Hatem" },
      { nom_entreprise: "GreenBuild",        matricule_fiscal: "GB948152", adresse: "Nabeul, Hammamet Sud",         description: "Bureau d'etudes batiment et infrastructures durables.",               statut_validation: "validee",    email: "rh@greenbuild.tn",        telephone: "+216 72 000 010", nom_representant: "Mansouri", prenom_representant: "Anis" },
      { nom_entreprise: "PharmaPlus",        matricule_fiscal: "PP648721", adresse: "Sousse, Khezama",              description: "Groupe pharmaceutique distributeur national.",                        statut_validation: "validee",    email: "rh@pharmaplus.tn",        telephone: "+216 73 000 011", nom_representant: "Ferchichi",prenom_representant: "Wafa" },
      { nom_entreprise: "Educatis Academy",  matricule_fiscal: "EA537281", adresse: "Tunis, El Menzah",             description: "Centre de formation professionnelle agree.",                          statut_validation: "validee",    email: "jobs@educatis.tn",        telephone: "+216 71 000 012", nom_representant: "Riahi",    prenom_representant: "Ines" },
      { nom_entreprise: "SmartRetail",       matricule_fiscal: "SR926354", adresse: "Ariana, Riadh Andalous",       description: "Reseau de magasins de distribution moderne.",                         statut_validation: "validee",    email: "carriere@smartretail.tn", telephone: "+216 71 000 013", nom_representant: "Hammami",  prenom_representant: "Fares" },
      { nom_entreprise: "Bluewave Logistics",matricule_fiscal: "BL189437", adresse: "Bizerte, Zone Portuaire",      description: "Transporteur et integrateur logistique multimodal.",                  statut_validation: "validee",    email: "rh@bluewave.tn",          telephone: "+216 72 000 014", nom_representant: "Cherif",   prenom_representant: "Sonia" },
      { nom_entreprise: "CodeFactory",       matricule_fiscal: "CF724681", adresse: "Tunis, Centre Ville",          description: "Studio software house produit SaaS B2B.",                             statut_validation: "validee",    email: "hello@codefactory.tn",    telephone: "+216 71 000 015", nom_representant: "Zouari",   prenom_representant: "Nour" },
    ];
    for (const r of recruteurs) {
      await client.query(
        `INSERT INTO recruteur (nom_entreprise, matricule_fiscal, adresse, description, statut_validation, email, mot_de_passe, telephone, nom_representant, prenom_representant)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [r.nom_entreprise, r.matricule_fiscal, r.adresse, r.description, r.statut_validation, r.email, hashedPassword, r.telephone, r.nom_representant, r.prenom_representant]
      );
    }

    // ── Offres d'emploi (60) ──
    type Offer = {
      titre: string; description: string; exigences: string;
      type_contrat: string; ville: string; experience_requise: string;
      niveau_etude: string; categorie_id: number; specialite_id: number;
      statut_validation: string; recruteur_id: number; salaire: string | null;
      days_ago: number;
    };
    const offres: Offer[] = [
      // ── Informatique (1) ──
      { titre: "Developpeur Full Stack Node.js / React",     description: "Rejoignez notre equipe produit pour batir une plateforme SaaS B2B moderne.",                            exigences: "Node.js, React, TypeScript, PostgreSQL, Git",      type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-3 ans", niveau_etude: "Licence",   categorie_id: 1, specialite_id: 1,  statut_validation: "validee",    recruteur_id: 1,  salaire: "2200-3000 TND", days_ago: 1 },
      { titre: "Ingenieur DevOps",                            description: "Mettre en place et maintenir les pipelines CI/CD et l'infra cloud.",                                  exigences: "Docker, Kubernetes, Jenkins, AWS, Terraform",       type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Ingénieur", categorie_id: 1, specialite_id: 4,  statut_validation: "validee",    recruteur_id: 7,  salaire: "3500-4500 TND", days_ago: 3 },
      { titre: "Developpeur Mobile Flutter",                  description: "Concevoir et maintenir des applications mobiles performantes pour le marche tunisien.",               exigences: "Flutter, Dart, REST API, Firebase",                 type_contrat: "CDI",       ville: "Sousse",    experience_requise: "2-4 ans", niveau_etude: "Licence",   categorie_id: 1, specialite_id: 2,  statut_validation: "validee",    recruteur_id: 6,  salaire: "2400-3200 TND", days_ago: 5 },
      { titre: "Ingenieur QA Automatisation",                 description: "Mettre en place les tests automatises et garantir la qualite des livrables produit.",                exigences: "Cypress, Playwright, CI/CD, Jest",                  type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-3 ans", niveau_etude: "Ingénieur", categorie_id: 1, specialite_id: 6,  statut_validation: "validee",    recruteur_id: 1,  salaire: "2400-3000 TND", days_ago: 2 },
      { titre: "Data Analyst BI",                             description: "Analyser les donnees metier et produire des tableaux de bord pour le pilotage des performances.",     exigences: "SQL, Power BI, Excel avance, esprit analytique",    type_contrat: "CDI",       ville: "Tunis",     experience_requise: "1-3 ans", niveau_etude: "Master",    categorie_id: 1, specialite_id: 3,  statut_validation: "validee",    recruteur_id: 4,  salaire: "2000-2800 TND", days_ago: 7 },
      { titre: "Data Scientist",                              description: "Concevoir des modeles ML pour la detection d'anomalies et le scoring client.",                       exigences: "Python, scikit-learn, pandas, MLflow",              type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 1, specialite_id: 3,  statut_validation: "validee",    recruteur_id: 4,  salaire: "3000-4000 TND", days_ago: 10 },
      { titre: "Developpeur Backend Java Spring",             description: "Concevoir des APIs robustes et maintenables pour notre coeur de plateforme.",                        exigences: "Java 17, Spring Boot, JPA, Postgres",               type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Ingénieur", categorie_id: 1, specialite_id: 1,  statut_validation: "validee",    recruteur_id: 15, salaire: "3000-4200 TND", days_ago: 4 },
      { titre: "Developpeur Frontend React Senior",           description: "Construire des interfaces ergonomiques pour des produits SaaS exigeants.",                            exigences: "React, TypeScript, Tailwind, design systems",       type_contrat: "CDI",       ville: "Tunis",     experience_requise: "4-6 ans", niveau_etude: "Licence",   categorie_id: 1, specialite_id: 1,  statut_validation: "validee",    recruteur_id: 15, salaire: "3200-4500 TND", days_ago: 8 },
      { titre: "Stage Developpeur Web (PFE)",                 description: "Stage de fin d'etudes oriente realisation d'un produit interne.",                                    exigences: "JavaScript, HTML/CSS, motivation",                  type_contrat: "Stage",     ville: "Tunis",     experience_requise: "0-1 an",  niveau_etude: "Licence",   categorie_id: 1, specialite_id: 1,  statut_validation: "validee",    recruteur_id: 6,  salaire: "400-600 TND",   days_ago: 0 },
      { titre: "Cloud Engineer AWS",                          description: "Migrer et exploiter des architectures multi-comptes AWS pour des clients regionaux.",                exigences: "AWS, Terraform, Linux, scripting",                  type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Ingénieur", categorie_id: 1, specialite_id: 4,  statut_validation: "validee",    recruteur_id: 7,  salaire: "3500-4800 TND", days_ago: 12 },
      { titre: "Analyste Cybersecurite SOC",                  description: "Surveiller les alertes SIEM et conduire des investigations niveau 2.",                               exigences: "SIEM, MITRE ATT&CK, scripting, anglais",            type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-4 ans", niveau_etude: "Ingénieur", categorie_id: 1, specialite_id: 5,  statut_validation: "validee",    recruteur_id: 7,  salaire: "2800-3600 TND", days_ago: 6 },
      { titre: "Tech Lead .NET",                              description: "Encadrer une equipe de 5 developpeurs sur une plateforme financiere critique.",                      exigences: ".NET 8, Azure, leadership, anglais",                type_contrat: "CDI",       ville: "Tunis",     experience_requise: "6+ ans", niveau_etude: "Ingénieur", categorie_id: 1, specialite_id: 1,  statut_validation: "en_attente", recruteur_id: 4,  salaire: "5000-6500 TND", days_ago: 14 },
      { titre: "Developpeur PHP / Symfony",                   description: "Maintenance et evolution d'une plateforme e-commerce a fort trafic.",                                exigences: "Symfony 6, PHP 8, Doctrine, MySQL",                 type_contrat: "Freelance", ville: "Sfax",      experience_requise: "3-5 ans", niveau_etude: "Licence",   categorie_id: 1, specialite_id: 1,  statut_validation: "validee",    recruteur_id: 13, salaire: "120-160 TND/jour", days_ago: 9 },

      // ── Finance (2) ──
      { titre: "Auditeur Financier Junior",                   description: "Participer aux missions d'audit et de controle financier.",                                          exigences: "Maitrise des normes IFRS, Excel avance",            type_contrat: "CDD",       ville: "Sfax",      experience_requise: "0-1 an",  niveau_etude: "Master",    categorie_id: 2, specialite_id: 8,  statut_validation: "validee",    recruteur_id: 2,  salaire: "1600-2000 TND", days_ago: 11 },
      { titre: "Comptable Senior",                            description: "Gestion de la comptabilite generale et analytique d'un portefeuille clients.",                       exigences: "Sage, SAP, 5 ans d'experience minimum",             type_contrat: "CDI",       ville: "Sfax",      experience_requise: "5+ ans",  niveau_etude: "Licence",   categorie_id: 2, specialite_id: 7,  statut_validation: "en_attente", recruteur_id: 2,  salaire: "2400-3000 TND", days_ago: 15 },
      { titre: "Assistant(e) Comptable",                      description: "Saisir les ecritures comptables et participer aux clotures mensuelles.",                             exigences: "Sage, rigueur, notions fiscales tunisiennes",       type_contrat: "CDD",       ville: "Sfax",      experience_requise: "0-1 an",  niveau_etude: "Licence",   categorie_id: 2, specialite_id: 7,  statut_validation: "validee",    recruteur_id: 2,  salaire: "1200-1500 TND", days_ago: 4 },
      { titre: "Consultant Audit Interne",                    description: "Conduire des missions d'audit et proposer des plans d'amelioration des controles internes.",         exigences: "Audit, communication, normes de controle interne", type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 2, specialite_id: 8,  statut_validation: "validee",    recruteur_id: 4,  salaire: "2800-3500 TND", days_ago: 16 },
      { titre: "Controleur de Gestion",                       description: "Suivre les budgets, alimenter les KPIs et fiabiliser le reporting financier.",                       exigences: "Excel avance, Power BI, ERP, rigueur",              type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 2, specialite_id: 9,  statut_validation: "validee",    recruteur_id: 4,  salaire: "2800-3500 TND", days_ago: 20 },
      { titre: "Charge(e) de Recouvrement",                   description: "Suivre le recouvrement clients, relances amiables et reporting.",                                    exigences: "Aisance relationnelle, ERP, rigueur",               type_contrat: "CDD",       ville: "Tunis",     experience_requise: "1-3 ans", niveau_etude: "Licence",   categorie_id: 2, specialite_id: 7,  statut_validation: "validee",    recruteur_id: 13, salaire: "1500-1800 TND", days_ago: 22 },
      { titre: "Analyste Risques Bancaires",                  description: "Mesurer et suivre les risques de credit sur des portefeuilles entreprises.",                         exigences: "Bale, statistiques, Excel, ESG",                    type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-4 ans", niveau_etude: "Master",    categorie_id: 2, specialite_id: 8,  statut_validation: "validee",    recruteur_id: 4,  salaire: "2600-3300 TND", days_ago: 18 },

      // ── Marketing (3) ──
      { titre: "Specialiste Marketing Digital",               description: "Piloter des campagnes Meta et Google Ads avec objectifs de conversion.",                              exigences: "Google Ads, Meta Ads, GA4, copywriting",            type_contrat: "CDI",       ville: "Sousse",    experience_requise: "2-3 ans", niveau_etude: "Licence",   categorie_id: 3, specialite_id: 10, statut_validation: "validee",    recruteur_id: 3,  salaire: "1800-2400 TND", days_ago: 6 },
      { titre: "Community Manager Junior",                    description: "Animer les reseaux sociaux et creer un calendrier editorial engageant.",                              exigences: "Canva, TikTok, Instagram, redaction",               type_contrat: "Stage",     ville: "Sfax",      experience_requise: "0-1 an",  niveau_etude: "Licence",   categorie_id: 3, specialite_id: 11, statut_validation: "validee",    recruteur_id: 3,  salaire: "400-600 TND",   days_ago: 2 },
      { titre: "SEO Specialist",                              description: "Construire et executer la strategie SEO multi-projets pour des clients regionaux.",                  exigences: "GSC, Ahrefs, redaction, technical SEO",             type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-4 ans", niveau_etude: "Licence",   categorie_id: 3, specialite_id: 12, statut_validation: "validee",    recruteur_id: 3,  salaire: "2000-2800 TND", days_ago: 8 },
      { titre: "Brand & Content Manager",                     description: "Definir la voix de marque et coordonner la production de contenus omnicanaux.",                      exigences: "Storytelling, redaction, planning editorial",       type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 3, specialite_id: 11, statut_validation: "validee",    recruteur_id: 8,  salaire: "2400-3200 TND", days_ago: 13 },
      { titre: "Growth Marketer",                             description: "Concevoir des experimentations growth pour accelerer l'acquisition utilisateurs.",                    exigences: "AB testing, analytics, copy, automation",           type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 3, specialite_id: 12, statut_validation: "en_attente", recruteur_id: 4,  salaire: "2800-3800 TND", days_ago: 17 },
      { titre: "Charge(e) de Communication",                  description: "Piloter la communication externe et evenementielle d'un groupe sante.",                              exigences: "Communication, evenementiel, presse",               type_contrat: "CDI",       ville: "Monastir",  experience_requise: "2-4 ans", niveau_etude: "Master",    categorie_id: 3, specialite_id: 11, statut_validation: "validee",    recruteur_id: 5,  salaire: "1900-2500 TND", days_ago: 9 },

      // ── Ingenierie (4) ──
      { titre: "Ingenieur Genie Civil",                       description: "Suivi de chantier, coordination des equipes techniques et controle de conformite.",                  exigences: "AutoCAD, MS Project, suivi chantier",               type_contrat: "CDI",       ville: "Nabeul",    experience_requise: "3-6 ans", niveau_etude: "Ingénieur", categorie_id: 4, specialite_id: 13, statut_validation: "validee",    recruteur_id: 10, salaire: "2800-3500 TND", days_ago: 14 },
      { titre: "Ingenieur Bureau d'Etudes Structure",         description: "Realiser les notes de calcul et plans pour des projets de batiments residentiels.",                   exigences: "Robot, Etabs, beton arme, methodes",                type_contrat: "CDI",       ville: "Nabeul",    experience_requise: "3-5 ans", niveau_etude: "Ingénieur", categorie_id: 4, specialite_id: 13, statut_validation: "validee",    recruteur_id: 10, salaire: "2800-3400 TND", days_ago: 19 },
      { titre: "Conducteur de Travaux",                       description: "Piloter l'execution de chantiers et la coordination des sous-traitants.",                            exigences: "Lecture de plans, planning, securite",              type_contrat: "CDI",       ville: "Hammamet", experience_requise: "5+ ans", niveau_etude: "Ingénieur", categorie_id: 4, specialite_id: 13, statut_validation: "validee",    recruteur_id: 10, salaire: "3200-4000 TND", days_ago: 21 },
      { titre: "Technicien Maintenance Mecanique",            description: "Assurer la maintenance preventive et corrective des equipements industriels.",                       exigences: "Pneumatique, hydraulique, lecture de plans",        type_contrat: "CDD",       ville: "Sousse",    experience_requise: "1-2 ans", niveau_etude: "BTS",       categorie_id: 4, specialite_id: 14, statut_validation: "validee",    recruteur_id: 1,  salaire: "1400-1700 TND", days_ago: 10 },
      { titre: "Ingenieur Process Industriel",                description: "Optimiser les flux de production et reduire les pertes sur ligne d'assemblage.",                      exigences: "Lean, six sigma, SAP",                              type_contrat: "CDI",       ville: "Bizerte",   experience_requise: "3-6 ans", niveau_etude: "Ingénieur", categorie_id: 4, specialite_id: 16, statut_validation: "validee",    recruteur_id: 14, salaire: "2900-3700 TND", days_ago: 25 },
      { titre: "Ingenieur Electrique",                        description: "Etudes et travaux d'electrification pour batiments tertiaires.",                                     exigences: "BT/HT, schemas, normes",                            type_contrat: "CDI",       ville: "Gabes",     experience_requise: "2-4 ans", niveau_etude: "Ingénieur", categorie_id: 4, specialite_id: 15, statut_validation: "validee",    recruteur_id: 10, salaire: "2500-3100 TND", days_ago: 23 },

      // ── RH (5) ──
      { titre: "Charge(e) de Recrutement IT",                 description: "Identifier et qualifier des profils tech pour des besoins nationaux et internationaux.",             exigences: "Sourcing LinkedIn, entretiens, ATS",                type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-4 ans", niveau_etude: "Master",    categorie_id: 5, specialite_id: 17, statut_validation: "validee",    recruteur_id: 9,  salaire: "2200-2900 TND", days_ago: 5 },
      { titre: "Talent Acquisition Lead",                     description: "Piloter la strategie d'acquisition de talents et structurer les pratiques d'entretien.",             exigences: "TA, leadership, employer branding",                 type_contrat: "CDI",       ville: "Tunis",     experience_requise: "5+ ans", niveau_etude: "Master",    categorie_id: 5, specialite_id: 17, statut_validation: "validee",    recruteur_id: 9,  salaire: "3500-4500 TND", days_ago: 11 },
      { titre: "Responsable Formation",                       description: "Construire des parcours de formation et mesurer l'impact des plans de developpement.",                exigences: "Ingenierie pedagogique, animation, LMS",            type_contrat: "CDI",       ville: "Tunis",     experience_requise: "4-6 ans", niveau_etude: "Master",    categorie_id: 5, specialite_id: 18, statut_validation: "en_attente", recruteur_id: 12, salaire: "2700-3500 TND", days_ago: 15 },
      { titre: "Gestionnaire Paie",                           description: "Etablir la paie multi-sociale et piloter les declarations sociales.",                                exigences: "Sage Paie, droit social, rigueur",                  type_contrat: "CDI",       ville: "Sousse",    experience_requise: "3-5 ans", niveau_etude: "Licence",   categorie_id: 5, specialite_id: 19, statut_validation: "validee",    recruteur_id: 11, salaire: "1800-2300 TND", days_ago: 12 },
      { titre: "HR Business Partner",                         description: "Accompagner les managers d'une BU technique sur tous les volets RH.",                                exigences: "Generaliste RH, conseil, droit social",             type_contrat: "CDI",       ville: "Tunis",     experience_requise: "5+ ans", niveau_etude: "Master",    categorie_id: 5, specialite_id: 17, statut_validation: "validee",    recruteur_id: 7,  salaire: "3000-3800 TND", days_ago: 20 },

      // ── Sante (6) ──
      { titre: "Medecin Generaliste",                         description: "Assurer les consultations de medecine generale en clinique privee.",                                  exigences: "Doctorat en medecine, inscription a l'ordre",       type_contrat: "CDI",       ville: "Monastir",  experience_requise: "2+ ans", niveau_etude: "Doctorat",  categorie_id: 6, specialite_id: 20, statut_validation: "validee",    recruteur_id: 5,  salaire: "4500-6000 TND", days_ago: 7 },
      { titre: "Pharmacien(ne) Officine",                     description: "Conseil patient, gestion des stocks et suivi reglementaire de l'officine.",                          exigences: "Diplome de pharmacie, sens du service",             type_contrat: "CDI",       ville: "Mahdia",    experience_requise: "1-3 ans", niveau_etude: "Doctorat",  categorie_id: 6, specialite_id: 21, statut_validation: "validee",    recruteur_id: 11, salaire: "2500-3200 TND", days_ago: 13 },
      { titre: "Infirmier(e) DE",                             description: "Soins infirmiers en service de medecine generale en clinique privee.",                               exigences: "DE infirmier, sens du soin, equipe",                type_contrat: "CDI",       ville: "Monastir",  experience_requise: "1-3 ans", niveau_etude: "Licence",   categorie_id: 6, specialite_id: 22, statut_validation: "validee",    recruteur_id: 5,  salaire: "1500-1900 TND", days_ago: 4 },
      { titre: "Pharmacien Responsable Etablissement",        description: "Encadrer la chaine pharmaceutique d'un grossiste reparteur.",                                        exigences: "PRE, reglementaire, leadership",                    type_contrat: "CDI",       ville: "Sousse",    experience_requise: "5+ ans", niveau_etude: "Doctorat",  categorie_id: 6, specialite_id: 21, statut_validation: "validee",    recruteur_id: 11, salaire: "5000-6500 TND", days_ago: 24 },
      { titre: "Assistant(e) Medical(e)",                     description: "Accueil patients, prise de RDV et gestion administrative en clinique.",                              exigences: "Accueil, organisation, outils bureautiques",        type_contrat: "CDD",       ville: "Monastir",  experience_requise: "0-1 an", niveau_etude: "Licence",   categorie_id: 6, specialite_id: 22, statut_validation: "validee",    recruteur_id: 5,  salaire: "1100-1400 TND", days_ago: 3 },

      // ── Education (7) ──
      { titre: "Formateur Web Frontend",                      description: "Animer des sessions de formation pour adultes en developpement web.",                                exigences: "HTML/CSS/JS, React, pedagogie",                     type_contrat: "Freelance", ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 7, specialite_id: 24, statut_validation: "validee",    recruteur_id: 12, salaire: "150-200 TND/jour", days_ago: 6 },
      { titre: "Enseignant(e) Anglais Primaire",              description: "Enseigner l'anglais a des classes de primaire dans une ecole privee.",                              exigences: "Diplome anglais, pedagogie, energie",               type_contrat: "CDI",       ville: "Tunis",     experience_requise: "1-3 ans", niveau_etude: "Licence",   categorie_id: 7, specialite_id: 23, statut_validation: "validee",    recruteur_id: 12, salaire: "1400-1800 TND", days_ago: 14 },
      { titre: "Formateur Comptabilite",                      description: "Former des adultes en reconversion sur les fondamentaux de la comptabilite.",                        exigences: "Sage, pedagogie, comptabilite",                     type_contrat: "CDD",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 7, specialite_id: 24, statut_validation: "validee",    recruteur_id: 12, salaire: "1800-2300 TND", days_ago: 18 },

      // ── Logistique (8) ──
      { titre: "Responsable Supply Chain",                    description: "Optimiser la chaine logistique d'un reseau de magasins multi-formats.",                              exigences: "S&OP, ERP, KPI logistiques",                        type_contrat: "CDI",       ville: "Ariana",    experience_requise: "5+ ans", niveau_etude: "Master",    categorie_id: 8, specialite_id: 25, statut_validation: "validee",    recruteur_id: 13, salaire: "3500-4500 TND", days_ago: 16 },
      { titre: "Responsable Entrepot",                        description: "Manager une equipe de 25 collaborateurs et garantir le SLA expedition.",                             exigences: "Logistique, encadrement, securite",                 type_contrat: "CDI",       ville: "Bizerte",   experience_requise: "4-6 ans", niveau_etude: "Licence",   categorie_id: 8, specialite_id: 26, statut_validation: "validee",    recruteur_id: 14, salaire: "2700-3300 TND", days_ago: 11 },
      { titre: "Coordinateur Transport",                      description: "Planifier les tournees, gerer les transporteurs et suivre la flotte.",                              exigences: "TMS, geographie, negociation",                      type_contrat: "CDI",       ville: "Bizerte",   experience_requise: "2-4 ans", niveau_etude: "Licence",   categorie_id: 8, specialite_id: 26, statut_validation: "validee",    recruteur_id: 14, salaire: "1900-2500 TND", days_ago: 8 },
      { titre: "Demand Planner",                              description: "Construire les previsions de demande et alimenter le plan industriel.",                              exigences: "Statistiques, ERP, anglais",                        type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-4 ans", niveau_etude: "Master",    categorie_id: 8, specialite_id: 25, statut_validation: "en_attente", recruteur_id: 13, salaire: "2400-3000 TND", days_ago: 19 },

      // ── Design (9) ──
      { titre: "UI/UX Designer Senior",                       description: "Concevoir des produits digitaux a fort impact et entretenir un design system unifie.",               exigences: "Figma, recherche utilisateur, design system",       type_contrat: "CDI",       ville: "Sfax",      experience_requise: "4-6 ans", niveau_etude: "Master",    categorie_id: 9, specialite_id: 27, statut_validation: "validee",    recruteur_id: 8,  salaire: "3000-4000 TND", days_ago: 9 },
      { titre: "Designer Graphique",                          description: "Realiser des supports print et digitaux pour des marques tunisiennes.",                              exigences: "Suite Adobe, brand design, motion",                 type_contrat: "CDI",       ville: "Sfax",      experience_requise: "2-4 ans", niveau_etude: "Licence",   categorie_id: 9, specialite_id: 28, statut_validation: "validee",    recruteur_id: 8,  salaire: "1900-2500 TND", days_ago: 7 },
      { titre: "Product Designer",                            description: "Conduire les phases discovery, prototypage et tests utilisateurs sur un produit SaaS.",              exigences: "Figma, Maze, ateliers UX",                          type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 9, specialite_id: 27, statut_validation: "validee",    recruteur_id: 6,  salaire: "2800-3700 TND", days_ago: 4 },
      { titre: "Stage Design UI/UX",                          description: "Stage decouverte sur des projets clients avec mentorat senior.",                                     exigences: "Figma, curiosite, sens du detail",                  type_contrat: "Stage",     ville: "Sfax",      experience_requise: "0-1 an",  niveau_etude: "Licence",   categorie_id: 9, specialite_id: 27, statut_validation: "validee",    recruteur_id: 8,  salaire: "500-700 TND",   days_ago: 2 },

      // ── Vente (10) ──
      { titre: "Commercial(e) BtoB Tunis",                    description: "Developper un portefeuille clients PME sur la region du Grand Tunis.",                               exigences: "Vente, prospection, CRM",                           type_contrat: "CDI",       ville: "Tunis",     experience_requise: "2-4 ans", niveau_etude: "Licence",   categorie_id: 10, specialite_id: 29, statut_validation: "validee",    recruteur_id: 13, salaire: "1800-2400 TND + commissions", days_ago: 5 },
      { titre: "Commercial Terrain Sud",                      description: "Animer un secteur sud (Sfax, Gabes, Mednine) et atteindre les objectifs trimestriels.",              exigences: "Permis, prospection, autonomie",                    type_contrat: "CDI",       ville: "Sfax",      experience_requise: "2-4 ans", niveau_etude: "Licence",   categorie_id: 10, specialite_id: 29, statut_validation: "validee",    recruteur_id: 13, salaire: "1700-2300 TND + commissions", days_ago: 12 },
      { titre: "Conseiller(e) Service Client",                description: "Repondre aux demandes des clients sur plusieurs canaux (chat, email, telephone).",                  exigences: "Aisance ecrite, empathie, anglais",                 type_contrat: "CDI",       ville: "Tunis",     experience_requise: "1-3 ans", niveau_etude: "Licence",   categorie_id: 10, specialite_id: 30, statut_validation: "validee",    recruteur_id: 6,  salaire: "1300-1700 TND", days_ago: 3 },
      { titre: "Responsable Magasin",                         description: "Animer une equipe de 12 collaborateurs et atteindre les objectifs commerciaux.",                     exigences: "Management, retail, KPI",                           type_contrat: "CDI",       ville: "Ariana",    experience_requise: "4-6 ans", niveau_etude: "Licence",   categorie_id: 10, specialite_id: 29, statut_validation: "validee",    recruteur_id: 13, salaire: "2200-2800 TND", days_ago: 17 },
      { titre: "Vendeur(se) Conseil Pharmacie",               description: "Conseil produits parapharmacie et fidelisation clients en officine.",                                exigences: "Sens du conseil, presentation, attention",          type_contrat: "CDD",       ville: "Sousse",    experience_requise: "0-1 an",  niveau_etude: "Bac",       categorie_id: 10, specialite_id: 30, statut_validation: "validee",    recruteur_id: 11, salaire: "1100-1400 TND", days_ago: 6 },
      { titre: "Account Manager B2B",                         description: "Suivre et faire grandir un portefeuille clients grands comptes.",                                    exigences: "Negociation, anglais, CRM",                         type_contrat: "CDI",       ville: "Tunis",     experience_requise: "3-5 ans", niveau_etude: "Master",    categorie_id: 10, specialite_id: 29, statut_validation: "validee",    recruteur_id: 7,  salaire: "2800-3600 TND + variable", days_ago: 10 },
      { titre: "Telesales Outbound",                          description: "Generer des opportunites commerciales via campagnes outbound multi-canaux.",                          exigences: "Phoning, CRM, persistance",                         type_contrat: "CDD",       ville: "Tunis",     experience_requise: "0-2 ans", niveau_etude: "Bac",       categorie_id: 10, specialite_id: 30, statut_validation: "en_attente", recruteur_id: 13, salaire: "1200-1600 TND + bonus", days_ago: 1 },
    ];
    for (const o of offres) {
      await client.query(
        `INSERT INTO offre_emploi (titre, description, exigences, type_contrat, ville, experience_requise, niveau_etude, categorie_id, specialite_id, statut_validation, recruteur_id, salaire, date_creation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() - ($13 || ' days')::interval)`,
        [o.titre, o.description, o.exigences, o.type_contrat, o.ville, o.experience_requise, o.niveau_etude, o.categorie_id, o.specialite_id, o.statut_validation, o.recruteur_id, o.salaire, o.days_ago]
      );
    }

    // ── Candidats (15) ──
    const candidats = [
      { nom: "Ben Ali",     prenom: "Mohamed",  email: "mohamed.benali@email.tn",     niveau_etude: "Licence",   experience: "2 ans",  diplome: "Licence en Informatique",            telephone: "+216 22 000 001" },
      { nom: "Trabelsi",    prenom: "Fatma",    email: "fatma.trabelsi@email.tn",     niveau_etude: "Master",    experience: "1 an",   diplome: "Master en Finance",                  telephone: "+216 22 000 002" },
      { nom: "Hammami",     prenom: "Ahmed",    email: "ahmed.hammami@email.tn",      niveau_etude: "Ingénieur", experience: "4 ans",  diplome: "Ingenieur en Informatique",          telephone: "+216 22 000 003" },
      { nom: "Chaabane",    prenom: "Sarra",    email: "sarra.chaabane@email.tn",     niveau_etude: "Licence",   experience: "0 ans",  diplome: "Licence en Marketing",               telephone: "+216 22 000 004" },
      { nom: "Mansour",     prenom: "Yassine",  email: "yassine.mansour@email.tn",    niveau_etude: "Ingénieur", experience: "3 ans",  diplome: "Ingenieur Genie Civil",              telephone: "+216 22 000 005" },
      { nom: "Khelifi",     prenom: "Imen",     email: "imen.khelifi@email.tn",       niveau_etude: "Master",    experience: "5 ans",  diplome: "Master en RH",                       telephone: "+216 22 000 006" },
      { nom: "Bouzid",      prenom: "Rami",     email: "rami.bouzid@email.tn",        niveau_etude: "Master",    experience: "6 ans",  diplome: "Master Data Science",                telephone: "+216 22 000 007" },
      { nom: "Sassi",       prenom: "Lina",     email: "lina.sassi@email.tn",         niveau_etude: "Licence",   experience: "2 ans",  diplome: "Licence Design Graphique",           telephone: "+216 22 000 008" },
      { nom: "Brahmi",      prenom: "Khalil",   email: "khalil.brahmi@email.tn",      niveau_etude: "Doctorat",  experience: "4 ans",  diplome: "Doctorat en Pharmacie",              telephone: "+216 22 000 009" },
      { nom: "Ferchichi",   prenom: "Asma",     email: "asma.ferchichi@email.tn",     niveau_etude: "Licence",   experience: "1 an",   diplome: "Licence en Comptabilite",            telephone: "+216 22 000 010" },
      { nom: "Zouari",      prenom: "Tarek",    email: "tarek.zouari@email.tn",       niveau_etude: "Ingénieur", experience: "5 ans",  diplome: "Ingenieur Telecoms",                 telephone: "+216 22 000 011" },
      { nom: "Riahi",       prenom: "Nour",     email: "nour.riahi@email.tn",         niveau_etude: "Master",    experience: "3 ans",  diplome: "Master en Logistique",               telephone: "+216 22 000 012" },
      { nom: "Cherif",      prenom: "Maher",    email: "maher.cherif@email.tn",       niveau_etude: "Bac",       experience: "1 an",   diplome: "Bac Pro Vente",                      telephone: "+216 22 000 013" },
      { nom: "Gharbi",      prenom: "Sirine",   email: "sirine.gharbi@email.tn",      niveau_etude: "Doctorat",  experience: "2 ans",  diplome: "Doctorat en Medecine",               telephone: "+216 22 000 014" },
      { nom: "Abidi",       prenom: "Mehdi",    email: "mehdi.abidi@email.tn",        niveau_etude: "Master",    experience: "7 ans",  diplome: "Master en Cybersecurite",            telephone: "+216 22 000 015" },
    ];
    for (const c of candidats) {
      await client.query(
        `INSERT INTO candidat (nom, prenom, email, mot_de_passe, niveau_etude, experience, diplome, telephone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [c.nom, c.prenom, c.email, hashedPassword, c.niveau_etude, c.experience, c.diplome, c.telephone]
      );
    }

    // ── Candidatures (35) ──
    const candidatures = [
      { candidat_id: 1,  offre_emploi_id: 1,  statut: "en_attente" },
      { candidat_id: 1,  offre_emploi_id: 2,  statut: "acceptee"   },
      { candidat_id: 1,  offre_emploi_id: 8,  statut: "en_attente" },
      { candidat_id: 2,  offre_emploi_id: 14, statut: "en_attente" },
      { candidat_id: 2,  offre_emploi_id: 17, statut: "refusee"    },
      { candidat_id: 2,  offre_emploi_id: 19, statut: "en_attente" },
      { candidat_id: 3,  offre_emploi_id: 2,  statut: "refusee"    },
      { candidat_id: 3,  offre_emploi_id: 7,  statut: "acceptee"   },
      { candidat_id: 3,  offre_emploi_id: 11, statut: "en_attente" },
      { candidat_id: 4,  offre_emploi_id: 21, statut: "en_attente" },
      { candidat_id: 4,  offre_emploi_id: 24, statut: "en_attente" },
      { candidat_id: 5,  offre_emploi_id: 27, statut: "acceptee"   },
      { candidat_id: 5,  offre_emploi_id: 28, statut: "en_attente" },
      { candidat_id: 5,  offre_emploi_id: 29, statut: "en_attente" },
      { candidat_id: 6,  offre_emploi_id: 33, statut: "en_attente" },
      { candidat_id: 6,  offre_emploi_id: 34, statut: "refusee"    },
      { candidat_id: 7,  offre_emploi_id: 5,  statut: "acceptee"   },
      { candidat_id: 7,  offre_emploi_id: 6,  statut: "en_attente" },
      { candidat_id: 8,  offre_emploi_id: 49, statut: "en_attente" },
      { candidat_id: 8,  offre_emploi_id: 50, statut: "acceptee"   },
      { candidat_id: 8,  offre_emploi_id: 52, statut: "en_attente" },
      { candidat_id: 9,  offre_emploi_id: 38, statut: "en_attente" },
      { candidat_id: 9,  offre_emploi_id: 40, statut: "acceptee"   },
      { candidat_id: 10, offre_emploi_id: 16, statut: "en_attente" },
      { candidat_id: 10, offre_emploi_id: 18, statut: "en_attente" },
      { candidat_id: 11, offre_emploi_id: 10, statut: "en_attente" },
      { candidat_id: 11, offre_emploi_id: 11, statut: "refusee"    },
      { candidat_id: 12, offre_emploi_id: 44, statut: "en_attente" },
      { candidat_id: 12, offre_emploi_id: 46, statut: "acceptee"   },
      { candidat_id: 13, offre_emploi_id: 53, statut: "en_attente" },
      { candidat_id: 13, offre_emploi_id: 55, statut: "en_attente" },
      { candidat_id: 14, offre_emploi_id: 37, statut: "acceptee"   },
      { candidat_id: 14, offre_emploi_id: 41, statut: "en_attente" },
      { candidat_id: 15, offre_emploi_id: 11, statut: "en_attente" },
      { candidat_id: 15, offre_emploi_id: 12, statut: "en_attente" },
    ];
    for (const ca of candidatures) {
      await client.query(
        `INSERT INTO candidature (candidat_id, offre_emploi_id, statut) VALUES ($1, $2, $3)`,
        [ca.candidat_id, ca.offre_emploi_id, ca.statut]
      );
    }

    await client.query("COMMIT");
    console.log(
      `Database seeded successfully: ${categories.length} categories, ${specialites.length} specialites, ${recruteurs.length} recruteurs, ${offres.length} offres, ${candidats.length} candidats, ${candidatures.length} candidatures.`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

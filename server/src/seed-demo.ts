import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { pool } from "./db";

const SALT_ROUNDS = 10;
const DEMO_PASSWORD = "password123";
const demoCvPath = "/uploads/cvs/CV_demo.pdf";

type QueryValue = string | number | null;

async function one<T>(query: string, values: QueryValue[] = []): Promise<T | null> {
  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
}

async function ensureDemoCv() {
  const cvDir = path.join(__dirname, "../uploads/cvs");
  fs.mkdirSync(cvDir, { recursive: true });

  const pdfPath = path.join(cvDir, "CV_demo.pdf");
  if (fs.existsSync(pdfPath)) return;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 112 >>
stream
BT
/F1 20 Tf
72 720 Td
(CV de demonstration JobLinker) Tj
0 -32 Td
/F1 12 Tf
(Mot de passe des comptes demo: password123) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000255 00000 n 
0000000417 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
487
%%EOF
`;
  fs.writeFileSync(pdfPath, pdf, "utf-8");
}

async function ensureCategory(name: string): Promise<number> {
  const existing = await one<{ id: number }>("SELECT id FROM categorie WHERE nom = $1 LIMIT 1", [name]);
  if (existing) return existing.id;

  const inserted = await one<{ id: number }>("INSERT INTO categorie (nom) VALUES ($1) RETURNING id", [name]);
  return inserted!.id;
}

async function ensureSpeciality(name: string, categoryId: number): Promise<number> {
  const existing = await one<{ id: number }>(
    "SELECT id FROM specialite WHERE nom = $1 AND categorie_id = $2 LIMIT 1",
    [name, categoryId]
  );
  if (existing) return existing.id;

  const inserted = await one<{ id: number }>(
    "INSERT INTO specialite (nom, categorie_id) VALUES ($1, $2) RETURNING id",
    [name, categoryId]
  );
  return inserted!.id;
}

async function ensureOffer(data: {
  titre: string;
  description: string;
  exigences: string;
  typeContrat: string;
  ville: string;
  experienceRequise: string;
  niveauEtude: string;
  categorieId: number;
  specialiteId: number;
  statutValidation: string;
  recruteurId: number;
  salaire: string;
  daysAgo: number;
}): Promise<number> {
  const existing = await one<{ id: number }>(
    "SELECT id FROM offre_emploi WHERE titre = $1 AND recruteur_id = $2 LIMIT 1",
    [data.titre, data.recruteurId]
  );

  if (existing) {
    await pool.query(
      `UPDATE offre_emploi
       SET description = $1, exigences = $2, type_contrat = $3, ville = $4,
           experience_requise = $5, niveau_etude = $6, categorie_id = $7,
           specialite_id = $8, statut_validation = $9, salaire = $10
       WHERE id = $11`,
      [
        data.description,
        data.exigences,
        data.typeContrat,
        data.ville,
        data.experienceRequise,
        data.niveauEtude,
        data.categorieId,
        data.specialiteId,
        data.statutValidation,
        data.salaire,
        existing.id,
      ]
    );
    return existing.id;
  }

  const inserted = await one<{ id: number }>(
    `INSERT INTO offre_emploi
      (titre, description, exigences, type_contrat, ville, experience_requise,
       niveau_etude, categorie_id, specialite_id, statut_validation, recruteur_id, salaire, date_creation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() - ($13 || ' days')::interval)
     RETURNING id`,
    [
      data.titre,
      data.description,
      data.exigences,
      data.typeContrat,
      data.ville,
      data.experienceRequise,
      data.niveauEtude,
      data.categorieId,
      data.specialiteId,
      data.statutValidation,
      data.recruteurId,
      data.salaire,
      data.daysAgo,
    ]
  );
  return inserted!.id;
}

async function seedDemo() {
  await ensureDemoCv();
  await pool.query("ALTER TABLE offre_emploi ADD COLUMN IF NOT EXISTS salaire TEXT");
  await pool.query("ALTER TABLE offre_emploi ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const admin = await one<{ id: number }>(
    `INSERT INTO administrateur (email, mot_de_passe)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe
     RETURNING id`,
    ["admin@joblinker.test", passwordHash]
  );

  const categoryNames = ["Informatique", "Finance", "Marketing", "Ressources Humaines", "Design", "Logistique"];
  const categories = Object.fromEntries(
    await Promise.all(categoryNames.map(async (name) => [name, await ensureCategory(name)]))
  ) as Record<string, number>;

  const specialities = {
    web: await ensureSpeciality("Developpement Web", categories.Informatique),
    data: await ensureSpeciality("Data Science", categories.Informatique),
    devops: await ensureSpeciality("DevOps & Cloud", categories.Informatique),
    finance: await ensureSpeciality("Comptabilite & Audit", categories.Finance),
    marketing: await ensureSpeciality("Marketing Digital", categories.Marketing),
    rh: await ensureSpeciality("Recrutement", categories["Ressources Humaines"]),
    ux: await ensureSpeciality("UI/UX Design", categories.Design),
    supply: await ensureSpeciality("Supply Chain", categories.Logistique),
  };

  const recruteurs = [
    {
      key: "tech",
      nomEntreprise: "JobLinker Tech Demo",
      email: "recruteur.tech@joblinker.test",
      matriculeFiscal: "DEMO-TECH-001",
      adresse: "Tunis, Lac 2",
      description: "Entreprise tech de demonstration pour tester les offres IT.",
      statutValidation: "validee",
      telephone: "+216 71 100 001",
      nomRepresentant: "Mansouri",
      prenomRepresentant: "Ines",
    },
    {
      key: "finance",
      nomEntreprise: "Finance Demo Consulting",
      email: "recruteur.finance@joblinker.test",
      matriculeFiscal: "DEMO-FIN-002",
      adresse: "Sfax, Centre ville",
      description: "Cabinet de conseil finance et audit pour jeux de test.",
      statutValidation: "validee",
      telephone: "+216 74 100 002",
      nomRepresentant: "Jaziri",
      prenomRepresentant: "Karim",
    },
    {
      key: "pending",
      nomEntreprise: "Startup En Attente Demo",
      email: "recruteur.pending@joblinker.test",
      matriculeFiscal: "DEMO-PEND-003",
      adresse: "Sousse, Khezama",
      description: "Recruteur en attente de validation admin.",
      statutValidation: "en_attente",
      telephone: "+216 73 100 003",
      nomRepresentant: "Sassi",
      prenomRepresentant: "Nadia",
    },
  ];

  const recruteurIds: Record<string, number> = {};
  for (const r of recruteurs) {
    const row = await one<{ id: number }>(
      `INSERT INTO recruteur
        (nom_entreprise, matricule_fiscal, adresse, description, statut_validation,
         email, mot_de_passe, telephone, nom_representant, prenom_representant)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (email) DO UPDATE SET
         nom_entreprise = EXCLUDED.nom_entreprise,
         matricule_fiscal = EXCLUDED.matricule_fiscal,
         adresse = EXCLUDED.adresse,
         description = EXCLUDED.description,
         statut_validation = EXCLUDED.statut_validation,
         mot_de_passe = EXCLUDED.mot_de_passe,
         telephone = EXCLUDED.telephone,
         nom_representant = EXCLUDED.nom_representant,
         prenom_representant = EXCLUDED.prenom_representant
       RETURNING id`,
      [
        r.nomEntreprise,
        r.matriculeFiscal,
        r.adresse,
        r.description,
        r.statutValidation,
        r.email,
        passwordHash,
        r.telephone,
        r.nomRepresentant,
        r.prenomRepresentant,
      ]
    );
    recruteurIds[r.key] = row!.id;
  }

  const candidats = [
    {
      key: "khaled",
      nom: "Hachicha",
      prenom: "Khaled",
      email: "khaled.hachicha@joblinker.test",
      telephone: "+216 22 200 001",
      diplome: "Licence en Informatique",
      niveauEtude: "Bac+3",
      experience: "2 ans en developpement web React et Node.js.",
      lettreMotivation: "Je souhaite rejoindre une equipe produit ambitieuse et contribuer rapidement.",
    },
    {
      key: "sarra",
      nom: "Ben Salem",
      prenom: "Sarra",
      email: "sarra.bensalem@joblinker.test",
      telephone: "+216 22 200 002",
      diplome: "Master Finance",
      niveauEtude: "Bac+5",
      experience: "3 ans en audit financier et controle interne.",
      lettreMotivation: "Votre offre correspond a mon experience en audit et reporting.",
    },
    {
      key: "amine",
      nom: "Trabelsi",
      prenom: "Amine",
      email: "amine.trabelsi@joblinker.test",
      telephone: "+216 22 200 003",
      diplome: "Master Marketing Digital",
      niveauEtude: "Bac+5",
      experience: "Growth marketing, SEO, Meta Ads et Google Ads.",
      lettreMotivation: "Je peux aider vos equipes a ameliorer l'acquisition et la conversion.",
    },
    {
      key: "nour",
      nom: "Riahi",
      prenom: "Nour",
      email: "nour.riahi@joblinker.test",
      telephone: "",
      diplome: "",
      niveauEtude: "",
      experience: "",
      lettreMotivation: "",
    },
  ];

  const candidatIds: Record<string, number> = {};
  for (const c of candidats) {
    const row = await one<{ id: number }>(
      `INSERT INTO candidat
        (nom, prenom, email, mot_de_passe, telephone, diplome, niveau_etude, experience, lettre_motivation, cv)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (email) DO UPDATE SET
         nom = EXCLUDED.nom,
         prenom = EXCLUDED.prenom,
         mot_de_passe = EXCLUDED.mot_de_passe,
         telephone = EXCLUDED.telephone,
         diplome = EXCLUDED.diplome,
         niveau_etude = EXCLUDED.niveau_etude,
         experience = EXCLUDED.experience,
         lettre_motivation = EXCLUDED.lettre_motivation,
         cv = EXCLUDED.cv
       RETURNING id`,
      [
        c.nom,
        c.prenom,
        c.email,
        passwordHash,
        c.telephone,
        c.diplome,
        c.niveauEtude,
        c.experience,
        c.lettreMotivation,
        c.key === "nour" ? "" : demoCvPath,
      ]
    );
    candidatIds[c.key] = row!.id;
  }

  const offers = [
    await ensureOffer({
      titre: "Developpeur Full Stack React Node.js Demo",
      description: "Construire des fonctionnalites SaaS, travailler sur l'API et l'interface candidat.",
      exigences: "React, TypeScript, Node.js, PostgreSQL",
      typeContrat: "CDI",
      ville: "Tunis",
      experienceRequise: "2-3 ans",
      niveauEtude: "Bac+3",
      categorieId: categories.Informatique,
      specialiteId: specialities.web,
      statutValidation: "validee",
      recruteurId: recruteurIds.tech,
      salaire: "2500-3500 TND",
      daysAgo: 1,
    }),
    await ensureOffer({
      titre: "Data Analyst BI Demo",
      description: "Produire des dashboards Power BI et analyser les indicateurs business.",
      exigences: "SQL, Power BI, Excel avance",
      typeContrat: "CDI",
      ville: "Tunis",
      experienceRequise: "1-3 ans",
      niveauEtude: "Bac+5",
      categorieId: categories.Informatique,
      specialiteId: specialities.data,
      statutValidation: "validee",
      recruteurId: recruteurIds.tech,
      salaire: "2200-3000 TND",
      daysAgo: 3,
    }),
    await ensureOffer({
      titre: "Ingenieur DevOps Cloud Demo",
      description: "Maintenir les pipelines CI/CD et l'infrastructure cloud.",
      exigences: "Docker, Linux, CI/CD, AWS",
      typeContrat: "CDI",
      ville: "Ariana",
      experienceRequise: "3-5 ans",
      niveauEtude: "Bac+5",
      categorieId: categories.Informatique,
      specialiteId: specialities.devops,
      statutValidation: "en_attente",
      recruteurId: recruteurIds.tech,
      salaire: "3500-4500 TND",
      daysAgo: 0,
    }),
    await ensureOffer({
      titre: "Auditeur Financier Junior Demo",
      description: "Participer aux missions d'audit legal et aux revues de controle interne.",
      exigences: "Comptabilite, Excel, normes IFRS",
      typeContrat: "CDD",
      ville: "Sfax",
      experienceRequise: "0-1 an",
      niveauEtude: "Bac+5",
      categorieId: categories.Finance,
      specialiteId: specialities.finance,
      statutValidation: "validee",
      recruteurId: recruteurIds.finance,
      salaire: "1500-2000 TND",
      daysAgo: 6,
    }),
    await ensureOffer({
      titre: "Specialiste Marketing Digital Demo",
      description: "Piloter campagnes Google Ads, Meta Ads et reporting acquisition.",
      exigences: "GA4, Meta Ads, Google Ads, copywriting",
      typeContrat: "CDI",
      ville: "Sousse",
      experienceRequise: "2-4 ans",
      niveauEtude: "Bac+3",
      categorieId: categories.Marketing,
      specialiteId: specialities.marketing,
      statutValidation: "validee",
      recruteurId: recruteurIds.pending,
      salaire: "1800-2600 TND",
      daysAgo: 2,
    }),
    await ensureOffer({
      titre: "UI UX Designer Demo",
      description: "Concevoir des parcours candidats et recruteurs simples et modernes.",
      exigences: "Figma, design system, tests utilisateurs",
      typeContrat: "Freelance",
      ville: "Remote",
      experienceRequise: "3-5 ans",
      niveauEtude: "Bac+3",
      categorieId: categories.Design,
      specialiteId: specialities.ux,
      statutValidation: "validee",
      recruteurId: recruteurIds.tech,
      salaire: "180 TND/jour",
      daysAgo: 4,
    }),
  ];

  const applications = [
    { candidat: "khaled", offer: offers[0], statut: "en_attente" },
    { candidat: "khaled", offer: offers[1], statut: "acceptee" },
    { candidat: "sarra", offer: offers[3], statut: "en_attente" },
    { candidat: "amine", offer: offers[4], statut: "refusee" },
    { candidat: "amine", offer: offers[5], statut: "en_attente" },
    { candidat: "nour", offer: offers[0], statut: "en_attente" },
  ];

  for (const app of applications) {
    const candidatId = candidatIds[app.candidat];
    const existing = await one<{ id: number }>(
      "SELECT id FROM candidature WHERE candidat_id = $1 AND offre_emploi_id = $2 LIMIT 1",
      [candidatId, app.offer]
    );
    const letter = "Candidature de demonstration pour tester le workflow recruteur/candidat.";

    if (existing) {
      await pool.query(
        "UPDATE candidature SET statut = $1, lettre_motivation = $2, cv = $3 WHERE id = $4",
        [app.statut, letter, demoCvPath, existing.id]
      );
    } else {
      await pool.query(
        `INSERT INTO candidature (candidat_id, offre_emploi_id, statut, lettre_motivation, cv)
         VALUES ($1, $2, $3, $4, $5)`,
        [candidatId, app.offer, app.statut, letter, demoCvPath]
      );
    }
  }

  await pool.end();

  console.log("Demo data added successfully.");
  console.log(`Admin: admin@joblinker.test / ${DEMO_PASSWORD}`);
  console.log(`Recruiters: ${recruteurs.map((r) => r.email).join(", ")} / ${DEMO_PASSWORD}`);
  console.log(`Candidates: ${candidats.map((c) => c.email).join(", ")} / ${DEMO_PASSWORD}`);
}

seedDemo().catch(async (error) => {
  console.error("Demo seed failed:", error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});

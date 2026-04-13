import { pool } from "./db";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear tables in reverse dependency order
    await client.query("DELETE FROM candidature");
    await client.query("DELETE FROM offre_emploi");
    await client.query("DELETE FROM candidat");
    await client.query("DELETE FROM recruteur");
    await client.query("DELETE FROM specialite");
    await client.query("DELETE FROM categorie");
    await client.query("DELETE FROM administrateur");

    // Reset sequences
    await client.query("ALTER SEQUENCE administrateur_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE categorie_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE specialite_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE recruteur_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE offre_emploi_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE candidat_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE candidature_id_seq RESTART WITH 1");

    const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

    // --- Administrateur ---
    await client.query(
      `INSERT INTO administrateur (email, mot_de_passe) VALUES ($1, $2)`,
      ["admin@jobportal.tn", hashedPassword]
    );

    // --- Categories ---
    const categories = [
      "Informatique",
      "Finance",
      "Marketing",
      "Ingénierie",
      "Ressources Humaines",
      "Santé",
    ];
    for (const nom of categories) {
      await client.query(`INSERT INTO categorie (nom) VALUES ($1)`, [nom]);
    }

    // --- Specialites ---
    const specialites = [
      // Informatique (1)
      { nom: "Développement Web", categorie_id: 1 },
      { nom: "Développement Mobile", categorie_id: 1 },
      { nom: "Data Science", categorie_id: 1 },
      { nom: "DevOps", categorie_id: 1 },
      // Finance (2)
      { nom: "Comptabilité", categorie_id: 2 },
      { nom: "Audit", categorie_id: 2 },
      // Marketing (3)
      { nom: "Marketing Digital", categorie_id: 3 },
      { nom: "Community Management", categorie_id: 3 },
      // Ingénierie (4)
      { nom: "Génie Civil", categorie_id: 4 },
      { nom: "Génie Mécanique", categorie_id: 4 },
      // Ressources Humaines (5)
      { nom: "Recrutement", categorie_id: 5 },
      { nom: "Formation", categorie_id: 5 },
      // Santé (6)
      { nom: "Médecine Générale", categorie_id: 6 },
      { nom: "Pharmacie", categorie_id: 6 },
    ];
    for (const s of specialites) {
      await client.query(
        `INSERT INTO specialite (nom, categorie_id) VALUES ($1, $2)`,
        [s.nom, s.categorie_id]
      );
    }

    // --- Recruteurs ---
    const recruteurs = [
      {
        nom_entreprise: "TechnoSoft",
        matricule_fiscal: "TS123456",
        adresse: "Tunis, Centre Urbain Nord",
        description: "Entreprise spécialisée en développement logiciel",
        statut_validation: "validee",
        email: "contact@technosoft.tn",
        telephone: "+216 71 000 001",
        nom_representant: "Bouzid",
        prenom_representant: "Karim",
      },
      {
        nom_entreprise: "FinancePlus",
        matricule_fiscal: "FP789012",
        adresse: "Sfax, Route de Tunis",
        description: "Cabinet de conseil en finance et audit",
        statut_validation: "validee",
        email: "rh@financeplus.tn",
        telephone: "+216 74 000 002",
        nom_representant: "Jaziri",
        prenom_representant: "Amira",
      },
      {
        nom_entreprise: "MarketPro",
        matricule_fiscal: "MP345678",
        adresse: "Sousse, Zone Industrielle",
        description: "Agence de marketing digital",
        statut_validation: "en_attente",
        email: "info@marketpro.tn",
        telephone: "+216 73 000 003",
        nom_representant: "Sassi",
        prenom_representant: "Nadia",
      },
    ];
    for (const r of recruteurs) {
      await client.query(
        `INSERT INTO recruteur (nom_entreprise, matricule_fiscal, adresse, description, statut_validation, email, mot_de_passe, telephone, nom_representant, prenom_representant)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          r.nom_entreprise,
          r.matricule_fiscal,
          r.adresse,
          r.description,
          r.statut_validation,
          r.email,
          hashedPassword,
          r.telephone,
          r.nom_representant,
          r.prenom_representant,
        ]
      );
    }

    // --- Offres d'emploi ---
    const offres = [
      {
        titre: "Développeur Full Stack Node.js / React",
        description:
          "Nous recherchons un développeur full stack pour rejoindre notre équipe produit.",
        exigences: "Node.js, React, TypeScript, PostgreSQL",
        type_contrat: "CDI",
        ville: "Tunis",
        experience_requise: "2-3 ans",
        niveau_etude: "Licence",
        categorie_id: 1,
        specialite_id: 1,
        statut_validation: "validee",
        recruteur_id: 1,
      },
      {
        titre: "Ingénieur DevOps",
        description:
          "Mission : mettre en place et maintenir les pipelines CI/CD.",
        exigences: "Docker, Kubernetes, Jenkins, AWS",
        type_contrat: "CDI",
        ville: "Tunis",
        experience_requise: "3-5 ans",
        niveau_etude: "Ingénieur",
        categorie_id: 1,
        specialite_id: 4,
        statut_validation: "validee",
        recruteur_id: 1,
      },
      {
        titre: "Auditeur Financier Junior",
        description:
          "Participer aux missions d'audit et de contrôle financier.",
        exigences: "Maîtrise des normes IFRS, Excel avancé",
        type_contrat: "CDD",
        ville: "Sfax",
        experience_requise: "0-1 an",
        niveau_etude: "Master",
        categorie_id: 2,
        specialite_id: 6,
        statut_validation: "validee",
        recruteur_id: 2,
      },
      {
        titre: "Comptable Senior",
        description: "Gestion de la comptabilité générale et analytique.",
        exigences: "Sage, SAP, 5 ans d'expérience minimum",
        type_contrat: "CDI",
        ville: "Sfax",
        experience_requise: "5+ ans",
        niveau_etude: "Licence",
        categorie_id: 2,
        specialite_id: 5,
        statut_validation: "en_attente",
        recruteur_id: 2,
      },
      {
        titre: "Community Manager",
        description:
          "Gérer les réseaux sociaux et créer du contenu engageant.",
        exigences: "Maîtrise des réseaux sociaux, Canva, copywriting",
        type_contrat: "Stage",
        ville: "Sousse",
        experience_requise: "0-1 an",
        niveau_etude: "Licence",
        categorie_id: 3,
        specialite_id: 8,
        statut_validation: "en_attente",
        recruteur_id: 3,
      },
    ];
    for (const o of offres) {
      await client.query(
        `INSERT INTO offre_emploi (titre, description, exigences, type_contrat, ville, experience_requise, niveau_etude, categorie_id, specialite_id, statut_validation, recruteur_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          o.titre,
          o.description,
          o.exigences,
          o.type_contrat,
          o.ville,
          o.experience_requise,
          o.niveau_etude,
          o.categorie_id,
          o.specialite_id,
          o.statut_validation,
          o.recruteur_id,
        ]
      );
    }

    // --- Candidats ---
    const candidats = [
      {
        nom: "Ben Ali",
        prenom: "Mohamed",
        email: "mohamed.benali@email.tn",
        niveau_etude: "Licence",
        experience: "2 ans",
        diplome: "Licence en Informatique",
        telephone: "+216 22 000 001",
      },
      {
        nom: "Trabelsi",
        prenom: "Fatma",
        email: "fatma.trabelsi@email.tn",
        niveau_etude: "Master",
        experience: "1 an",
        diplome: "Master en Finance",
        telephone: "+216 22 000 002",
      },
      {
        nom: "Hammami",
        prenom: "Ahmed",
        email: "ahmed.hammami@email.tn",
        niveau_etude: "Ingénieur",
        experience: "4 ans",
        diplome: "Diplôme d'Ingénieur en Informatique",
        telephone: "+216 22 000 003",
      },
      {
        nom: "Chaabane",
        prenom: "Sarra",
        email: "sarra.chaabane@email.tn",
        niveau_etude: "Licence",
        experience: "0 ans",
        diplome: "Licence en Marketing",
        telephone: "+216 22 000 004",
      },
    ];
    for (const c of candidats) {
      await client.query(
        `INSERT INTO candidat (nom, prenom, email, mot_de_passe, niveau_etude, experience, diplome, telephone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          c.nom,
          c.prenom,
          c.email,
          hashedPassword,
          c.niveau_etude,
          c.experience,
          c.diplome,
          c.telephone,
        ]
      );
    }

    // --- Candidatures ---
    const candidatures = [
      { candidat_id: 1, offre_emploi_id: 1, statut: "en_attente" },
      { candidat_id: 1, offre_emploi_id: 2, statut: "acceptee" },
      { candidat_id: 2, offre_emploi_id: 3, statut: "en_attente" },
      { candidat_id: 3, offre_emploi_id: 2, statut: "refusee" },
      { candidat_id: 4, offre_emploi_id: 5, statut: "en_attente" },
    ];
    for (const ca of candidatures) {
      await client.query(
        `INSERT INTO candidature (candidat_id, offre_emploi_id, statut) VALUES ($1, $2, $3)`,
        [ca.candidat_id, ca.offre_emploi_id, ca.statut]
      );
    }

    await client.query("COMMIT");
    console.log("Database seeded successfully!");
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

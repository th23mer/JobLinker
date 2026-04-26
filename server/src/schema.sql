CREATE TABLE IF NOT EXISTS administrateur (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  mot_de_passe TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categorie (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS specialite (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  categorie_id INTEGER NOT NULL REFERENCES categorie(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruteur (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_entreprise TEXT NOT NULL,
  matricule_fiscal TEXT NOT NULL,
  adresse TEXT,
  description TEXT,
  statut_validation TEXT DEFAULT 'en_attente',
  email TEXT UNIQUE NOT NULL,
  mot_de_passe TEXT NOT NULL,
  telephone TEXT,
  nom_representant TEXT,
  prenom_representant TEXT
);

CREATE TABLE IF NOT EXISTS offre_emploi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  description TEXT,
  exigences TEXT,
  type_contrat TEXT,
  ville TEXT,
  experience_requise TEXT,
  niveau_etude TEXT,
  categorie_id INTEGER REFERENCES categorie(id),
  specialite_id INTEGER REFERENCES specialite(id),
  statut_validation TEXT DEFAULT 'en_attente',
  recruteur_id INTEGER NOT NULL REFERENCES recruteur(id) ON DELETE CASCADE,
  salaire TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cv TEXT,
  lettre_motivation TEXT,
  niveau_etude TEXT,
  experience TEXT,
  diplome TEXT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mot_de_passe TEXT NOT NULL,
  telephone TEXT
);

CREATE TABLE IF NOT EXISTS candidature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_postulation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut TEXT DEFAULT 'en_attente',
  cv TEXT,
  lettre_motivation TEXT,
  candidat_id INTEGER NOT NULL REFERENCES candidat(id) ON DELETE CASCADE,
  offre_emploi_id INTEGER NOT NULL REFERENCES offre_emploi(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS administrateur (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS categorie (
  id BIGSERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS specialite (
  id BIGSERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  categorie_id BIGINT NOT NULL REFERENCES categorie(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruteur (
  id BIGSERIAL PRIMARY KEY,
  nom_entreprise VARCHAR(255) NOT NULL,
  matricule_fiscal VARCHAR(255) NOT NULL,
  adresse VARCHAR(500),
  description TEXT,
  statut_validation VARCHAR(50) DEFAULT 'en_attente',
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(50),
  nom_representant VARCHAR(255),
  prenom_representant VARCHAR(255)
);

ALTER TABLE recruteur ADD COLUMN IF NOT EXISTS nom_representant VARCHAR(255);
ALTER TABLE recruteur ADD COLUMN IF NOT EXISTS prenom_representant VARCHAR(255);

CREATE TABLE IF NOT EXISTS offre_emploi (
  id BIGSERIAL PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  exigences TEXT,
  type_contrat VARCHAR(100),
  ville VARCHAR(255),
  experience_requise VARCHAR(100),
  niveau_etude VARCHAR(100),
  categorie_id BIGINT REFERENCES categorie(id),
  specialite_id BIGINT REFERENCES specialite(id),
  statut_validation VARCHAR(50) DEFAULT 'en_attente',
  recruteur_id BIGINT NOT NULL REFERENCES recruteur(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidat (
  id BIGSERIAL PRIMARY KEY,
  cv TEXT,
  lettre_motivation TEXT,
  niveau_etude VARCHAR(100),
  experience VARCHAR(255),
  diplome VARCHAR(255),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS candidature (
  id BIGSERIAL PRIMARY KEY,
  date_postulation TIMESTAMP DEFAULT NOW(),
  statut VARCHAR(50) DEFAULT 'en_attente',
  cv TEXT,
  lettre_motivation TEXT,
  candidat_id BIGINT NOT NULL REFERENCES candidat(id) ON DELETE CASCADE,
  offre_emploi_id BIGINT NOT NULL REFERENCES offre_emploi(id) ON DELETE CASCADE
);

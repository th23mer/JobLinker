export interface Administrateur {
  id: number;
  email: string;
  motDePasse: string;
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface Specialite {
  id: number;
  nom: string;
  categorieId: number;
}

export interface Recruteur {
  id: number;
  nomEntreprise: string;
  matriculeFiscal: string;
  adresse: string;
  description: string;
  statutValidation: string;
  email: string;
  motDePasse: string;
  telephone: string;
  nomRepresentant: string;
  prenomRepresentant: string;
}

export interface OffreEmploi {
  id: number;
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
}

export interface Candidat {
  id: number;
  cv: string;
  lettreMotivation: string;
  niveauEtude: string;
  experience: string;
  diplome: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
}

export interface Candidature {
  id: number;
  datePostulation: Date;
  statut: string;
  cv: string;
  lettreMotivation: string;
  candidatId: number;
  offreEmploiId: number;
}

export interface CandidatureWithCandidat extends Candidature {
  candidatNom: string;
  candidatPrenom: string;
  candidatEmail: string;
  candidatTelephone: string;
  candidatDiplome: string;
  candidatNiveauEtude: string;
  candidatExperience: string;
  candidatCv: string;
}

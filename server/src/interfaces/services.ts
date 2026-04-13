import {
  Categorie,
  Specialite,
  Recruteur,
  OffreEmploi,
  Candidat,
  Candidature,
  CandidatureWithCandidat,
} from "./entities";

export interface IAuthService {
  loginAdmin(email: string, motDePasse: string): Promise<{ token: string }>;
  loginRecruteur(email: string, motDePasse: string): Promise<{ token: string }>;
  loginCandidat(email: string, motDePasse: string): Promise<{ token: string }>;
}

export interface ICategorieService {
  getAll(): Promise<Categorie[]>;
  getById(id: number): Promise<Categorie>;
  create(nom: string): Promise<Categorie>;
  update(id: number, nom: string): Promise<Categorie>;
  delete(id: number): Promise<void>;
}

export interface ISpecialiteService {
  getAll(): Promise<Specialite[]>;
  getByCategorieId(categorieId: number): Promise<Specialite[]>;
  create(nom: string, categorieId: number): Promise<Specialite>;
  update(id: number, nom: string): Promise<Specialite>;
  delete(id: number): Promise<void>;
}

export interface IRecruteurService {
  getAll(): Promise<Recruteur[]>;
  getById(id: number): Promise<Recruteur>;
  register(data: Omit<Recruteur, "id" | "statutValidation">): Promise<Recruteur>;
  updateProfil(id: number, data: Partial<Omit<Recruteur, "id" | "motDePasse">>): Promise<Recruteur>;
  valider(id: number): Promise<Recruteur>;
}

export interface IOffreEmploiService {
  getAll(): Promise<OffreEmploi[]>;
  getAllAdmin(): Promise<OffreEmploi[]>;
  getById(id: number): Promise<OffreEmploi>;
  getByRecruteurId(recruteurId: number): Promise<OffreEmploi[]>;
  search(titre: string): Promise<OffreEmploi[]>;
  searchAdvanced(filters: Partial<Pick<OffreEmploi, "categorieId" | "specialiteId" | "typeContrat" | "ville" | "niveauEtude" | "experienceRequise">>): Promise<OffreEmploi[]>;
  create(data: Omit<OffreEmploi, "id" | "statutValidation">): Promise<OffreEmploi>;
  update(id: number, data: Partial<Omit<OffreEmploi, "id">>): Promise<OffreEmploi>;
  delete(id: number): Promise<void>;
  valider(id: number): Promise<OffreEmploi>;
}

export interface ICandidatService {
  getAll(): Promise<Candidat[]>;
  getById(id: number): Promise<Candidat>;
  register(data: Omit<Candidat, "id">): Promise<Candidat>;
  updateProfil(id: number, data: Partial<Omit<Candidat, "id" | "motDePasse">>): Promise<Candidat>;
}

export interface ICandidatureService {
  getAll(): Promise<Candidature[]>;
  getById(id: number): Promise<Candidature>;
  getByCandidatId(candidatId: number): Promise<Candidature[]>;
  getByOffreId(offreId: number): Promise<Candidature[]>;
  getByOffreIdWithCandidat(offreId: number): Promise<CandidatureWithCandidat[]>;
  postuler(data: Omit<Candidature, "id" | "datePostulation" | "statut">): Promise<Candidature>;
  accepter(id: number): Promise<Candidature>;
  refuser(id: number): Promise<Candidature>;
}

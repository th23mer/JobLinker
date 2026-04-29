import {
  Administrateur,
  Categorie,
  Specialite,
  Recruteur,
  OffreEmploi,
  Candidat,
  Candidature,
  CandidatureWithCandidat,
} from "./entities";

export interface IAdminRepository {
  findByEmail(email: string): Promise<Administrateur | null>;
  findById(id: number): Promise<Administrateur | null>;
  updatePassword(id: number, hashedPassword: string): Promise<boolean>;
}

export interface ICategorieRepository {
  findAll(): Promise<Categorie[]>;
  findById(id: number): Promise<Categorie | null>;
  create(nom: string): Promise<Categorie>;
  update(id: number, nom: string): Promise<Categorie | null>;
  delete(id: number): Promise<boolean>;
}

export interface ISpecialiteRepository {
  findAll(): Promise<Specialite[]>;
  findByCategorieId(categorieId: number): Promise<Specialite[]>;
  findById(id: number): Promise<Specialite | null>;
  create(nom: string, categorieId: number): Promise<Specialite>;
  update(id: number, nom: string): Promise<Specialite | null>;
  delete(id: number): Promise<boolean>;
}

export interface IRecruteurRepository {
  findAll(): Promise<Recruteur[]>;
  findById(id: number): Promise<Recruteur | null>;
  findByEmail(email: string): Promise<Recruteur | null>;
  updatePassword(id: number, hashedPassword: string): Promise<boolean>;
  create(data: Omit<Recruteur, "id" | "statutValidation">): Promise<Recruteur>;
  update(id: number, data: Partial<Omit<Recruteur, "id" | "motDePasse">>): Promise<Recruteur | null>;
  updateStatut(id: number, statut: string): Promise<Recruteur | null>;
  search(filters: { q?: string; statutValidation?: string }): Promise<Recruteur[]>;
}

export interface IOffreEmploiRepository {
  findAll(): Promise<OffreEmploi[]>;
  findAllAdmin(): Promise<OffreEmploi[]>;
  findById(id: number): Promise<OffreEmploi | null>;
  findByRecruteurId(recruteurId: number): Promise<OffreEmploi[]>;
  search(titre: string): Promise<OffreEmploi[]>;
  searchAdvanced(filters: { categorieId?: number; specialiteId?: number; typeContrat?: string; ville?: string; niveauEtude?: string; experienceRequise?: string; q?: string; statutValidation?: string }): Promise<OffreEmploi[]>;
  create(data: Omit<OffreEmploi, "id" | "statutValidation">): Promise<OffreEmploi>;
  update(id: number, data: Partial<Omit<OffreEmploi, "id">>): Promise<OffreEmploi | null>;
  delete(id: number): Promise<boolean>;
  updateStatut(id: number, statut: string): Promise<OffreEmploi | null>;
}

export interface ICandidatRepository {
  findAll(): Promise<Candidat[]>;
  findById(id: number): Promise<Candidat | null>;
  findByEmail(email: string): Promise<Candidat | null>;
  updatePassword(id: number, hashedPassword: string): Promise<boolean>;
  create(data: Omit<Candidat, "id">): Promise<Candidat>;
  update(id: number, data: Partial<Omit<Candidat, "id" | "motDePasse">>): Promise<Candidat | null>;
}

export interface ICandidatureRepository {
  findAll(): Promise<Candidature[]>;
  findById(id: number): Promise<Candidature | null>;
  findByCandidatId(candidatId: number): Promise<Candidature[]>;
  findByOffreId(offreId: number): Promise<Candidature[]>;
  findByOffreIdWithCandidat(offreId: number): Promise<CandidatureWithCandidat[]>;
  create(data: Omit<Candidature, "id" | "datePostulation" | "statut">): Promise<Candidature>;
  updateStatut(id: number, statut: string): Promise<Candidature | null>;
}

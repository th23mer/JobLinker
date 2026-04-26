import { OffreEmploi } from "../interfaces/entities";
import { IOffreEmploiService } from "../interfaces/services";
import { IOffreEmploiRepository, IRecruteurRepository } from "../interfaces/repositories";
import { NotFoundError, AppError } from "../errors/AppError";

export class OffreEmploiService implements IOffreEmploiService {
  constructor(
    private repo: IOffreEmploiRepository,
    private recruteurRepo: IRecruteurRepository,
  ) {}

  async getAll(): Promise<OffreEmploi[]> {
    return this.repo.findAll();
  }

  async getAllAdmin(): Promise<OffreEmploi[]> {
    return this.repo.findAllAdmin();
  }

  async getById(id: number): Promise<OffreEmploi> {
    const offre = await this.repo.findById(id);
    if (!offre) throw new NotFoundError("Offre d'emploi");
    return offre;
  }

  async getByRecruteurId(recruteurId: number): Promise<OffreEmploi[]> {
    return this.repo.findByRecruteurId(recruteurId);
  }

  async search(titre: string): Promise<OffreEmploi[]> {
    return this.repo.search(titre);
  }

  async searchAdvanced(
    filters: Partial<Pick<OffreEmploi, "categorieId" | "specialiteId" | "typeContrat" | "ville" | "niveauEtude" | "experienceRequise">>
  ): Promise<OffreEmploi[]> {
    return this.repo.searchAdvanced(filters);
  }

  async create(data: Omit<OffreEmploi, "id" | "statutValidation">): Promise<OffreEmploi> {
    const recruteur = await this.recruteurRepo.findById(data.recruteurId);
    if (!recruteur) throw new NotFoundError("Recruteur");
    if (recruteur.statutValidation !== "validee") {
      throw new AppError(403, "Votre compte recruteur doit etre valide par un administrateur avant de pouvoir publier des offres.");
    }
    return this.repo.create(data);
  }

  async update(id: number, data: Partial<Omit<OffreEmploi, "id">>): Promise<OffreEmploi> {
    const offre = await this.repo.update(id, data);
    if (!offre) throw new NotFoundError("Offre d'emploi");
    return offre;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError("Offre d'emploi");
  }

  async valider(id: number): Promise<OffreEmploi> {
    const offre = await this.repo.updateStatut(id, "validee");
    if (!offre) throw new NotFoundError("Offre d'emploi");
    return offre;
  }
}

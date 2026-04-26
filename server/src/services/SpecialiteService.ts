import { Specialite } from "../interfaces/entities";
import { ISpecialiteService } from "../interfaces/services";
import { ISpecialiteRepository, ICategorieRepository } from "../interfaces/repositories";
import { NotFoundError } from "../errors/AppError";

export class SpecialiteService implements ISpecialiteService {
  constructor(
    private repo: ISpecialiteRepository,
    private categorieRepo: ICategorieRepository
  ) {}

  async getAll(): Promise<Specialite[]> {
    return this.repo.findAll();
  }

  async getByCategorieId(categorieId: number): Promise<Specialite[]> {
    const cat = await this.categorieRepo.findById(categorieId);
    if (!cat) throw new NotFoundError("Catégorie");
    return this.repo.findByCategorieId(categorieId);
  }

  async create(nom: string, categorieId: number): Promise<Specialite> {
    const cat = await this.categorieRepo.findById(categorieId);
    if (!cat) throw new NotFoundError("Catégorie");
    return this.repo.create(nom, categorieId);
  }

  async update(id: number, nom: string): Promise<Specialite> {
    const spec = await this.repo.update(id, nom);
    if (!spec) throw new NotFoundError("Spécialité");
    return spec;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError("Spécialité");
  }
}

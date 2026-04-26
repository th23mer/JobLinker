import { Categorie } from "../interfaces/entities";
import { ICategorieService } from "../interfaces/services";
import { ICategorieRepository } from "../interfaces/repositories";
import { NotFoundError } from "../errors/AppError";

export class CategorieService implements ICategorieService {
  constructor(private repo: ICategorieRepository) {}

  async getAll(): Promise<Categorie[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Categorie> {
    const cat = await this.repo.findById(id);
    if (!cat) throw new NotFoundError("Catégorie");
    return cat;
  }

  async create(nom: string): Promise<Categorie> {
    return this.repo.create(nom);
  }

  async update(id: number, nom: string): Promise<Categorie> {
    const cat = await this.repo.update(id, nom);
    if (!cat) throw new NotFoundError("Catégorie");
    return cat;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError("Catégorie");
  }
}

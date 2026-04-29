import bcrypt from "bcrypt";
import { Recruteur } from "../interfaces/entities";
import { IRecruteurService } from "../interfaces/services";
import { IRecruteurRepository } from "../interfaces/repositories";
import { NotFoundError, ConflictError } from "../errors/AppError";

export class RecruteurService implements IRecruteurService {
  constructor(private repo: IRecruteurRepository) {}

  async getAll(): Promise<Recruteur[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Recruteur> {
    const rec = await this.repo.findById(id);
    if (!rec) throw new NotFoundError("Recruteur");
    return rec;
  }

  async register(data: Omit<Recruteur, "id" | "statutValidation">): Promise<Recruteur> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new ConflictError("Un compte avec cet email existe déjà");

    const hashedPassword = await bcrypt.hash(data.motDePasse, 10);
    return this.repo.create({ ...data, motDePasse: hashedPassword });
  }

  async updateProfil(id: number, data: Partial<Omit<Recruteur, "id" | "motDePasse">>): Promise<Recruteur> {
    const rec = await this.repo.update(id, data);
    if (!rec) throw new NotFoundError("Recruteur");
    return rec;
  }

  async valider(id: number): Promise<Recruteur> {
    const rec = await this.repo.updateStatut(id, "validee");
    if (!rec) throw new NotFoundError("Recruteur");
    return rec;
  }

  async search(filters: { q?: string; statutValidation?: string }): Promise<Recruteur[]> {
    return this.repo.search(filters);
  }
}

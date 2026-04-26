import bcrypt from "bcrypt";
import { Candidat } from "../interfaces/entities";
import { ICandidatService } from "../interfaces/services";
import { ICandidatRepository } from "../interfaces/repositories";
import { NotFoundError, ConflictError } from "../errors/AppError";

export class CandidatService implements ICandidatService {
  constructor(private repo: ICandidatRepository) {}

  async getAll(): Promise<Candidat[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Candidat> {
    const candidat = await this.repo.findById(id);
    if (!candidat) throw new NotFoundError("Candidat");
    return candidat;
  }

  async register(data: Omit<Candidat, "id">): Promise<Candidat> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new ConflictError("Un compte avec cet email existe déjà");

    const hashedPassword = await bcrypt.hash(data.motDePasse, 10);
    return this.repo.create({ ...data, motDePasse: hashedPassword });
  }

  async updateProfil(id: number, data: Partial<Omit<Candidat, "id" | "motDePasse">>): Promise<Candidat> {
    const candidat = await this.repo.update(id, data);
    if (!candidat) throw new NotFoundError("Candidat");
    return candidat;
  }
}

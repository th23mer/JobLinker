import bcrypt from "bcrypt";
import { IAuthService } from "../interfaces/services";
import { IAdminRepository, IRecruteurRepository, ICandidatRepository } from "../interfaces/repositories";
import { generateToken } from "../middleware/auth";
import { UnauthorizedError } from "../errors/AppError";

export class AuthService implements IAuthService {
  constructor(
    private adminRepo: IAdminRepository,
    private recruteurRepo: IRecruteurRepository,
    private candidatRepo: ICandidatRepository
  ) {}

  async loginAdmin(email: string, motDePasse: string): Promise<{ token: string }> {
    const admin = await this.adminRepo.findByEmail(email);
    if (!admin || !(await bcrypt.compare(motDePasse, admin.motDePasse))) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }
    return { token: generateToken({ id: admin.id, role: "admin" }) };
  }

  async loginRecruteur(email: string, motDePasse: string): Promise<{ token: string }> {
    const recruteur = await this.recruteurRepo.findByEmail(email);
    if (!recruteur || !(await bcrypt.compare(motDePasse, recruteur.motDePasse))) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }
    return { token: generateToken({ id: recruteur.id, role: "recruteur" }) };
  }

  async loginCandidat(email: string, motDePasse: string): Promise<{ token: string }> {
    const candidat = await this.candidatRepo.findByEmail(email);
    if (!candidat || !(await bcrypt.compare(motDePasse, candidat.motDePasse))) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }
    return { token: generateToken({ id: candidat.id, role: "candidat" }) };
  }
}

import bcrypt from "bcrypt";
import { IAuthService } from "../interfaces/services";
import { IAdminRepository, IRecruteurRepository, ICandidatRepository } from "../interfaces/repositories";
import { generateToken } from "../middleware/auth";
import { AppError, UnauthorizedError } from "../errors/AppError";
import { IMailer } from "./Mailer";
import jwt from "jsonwebtoken";

type ResetTokenPayload = {
  id: number;
  role: "admin" | "recruteur" | "candidat";
  type: "password_reset";
  iat: number;
  exp: number;
};

export class AuthService implements IAuthService {
  constructor(
    private adminRepo: IAdminRepository,
    private recruteurRepo: IRecruteurRepository,
    private candidatRepo: ICandidatRepository,
    private mailer: IMailer
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

  async forgotPassword(email: string, role?: "admin" | "recruteur" | "candidat"): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const targets: Array<"admin" | "recruteur" | "candidat"> = role ? [role] : ["candidat", "recruteur", "admin"];
    const jwtSecret = process.env.JWT_SECRET || "changeme_secret_key";
    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5173";

    let sent = false;

    for (const target of targets) {
      if (sent) break;

      if (target === "admin") {
        const admin = await this.adminRepo.findByEmail(normalizedEmail);
        if (!admin) continue;

        const token = jwt.sign({ id: admin.id, role: "admin", type: "password_reset" }, jwtSecret, { expiresIn: "15m" });
        const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
        await this.mailer.send(
          normalizedEmail,
          "JobLinker - Réinitialisation du mot de passe",
          `Vous avez demandé la réinitialisation de votre mot de passe.\n\nUtilisez ce lien (valide 15 minutes): ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`
        );
        sent = true;
        break;
      }

      if (target === "recruteur") {
        const recruteur = await this.recruteurRepo.findByEmail(normalizedEmail);
        if (!recruteur) continue;

        const token = jwt.sign({ id: recruteur.id, role: "recruteur", type: "password_reset" }, jwtSecret, { expiresIn: "15m" });
        const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
        await this.mailer.send(
          normalizedEmail,
          "JobLinker - Réinitialisation du mot de passe",
          `Vous avez demandé la réinitialisation de votre mot de passe.\n\nUtilisez ce lien (valide 15 minutes): ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`
        );
        sent = true;
        break;
      }

      const candidat = await this.candidatRepo.findByEmail(normalizedEmail);
      if (!candidat) continue;

      const token = jwt.sign({ id: candidat.id, role: "candidat", type: "password_reset" }, jwtSecret, { expiresIn: "15m" });
      const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
      await this.mailer.send(
        normalizedEmail,
        "JobLinker - Réinitialisation du mot de passe",
        `Vous avez demandé la réinitialisation de votre mot de passe.\n\nUtilisez ce lien (valide 15 minutes): ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`
      );
      sent = true;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token) {
      throw new AppError(400, "Lien de réinitialisation invalide");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new AppError(400, "Mot de passe trop court (6 caractères minimum)");
    }

    const jwtSecret = process.env.JWT_SECRET || "changeme_secret_key";

    let payload: ResetTokenPayload;
    try {
      payload = jwt.verify(token, jwtSecret) as ResetTokenPayload;
    } catch {
      throw new AppError(400, "Lien de réinitialisation invalide ou expiré");
    }

    if (payload.type !== "password_reset") {
      throw new AppError(400, "Lien de réinitialisation invalide");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (payload.role === "admin") {
      const updated = await this.adminRepo.updatePassword(payload.id, hashedPassword);
      if (!updated) throw new AppError(400, "Compte introuvable");
      return;
    }

    if (payload.role === "recruteur") {
      const updated = await this.recruteurRepo.updatePassword(payload.id, hashedPassword);
      if (!updated) throw new AppError(400, "Compte introuvable");
      return;
    }

    const updated = await this.candidatRepo.updatePassword(payload.id, hashedPassword);
    if (!updated) throw new AppError(400, "Compte introuvable");
  }
}

import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/services";

export class AuthController {
  constructor(private authService: IAuthService) {}

  loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, motDePasse } = req.body;
      const result = await this.authService.loginAdmin(email, motDePasse);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  loginRecruteur = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, motDePasse } = req.body;
      const result = await this.authService.loginRecruteur(email, motDePasse);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  loginCandidat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, motDePasse } = req.body;
      const result = await this.authService.loginCandidat(email, motDePasse);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, role } = req.body as { email?: string; role?: "admin" | "recruteur" | "candidat" };
      await this.authService.forgotPassword(email || "", role);
      res.json({ message: "Si un compte existe, un email de réinitialisation a été envoyé." });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body as { token?: string; newPassword?: string };
      await this.authService.resetPassword(token || "", newPassword || "");
      res.json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (err) {
      next(err);
    }
  };
}

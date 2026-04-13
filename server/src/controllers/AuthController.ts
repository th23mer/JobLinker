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
}

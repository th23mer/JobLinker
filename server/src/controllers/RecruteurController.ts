import { Request, Response, NextFunction } from "express";
import { IRecruteurService } from "../interfaces/services";

export class RecruteurController {
  constructor(private service: IRecruteurService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getAll();
      res.json(list);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rec = await this.service.getById(Number(req.params.id));
      res.json(rec);
    } catch (err) { next(err); }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rec = await this.service.register(req.body);
      res.status(201).json(rec);
    } catch (err) { next(err); }
  };

  updateProfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rec = await this.service.updateProfil(Number(req.params.id), req.body);
      res.json(rec);
    } catch (err) { next(err); }
  };

  valider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rec = await this.service.valider(Number(req.params.id));
      res.json(rec);
    } catch (err) { next(err); }
  };
}

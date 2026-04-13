import { Request, Response, NextFunction } from "express";
import { ISpecialiteService } from "../interfaces/services";

export class SpecialiteController {
  constructor(private service: ISpecialiteService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getAll();
      res.json(list);
    } catch (err) { next(err); }
  };

  getByCategorieId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getByCategorieId(Number(req.params.categorieId));
      res.json(list);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const spec = await this.service.create(req.body.nom, req.body.categorieId);
      res.status(201).json(spec);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const spec = await this.service.update(Number(req.params.id), req.body.nom);
      res.json(spec);
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

import { Request, Response, NextFunction } from "express";
import { ICategorieService } from "../interfaces/services";

export class CategorieController {
  constructor(private service: ICategorieService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getAll();
      res.json(categories);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cat = await this.service.getById(Number(req.params.id));
      res.json(cat);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cat = await this.service.create(req.body.nom);
      res.status(201).json(cat);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cat = await this.service.update(Number(req.params.id), req.body.nom);
      res.json(cat);
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

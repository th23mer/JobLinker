import { Request, Response, NextFunction } from "express";
import { IOffreEmploiService } from "../interfaces/services";

export class OffreEmploiController {
  constructor(private service: IOffreEmploiService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getAll();
      res.json(list);
    } catch (err) { next(err); }
  };

  getAllAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getAllAdmin();
      res.json(list);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offre = await this.service.getById(Number(req.params.id));
      res.json(offre);
    } catch (err) { next(err); }
  };

  getByRecruteurId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getByRecruteurId(Number(req.params.recruteurId));
      res.json(list);
    } catch (err) { next(err); }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.search(req.query.titre as string);
      res.json(list);
    } catch (err) { next(err); }
  };

  searchAdvanced = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: Record<string, unknown> = {};
      const { categorieId, specialiteId, typeContrat, ville, niveauEtude, experienceRequise } = req.query;
      if (categorieId) filters.categorieId = Number(categorieId);
      if (specialiteId) filters.specialiteId = Number(specialiteId);
      if (typeContrat) filters.typeContrat = typeContrat;
      if (ville) filters.ville = ville;
      if (niveauEtude) filters.niveauEtude = niveauEtude;
      if (experienceRequise) filters.experienceRequise = experienceRequise;
      const list = await this.service.searchAdvanced(filters);
      res.json(list);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offre = await this.service.create(req.body);
      res.status(201).json(offre);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offre = await this.service.update(Number(req.params.id), req.body);
      res.json(offre);
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  };

  valider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offre = await this.service.valider(Number(req.params.id));
      res.json(offre);
    } catch (err) { next(err); }
  };
}

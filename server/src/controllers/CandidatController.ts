import { Request, Response, NextFunction } from "express";
import { ICandidatService } from "../interfaces/services";

export class CandidatController {
  constructor(private service: ICandidatService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getAll();
      res.json(list);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidat = await this.service.getById(Number(req.params.id));
      res.json(candidat);
    } catch (err) { next(err); }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidat = await this.service.register(req.body);
      res.status(201).json(candidat);
    } catch (err) { next(err); }
  };

  updateProfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidat = await this.service.updateProfil(Number(req.params.id), req.body);
      res.json(candidat);
    } catch (err) { next(err); }
  };

  uploadCv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Aucun fichier PDF fourni." });
        return;
      }
      const cvPath = `/uploads/cvs/${req.file.filename}`;
      const candidat = await this.service.updateProfil(Number(req.params.id), { cv: cvPath });
      res.json(candidat);
    } catch (err) { next(err); }
  };
}

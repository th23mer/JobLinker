import { Request, Response, NextFunction } from "express";
import { ICandidatureService } from "../interfaces/services";

export class CandidatureController {
  constructor(private service: ICandidatureService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getAll();
      res.json(list);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.service.getById(Number(req.params.id));
      res.json(c);
    } catch (err) { next(err); }
  };

  getByCandidatId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getByCandidatId(Number(req.params.candidatId));
      res.json(list);
    } catch (err) { next(err); }
  };

  getByOffreId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getByOffreId(Number(req.params.offreId));
      res.json(list);
    } catch (err) { next(err); }
  };

  getByOffreIdWithCandidat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.service.getByOffreIdWithCandidat(Number(req.params.offreId));
      res.json(list);
    } catch (err) { next(err); }
  };

  postuler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cv = req.file ? `/uploads/cvs/${req.file.filename}` : req.body.cv;
      const data = {
        cv,
        lettreMotivation: req.body.lettreMotivation,
        candidatId: Number(req.body.candidatId),
        offreEmploiId: Number(req.body.offreEmploiId),
      };
      const c = await this.service.postuler(data);
      res.status(201).json(c);
    } catch (err) { next(err); }
  };

  accepter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.service.accepter(Number(req.params.id));
      res.json(c);
    } catch (err) { next(err); }
  };

  refuser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.service.refuser(Number(req.params.id));
      res.json(c);
    } catch (err) { next(err); }
  };
}

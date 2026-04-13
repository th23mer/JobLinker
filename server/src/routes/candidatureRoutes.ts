import { Router } from "express";
import { CandidatureController } from "../controllers/CandidatureController";
import { authenticate, authorize } from "../middleware/auth";
import { uploadCv } from "../middleware/upload";

export function createCandidatureRoutes(controller: CandidatureController): Router {
  const router = Router();
  router.get("/", authenticate, authorize("admin"), controller.getAll);
  router.get("/:id", authenticate, controller.getById);
  router.get("/candidat/:candidatId", authenticate, authorize("candidat"), controller.getByCandidatId);
  router.get("/offre/:offreId", authenticate, authorize("recruteur", "admin"), controller.getByOffreId);
  router.get("/offre/:offreId/details", authenticate, authorize("recruteur"), controller.getByOffreIdWithCandidat);
  router.post("/", authenticate, authorize("candidat"), uploadCv.single("cv"), controller.postuler);
  router.patch("/:id/accepter", authenticate, authorize("recruteur"), controller.accepter);
  router.patch("/:id/refuser", authenticate, authorize("recruteur"), controller.refuser);
  return router;
}

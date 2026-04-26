import { Router } from "express";
import { CandidatController } from "../controllers/CandidatController";
import { authenticate, authorize } from "../middleware/auth";
import { uploadCv } from "../middleware/upload";

export function createCandidatRoutes(controller: CandidatController): Router {
  const router = Router();
  router.get("/", authenticate, authorize("admin"), controller.getAll);
  router.get("/:id", authenticate, controller.getById);
  router.post("/register", controller.register);
  router.put("/:id", authenticate, authorize("candidat"), controller.updateProfil);
  router.post("/:id/cv", authenticate, authorize("candidat"), uploadCv.single("cv"), controller.uploadCv);
  return router;
}

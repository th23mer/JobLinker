import { Router } from "express";
import { RecruteurController } from "../controllers/RecruteurController";
import { authenticate, authorize } from "../middleware/auth";

export function createRecruteurRoutes(controller: RecruteurController): Router {
  const router = Router();
  router.get("/", authenticate, authorize("admin"), controller.getAll);
  router.get("/:id", authenticate, controller.getById);
  router.post("/register", controller.register);
  router.put("/:id", authenticate, authorize("recruteur"), controller.updateProfil);
  router.patch("/:id/valider", authenticate, authorize("admin"), controller.valider);
  return router;
}

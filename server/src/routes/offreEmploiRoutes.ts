import { Router } from "express";
import { OffreEmploiController } from "../controllers/OffreEmploiController";
import { authenticate, authorize } from "../middleware/auth";

export function createOffreEmploiRoutes(controller: OffreEmploiController): Router {
  const router = Router();
  router.get("/", controller.getAll);
  router.get("/admin", authenticate, authorize("admin"), controller.getAllAdmin);
  router.get("/search", controller.search);
  router.get("/search/advanced", controller.searchAdvanced);
  router.get("/recruteur/:recruteurId", authenticate, authorize("recruteur"), controller.getByRecruteurId);
  router.get("/:id", controller.getById);
  router.post("/", authenticate, authorize("recruteur"), controller.create);
  router.put("/:id", authenticate, authorize("recruteur"), controller.update);
  router.delete("/:id", authenticate, authorize("recruteur", "admin"), controller.delete);
  router.patch("/:id/valider", authenticate, authorize("admin"), controller.valider);
  return router;
}

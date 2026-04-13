import { Router } from "express";
import { SpecialiteController } from "../controllers/SpecialiteController";
import { authenticate, authorize } from "../middleware/auth";

export function createSpecialiteRoutes(controller: SpecialiteController): Router {
  const router = Router();
  router.get("/", controller.getAll);
  router.get("/categorie/:categorieId", controller.getByCategorieId);
  router.post("/", authenticate, authorize("admin"), controller.create);
  router.put("/:id", authenticate, authorize("admin"), controller.update);
  router.delete("/:id", authenticate, authorize("admin"), controller.delete);
  return router;
}

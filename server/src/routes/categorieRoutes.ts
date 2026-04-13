import { Router } from "express";
import { CategorieController } from "../controllers/CategorieController";
import { authenticate, authorize } from "../middleware/auth";

export function createCategorieRoutes(controller: CategorieController): Router {
  const router = Router();
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", authenticate, authorize("admin"), controller.create);
  router.put("/:id", authenticate, authorize("admin"), controller.update);
  router.delete("/:id", authenticate, authorize("admin"), controller.delete);
  return router;
}

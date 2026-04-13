import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/admin", controller.loginAdmin);
  router.post("/recruteur", controller.loginRecruteur);
  router.post("/candidat", controller.loginCandidat);
  return router;
}

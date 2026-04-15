import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/admin", controller.loginAdmin);
  router.post("/recruteur", controller.loginRecruteur);
  router.post("/candidat", controller.loginCandidat);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);
  return router;
}

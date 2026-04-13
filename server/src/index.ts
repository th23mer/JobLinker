import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import { pool } from "./db";
import { errorHandler } from "./middleware/errorHandler";

// Repositories
import { AdminRepository } from "./repositories/AdminRepository";
import { CategorieRepository } from "./repositories/CategorieRepository";
import { SpecialiteRepository } from "./repositories/SpecialiteRepository";
import { RecruteurRepository } from "./repositories/RecruteurRepository";
import { OffreEmploiRepository } from "./repositories/OffreEmploiRepository";
import { CandidatRepository } from "./repositories/CandidatRepository";
import { CandidatureRepository } from "./repositories/CandidatureRepository";

// Services
import { AuthService } from "./services/AuthService";
import { CategorieService } from "./services/CategorieService";
import { SpecialiteService } from "./services/SpecialiteService";
import { RecruteurService } from "./services/RecruteurService";
import { OffreEmploiService } from "./services/OffreEmploiService";
import { CandidatService } from "./services/CandidatService";
import { CandidatureService } from "./services/CandidatureService";
import { Mailer } from "./services/Mailer";

// Controllers
import { AuthController } from "./controllers/AuthController";
import { CategorieController } from "./controllers/CategorieController";
import { SpecialiteController } from "./controllers/SpecialiteController";
import { RecruteurController } from "./controllers/RecruteurController";
import { OffreEmploiController } from "./controllers/OffreEmploiController";
import { CandidatController } from "./controllers/CandidatController";
import { CandidatureController } from "./controllers/CandidatureController";

// Routes
import { createAuthRoutes } from "./routes/authRoutes";
import { createCategorieRoutes } from "./routes/categorieRoutes";
import { createSpecialiteRoutes } from "./routes/specialiteRoutes";
import { createRecruteurRoutes } from "./routes/recruteurRoutes";
import { createOffreEmploiRoutes } from "./routes/offreEmploiRoutes";
import { createCandidatRoutes } from "./routes/candidatRoutes";
import { createCandidatureRoutes } from "./routes/candidatureRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Wire dependencies (Dependency Inversion — all layers depend on abstractions)
const adminRepo = new AdminRepository(pool);
const categorieRepo = new CategorieRepository(pool);
const specialiteRepo = new SpecialiteRepository(pool);
const recruteurRepo = new RecruteurRepository(pool);
const offreRepo = new OffreEmploiRepository(pool);
const candidatRepo = new CandidatRepository(pool);
const candidatureRepo = new CandidatureRepository(pool);

const authService = new AuthService(adminRepo, recruteurRepo, candidatRepo);
const categorieService = new CategorieService(categorieRepo);
const specialiteService = new SpecialiteService(specialiteRepo, categorieRepo);
const recruteurService = new RecruteurService(recruteurRepo);
const offreService = new OffreEmploiService(offreRepo, recruteurRepo);
const candidatService = new CandidatService(candidatRepo);
const mailer = new Mailer();
const candidatureService = new CandidatureService(candidatureRepo, candidatRepo, offreRepo, mailer);

const authController = new AuthController(authService);
const categorieController = new CategorieController(categorieService);
const specialiteController = new SpecialiteController(specialiteService);
const recruteurController = new RecruteurController(recruteurService);
const offreController = new OffreEmploiController(offreService);
const candidatController = new CandidatController(candidatService);
const candidatureController = new CandidatureController(candidatureService);

// Routes
app.use("/api/auth", createAuthRoutes(authController));
app.use("/api/categories", createCategorieRoutes(categorieController));
app.use("/api/specialites", createSpecialiteRoutes(specialiteController));
app.use("/api/recruteurs", createRecruteurRoutes(recruteurController));
app.use("/api/offres", createOffreEmploiRoutes(offreController));
app.use("/api/candidats", createCandidatRoutes(candidatController));
app.use("/api/candidatures", createCandidatureRoutes(candidatureController));

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

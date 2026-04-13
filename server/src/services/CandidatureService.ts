import { Candidature, CandidatureWithCandidat } from "../interfaces/entities";
import { ICandidatureService } from "../interfaces/services";
import { ICandidatureRepository, ICandidatRepository, IOffreEmploiRepository } from "../interfaces/repositories";
import { NotFoundError } from "../errors/AppError";
import { IMailer } from "./Mailer";

export class CandidatureService implements ICandidatureService {
  constructor(
    private repo: ICandidatureRepository,
    private candidatRepo: ICandidatRepository,
    private offreRepo: IOffreEmploiRepository,
    private mailer: IMailer,
  ) {}

  async getAll(): Promise<Candidature[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<Candidature> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundError("Candidature");
    return c;
  }

  async getByCandidatId(candidatId: number): Promise<Candidature[]> {
    return this.repo.findByCandidatId(candidatId);
  }

  async getByOffreId(offreId: number): Promise<Candidature[]> {
    return this.repo.findByOffreId(offreId);
  }

  async getByOffreIdWithCandidat(offreId: number): Promise<CandidatureWithCandidat[]> {
    return this.repo.findByOffreIdWithCandidat(offreId);
  }

  async postuler(data: Omit<Candidature, "id" | "datePostulation" | "statut">): Promise<Candidature> {
    return this.repo.create(data);
  }

  async accepter(id: number): Promise<Candidature> {
    const c = await this.repo.updateStatut(id, "acceptee");
    if (!c) throw new NotFoundError("Candidature");
    await this.notify(c, "acceptee");
    return c;
  }

  async refuser(id: number): Promise<Candidature> {
    const c = await this.repo.updateStatut(id, "refusee");
    if (!c) throw new NotFoundError("Candidature");
    await this.notify(c, "refusee");
    return c;
  }

  private async notify(c: Candidature, statut: "acceptee" | "refusee"): Promise<void> {
    try {
      const [candidat, offre] = await Promise.all([
        this.candidatRepo.findById(c.candidatId),
        this.offreRepo.findById(c.offreEmploiId),
      ]);
      if (!candidat || !offre) return;
      const titrePoste = offre.titre;
      const subject =
        statut === "acceptee"
          ? `Votre candidature pour "${titrePoste}" a ete acceptee`
          : `Votre candidature pour "${titrePoste}" n'a pas ete retenue`;
      const body =
        statut === "acceptee"
          ? `Bonjour ${candidat.prenom} ${candidat.nom},\n\nNous avons le plaisir de vous informer que votre candidature pour le poste "${titrePoste}" a ete acceptee. Le recruteur vous contactera prochainement pour la suite du processus.\n\nCordialement,\nL'equipe JobLinker`
          : `Bonjour ${candidat.prenom} ${candidat.nom},\n\nNous vous remercions pour l'interet que vous avez porte au poste "${titrePoste}". Apres etude, votre candidature n'a pas ete retenue cette fois-ci. Nous vous souhaitons plein succes dans votre recherche.\n\nCordialement,\nL'equipe JobLinker`;
      await this.mailer.send(candidat.email, subject, body);
    } catch (err) {
      console.error("[notify] failed:", err);
    }
  }
}

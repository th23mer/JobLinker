import { Pool } from "pg";
import { Candidature, CandidatureWithCandidat } from "../interfaces/entities";
import { ICandidatureRepository } from "../interfaces/repositories";
import { ConflictError } from "../errors/AppError";

const SELECT_COLS = `
  id, date_postulation AS "datePostulation", statut, cv,
  lettre_motivation AS "lettreMotivation", candidat_id AS "candidatId",
  offre_emploi_id AS "offreEmploiId"
`;

export class CandidatureRepository implements ICandidatureRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Candidature[]> {
    const { rows } = await this.pool.query(`SELECT ${SELECT_COLS} FROM candidature ORDER BY date_postulation DESC`);
    return rows;
  }

  async findById(id: number): Promise<Candidature | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM candidature WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByCandidatId(candidatId: number): Promise<Candidature[]> {
    const { rows } = await this.pool.query(
      `SELECT
        c.id, c.date_postulation AS "datePostulation", c.statut, c.cv,
        c.lettre_motivation AS "lettreMotivation", c.candidat_id AS "candidatId",
        c.offre_emploi_id AS "offreEmploiId",
        o.titre AS "offreTitre", r.nom_entreprise AS "nomEntreprise", o.ville AS "ville",
        o.type_contrat AS "typeContrat", o.salaire AS "salaire"
      FROM candidature c
      JOIN offre_emploi o ON c.offre_emploi_id = o.id
      JOIN recruteur r ON o.recruteur_id = r.id
      WHERE c.candidat_id = $1
      ORDER BY c.date_postulation DESC`,
      [candidatId]
    );
    return rows;
  }

  async findByOffreId(offreId: number): Promise<Candidature[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM candidature WHERE offre_emploi_id = $1 ORDER BY date_postulation DESC`,
      [offreId]
    );
    return rows;
  }

  async findByOffreIdWithCandidat(offreId: number): Promise<CandidatureWithCandidat[]> {
    const { rows } = await this.pool.query(
      `SELECT
        c.id, c.date_postulation AS "datePostulation", c.statut, c.cv,
        c.lettre_motivation AS "lettreMotivation", c.candidat_id AS "candidatId",
        c.offre_emploi_id AS "offreEmploiId",
        ca.nom AS "candidatNom", ca.prenom AS "candidatPrenom",
        ca.email AS "candidatEmail", ca.telephone AS "candidatTelephone",
        ca.diplome AS "candidatDiplome", ca.niveau_etude AS "candidatNiveauEtude",
        ca.experience AS "candidatExperience", ca.cv AS "candidatCv"
      FROM candidature c
      JOIN candidat ca ON ca.id = c.candidat_id
      WHERE c.offre_emploi_id = $1
      ORDER BY c.date_postulation DESC`,
      [offreId]
    );
    return rows;
  }

  async create(data: Omit<Candidature, "id" | "datePostulation" | "statut">): Promise<Candidature> {
    // Vérifier si le candidat a déjà postulé sur cette offre
    const existing = await this.pool.query(
      "SELECT id FROM candidature WHERE candidat_id = $1 AND offre_emploi_id = $2",
      [data.candidatId, data.offreEmploiId]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError("Vous avez déjà postulé sur cette offre");
    }

    const { rows } = await this.pool.query(
      `INSERT INTO candidature (cv, lettre_motivation, candidat_id, offre_emploi_id, date_postulation, statut)
       VALUES ($1, $2, $3, $4, NOW(), 'en_attente')
       RETURNING ${SELECT_COLS}`,
      [data.cv, data.lettreMotivation, data.candidatId, data.offreEmploiId]
    );
    return rows[0];
  }

  async updateStatut(id: number, statut: string): Promise<Candidature | null> {
    const { rows } = await this.pool.query(
      `UPDATE candidature SET statut = $1 WHERE id = $2 RETURNING ${SELECT_COLS}`,
      [statut, id]
    );
    return rows[0] || null;
  }
}

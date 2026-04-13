import { Pool } from "pg";
import { Candidature, CandidatureWithCandidat } from "../interfaces/entities";
import { ICandidatureRepository } from "../interfaces/repositories";

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
      `SELECT ${SELECT_COLS} FROM candidature WHERE candidat_id = $1 ORDER BY date_postulation DESC`,
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

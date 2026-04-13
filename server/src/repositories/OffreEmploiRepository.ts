import { Pool } from "pg";
import { OffreEmploi } from "../interfaces/entities";
import { IOffreEmploiRepository } from "../interfaces/repositories";

const SELECT_COLS = `
  id, titre, description, exigences, type_contrat AS "typeContrat",
  ville, experience_requise AS "experienceRequise", niveau_etude AS "niveauEtude",
  categorie_id AS "categorieId", specialite_id AS "specialiteId",
  statut_validation AS "statutValidation", recruteur_id AS "recruteurId"
`;

export class OffreEmploiRepository implements IOffreEmploiRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi WHERE statut_validation = 'validee' ORDER BY id DESC`
    );
    return rows;
  }

  async findAllAdmin(): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(`SELECT ${SELECT_COLS} FROM offre_emploi ORDER BY id DESC`);
    return rows;
  }

  async findById(id: number): Promise<OffreEmploi | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByRecruteurId(recruteurId: number): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi WHERE recruteur_id = $1 ORDER BY id DESC`,
      [recruteurId]
    );
    return rows;
  }

  async search(titre: string): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi WHERE titre ILIKE $1 AND statut_validation = 'validee'`,
      [`%${titre}%`]
    );
    return rows;
  }

  async searchAdvanced(
    filters: Partial<Pick<OffreEmploi, "categorieId" | "specialiteId" | "typeContrat" | "ville" | "niveauEtude" | "experienceRequise">>
  ): Promise<OffreEmploi[]> {
    const conditions: string[] = ["statut_validation = 'validee'"];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.categorieId) { conditions.push(`categorie_id = $${idx++}`); values.push(filters.categorieId); }
    if (filters.specialiteId) { conditions.push(`specialite_id = $${idx++}`); values.push(filters.specialiteId); }
    if (filters.typeContrat) { conditions.push(`type_contrat = $${idx++}`); values.push(filters.typeContrat); }
    if (filters.ville) { conditions.push(`ville ILIKE $${idx++}`); values.push(`%${filters.ville}%`); }
    if (filters.niveauEtude) { conditions.push(`niveau_etude = $${idx++}`); values.push(filters.niveauEtude); }
    if (filters.experienceRequise) { conditions.push(`experience_requise = $${idx++}`); values.push(filters.experienceRequise); }

    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi WHERE ${conditions.join(" AND ")} ORDER BY id DESC`,
      values
    );
    return rows;
  }

  async create(data: Omit<OffreEmploi, "id" | "statutValidation">): Promise<OffreEmploi> {
    const { rows } = await this.pool.query(
      `INSERT INTO offre_emploi (titre, description, exigences, type_contrat, ville, experience_requise, niveau_etude, categorie_id, specialite_id, recruteur_id, statut_validation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'en_attente')
       RETURNING ${SELECT_COLS}`,
      [data.titre, data.description, data.exigences, data.typeContrat, data.ville, data.experienceRequise, data.niveauEtude, data.categorieId, data.specialiteId, data.recruteurId]
    );
    return rows[0];
  }

  async update(id: number, data: Partial<Omit<OffreEmploi, "id">>): Promise<OffreEmploi | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.titre !== undefined) { fields.push(`titre = $${idx++}`); values.push(data.titre); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.exigences !== undefined) { fields.push(`exigences = $${idx++}`); values.push(data.exigences); }
    if (data.typeContrat !== undefined) { fields.push(`type_contrat = $${idx++}`); values.push(data.typeContrat); }
    if (data.ville !== undefined) { fields.push(`ville = $${idx++}`); values.push(data.ville); }
    if (data.experienceRequise !== undefined) { fields.push(`experience_requise = $${idx++}`); values.push(data.experienceRequise); }
    if (data.niveauEtude !== undefined) { fields.push(`niveau_etude = $${idx++}`); values.push(data.niveauEtude); }
    if (data.categorieId !== undefined) { fields.push(`categorie_id = $${idx++}`); values.push(data.categorieId); }
    if (data.specialiteId !== undefined) { fields.push(`specialite_id = $${idx++}`); values.push(data.specialiteId); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.pool.query(
      `UPDATE offre_emploi SET ${fields.join(", ")} WHERE id = $${idx} RETURNING ${SELECT_COLS}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query("DELETE FROM offre_emploi WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  }

  async updateStatut(id: number, statut: string): Promise<OffreEmploi | null> {
    const { rows } = await this.pool.query(
      `UPDATE offre_emploi SET statut_validation = $1 WHERE id = $2 RETURNING ${SELECT_COLS}`,
      [statut, id]
    );
    return rows[0] || null;
  }
}

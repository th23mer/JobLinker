import { Pool } from "pg";
import { OffreEmploi } from "../interfaces/entities";
import { IOffreEmploiRepository } from "../interfaces/repositories";

const SELECT_COLS = `
  oe.id, oe.titre, oe.description, oe.exigences, oe.type_contrat AS "typeContrat",
  oe.ville, oe.experience_requise AS "experienceRequise", oe.niveau_etude AS "niveauEtude",
  oe.categorie_id AS "categorieId", oe.specialite_id AS "specialiteId",
  oe.statut_validation AS "statutValidation", oe.recruteur_id AS "recruteurId",
  oe.salaire, oe.date_creation AS "dateCreation",
  r.nom_entreprise AS "nomEntreprise", c.nom AS "categorieName"
`;

export class OffreEmploiRepository implements IOffreEmploiRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id WHERE oe.statut_validation = 'validee' ORDER BY oe.date_creation DESC`
    );
    return rows;
  }

  async findAllAdmin(): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(`SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id ORDER BY oe.date_creation DESC`);
    return rows;
  }

  async findById(id: number): Promise<OffreEmploi | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id WHERE oe.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByRecruteurId(recruteurId: number): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id WHERE oe.recruteur_id = $1 ORDER BY oe.date_creation DESC`,
      [recruteurId]
    );
    return rows;
  }

  async search(titre: string): Promise<OffreEmploi[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id WHERE oe.titre LIKE $1 AND oe.statut_validation = 'validee'`,
      [`%${titre}%`]
    );
    return rows;
  }

  async searchAdvanced(
    filters: Partial<Pick<OffreEmploi, "categorieId" | "specialiteId" | "typeContrat" | "ville" | "niveauEtude" | "experienceRequise">>
  ): Promise<OffreEmploi[]> {
    const conditions: string[] = ["oe.statut_validation = 'validee'"];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.categorieId) { conditions.push(`oe.categorie_id = $${idx++}`); values.push(filters.categorieId); }
    if (filters.specialiteId) { conditions.push(`oe.specialite_id = $${idx++}`); values.push(filters.specialiteId); }
    if (filters.typeContrat) { conditions.push(`oe.type_contrat = $${idx++}`); values.push(filters.typeContrat); }
    if (filters.ville) { conditions.push(`oe.ville LIKE $${idx++}`); values.push(`%${filters.ville}%`); }
    if (filters.niveauEtude) { conditions.push(`oe.niveau_etude = $${idx++}`); values.push(filters.niveauEtude); }
    if (filters.experienceRequise) { conditions.push(`oe.experience_requise = $${idx++}`); values.push(filters.experienceRequise); }

    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id WHERE ${conditions.join(" AND ")} ORDER BY oe.date_creation DESC`,
      values
    );
    return rows;
  }

  async create(data: Omit<OffreEmploi, "id" | "statutValidation">): Promise<OffreEmploi> {
    const { rows } = await this.pool.query(
      `INSERT INTO offre_emploi (titre, description, exigences, type_contrat, ville, experience_requise, niveau_etude, categorie_id, specialite_id, recruteur_id, statut_validation, salaire, date_creation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'en_attente', $11, CURRENT_TIMESTAMP)
       RETURNING id`,
      [data.titre, data.description, data.exigences, data.typeContrat, data.ville, data.experienceRequise, data.niveauEtude, data.categorieId, data.specialiteId, data.recruteurId, (data as any).salaire || null]
    );
    const createdId = rows[0].id;
    const { rows: fullRows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id WHERE oe.id = $1`,
      [createdId]
    );
    return fullRows[0];
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
    if ((data as any).salaire !== undefined) { fields.push(`salaire = $${idx++}`); values.push((data as any).salaire); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await this.pool.query(
      `UPDATE offre_emploi SET ${fields.join(", ")} WHERE id = $${idx}`,
      values
    );
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query("DELETE FROM offre_emploi WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  }

  async updateStatut(id: number, statut: string): Promise<OffreEmploi | null> {
    await this.pool.query(
      `UPDATE offre_emploi SET statut_validation = $1 WHERE id = $2`,
      [statut, id]
    );
    return this.findById(id);
  }
}

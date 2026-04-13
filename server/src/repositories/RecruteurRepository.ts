import { Pool } from "pg";
import { Recruteur } from "../interfaces/entities";
import { IRecruteurRepository } from "../interfaces/repositories";

const SELECT_COLS = `
  id, nom_entreprise AS "nomEntreprise", matricule_fiscal AS "matriculeFiscal",
  adresse, description, statut_validation AS "statutValidation",
  email, mot_de_passe AS "motDePasse", telephone,
  nom_representant AS "nomRepresentant", prenom_representant AS "prenomRepresentant"
`;

export class RecruteurRepository implements IRecruteurRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Recruteur[]> {
    const { rows } = await this.pool.query(`SELECT ${SELECT_COLS} FROM recruteur ORDER BY id`);
    return rows;
  }

  async findById(id: number): Promise<Recruteur | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM recruteur WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<Recruteur | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM recruteur WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  async create(data: Omit<Recruteur, "id" | "statutValidation">): Promise<Recruteur> {
    const { rows } = await this.pool.query(
      `INSERT INTO recruteur (nom_entreprise, matricule_fiscal, adresse, description, email, mot_de_passe, telephone, nom_representant, prenom_representant, statut_validation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'en_attente')
       RETURNING ${SELECT_COLS}`,
      [data.nomEntreprise, data.matriculeFiscal, data.adresse, data.description, data.email, data.motDePasse, data.telephone, data.nomRepresentant, data.prenomRepresentant]
    );
    return rows[0];
  }

  async update(id: number, data: Partial<Omit<Recruteur, "id" | "motDePasse">>): Promise<Recruteur | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.nomEntreprise !== undefined) { fields.push(`nom_entreprise = $${idx++}`); values.push(data.nomEntreprise); }
    if (data.matriculeFiscal !== undefined) { fields.push(`matricule_fiscal = $${idx++}`); values.push(data.matriculeFiscal); }
    if (data.adresse !== undefined) { fields.push(`adresse = $${idx++}`); values.push(data.adresse); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.telephone !== undefined) { fields.push(`telephone = $${idx++}`); values.push(data.telephone); }
    if (data.nomRepresentant !== undefined) { fields.push(`nom_representant = $${idx++}`); values.push(data.nomRepresentant); }
    if (data.prenomRepresentant !== undefined) { fields.push(`prenom_representant = $${idx++}`); values.push(data.prenomRepresentant); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.pool.query(
      `UPDATE recruteur SET ${fields.join(", ")} WHERE id = $${idx} RETURNING ${SELECT_COLS}`,
      values
    );
    return rows[0] || null;
  }

  async updateStatut(id: number, statut: string): Promise<Recruteur | null> {
    const { rows } = await this.pool.query(
      `UPDATE recruteur SET statut_validation = $1 WHERE id = $2 RETURNING ${SELECT_COLS}`,
      [statut, id]
    );
    return rows[0] || null;
  }
}

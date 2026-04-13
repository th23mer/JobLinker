import { Pool } from "pg";
import { Candidat } from "../interfaces/entities";
import { ICandidatRepository } from "../interfaces/repositories";

const SELECT_COLS = `
  id, cv, lettre_motivation AS "lettreMotivation", niveau_etude AS "niveauEtude",
  experience, diplome, nom, prenom, email, mot_de_passe AS "motDePasse", telephone
`;

export class CandidatRepository implements ICandidatRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Candidat[]> {
    const { rows } = await this.pool.query(`SELECT ${SELECT_COLS} FROM candidat ORDER BY id`);
    return rows;
  }

  async findById(id: number): Promise<Candidat | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM candidat WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<Candidat | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM candidat WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  async create(data: Omit<Candidat, "id">): Promise<Candidat> {
    const { rows } = await this.pool.query(
      `INSERT INTO candidat (cv, lettre_motivation, niveau_etude, experience, diplome, nom, prenom, email, mot_de_passe, telephone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${SELECT_COLS}`,
      [data.cv, data.lettreMotivation, data.niveauEtude, data.experience, data.diplome, data.nom, data.prenom, data.email, data.motDePasse, data.telephone]
    );
    return rows[0];
  }

  async update(id: number, data: Partial<Omit<Candidat, "id" | "motDePasse">>): Promise<Candidat | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.cv !== undefined) { fields.push(`cv = $${idx++}`); values.push(data.cv); }
    if (data.lettreMotivation !== undefined) { fields.push(`lettre_motivation = $${idx++}`); values.push(data.lettreMotivation); }
    if (data.niveauEtude !== undefined) { fields.push(`niveau_etude = $${idx++}`); values.push(data.niveauEtude); }
    if (data.experience !== undefined) { fields.push(`experience = $${idx++}`); values.push(data.experience); }
    if (data.diplome !== undefined) { fields.push(`diplome = $${idx++}`); values.push(data.diplome); }
    if (data.nom !== undefined) { fields.push(`nom = $${idx++}`); values.push(data.nom); }
    if (data.prenom !== undefined) { fields.push(`prenom = $${idx++}`); values.push(data.prenom); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.telephone !== undefined) { fields.push(`telephone = $${idx++}`); values.push(data.telephone); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.pool.query(
      `UPDATE candidat SET ${fields.join(", ")} WHERE id = $${idx} RETURNING ${SELECT_COLS}`,
      values
    );
    return rows[0] || null;
  }
}

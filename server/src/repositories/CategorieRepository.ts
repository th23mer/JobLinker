import { Pool } from "pg";
import { Categorie } from "../interfaces/entities";
import { ICategorieRepository } from "../interfaces/repositories";

export class CategorieRepository implements ICategorieRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Categorie[]> {
    const { rows } = await this.pool.query("SELECT id, nom FROM categorie ORDER BY nom");
    return rows;
  }

  async findById(id: number): Promise<Categorie | null> {
    const { rows } = await this.pool.query("SELECT id, nom FROM categorie WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async create(nom: string): Promise<Categorie> {
    // Check if category with same name already exists
    const existing = await this.pool.query("SELECT id FROM categorie WHERE nom = $1", [nom]);
    if (existing.rows.length > 0) {
      throw new Error("Une catégorie avec ce nom existe déjà");
    }
    
    const { rows } = await this.pool.query(
      "INSERT INTO categorie (nom) VALUES ($1) RETURNING id, nom",
      [nom]
    );
    return rows[0];
  }

  async update(id: number, nom: string): Promise<Categorie | null> {
    const { rows } = await this.pool.query(
      "UPDATE categorie SET nom = $1 WHERE id = $2 RETURNING id, nom",
      [nom, id]
    );
    return rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query("DELETE FROM categorie WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  }
}

import { Pool } from "pg";
import { Specialite } from "../interfaces/entities";
import { ISpecialiteRepository } from "../interfaces/repositories";

export class SpecialiteRepository implements ISpecialiteRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Specialite[]> {
    const { rows } = await this.pool.query(
      "SELECT id, nom, categorie_id AS \"categorieId\" FROM specialite ORDER BY nom"
    );
    return rows;
  }

  async findByCategorieId(categorieId: number): Promise<Specialite[]> {
    const { rows } = await this.pool.query(
      "SELECT id, nom, categorie_id AS \"categorieId\" FROM specialite WHERE categorie_id = $1 ORDER BY nom",
      [categorieId]
    );
    return rows;
  }

  async findById(id: number): Promise<Specialite | null> {
    const { rows } = await this.pool.query(
      "SELECT id, nom, categorie_id AS \"categorieId\" FROM specialite WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }

  async create(nom: string, categorieId: number): Promise<Specialite> {
    const { rows } = await this.pool.query(
      "INSERT INTO specialite (nom, categorie_id) VALUES ($1, $2) RETURNING id, nom, categorie_id AS \"categorieId\"",
      [nom, categorieId]
    );
    return rows[0];
  }

  async update(id: number, nom: string): Promise<Specialite | null> {
    const { rows } = await this.pool.query(
      "UPDATE specialite SET nom = $1 WHERE id = $2 RETURNING id, nom, categorie_id AS \"categorieId\"",
      [nom, id]
    );
    return rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query("DELETE FROM specialite WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  }
}

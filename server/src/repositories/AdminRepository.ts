import { Pool } from "pg";
import { Administrateur } from "../interfaces/entities";
import { IAdminRepository } from "../interfaces/repositories";

export class AdminRepository implements IAdminRepository {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<Administrateur | null> {
    const { rows } = await this.pool.query(
      "SELECT id, email, mot_de_passe AS \"motDePasse\" FROM administrateur WHERE email = $1",
      [email]
    );
    return rows[0] || null;
  }

  async findById(id: number): Promise<Administrateur | null> {
    const { rows } = await this.pool.query(
      "SELECT id, email, mot_de_passe AS \"motDePasse\" FROM administrateur WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }
}

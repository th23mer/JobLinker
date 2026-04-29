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

const normalizeSearchText = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokenizeSearchText = (value: unknown): string[] =>
  normalizeSearchText(value).split(/\s+/).filter(Boolean);

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
};

const allowedTypoDistance = (term: string): number => {
  if (term.length <= 3) return 0;
  if (term.length <= 6) return 1;
  return 2;
};

const tokenMatchScore = (term: string, candidate: string): number => {
  if (candidate === term) return 120;
  if (candidate.includes(term)) return 95;
  if (term.includes(candidate) && candidate.length >= 4) return 75;

  const maxDistance = allowedTypoDistance(term);
  if (!maxDistance) return 0;

  const distance = levenshteinDistance(term, candidate);
  if (distance <= maxDistance) return 70 - distance * 12;

  return 0;
};

const offerSearchScore = (offre: OffreEmploi, query: string): number => {
  const terms = tokenizeSearchText(query);
  if (terms.length === 0) return 1;

  const searchable = [
    offre.titre,
    offre.description,
    offre.exigences,
    offre.ville,
    (offre as any).nomEntreprise,
    (offre as any).categorieName,
  ].join(" ");
  const normalizedSearchable = normalizeSearchText(searchable);
  const tokens = tokenizeSearchText(searchable);

  let totalScore = 0;
  for (const term of terms) {
    if (normalizedSearchable.includes(term)) {
      totalScore += 110;
      continue;
    }

    const bestScore = tokens.reduce((best, token) => Math.max(best, tokenMatchScore(term, token)), 0);
    if (bestScore === 0) return 0;
    totalScore += bestScore;
  }

  return totalScore;
};

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
    const query = String(titre ?? "").trim();
    if (!query) return this.findAll();

    const { rows } = await this.pool.query<OffreEmploi>(
      `SELECT ${SELECT_COLS}
       FROM offre_emploi oe
       JOIN recruteur r ON oe.recruteur_id = r.id
       JOIN categorie c ON oe.categorie_id = c.id
       WHERE oe.statut_validation = 'validee'
       ORDER BY oe.date_creation DESC`
    );

    return rows
      .map((offre) => ({ offre, score: offerSearchScore(offre, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ offre }) => offre);
  }

  async searchAdvanced(
    filters: { categorieId?: number; specialiteId?: number; typeContrat?: string; ville?: string; niveauEtude?: string; experienceRequise?: string; q?: string; statutValidation?: string }
  ): Promise<OffreEmploi[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.q) {
      conditions.push(`(oe.titre ILIKE $${idx} OR r.nom_entreprise ILIKE $${idx})`);
      values.push(`%${filters.q}%`);
      idx++;
    }
    if (filters.statutValidation) { conditions.push(`oe.statut_validation = $${idx++}`); values.push(filters.statutValidation); }
    if (filters.categorieId) { conditions.push(`oe.categorie_id = $${idx++}`); values.push(filters.categorieId); }
    if (filters.specialiteId) { conditions.push(`oe.specialite_id = $${idx++}`); values.push(filters.specialiteId); }
    if (filters.typeContrat) { conditions.push(`oe.type_contrat = $${idx++}`); values.push(filters.typeContrat); }
    if (filters.ville) { conditions.push(`oe.ville ILIKE $${idx++}`); values.push(`%${filters.ville}%`); }
    if (filters.niveauEtude) { conditions.push(`oe.niveau_etude = $${idx++}`); values.push(filters.niveauEtude); }
    if (filters.experienceRequise) { conditions.push(`oe.experience_requise = $${idx++}`); values.push(filters.experienceRequise); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM offre_emploi oe JOIN recruteur r ON oe.recruteur_id = r.id JOIN categorie c ON oe.categorie_id = c.id ${whereClause} ORDER BY oe.date_creation DESC`,
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

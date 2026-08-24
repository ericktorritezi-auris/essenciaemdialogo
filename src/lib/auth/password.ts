import argon2 from "argon2";

/**
 * Argon2id — resistente a cracking por GPU, recomendado explicitamente
 * no Plano Técnico (Seção 6/8) sobre bcrypt.
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB — recomendação OWASP para argon2id
  timeCost: 2,
  parallelism: 1,
} satisfies argon2.Options;

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // hash malformado/corrompido — trata como senha inválida, nunca lança
    return false;
  }
}

/**
 * Gera um hash "impossível de bater" para usuários que ainda não
 * definiram senha própria (ex.: logo após o bootstrap do admin).
 * Garante que nenhuma senha vazia/adivinhável funcione antes do
 * fluxo de primeiro acesso ser concluído.
 */
export async function hashUnusablePassword(): Promise<string> {
  const random = crypto.randomUUID() + crypto.randomUUID();
  return hashPassword(random);
}

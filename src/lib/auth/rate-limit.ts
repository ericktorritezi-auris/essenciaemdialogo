/**
 * Rate limiting em memória para tentativas de login (proteção contra
 * força bruta — Seção 17 do Plano Técnico).
 *
 * LIMITAÇÃO CONHECIDA: funciona em memória do processo, então só é
 * confiável com UMA única instância da aplicação — o que bate com a
 * decisão já tomada de rodar apenas "produção" sem múltiplas réplicas
 * (Seção 25 do Plano Técnico). Se o projeto crescer para múltiplas
 * instâncias no futuro, isso precisa migrar para um store compartilhado
 * (ex.: Redis) — documentado aqui para não ser esquecido.
 */

interface AttemptRecord {
  count: number;
  windowStartedAt: number;
}

const attempts = new Map<string, AttemptRecord>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000); // 15 min
const MAX_ATTEMPTS = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS ?? 5);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Chave recomendada: `${ip}:${email.toLowerCase()}` — limita por
 * combinação de IP + e-mail, não só por IP (evita que um único IP
 * atacando vários e-mails passe despercebido) nem só por e-mail
 * (evita que múltiplos IPs contornem o limite de um usuário).
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.windowStartedAt > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStartedAt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterMs: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: WINDOW_MS - (now - record.windowStartedAt),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - record.count,
    retryAfterMs: 0,
  };
}

/** Limpa o contador após um login bem-sucedido. */
export function clearRateLimit(key: string): void {
  attempts.delete(key);
}

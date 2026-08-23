import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfWeek, endOfWeek } from "date-fns";

/**
 * Camada única de regras de tempo de negócio.
 *
 * Todo o projeto tem UMA fonte de verdade para timezone — nunca duplicar
 * esta lógica em outros arquivos. Isso existe porque a regra de
 * "Últimos Lançamentos" (Seção 11 do Prompt Mestre) é o ponto de maior
 * risco técnico do projeto: semana editorial segunda→domingo, calculada
 * em America/Sao_Paulo, usando `published_at` (nunca created_at/updated_at).
 *
 * Banco sempre armazena instantes absolutos (UTC). Esta camada converte
 * para o timezone oficial de negócio somente na borda de regra/exibição.
 */

export const BUSINESS_TIMEZONE = "America/Sao_Paulo";

/**
 * Retorna o início (segunda-feira 00:00:00.000) e o fim
 * (domingo 23:59:59.999) da semana editorial corrente, em
 * America/Sao_Paulo, já convertidos para instantes absolutos (UTC)
 * prontos para uso em query no banco.
 */
export function getCurrentEditorialWeekRange(referenceDate: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const zonedNow = toZonedTime(referenceDate, BUSINESS_TIMEZONE);

  // weekStartsOn: 1 => segunda-feira
  const zonedStart = startOfWeek(zonedNow, { weekStartsOn: 1 });
  const zonedEnd = endOfWeek(zonedNow, { weekStartsOn: 1 });

  return {
    start: fromZonedTime(zonedStart, BUSINESS_TIMEZONE),
    end: fromZonedTime(zonedEnd, BUSINESS_TIMEZONE),
  };
}

/**
 * Converte um instante absoluto (UTC, vindo do banco) para exibição
 * no timezone oficial de negócio.
 */
export function toBusinessTime(date: Date): Date {
  return toZonedTime(date, BUSINESS_TIMEZONE);
}

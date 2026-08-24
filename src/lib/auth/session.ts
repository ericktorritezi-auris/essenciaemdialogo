import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";

/**
 * Sessão criptografada em cookie HttpOnly (Seção 8 do Plano Técnico —
 * nunca JWT em localStorage). O cookie carrega só o essencial (userId);
 * o papel/estado atual do usuário é sempre revalidado no banco a cada
 * request via getCurrentUser(), nunca confiado apenas pelo conteúdo
 * do cookie — isso permite desativar um usuário e a sessão perder
 * efeito imediatamente, mesmo com o cookie ainda válido.
 */
export interface SessionData {
  userId?: string;
}

const secret = process.env.SESSION_SECRET;

if (!secret || secret.length < 32) {
  // Falha alto e cedo — nunca subir com um segredo fraco/ausente.
  throw new Error(
    "SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres). Configure no ambiente.",
  );
}

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

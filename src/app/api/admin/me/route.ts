import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

/** GET /api/admin/me — usado pelo client para saber o papel do usuário logado. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

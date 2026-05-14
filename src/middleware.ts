import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware ligero — NO requiere NextAuth en dev.
 *
 * Responsabilidades:
 *  1. Inyectar X-Tenant-Id en cada request (para el backend)
 *  2. (Comentado) Protección de rutas — activar cuando NextAuth esté configurado
 */
export function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;

  // ── 1. Tenant resolution ──────────────────────────────────────
  const subdomain = hostname.split(".")[0];
  const tenantId  = subdomain !== "localhost" ? subdomain : "default_tenant";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("X-Tenant-Id", tenantId);

  // ── 2. Plan gate (desactivado en dev — activar con NextAuth real) ──
  // const token = await getToken({ req });
  // if (pathname.startsWith("/herramientas/video") && token?.plan === "free") {
  //   return NextResponse.redirect(new URL("/dashboard?error=plan_restricted", req.url));
  // }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  /*
   * Solo corre en rutas que realmente necesitan el tenant header.
   * Excluye: archivos estáticos, _next, favicon, etc.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

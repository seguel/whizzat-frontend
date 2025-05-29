import { NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/cadastro/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  console.log("Middleware executado:", { path, token, isPublicRoute });

  if (token && isPublicRoute) {
    // Usuário logado tentando acessar rota pública (login)
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && !isPublicRoute) {
    // Usuário não logado tentando acessar rota privada
    return NextResponse.redirect(new URL("/cadastro/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/cadastro/:path*"],
};

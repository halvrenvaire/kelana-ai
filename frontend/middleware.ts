import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Halaman yang wajib login
const PROTECTED = ["/", "/history", "/assistant"];

// Halaman yang tidak boleh diakses kalau sudah login
const AUTH_ONLY = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kelana_token")?.value;

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  const isAuthOnly = AUTH_ONLY.includes(pathname);

  // Belum login → redirect ke /login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Sudah login → redirect ke / kalau buka /login atau /register
  if (isAuthOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

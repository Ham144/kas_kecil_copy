import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./types/role.type";

function normalizeRole(role?: string | null): string {
  return String(role || "").toUpperCase();
}

function canAccessPath(pathname: string, allowedPaths: string[]): boolean {
  return allowedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const pathname = req.nextUrl.pathname;

  //page hanya bisa di kunjungi office:non WL non IT
  const admin_only = [
    "/",
    "/admin",
    "/setup",
    "/warehouse",
    "/setup/category",
    "/admin/flow",
    "/admin/stats",
    "/expense",
    "/revenue",
  ];
  //page hanya bisa dikunjugi office:mengandung "WL"
  const kasir_only = [
    "/",
    "/expense",
    "/revenue",
    "/admin/flow",
    "/admin/stats",
  ];

  // Jika di halaman login, biarkan lewat (tidak perlu check token)
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Jika tidak ada access_token
  if (!token) {
    const refreshPayload = refreshToken ? decodeJwtPayload(refreshToken) : null;
    const refreshExp = Number(refreshPayload?.exp);
    const refreshIsValid = !!refreshToken && (!refreshExp || refreshExp * 1000 > Date.now());

    // Jika ada refresh_token yang masih valid, biarkan lewat
    // Axios interceptor akan otomatis refresh token jika diperlukan
    if (refreshIsValid) {
      return NextResponse.next();
    }
    // Jika tidak ada keduanya, redirect ke login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // === Manual decode JWT ===
    // Decode token untuk check expiration dan role
    const payload = token.split(".")[1];
    const decoded: TokenPayload = JSON.parse(
      Buffer.from(payload, "base64").toString(),
    );

    // Check token expiration (exp adalah timestamp dalam detik)
    const exp = decoded?.exp;
    if (exp && exp * 1000 < Date.now()) {
      // Token expired, tapi ada refresh_token - biarkan lewat
      // Axios interceptor akan handle refresh
      if (refreshToken) {
        return NextResponse.next();
      }
      // Token expired dan tidak ada refresh_token, redirect ke login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = normalizeRole(decoded?.role);

    // === Role checking ===
    if (role === Role.IT || decoded?.description?.toUpperCase() === "IT") {
      return NextResponse.next();
    }

    if (role === Role.ADMIN) {
      if (canAccessPath(pathname, admin_only)) {
        return NextResponse.next();
      }
    }

    if (role === Role.KASIR) {
      if (canAccessPath(pathname, kasir_only)) {
        return NextResponse.next();
      }
    }

    return NextResponse.redirect(new URL("/unauthorized", req.url));
  } catch (err) {
    // Token invalid/malformed
    const refreshPayload = refreshToken ? decodeJwtPayload(refreshToken) : null;
    const refreshExp = Number(refreshPayload?.exp);
    const refreshIsValid = !!refreshToken && (!refreshExp || refreshExp * 1000 > Date.now());

    // Jika ada refresh_token yang masih valid, biarkan lewat
    if (refreshIsValid) {
      return NextResponse.next();
    }
    // Token invalid dan tidak ada refresh_token, redirect ke login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|csi-logo.png|login|unauthorized).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./types/role.type";

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
  const kasir_only = ["/", "/expense", "/revenue"];

  // Jika di halaman login, biarkan lewat (tidak perlu check token)
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Jika tidak ada access_token
  if (!token) {
    // Jika ada refresh_token, biarkan lewat (biarkan axios handle refresh saat API call)
    // Axios interceptor akan otomatis refresh token jika diperlukan
    if (refreshToken) {
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
      Buffer.from(payload, "base64").toString()
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

    const role = decoded?.role;

    // === Role checking ===
    if (role === Role.IT) {
      return NextResponse.next();
    }

    if (role == Role.ADMIN) {
      if (admin_only.includes(pathname)) {
        return NextResponse.next();
      }
    }

    if (role == Role.KASIR) {
      if (kasir_only.includes(pathname)) {
        return NextResponse.next();
      }
    }

    return NextResponse.redirect(new URL("/unauthorized", req.url));
  } catch (err) {
    // Token invalid/malformed
    // Jika ada refresh_token, biarkan lewat (biarkan axios handle refresh)
    if (refreshToken) {
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

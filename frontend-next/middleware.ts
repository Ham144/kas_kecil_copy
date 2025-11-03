import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const pathname = req.nextUrl.pathname;

  const wl_IT_only = ["/admin", "/setup", "/warehouse"];
  const kasir_IT_only = ["/"];

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // === Manual decode JWT ===
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    const description = decoded?.description;

    // === Role checking ===
    if (description === "IT") {
      return NextResponse.next();
    }

    if (description?.includes("WL")) {
      if (wl_IT_only.includes(pathname)) {
        return NextResponse.next();
      }
    }

    if (description?.includes("KASIR")) {
      if (kasir_IT_only.includes(pathname)) {
        return NextResponse.next();
      }
    }

    return NextResponse.redirect(new URL("/unauthorized", req.url));
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|unauthorized).*)"],
};

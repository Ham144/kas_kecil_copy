import { UserInfo } from "@/types/auth";
import { Role } from "@/types/role.type";

export function normalizeRole(role?: string | null): string {
  return String(role || "").toUpperCase();
}

export function isKasirUser(userInfo: UserInfo | null | undefined): boolean {
  return normalizeRole(userInfo?.role) === Role.KASIR;
}

export function isAdminUser(userInfo: UserInfo | null | undefined): boolean {
  return normalizeRole(userInfo?.role) === Role.ADMIN;
}

export function isItUser(userInfo: UserInfo | null | undefined): boolean {
  return (
    normalizeRole(userInfo?.role) === Role.IT ||
    userInfo?.description?.toUpperCase() === "IT"
  );
}

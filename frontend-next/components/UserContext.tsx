"use client";
import { AuthApi } from "@/api/auth";
import { UserInfo } from "@/types/auth";
import { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  loadingUser: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingUser, setloadingUser] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await AuthApi.getUserInfo();
        setUserInfo(res);
      } catch (err: any) {
        // Silent fail jika 403/401 (user belum login)
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          setUserInfo(null);
        } else {
          console.error("Failed to fetch user:", err);
          setUserInfo(null);
        }
      } finally {
        setloadingUser(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserInfo(): {
  userInfo: UserInfo | null;
  loadingUser: boolean;
} {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserInfo must be used within UserProvider");
  }
  return context;
}

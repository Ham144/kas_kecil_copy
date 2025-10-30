import axiosInstance from "@/lib/axios";
import type { LoginRequestLdapDto, LoginResponseDto } from "@/types/auth";

export const AuthApi = {
  loginUserLdap: async (
    credentials: LoginRequestLdapDto
  ): Promise<LoginResponseDto> => {
    const response = await axiosInstance.post<LoginResponseDto>(
      "/api/user/login/ldap",
      credentials
    );

    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.delete("/api/user/logout");
    return response.data;
  },

  getUserInfo: async () => {
    const response = await axiosInstance.get("/api/user/get-user-info");
    return response.data;
  },
};

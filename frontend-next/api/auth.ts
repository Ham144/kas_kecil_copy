import axiosInstance from "@/lib/axios";
import type {
  LoginRequestLdapDto,
  LoginResponseDto,
  UserInfo,
} from "@/types/auth";

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

  updateAccount: async (body: UserInfo) => {
    const response = await axiosInstance.patch("/api/user/update", body);
    return response.data;
  },

  getAllAccount: async (page: number, searchKey: string) => {
    let params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("searchKey", searchKey);
    const response = await axiosInstance.get("/api/user/list", { params });
    return response.data;
  },
};

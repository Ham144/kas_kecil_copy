export interface LoginRequestLdapDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  role?: string;
  // Tambahkan field lain sesuai kebutuhan
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

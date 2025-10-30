export class LoginResponseDto {
  description: string;
  username: string;
  displayName: string;
  warehouse: object;
  two_faIsVerified: boolean;
  twoFARequired?: boolean;
  refresh_token?: string;
  access_token?: string;
}

export class LoginRequestLdapDto {
  username: string;
  password: string;
}

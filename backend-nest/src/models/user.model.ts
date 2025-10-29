export class LoginResponseDto {
  description: string;
  username: string;
  displayName: string;
  token?: string;
  warehouse: object;
  two_faIsVerified: boolean;
  pendingToken?: string;
  twoFARequired?: boolean;
  refresh_token?: string;
  access_token?: string;
}

export class LoginRequestLdapDto {
  username: string;
  password: string;
}

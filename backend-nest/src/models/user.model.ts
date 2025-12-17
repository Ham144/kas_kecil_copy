export class LoginResponseDto {
  description: string;
  username: string;
  displayName: string;
  warehouse: object;
  warehouseId: string;
  role?: string;
  isActive?: boolean;
  refresh_token?: string;
  access_token?: string;
}

export class LoginRequestLdapDto {
  username: string;
  password: string;
}

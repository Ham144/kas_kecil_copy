import { ROLE } from '@prisma/client';

export class TokenPayload {
  username: string;
  description: string;
  warehouseId: string;
  warehouseName: string; //untuk penentuan isKasir
  role: ROLE;
  jti: string;
}

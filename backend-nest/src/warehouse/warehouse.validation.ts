import z, { ZodType } from 'zod';

export class WarehouseValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string(),
    members: z.array(z.string()),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string(),
    members: z.array(z.string()),
  });
}

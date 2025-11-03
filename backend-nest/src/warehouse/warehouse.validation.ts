import z, { ZodType } from 'zod';

export class WarehouseValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1, 'Warehouse name is required'),
    location: z.string().optional(),
    description: z.string().optional(),
    members: z.array(z.string()).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1, 'Warehouse id is required'),
    name: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    members: z.array(z.string()).optional(),
  });
}

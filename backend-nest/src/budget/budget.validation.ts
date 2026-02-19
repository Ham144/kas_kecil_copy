import z, { ZodType } from 'zod';

export class BudgetValidation {
  static readonly CREATE: ZodType = z.object({
    categoryId: z.string().min(1, 'category ID is required'),
    month: z.number().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.number().int().min(2000).max(2100),
    amount: z.number().positive('Amount must be positive'),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1, 'Budget ID is required'),
    month: z.number().min(1).max(12).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    amount: z.number().positive().optional(),
  });
}

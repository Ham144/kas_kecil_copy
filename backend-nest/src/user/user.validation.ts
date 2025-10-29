import z, { ZodType } from 'zod';

export class UserValidation {
  static readonly LOGIN: ZodType = z.object({
    username: z.string(),
    password: z.string(),
  });
}

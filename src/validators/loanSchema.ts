import { z } from 'zod';

export const loanCreateSchema = z.object({
  userId: z.number().int().positive(),
  accountId: z.number().int().positive(),
  type: z.enum(['PERSONAL', 'BUSINESS', 'HOME', 'CAR']),
  amount: z.number().positive().min(1000, 'Min loan 1000'),
  interestRate: z.number().min(0).max(50),
  duration: z.number().int().min(1).max(360), // months
}).strict();

export type LoanCreateInput = z.infer<typeof loanCreateSchema>;


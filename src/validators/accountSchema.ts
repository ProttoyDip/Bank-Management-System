import { z } from 'zod';

export const accountCreateSchema = z.object({
  userId: z.number().int().positive(),
  accountNumber: z.string().min(5).max(20),
  balance: z.number().min(0).default(0),
  type: z.enum(['SAVINGS', 'CURRENT', 'FIXED']).default('SAVINGS'),
}).strict();

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).optional(),
});

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;


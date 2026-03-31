import { z } from 'zod';

const strongPassword = z.string().min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

const adminCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().max(20),
  password: strongPassword,
  nationalId: z.string().min(10).max(50),
  authCode: z.string().min(6), // Admin authorization code
  department: z.enum(['IT', 'Operations', 'Compliance']),
  officeLocation: z.string().max(100),
  accessLevel: z.enum(['Super Admin', 'Manager Admin']),
  permissions: z.array(z.string()).min(1), // e.g. ['manageEmployees']
  twoFactorEnabled: z.boolean().optional(),
  securityQuestions: z.object({ q1: z.string(), ans1: z.string(), q2: z.string(), ans2: z.string() }).optional(),
  role: z.literal('Admin'),
});

const employeeCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().max(20),
  password: strongPassword,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  gender: z.enum(['Male', 'Female', 'Other']),
  nationalId: z.string().min(10).max(50),
  presentAddress: z.string().max(100),
  permanentAddress: z.string().max(255),
  department: z.string().max(100),
  position: z.string().max(100),
  branchId: z.number().int().positive(),
  employmentType: z.enum(['Full-time', 'Contract']),
  dailyTransactionLimit: z.number().min(0),
  permissions: z.array(z.string()).min(1),
  twoFactorEnabled: z.boolean().optional(),
  role: z.literal('Employee'),
  salary: z.number().min(0).optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const userCreateSchema = z.discriminatedUnion('role', [
  adminCreateSchema,
  employeeCreateSchema,
  // Keep basic customer for backward compat
  z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase(),
    phone: z.string().optional(),
    address: z.string().max(255).optional(),
    password: strongPassword,
    role: z.literal('Customer'),
  })
]);

export const customerRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  password: strongPassword,
  accountType: z.enum(['Savings', 'Current', 'Fixed Deposit', 'Loan Account']).optional(),
  initialDeposit: z.coerce.number().min(0).optional().default(2000),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPassword,
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;


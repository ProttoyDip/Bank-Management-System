import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { generateToken } from "../utils/generateToken";

interface LoginResult {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}

/**
 * Authenticate a user and generate JWT token
 */
export async function login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPasswordHash = String(process.env.ADMIN_PASSWORD_HASH || "").trim();
    const userRepository = getDataSource().getRepository(User);

    if (adminEmail && normalizedEmail === adminEmail) {
        const dbUser = await userRepository.findOne({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                name: true,
                status: true,
                accessLevel: true,
                permissions: true
            }
        });

        const isEnvAdminPasswordValid = adminPasswordHash
            ? await comparePassword(password, adminPasswordHash)
            : false;
        const isDbPasswordValid = dbUser?.password
            ? await comparePassword(password, dbUser.password)
            : false;

        if (!isEnvAdminPasswordValid && !isDbPasswordValid) {
            return {
                success: false,
                error: "Invalid credentials"
            };
        }

        const token = generateToken({
            id: dbUser?.id ?? -1,
            user_id: dbUser?.id ? `ADMIN_${dbUser.id}` : "ADMIN_STATIC_ID",
            email: adminEmail,
            role: "ADMIN",
            accessLevel: "Super Admin",  // Static admin is always Super Admin
            permissions: JSON.stringify({ inviteEmployees: true, updateSettings: true, createAdmin: true })
        });

        const adminUser = {
            id: dbUser?.id ?? -1,
            name: dbUser?.name || "System Administrator",
            email: adminEmail,
            role: "ADMIN",
            accessLevel: "Super Admin",
            permissions: JSON.stringify({ inviteEmployees: true, updateSettings: true, createAdmin: true })
        } as User;

        return {
            success: true,
            token,
            user: adminUser
        };
    }

    // Find user by email (select admin tier columns)
    const user = await userRepository.findOne({ 
        where: { email: normalizedEmail },
        select: { 
            id: true, 
            email: true, 
            password: true, 
            role: true,
            name: true,
            status: true,
            accessLevel: true,
            permissions: true
        } 
    });

    if (!user) {
        return {
            success: false,
            error: "Invalid email or password"
        };
    }

    // Check if password matches
    const isPasswordValid = await comparePassword(password, user.password || "");

    if (!isPasswordValid) {
        return {
            success: false,
            error: "Invalid email or password"
        };
    }

    // Generate JWT token with admin tier claims
    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role || "Customer",
        accessLevel: user.accessLevel || undefined,
        permissions: user.permissions || undefined
    });

    return {
        success: true,
        token,
        user
    };
}

/**
 * Register a new user
 */
export async function register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string,
    role: string = "Customer"
): Promise<{ success: boolean; user?: User; error?: string }> {
    const normalizedRole = String(role || "").trim().toLowerCase();
    if (normalizedRole === "admin") {
        return {
            success: false,
            error: "Unauthorized role selection"
        };
    }

    const userRepository = getDataSource().getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ 
        where: { email },
        select: { id: true }
    });
    if (existingUser) {
        return {
            success: false,
            error: "User with this email already exists"
        };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role
    });

    const savedUser = await userRepository.save(user);

    return {
        success: true,
        user: savedUser
    };
}

/**
 * Change password for a user
 */
export async function changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    const userRepository = getDataSource().getRepository(User);

    const user = await userRepository.findOne({ 
        where: { id: userId },
        select: { 
            id: true, 
            password: true 
        } 
    });
    if (!user) {
        return {
            success: false,
            error: "User not found"
        };
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password || "");
    if (!isPasswordValid) {
        return {
            success: false,
            error: "Current password is incorrect"
        };
    }

    // Hash new password
    user.password = await hashPassword(newPassword);
    await userRepository.save(user);

    return {
        success: true
    };
}

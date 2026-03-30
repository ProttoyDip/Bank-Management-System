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
    const userRepository = getDataSource().getRepository(User);

    // Find user by email (select only needed fields to avoid nullable admin columns)
    const user = await userRepository.findOne({ 
        where: { email },
        select: { 
            id: true, 
            email: true, 
            password: true, 
            role: true,
            name: true,
            status: true 
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

    // Generate JWT token
    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role || "Customer"
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


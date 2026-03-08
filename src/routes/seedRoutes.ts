import { Router } from "express";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { hashPassword } from "../utils/hashPassword";

const router = Router();

// Seed/Reset users with proper passwords
router.post("/seed-users", async (_req, res) => {
    try {
        const userRepository = getDataSource().getRepository(User);
        
        // Hash the password
        const hashedPassword = await hashPassword("password123");
        
        // Define users to create/update
        const usersData = [
            { id: 1, name: "Rahim Uddin", email: "rahim@example.com", phone: "+8801711000001", address: "123 Mirpur Road, Dhaka", role: "Admin" },
            { id: 2, name: "Fatema Akhter", email: "fatema@example.com", phone: "+8801812000002", address: "45 Agrabad, Chittagong", role: "Employee" },
            { id: 3, name: "Kamal Hossain", email: "kamal@example.com", phone: "+8801913000003", address: "78 Zindabazar, Sylhet", role: "Customer" },
            { id: 4, name: "Nasrin Begum", email: "nasrin@example.com", phone: "+8801611000004", address: "22 Jessore Road, Khulna", role: "Customer" },
            { id: 5, name: "Tariqul Islam", email: "tariq@example.com", phone: "+8801511000005", address: "55 Shaheb Bazar, Rajshahi", role: "Customer" },
        ];
        
        const createdUsers = [];
        
        for (const userData of usersData) {
            // Check if user exists
            let user = await userRepository.findOneBy({ id: userData.id });
            
            if (user) {
                // Update existing user
                user.name = userData.name;
                user.email = userData.email;
                user.phone = userData.phone;
                user.address = userData.address;
                user.role = userData.role;
                user.password = hashedPassword;
            } else {
                // Create new user
                user = userRepository.create({
                    ...userData,
                    password: hashedPassword
                });
            }
            
            const savedUser = await userRepository.save(user);
            createdUsers.push({
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            });
        }
        
        res.json({
            message: "Users seeded successfully",
            users: createdUsers,
            defaultPassword: "password123"
        });
    } catch (error) {
        console.error("Error seeding users:", error);
        res.status(500).json({ error: "Failed to seed users" });
    }
});

export default router;


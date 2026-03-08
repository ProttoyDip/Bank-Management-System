import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Account } from "./Account";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 100 })
    name!: string;

    @Column({ type: "nvarchar", length: 150, unique: true })
    email!: string;

    @Column({ type: "nvarchar", length: 20, nullable: true })
    phone!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    address!: string;

    @Column({ type: "nvarchar", length: 20, default: "Customer" })
    role!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    password!: string;

    @Column({ type: "nvarchar", length: 10, nullable: true })
    verificationCode!: string;

    @Column({ type: "datetime", nullable: true })
    verificationExpiry!: Date | null;

    @OneToMany(() => Account, (account) => account.user, { cascade: true })
    accounts!: Account[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

// Auth routes
router.post("/login", UserController.login);

// User CRUD routes
router.post("/", UserController.create);
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

// Password reset routes
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-code", UserController.verifyCode);
router.post("/change-password", UserController.changePassword);

export default router;

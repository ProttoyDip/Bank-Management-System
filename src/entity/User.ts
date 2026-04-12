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
    verificationCode!: string | null;

    @Column({ type: "datetime", nullable: true })
    verificationExpiry!: Date | null;

    @OneToMany(() => Account, (account) => account.user, { cascade: true })
    accounts!: Account[];

    @CreateDateColumn()
    createdAt!: Date;

@Column({ type: "nvarchar", length: 20, default: "Active" })
    status!: string;

    @Column({ type: "int", nullable: true })
    createdBy!: number;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    profilePhoto!: string;

    @Column({ type: "nvarchar", length: 50, nullable: true })
    nationalId!: string;

    @Column({ type: "bit", default: false })
    twoFactorEnabled!: boolean;

    @Column({ type: "nvarchar", length: 500, nullable: true })
    securityQuestions!: string; // JSON string

    // Admin-specific fields
    @Column({ type: "nvarchar", length: 20, nullable: true })
    adminId!: string;

    @Column({ type: "nvarchar", length: 50, nullable: true })
    accessLevel!: string;

    @Column({ type: "nvarchar", length: 1000, nullable: true })
    permissions!: string; // JSON array string e.g. '["manageEmployees","approveTransactions"]'

    @Column({ type: "nvarchar", length: 100, nullable: true })
    authCode!: string; // Hashed admin authorization code

    @Column({ type: "nvarchar", length: 100, nullable: true })
    department!: string;

    @Column({ type: "nvarchar", length: 100, nullable: true })
    officeLocation!: string;

    @Column({ type: "nvarchar", length: 45, nullable: true })
    lastLoginIP!: string;

    @UpdateDateColumn()
    updatedAt!: Date;
}

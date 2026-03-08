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

    @UpdateDateColumn()
    updatedAt!: Date;
}

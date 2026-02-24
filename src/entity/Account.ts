import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum AccountType {
    SAVINGS = "Savings",
    CURRENT = "Current",
    FIXED_DEPOSIT = "Fixed Deposit",
    LOAN = "Loan Account",
}

@Entity("accounts")
export class Account {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 20, unique: true })
    accountNumber!: string;

    @Column({ type: "nvarchar", length: 50, default: AccountType.SAVINGS })
    type!: string;

    @Column({ type: "decimal", precision: 18, scale: 2, default: 0 })
    balance!: number;

    @Column({ type: "bit", default: true })
    isActive!: boolean;

    @ManyToOne(() => User, (user) => user.accounts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column()
    userId!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { Account } from "./Account";

// Transaction types as enum
export enum TransactionType {
    DEPOSIT = "Deposit",
    WITHDRAW = "Withdraw",
    TRANSFER_IN = "Transfer In",
    TRANSFER_OUT = "Transfer Out",
    LOAN_DISBURSEMENT = "Loan Disbursement",
    LOAN_PAYMENT = "Loan Payment",
}

export enum TransactionStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    SUSPICIOUS = "Suspicious",
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    accountId!: number;

    // Store enum as string (MSSQL compatible)
    @Column({ type: "nvarchar", length: 50, enum: TransactionType })
    type!: TransactionType;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    amount!: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    balanceAfter!: number;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    description!: string;

    @Column({ type: "nvarchar", length: 50, unique: true })
    referenceNumber!: string;

    @Column({ type: "nvarchar", length: 30, default: TransactionStatus.PENDING })
    status!: string;

    @Column({ type: "bit", default: false })
    isFlagged!: boolean;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    flagReason!: string | null;

    @Column({ type: "int", nullable: true })
    reviewedByEmployeeId!: number | null;

    @Column({ type: "datetime", nullable: true })
    reviewedAt!: Date | null;

    @Column({ type: "int", nullable: true })
    createdByEmployeeId!: number | null;

    @ManyToOne(() => Account, { onDelete: "CASCADE" })
    @JoinColumn({ name: "accountId" })
    account!: Account;

    @CreateDateColumn()
    createdAt!: Date;
}

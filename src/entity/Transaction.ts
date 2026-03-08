import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { Account } from "./Account";

export enum TransactionType {
    DEPOSIT = "Deposit",
    WITHDRAW = "Withdraw",
    TRANSFER_IN = "Transfer In",
    TRANSFER_OUT = "Transfer Out",
    LOAN_DISBURSEMENT = "Loan Disbursement",
    LOAN_PAYMENT = "Loan Payment",
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    accountId!: number;

    @Column({ type: "nvarchar", length: 50 })
    type!: string;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    amount!: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    balanceAfter!: number;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    description!: string;

    @Column({ type: "nvarchar", length: 50, unique: true })
    referenceNumber!: string;

    @ManyToOne(() => Account, { onDelete: "CASCADE" })
    @JoinColumn({ name: "accountId" })
    account!: Account;

    @CreateDateColumn()
    createdAt!: Date;
}

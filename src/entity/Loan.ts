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
import { Account } from "./Account";

export enum LoanType {
    PERSONAL = "Personal",
    HOME = "Home",
    CAR = "Car",
    EDUCATION = "Education",
    BUSINESS = "Business",
}

export enum LoanStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    ACTIVE = "Active",
    COMPLETED = "Completed",
    DEFAULTED = "Defaulted",
}

@Entity("loans")
export class Loan {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 20, unique: true })
    loanNumber!: string;

    @Column()
    userId!: number;

    @Column()
    accountId!: number;

    @Column({ type: "nvarchar", length: 50 })
    type!: string;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    amount!: number;

    @Column({ type: "decimal", precision: 5, scale: 2 })
    interestRate!: number;

    @Column({ type: "int" })
    duration!: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    monthlyPayment!: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    remainingBalance!: number;

    @Column({ type: "nvarchar", length: 50, default: LoanStatus.PENDING })
    status!: string;

    @Column({ type: "datetime", nullable: true })
    startDate!: Date | null;

    @Column({ type: "datetime", nullable: true })
    endDate!: Date | null;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @ManyToOne(() => Account, { onDelete: "NO ACTION" })
    @JoinColumn({ name: "accountId" })
    account!: Account;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

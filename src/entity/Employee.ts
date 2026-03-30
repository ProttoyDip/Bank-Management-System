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

@Entity("employees")
export class Employee {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column({ type: "nvarchar", length: 20, unique: true })
    employeeId!: string;

    @Column({ type: "nvarchar", length: 100 })
    department!: string;

    @Column({ type: "nvarchar", length: 100 })
    position!: string;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    salary!: number;

    @Column({ type: "datetime" })
    hireDate!: Date;

    @Column({ type: "bit", default: true })
    isActive!: boolean;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

@Column({ type: "date", nullable: true })
    dateOfBirth!: Date;

    @Column({ type: "nvarchar", length: 20, nullable: true })
    gender!: string;

    @Column({ type: "nvarchar", length: 50, nullable: true })
    employmentType!: string; // Full-time / Contract

    @Column({ type: "nvarchar", length: 100, nullable: true })
    presentAddress!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    permanentAddress!: string;

    @Column({ type: "int", nullable: true })
    branchId!: number;

    @Column({ type: "decimal", precision: 18, scale: 2, default: 0 })
    dailyTransactionLimit!: number;

    @Column({ type: "nvarchar", length: 1000, nullable: true })
    permissions!: string; // JSON e.g. '["viewCustomers","processTransactions"]'

    @UpdateDateColumn()
    updatedAt!: Date;
}

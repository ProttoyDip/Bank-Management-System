import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("employee_invites")
export class EmployeeInvite {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 150, unique: true })
    email!: string;

    @Column({ type: "nvarchar", length: 100 })
    name!: string;

    @Column({ type: "nvarchar", length: 100 })
    department!: string;

    @Column({ type: "nvarchar", length: 100 })
    position!: string;

    @Column({ type: "decimal", precision: 18, scale: 2, default: 0 })
    salary!: number;

    @Column({ type: "datetime", nullable: true })
    expiresAt!: Date | null;

    @Column({ type: "nvarchar", length: 50, default: "Pending" })
    status!: string;

    @Column({ type: "int", nullable: true })
    createdByAdminId!: number | null;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    notes!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
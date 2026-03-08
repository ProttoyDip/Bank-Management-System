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

    @UpdateDateColumn()
    updatedAt!: Date;
}

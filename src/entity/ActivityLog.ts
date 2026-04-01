import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("activity_logs")
export class ActivityLog {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    employeeId!: number;

    @Column({ type: "nvarchar", length: 255 })
    action!: string;

    @Column({ type: "nvarchar", length: 1000, nullable: true })
    details!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}

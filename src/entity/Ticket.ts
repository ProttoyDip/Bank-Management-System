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

export enum TicketStatus {
    OPEN = "Open",
    RESOLVED = "Resolved",
}

@Entity("tickets")
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column({ type: "nvarchar", length: 1000 })
    message!: string;

    @Column({ type: "nvarchar", length: 50, default: TicketStatus.OPEN })
    status!: string;

    @Column({ type: "nvarchar", length: 1000, nullable: true })
    response!: string | null;

    @Column({ type: "int", nullable: true })
    resolvedByEmployeeId!: number | null;

    @Column({ type: "datetime", nullable: true })
    resolvedAt!: Date | null;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

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

@Entity("notifications")
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int", nullable: true })
    userId!: number | null;

    @Column({ type: "nvarchar", length: "MAX" })
    message!: string;

    @Column({ type: "nvarchar", length: 50, default: "system" })
    type!: string;

    @Column({ type: "bit", default: false })
    isRead!: boolean;

    @ManyToOne(() => User, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "userId" })
    user!: User | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

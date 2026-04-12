import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum CardApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

@Entity("card_applications")
export class CardApplication {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column()
    user_id!: number;

    @Column({ type: "nvarchar", length: 20, default: CardApplicationStatus.PENDING })
    status!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    reason!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}

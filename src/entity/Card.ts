import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum CardType {
    DEBIT = "Debit",
    CREDIT = "Credit",
}

export enum CardStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    BLOCKED = "Blocked",
    EXPIRED = "Expired",
}

@Entity("cards")
export class Card {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column()
    user_id!: number;

    @Column({ type: "nvarchar", length: 16, unique: true })
    card_number!: string;

    @Column({ type: "nvarchar", length: 50, default: CardType.DEBIT })
    card_type!: string;

    @Column({ type: "datetime" })
    expiry_date!: Date;

    @Column({ type: "nvarchar", length: 3 })
    cvv!: string;

    @Column({ type: "nvarchar", length: 20, default: CardStatus.ACTIVE })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;
}

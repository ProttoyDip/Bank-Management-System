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

export enum KycStatus {
    PENDING = "Pending",
    UNDER_REVIEW_ADMIN = "Under Review (Admin)",
    VERIFIED = "Verified",
    REJECTED = "Rejected",
}

@Entity("kyc")
export class KycRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column({ type: "nvarchar", length: 50, default: KycStatus.PENDING })
    status!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    documentType!: string | null;

    @Column({ type: "nvarchar", length: 500, nullable: true })
    documentRef!: string | null;

    @Column({ type: "nvarchar", length: 500, nullable: true })
    remarks!: string | null;

    @Column({ type: "int", nullable: true })
    verifiedByEmployeeId!: number | null;

    @Column({ type: "datetime", nullable: true })
    verifiedAt!: Date | null;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

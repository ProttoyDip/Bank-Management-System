import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("admin_settings")
export class AdminSetting {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 100, unique: true })
    settingKey!: string;

    @Column({ type: "nvarchar", length: 2000, nullable: true })
    settingValue!: string | null;

    @Column({ type: "nvarchar", length: 1000, nullable: true })
    description!: string | null;

    @Column({ type: "int", nullable: true })
    updatedByAdminId!: number | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
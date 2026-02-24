import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Account } from "./Account";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 100 })
    name!: string;

    @Column({ type: "nvarchar", length: 150, unique: true })
    email!: string;

    @Column({ type: "nvarchar", length: 20, nullable: true })
    phone!: string;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    address!: string;

    @OneToMany(() => Account, (account) => account.user, { cascade: true })
    accounts!: Account[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

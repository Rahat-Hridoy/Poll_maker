import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('polls')
export class Poll {
    @PrimaryColumn()
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'published' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    @Column({ default: 0 })
    visitors: number;

    @Column({ default: 0 })
    totalVotes: number;

    @Column({ type: 'jsonb' })
    questions: any[];

    @Column({ type: 'jsonb', nullable: true })
    clients: any[];
}

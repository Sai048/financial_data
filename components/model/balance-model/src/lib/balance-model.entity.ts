import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';

@Entity({ name: 'balance' })
export class Balance {
  @PrimaryGeneratedColumn()
  "id": number;

  @OneToOne(() => AuthModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  "user": AuthModel;

  @Column({ default: 0 })
  "balance": number;

  @CreateDateColumn()
  "createdAt": Date;

  @UpdateDateColumn()
  "updatedAt": Date;
}
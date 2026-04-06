import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';

export enum Type {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity({ name: 'financial_model' })
export class FinancialModel {
  @PrimaryGeneratedColumn()
  'id': number;

  @Column({
    type: 'enum',
    enum: Type,
  })
  'type': Type;

  @Column()
  'category': string;

  @Column('decimal', { precision: 10, scale: 2 })
  'amount': number;

  @ManyToOne(() => AuthModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  'user': AuthModel;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  'date': Date;

  @Column({ nullable: true })
  'description'?: string;
}

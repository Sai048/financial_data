import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Roles {
  ADMIN = 'admin',
  Analyst = 'analyst',
  Viewer = 'viewer',
  User = 'user',
}

@Entity({ name: 'auth_model' })
export class AuthModel {
  @PrimaryGeneratedColumn()
  'id': number;

  @Column()
  'username': string;

  @Column()
  'email': string;

  @Column()
  'password': string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.User,
  })
  'role': Roles;

  @Column({
    default: 'active',
  })
  'status': string;

  @CreateDateColumn()
  'createdAt': Date;

  @UpdateDateColumn()
  'updatedAt': Date;
}

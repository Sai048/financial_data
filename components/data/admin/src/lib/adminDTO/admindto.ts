import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from 'components/model/auth-model/src/lib/auth-model.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export class UpdateUserDataByAdminDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
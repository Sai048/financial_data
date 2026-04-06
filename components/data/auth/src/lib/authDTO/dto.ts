import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Roles } from 'components/model/auth-model/src/lib/auth-model.entity';

export class User {
  'id': number;
  'username': string;
  'role': Roles;
  'status': string;
  'createdAt': Date;
  'updatedAt': Date;
}

export class LoginResponse {
  'status': number;
  'message': string;
  'token': string;
  'user': User;
}

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  'username': string;

  @IsNotEmpty()
  @IsEmail()
  'email': string;

  @IsNotEmpty()
  @IsString()
  'password': string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  'email': string;

  @IsNotEmpty()
  @IsString()
  'password': string;
}

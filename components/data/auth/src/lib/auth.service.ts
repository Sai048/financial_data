import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';
import { Repository } from 'typeorm/repository/Repository';
import { AuthDto, LoginDto, LoginResponse, User } from './authDTO/dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthModel)
    private readonly authRepository: Repository<AuthModel>,

    private readonly jwtService: JwtService,
  ) {}

  async createUser(
    authDto: AuthDto,
  ): Promise<{ status: number; message: string; user: User }> {
    try {
      const existingUser = await this.authRepository.findOne({
        where: { email: authDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const { password: plainPassword } = authDto;

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = this.authRepository.create({
        ...authDto,
        password: hashedPassword,
      });

      const savedUser = await this.authRepository.save(user);

      const { password, ...safeUser } = savedUser;

      return {
        status: HttpStatus.CREATED,
        message: 'User created successfully',
        user: safeUser,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while creating user',
      );
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const existingUser = await this.authRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!existingUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(
        loginDto.password,
        existingUser.password,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({
        sub: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
        status: existingUser.status,
      });

      const { password, ...safeUser } = existingUser;

      const response: LoginResponse = {
        status: HttpStatus.OK,
        message: 'Login successful',
        token,
        user: safeUser,
      };

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Login failed');
    }
  }
}

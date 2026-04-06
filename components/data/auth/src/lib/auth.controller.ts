import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto, LoginDto, LoginResponse, User } from './authDTO/dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('createUser')
  async createUser(
    @Body() authDto: AuthDto,
  ): Promise<{ status: number; message: string; user: User }> {
    return this.authService.createUser(authDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  


}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthModelModule } from '@my-be-app/auth-model';
import { JwtStrategy } from './auth.strategyt';


@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard,JwtStrategy],
  exports: [AuthService, JwtAuthGuard],
  imports: [
    JwtModule.register({
      secret: process.env["JWT_SECRET"] ,
      signOptions: { expiresIn: '1h' },
    }), 
    AuthModelModule
  ],
})
export class AuthModule {}

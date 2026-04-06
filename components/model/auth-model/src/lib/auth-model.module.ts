import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModel } from './auth-model.entity';

@Module({
  controllers: [],
  providers: [],
  exports: [TypeOrmModule.forFeature([AuthModel])],
  imports: [TypeOrmModule.forFeature([AuthModel])],
})
export class AuthModelModule {}

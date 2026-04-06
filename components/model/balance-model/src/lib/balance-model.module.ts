import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from './balance-model.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([ Balance ])],
  exports: [TypeOrmModule.forFeature([ Balance ])],
})
export class BalanceModelModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialModel } from './financial-model.entity';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([ FinancialModel,AuthModel,])],
  exports: [TypeOrmModule.forFeature([ FinancialModel ])],
})
export class FinancialModelModule {}

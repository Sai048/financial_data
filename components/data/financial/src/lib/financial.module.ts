import { Module } from '@nestjs/common';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { AuthModule } from '@my-be-app/auth';
import { FinancialModelModule } from '@my-be-app/financial-model';
import { BalanceModelModule } from '@my-be-app/balance-model';

@Module({
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
  imports: [AuthModule,FinancialModelModule,BalanceModelModule]
})
export class FinancialModule {}

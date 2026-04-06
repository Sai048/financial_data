import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthModule } from '@my-be-app/auth';
import {FinancialModelModule } from '@my-be-app/financial-model';
import { BalanceModelModule } from '@my-be-app/balance-model'

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [],
  imports: [AuthModule,FinancialModelModule,BalanceModelModule],  
})
export class DashboardModule {}

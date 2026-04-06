import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '@my-be-app/auth';
import { FinancialModelModule } from '@my-be-app/financial-model';
import { BalanceModelModule } from '@my-be-app/balance-model';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  exports: [],
  imports: [AuthModule,FinancialModelModule,BalanceModelModule]
})
export class AdminModule {}

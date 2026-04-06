import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@my-be-app/auth';
import { AdminModule } from '@my-be-app/admin';
import { FinancialModule } from '@my-be-app/financial';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      url: process.env.DATABASE_URL,
      type: 'postgres',
      synchronize: true,
      ssl: {
        rejectUnauthorized: true,
      },
      autoLoadEntities: true,
    }),
    AuthModule,
    AdminModule,
    FinancialModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

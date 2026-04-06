import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm/repository/Repository';
import { FinancialModel } from 'components/model/financial-model/src/lib/financial-model.entity';
import { Balance } from 'components/model/balance-model/src/lib/balance-model.entity';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';
import { objData } from 'components/data/financial/src/lib/financialDTO/dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(AuthModel)
    private authRepository: Repository<AuthModel>,

    @InjectRepository(FinancialModel)
    private financialRepository: Repository<FinancialModel>,

    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
  ) {}

  private applyFilters(query: any, dataObject: objData) {
    if (dataObject.fromDate) {
      query.andWhere('financial.date >= :fromDate', {
        fromDate: dataObject.fromDate,
      });
    }

    if (dataObject.toDate) {
      query.andWhere('financial.date <= :toDate', {
        toDate: dataObject.toDate,
      });
    }

    if (dataObject.type) {
      query.andWhere('financial.type = :type', {
        type: dataObject.type,
      });
    }

    if (dataObject.category) {
      query.andWhere('financial.category = :category', {
        category: dataObject.category,
      });
    }

    return query;
  }

  async getDashboardData(user: any, dataObject: objData) {
    const { role, userId } = user;

    if (role === 'user') {
      return this.getUserDashboard(userId, dataObject);
    }

    if (role === 'admin') {
      return this.getAdminDashboard(dataObject);
    }

    if (role === 'analyst' || role === 'viewer') {
      return this.getAnalyticsDashboard(dataObject);
    }

    throw new ForbiddenException('Invalid role');
  }

  async getUserDashboard(userId: number, dataObject: objData) {
    const balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } },
    });

    let incomeQuery = this.financialRepository
      .createQueryBuilder('financial')
      .select('SUM(financial.amount)', 'total')
      .where('financial.type = :type', { type: 'income' })
      .andWhere('financial.userId = :userId', { userId });

    incomeQuery = this.applyFilters(incomeQuery, dataObject);

    const income = await incomeQuery.getRawOne();

    let expenseQuery = this.financialRepository
      .createQueryBuilder('financial')
      .select('SUM(financial.amount)', 'total')
      .where('financial.type = :type', { type: 'expense' })
      .andWhere('financial.userId = :userId', { userId });

    expenseQuery = this.applyFilters(expenseQuery, dataObject);

    const expense = await expenseQuery.getRawOne();

    let recentQuery = this.financialRepository
      .createQueryBuilder('financial')
      .where('financial.userId = :userId', { userId })
      .orderBy('financial.date', 'DESC')
      .take(5);

    recentQuery = this.applyFilters(recentQuery, dataObject);

    const recent = await recentQuery.getMany();

    return {
      status: HttpStatus.OK,
      message: 'User dashboard fetched successfully',
      data: {
        balance: balance?.balance || 0,
        totalIncome: Number(income?.total) || 0,
        totalExpense: Number(expense?.total) || 0,
        recentTransactions: recent,
      },
    };
  }

  async getAdminDashboard(dataObject: objData) {
    const totalUsers = await this.authRepository.count();

    let transactionQuery =
      this.financialRepository.createQueryBuilder('financial');

    transactionQuery = this.applyFilters(transactionQuery, dataObject);

    const totalTransactions = await transactionQuery.getCount();

    let balanceQuery = this.balanceRepository
      .createQueryBuilder('balance')
      .select('SUM(balance.balance)', 'total');

    const totalBalance = await balanceQuery.getRawOne();

    let incomeQuery = this.financialRepository
      .createQueryBuilder('financial')
      .select('SUM(financial.amount)', 'total')
      .where('financial.type = :type', { type: 'income' });

    incomeQuery = this.applyFilters(incomeQuery, dataObject);

    const income = await incomeQuery.getRawOne();

    let expenseQuery = this.financialRepository
      .createQueryBuilder('financial')
      .select('SUM(financial.amount)', 'total')
      .where('financial.type = :type', { type: 'expense' });

    expenseQuery = this.applyFilters(expenseQuery, dataObject);

    const expense = await expenseQuery.getRawOne();

    return {
      status: HttpStatus.OK,
      message: 'Admin dashboard fetched successfully',
      data: {
        totalUsers,
        totalTransactions,
        totalSystemBalance: Number(totalBalance?.total) || 0,
        totalIncome: Number(income?.total) || 0,
        totalExpense: Number(expense?.total) || 0,
      },
    };
  }

  async getAnalyticsDashboard(dataObject: objData) {
    let categoryQuery = this.financialRepository
      .createQueryBuilder('financial')
      .select('financial.category', 'category')
      .addSelect('SUM(financial.amount)', 'total')
      .groupBy('financial.category');

    categoryQuery = this.applyFilters(categoryQuery, dataObject);

    const categoryStats = await categoryQuery.getRawMany();

    let monthlyQuery = this.financialRepository
      .createQueryBuilder('financial')
      .select("DATE_TRUNC('month', financial.date)", 'month')
      .addSelect('SUM(financial.amount)', 'total')
      .groupBy('month')
      .orderBy('month', 'ASC');

    monthlyQuery = this.applyFilters(monthlyQuery, dataObject);

    const monthlyStats = await monthlyQuery.getRawMany();

    return {
      status: HttpStatus.OK,
      message: 'Analytics dashboard fetched successfully',
      data: {
        categoryBreakdown: categoryStats,
        monthlyTrends: monthlyStats,
      },
    };
  }
}

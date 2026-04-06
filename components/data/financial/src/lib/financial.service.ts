import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialModel } from 'components/model/financial-model/src/lib/financial-model.entity';
import { FinancialDto, objData, UpdateFinancialDto } from './financialDTO/dto';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';
import {
  FinancialListResponse,
  FinancialSingleResponse,
} from './financialDTO/dto';
import { Balance } from 'components/model/balance-model/src/lib/balance-model.entity';
import { User } from 'components/data/auth/src/lib/authDTO/dto';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(AuthModel)
    private authRepository: Repository<AuthModel>,

    @InjectRepository(FinancialModel)
    private financialRepository: Repository<FinancialModel>,

    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
  ) {}

  async createFinancial(
    financialDto: FinancialDto,
    userId: number,
  ): Promise<FinancialSingleResponse> {
    try {
      return await this.financialRepository.manager.transaction(
        async (manager) => {
          const user = await manager.findOne(AuthModel, {
            where: { id: userId },
          });

          if (!user) {
            throw new NotFoundException('User not found');
          }

          let balance = await manager.findOne(Balance, {
            where: { user: { id: userId } },
            relations: ['user'],
          });

          if (!balance) {
            balance = manager.create(Balance, {
              user,
              balance: 0,
            });
          }

          const type = financialDto.type?.toLowerCase();
          const amount = Number(financialDto.amount);

          if (isNaN(amount)) {
            throw new Error('Invalid amount');
          }

          if (type === 'income') {
            balance.balance += amount;
          } else {
            if (balance.balance < amount) {
              throw new BadRequestException('Insufficient balance');
            }
            balance.balance -= amount;
          }

          await manager.save(balance);

          const financial = manager.create(FinancialModel, {
            ...financialDto,
            user,
          });

          const savedFinancial = await manager.save(financial);

          const { password, ...safeUser } = savedFinancial.user;

          const removedPasswordFinancial = {
            ...savedFinancial,
            user: safeUser,
          };

          return {
            status: HttpStatus.CREATED,
            message: 'Financial record created successfully',
            data: removedPasswordFinancial,
          };
        },
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error occurred while fetching financial record',
      );
    }
  }

  async getBalanceAll(): Promise<{
    status: number;
    message: string;
    data: {
      balance: number;
      user: User;
    }[];
    total: number;
  }> {
    try {
      const [balances, total] = await this.balanceRepository
        .createQueryBuilder('balance')
        .leftJoinAndSelect('balance.user', 'user')
        .getManyAndCount();

      const data = balances.map((balance) => {
        const { password, ...safeUser } = balance.user;
        return {
          balance: balance.balance,
          user: safeUser,
        };
      });

      return {
        status: HttpStatus.OK,
        message: 'Balances retrieved successfully',
        data,
        total,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error fetching balances');
    }
  }

  async getBalanceByUserId(id: number): Promise<{
    status: number;
    message: string;
    data: {
      balance: number;
      user: User;
    };
  }> {
    try {
      const balance = await this.balanceRepository
        .createQueryBuilder('balance')
        .leftJoinAndSelect('balance.user', 'user')
        .where('user.id = :id', { id })
        .getOne();

      if (!balance) {
        throw new NotFoundException('Balance record not found');
      }

      const { password, ...safeUser } = balance.user;

      const removedPasswordBalance = {
        ...balance,
        user: safeUser,
      };

      return {
        status: HttpStatus.OK,
        message: 'Balance retrieved successfully',
        data: removedPasswordBalance,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Error fetching balance');
    }
  }

  async getFinancialByUserId(
    id: number,
    dataObject: objData,
  ): Promise<FinancialListResponse> {
    try {
      const financials = this.financialRepository
        .createQueryBuilder('financial')
        .leftJoin('financial.user', 'user')
        .select([
          'financial.id',
          'financial.type',
          'financial.category',
          'financial.amount',
          'financial.date',
          'financial.description',
          'user.id',
          'user.username',
          'user.email',
        ])
        .where('user.id = :id', { id });

      if (dataObject.fromDate) {
        financials.andWhere('financial.date >= :fromDate', {
          fromDate: dataObject.fromDate,
        });
      }

      if (dataObject.toDate) {
        financials.andWhere('financial.date <= :toDate', {
          toDate: dataObject.toDate,
        });
      }

      if (dataObject.type) {
        financials.andWhere('financial.type = :type', {
          type: dataObject.type,
        });
      }

      if (dataObject.category) {
        financials.andWhere('financial.category = :category', {
          category: dataObject.category,
        });
      }

      const pageNumber = dataObject.page
        ? parseInt(dataObject.page.toString(), 10)
        : 1;

      const limitNumber = dataObject.limit
        ? parseInt(dataObject.limit.toString(), 10)
        : 10;

      const skip = (pageNumber - 1) * limitNumber;

      financials.skip(skip).take(limitNumber);

      financials.orderBy('financial.date', 'DESC');

      const [records, total] = await financials.getManyAndCount();

      return {
        status: HttpStatus.OK,
        message: 'Financial records retrieved successfully',
        data: records,
        total,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred while fetching financial records');
    }
  }

  async getFinancialById(
    id: number,
    currentUser: { userId: number; role: string; status: string },
  ): Promise<FinancialSingleResponse> {
    try {
      const financial = await this.financialRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!financial) {
        throw new NotFoundException('Financial record not found');
      }

      console.log('Financial Record:', financial);

      if (
        currentUser.role === 'user' &&
        financial.user.id !== currentUser.userId
      ) {
        throw new ForbiddenException('Access denied');
      }

      const { password, ...safeUser } = financial.user;

      const removedPasswordFinancial = {
        ...financial,
        user: safeUser,
      };

      return {
        status: HttpStatus.OK,
        message: 'Financial record retrieved successfully',
        data: removedPasswordFinancial,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred while fetching financial record');
    }
  }

  async updateFinancial(
    id: number,
    currentUser: { userId: number; role: string; status: string },
    financialDto: UpdateFinancialDto,
  ): Promise<FinancialSingleResponse> {
    try {
      const financial = await this.financialRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!financial) {
        throw new NotFoundException('Financial record not found');
      }

      if (
        currentUser.role !== 'admin' &&
        financial.user.id !== currentUser.userId
      ) {
        throw new ForbiddenException('Access denied');
      }

      const user = financial.user;

      const balance = await this.balanceRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user'],
      });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const oldAmount = Number(financial.amount);
      const oldType = financial.type;

      const newAmount = Number(financialDto.amount);
      const newType = financialDto.type?.toLowerCase();

      if (oldType === 'income') {
        balance.balance -= oldAmount;
      } else {
        balance.balance += oldAmount;
      }

      if (newType === 'income') {
        balance.balance += newAmount;
      } else {
        if (balance.balance < newAmount) {
          throw new Error('Insufficient balance');
        }
        balance.balance -= newAmount;
      }

      await this.balanceRepository.save(balance);

      Object.assign(financial, {
        ...financialDto,
        type: newType,
      });

      const updatedFinancial = await this.financialRepository.save(financial);

      return {
        status: HttpStatus.OK,
        message: 'Financial record updated successfully',
        data: updatedFinancial,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error updating financial record');
    }
  }

  async deleteFinancial(
    id: number,
    currentUser: { userId: number; role: string; status: string },
  ): Promise<{ status: number; message: string }> {
    try {
      return await this.financialRepository.manager.transaction(
        async (manager) => {
          const financial = await manager.findOne(FinancialModel, {
            where: { id },
            relations: ['user'],
          });

          if (!financial) {
            throw new NotFoundException('Financial record not found');
          }

          if (
            currentUser.role !== 'admin' &&
            financial.user.id !== currentUser.userId
          ) {
            throw new ForbiddenException('Access denied');
          }

          const user = financial.user;

          const balance = await manager.findOne(Balance, {
            where: { user: { id: user.id } },
            relations: ['user'],
          });

          if (!balance) {
            throw new Error('Balance not found');
          }

          const oldAmount = Number(financial.amount);

          if (isNaN(oldAmount)) {
            throw new Error('Invalid financial amount');
          }

          const oldType = financial.type;

          if (oldType === 'income') {
            balance.balance -= oldAmount;
          } else {
            balance.balance += oldAmount;
          }

          await manager.save(balance);

          await manager.delete(FinancialModel, id);

          return {
            status: HttpStatus.OK,
            message: 'Financial record deleted successfully',
          };
        },
      );
    } catch (error) {
      console.error(error);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Error deleting financial record');
    }
  }
}

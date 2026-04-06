import {
  HttpStatus,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { AuthModel } from 'components/model/auth-model/src/lib/auth-model.entity';
import { FinancialModel } from 'components/model/financial-model/src/lib/financial-model.entity';
import { Balance } from 'components/model/balance-model/src/lib/balance-model.entity';
import { Repository } from 'typeorm';
import { User } from 'components/data/auth/src/lib/authDTO/dto';
import { UpdateUserDataByAdminDto } from './adminDTO/admindto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AuthModel)
    private authRepository: Repository<AuthModel>,

    @InjectRepository(FinancialModel)
    private financialRepository: Repository<FinancialModel>,

    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
  ) {}

  async getAllUsersDataByAdmin(): Promise<{
    status: number;
    message: string;
    users: User[];
  }> {
    try {
      const users = await this.authRepository.find();

      if (!users) {
        throw new InternalServerErrorException('Failed to fetch users');
      }

      return {
        status: HttpStatus.OK,
        message: 'Users fetched successfully',
        users,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async getOneUsersDataByAdmin(id: number): Promise<{
    status: number;
    message: string;
    user: User;
  }> {
    try {
      const user = await this.authRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new InternalServerErrorException('Failed to fetch user');
      }

      return {
        status: HttpStatus.OK,
        message: 'User fetched successfully',
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async getOneUsersDataAndUpdateByAdmin(
    id: number,
    updateUserDataByAdminDto: UpdateUserDataByAdminDto,
  ): Promise<{
    status: number;
    message: string;
    user: User;
  }> {
    try {
      const user = await this.authRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new InternalServerErrorException('Failed to fetch user');
      }

      if (updateUserDataByAdminDto.status !== undefined) {
        user.status = updateUserDataByAdminDto.status;
      }

      Object.assign(user, updateUserDataByAdminDto);

      const updatedUser = await this.authRepository.save(user);

      return {
        status: HttpStatus.OK,
        message: 'User status updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user status');
    }
  }
}

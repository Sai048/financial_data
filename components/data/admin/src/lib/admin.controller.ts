import { Body, Controller, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Get, Param, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'components/data/auth/src/lib/roles/role.guard';
import { JwtAuthGuard } from 'components/data/auth/src/lib/auth.guard';
import { Roles } from 'components/data/auth/src/lib/roles/role.strategy';
import { User } from 'components/data/auth/src/lib/authDTO/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDataByAdminDto } from './adminDTO/admindto';

@Controller('admin')
@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('adminOnly')
  async getAllUsersDataByAdmin(): Promise<{
    status: number;
    message: string;
    users: User[];
  }> {
    return this.adminService.getAllUsersDataByAdmin();
  }

  @Get('getOneUserDataByAdmin/:id')
  async getOneUsersDataByAdmin(@Param('id') id: number): Promise<{
    status: number;
    message: string;
    user: User;
  }> {
    return this.adminService.getOneUsersDataByAdmin(id);
  }

  @Put('getOneUsersDataAndUpdateByAdmin/:id')
  async getOneUsersDataAndUpdateByAdmin(@Param('id') id: number , @Body() updateUserDataByAdminDto: UpdateUserDataByAdminDto): Promise<{
    status: number;
    message: string;
    user: User;
  }> {
    return this.adminService.getOneUsersDataAndUpdateByAdmin(id, updateUserDataByAdminDto);
  }
}

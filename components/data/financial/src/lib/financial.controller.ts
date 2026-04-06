import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from 'components/data/auth/src/lib/auth.guard';
import { Roles } from 'components/data/auth/src/lib/roles/role.strategy';
import {
  FinancialDto,
  FinancialListResponse,
  FinancialSingleResponse,
  objData,
  UpdateFinancialDto,
} from './financialDTO/dto';
import { User } from 'components/data/auth/src/lib/authDTO/dto';

@Controller('financial')
@ApiTags('User Financial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post('createFinancial')
  @Roles('admin', 'user')
  @ApiQuery({ name: 'userId', required: false, type: Number })
  async createFinancial(
    @Body() financialDto: FinancialDto,
    @Req() req: any,
    @Query('userId') userId?: number,
  ): Promise<FinancialSingleResponse> {
    if (req.user.role !== 'admin' && req.user.role !== 'user') {
      throw new ForbiddenException(
        'You are not allowed to create financial record',
      );
    }

    if (req.user.role === 'user' && userId) {
      throw new ForbiddenException(
        'Users cannot create financial records for others',
      );
    }

    if (req.user.role == 'admin' && !userId) {
      throw new ForbiddenException(
        'You must provide a userId to create financial record for a specific user',
      );
    }

    let finalUserId = req.user.userId;

    if (req.user.role === 'admin' && userId) {
      const parsedId = Number(userId);

      if (isNaN(parsedId)) {
        throw new BadRequestException('Invalid userId');
      }

      finalUserId = parsedId;
    }
    return this.financialService.createFinancial(financialDto, finalUserId);
  }

  @Get('getBalanceAll')
  @Roles('admin', 'analyst', 'viewer')
  async getBalanceAll(
   @Req() req: any,
  ): Promise<{
    status: number;
    message: string;
    data: {
      balance: number;
      user: User;
    }[];
  }> {
    if (!['admin', 'analyst', 'viewer'].includes(req.user.role)) {
      throw new ForbiddenException('You are not allowed to access this resource');
    }
    return this.financialService.getBalanceAll();
  }


  @Get('getBalanceByUserId')
  @Roles('admin', 'user', 'analyst', 'viewer')
  @ApiQuery({ name: 'userId', required: false, type: Number })
  async getBalanceByUserId(
    @Req() req: any,
    @Query('userId') userId?: number,
  ): Promise<{
    status: number;
    message: string;
    data: {
      balance: number;
      user: User;
    };
  }> {
    let finalUserId: number;
    if (req.user.role === 'user') {
      if (userId) {
        throw new ForbiddenException('Users cannot access other users data');
      }
      finalUserId = req.user.userId;
    } else if (['admin', 'analyst', 'viewer'].includes(req.user.role)) {
      if (!userId) {
        throw new ForbiddenException('You must provide userId');
      }

      const parsedId = Number(userId);
      if (isNaN(parsedId)) {
        throw new BadRequestException('Invalid userId');
      }

      finalUserId = parsedId;
    } else {
      throw new ForbiddenException('Access denied');
    }

    return this.financialService.getBalanceByUserId(finalUserId);
  }

  @Get('getFinancialByUserId')
  @Roles('admin', 'user', 'analyst', 'viewer')
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  async getFinancialByUserId(
    @Req() req: any,
    @Query('userId') userId?: number,
    @Query('page') page?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ): Promise<FinancialListResponse> {
    const dataObject: objData = {};

    if (fromDate) {
      const parsedFromDate = new Date(fromDate);

      if (isNaN(parsedFromDate.getTime())) {
        throw new BadRequestException('Invalid fromDate');
      }

      dataObject.fromDate = parsedFromDate;
    }

    if (toDate) {
      const parsedToDate = new Date(toDate);
      if (isNaN(parsedToDate.getTime())) {
        throw new BadRequestException('Invalid toDate');
      }

      dataObject.toDate = parsedToDate;
    }

    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType !== 'income' && lowerType !== 'expense') {
        throw new BadRequestException('Invalid type');
      }
      dataObject.type = lowerType;
    }

    if (category) {
      dataObject.category = category;
    }

    const pageNumber = page ? Number(page) : 1;

    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Invalid page number');
    } else {
      dataObject.page = pageNumber;
    }

    const limitNumber = limit ? Number(limit) : 10;

    if (isNaN(limitNumber) || limitNumber < 1) {
      throw new BadRequestException('Invalid limit number');
    } else {
      dataObject.limit = limitNumber;
    }

    let finalUserId: number;
    if (req.user.role === 'user') {
      if (userId) {
        throw new ForbiddenException('Users cannot access other users data');
      }
      finalUserId = req.user.userId;
    } else if (['admin', 'analyst', 'viewer'].includes(req.user.role)) {
      if (!userId) {
        throw new ForbiddenException('You must provide userId');
      }
      const parsedId = Number(userId);
      if (isNaN(parsedId)) {
        throw new BadRequestException('Invalid userId');
      }
      finalUserId = parsedId;
    } else {
      throw new ForbiddenException('Access denied');
    }

    return this.financialService.getFinancialByUserId(finalUserId, dataObject);
  }

  @Get('getFinancialById/:id')
  @Roles('admin', 'user', 'analyst', 'viewer')
  async getFinancialById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<FinancialSingleResponse> {
    return this.financialService.getFinancialById(id, req.user);
  }

  @Put('updateFinancial/:id')
  @Roles('admin', 'user')
  async updateFinancial(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() financialDto: UpdateFinancialDto,
  ): Promise<FinancialSingleResponse> {
    return this.financialService.updateFinancial(id, req.user, financialDto);
  }

  @Delete('deleteFinancial/:id')
  @Roles('admin', 'user')
  async deleteFinancial(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ status: number; message: string }> {
    return this.financialService.deleteFinancial(id, req.user);
  }
}

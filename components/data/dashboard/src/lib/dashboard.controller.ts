import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'components/data/auth/src/lib/auth.guard';
import { DashboardService } from './dashboard.service';
import { objData } from 'components/data/financial/src/lib/financialDTO/dto'

@Controller('dashboard')
@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDashboard(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    const role = req.user.role;

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

    if (!['user', 'admin', 'analyst', 'viewer'].includes(role)) {
      throw new ForbiddenException('Access denied');
    }

    return this.dashboardService.getDashboardData(req.user,dataObject);
  }
}

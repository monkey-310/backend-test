import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Private / Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  async deletedPercentage() {
    return this.reportsService.getDeletedPercentage();
  }

  @Get('non-deleted-price-percentage')
  @ApiQuery({ name: 'hasPrice', required: true, type: Boolean })
  async nonDeletedPricePercentage(
    @Query('hasPrice', ParseBoolPipe) hasPrice: boolean,
  ) {
    return this.reportsService.getNonDeletedPricePercentage(hasPrice);
  }

  @Get('non-deleted-date-range')
  @ApiQuery({ name: 'from', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2025-12-31' })
  async nonDeletedDateRange(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.reportsService.getNonDeletedInDateRange(fromDate, toDate);
  }

  @Get('categories')
  async categoryReport() {
    return this.reportsService.getCategoryReport();
  }
}

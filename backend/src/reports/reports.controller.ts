import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { AccountsResponseDto } from './dto/accounts-response.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/reports/balance
   * Retorna o relatório de saldos (balance)
   */
  @Get('balance')
  getBalance(@Query() filters: ReportFilterDto): Promise<ReportResponseDto> {
    return this.reportsService.getBalance(filters);
  }

  /**
   * GET /api/reports/register
   * Retorna o registro de transações
   */
  @Get('register')
  getRegister(@Query() filters: ReportFilterDto): Promise<ReportResponseDto> {
    return this.reportsService.getRegister(filters);
  }

  /**
   * GET /api/reports/income-statement
   * Retorna a demonstração de resultados (Income Statement)
   */
  @Get('income-statement')
  getIncomeStatement(@Query() filters: ReportFilterDto): Promise<ReportResponseDto> {
    return this.reportsService.getIncomeStatement(filters);
  }

  /**
   * GET /api/reports/accounts
   * Retorna lista de todas as contas
   */
  @Get('accounts')
  getAccounts(): Promise<AccountsResponseDto> {
    return this.reportsService.getAccounts();
  }
}

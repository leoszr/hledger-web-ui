import { Controller, Get, Query } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { MonthlySummaryResponseDto } from './dto/monthly-summary.dto';
import { ExpensesByAccountResponseDto } from './dto/expenses-by-account.dto';

@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  /**
   * GET /api/charts/monthly-summary
   * Retorna resumo mensal com income, expenses e net
   */
  @Get('monthly-summary')
  getMonthlySummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<MonthlySummaryResponseDto> {
    return this.chartsService.getMonthlySummary(from, to);
  }

  /**
   * GET /api/charts/expenses-by-account
   * Retorna top N despesas por conta
   */
  @Get('expenses-by-account')
  getExpensesByAccount(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ): Promise<ExpensesByAccountResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.chartsService.getExpensesByAccount(from, to, limitNum);
  }
}

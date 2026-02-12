import { Injectable, Logger } from '@nestjs/common';
import { HledgerRunnerService } from '../hledger/hledger-runner.service';
import {
  MonthlySummaryDto,
  MonthlySummaryResponseDto,
} from './dto/monthly-summary.dto';
import {
  ExpensesByAccountDto,
  ExpensesByAccountResponseDto,
} from './dto/expenses-by-account.dto';

@Injectable()
export class ChartsService {
  private readonly logger = new Logger(ChartsService.name);

  constructor(private readonly hledgerRunner: HledgerRunnerService) {}

  /**
   * Gera resumo mensal com income, expenses e net
   */
  async getMonthlySummary(
    from?: string,
    to?: string,
  ): Promise<MonthlySummaryResponseDto> {
    this.logger.log(`Gerando resumo mensal: from=${from}, to=${to}`);

    // Construir argumentos de filtro
    const args = this.hledgerRunner.buildFilterArgs({ from, to });
    args.push('-M'); // Monthly grouping
    args.push('-O', 'json');

    // Executar income statement mensal
    const output = await this.hledgerRunner.runCommand('is', args);

    // Processar o output JSON do hledger
    const data = output ? JSON.parse(output) : [];
    const monthlySummary = this.processIncomeStatementToMonthlySummary(data);

    return {
      success: true,
      data: monthlySummary,
    };
  }

  /**
   * Retorna as top N contas de despesas
   */
  async getExpensesByAccount(
    from?: string,
    to?: string,
    limit?: number,
  ): Promise<ExpensesByAccountResponseDto> {
    this.logger.log(
      `Gerando despesas por conta: from=${from}, to=${to}, limit=${limit}`,
    );

    // Filtrar apenas contas de expenses
    const args = this.hledgerRunner.buildFilterArgs({ from, to, account: 'expenses' });
    args.push('-O', 'json');

    // Executar balance para contas de expenses
    const output = await this.hledgerRunner.runCommand('balance', args);

    // Processar o output JSON
    const data = output ? JSON.parse(output) : [];
    const expenses = this.processBalanceToExpensesList(data);

    // Ordenar por valor (maior primeiro) e limitar
    expenses.sort((a, b) => b.amount - a.amount);
    const limitedExpenses = limit ? expenses.slice(0, limit) : expenses;

    return {
      success: true,
      data: limitedExpenses,
    };
  }

  /**
   * Processa o output do income statement para formato de resumo mensal
   */
  private processIncomeStatementToMonthlySummary(
    data: any,
  ): MonthlySummaryDto[] {
    // O hledger is -M retorna dados em formato de períodos
    // Aqui vamos fazer uma simplificação - extrair dados do JSON
    // Se não houver dados estruturados, retornar array vazio
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const summary: MonthlySummaryDto[] = [];

    // Placeholder: implementação simplificada
    // Em produção, você processaria a estrutura real do JSON do hledger
    // Por enquanto, retornamos dados mock se necessário
    
    return summary;
  }

  /**
   * Processa o output do balance para lista de despesas por conta
   */
  private processBalanceToExpensesList(data: any): ExpensesByAccountDto[] {
    const expenses: ExpensesByAccountDto[] = [];

    if (!data || !Array.isArray(data) || data.length === 0) {
      return expenses;
    }

    // O JSON do hledger balance retorna [accounts, totals]
    const [accounts] = data;

    if (!Array.isArray(accounts)) {
      return expenses;
    }

    // Processar cada conta
    for (const account of accounts) {
      if (Array.isArray(account)) {
        const [fullName, , , amounts] = account;
        
        if (typeof fullName === 'string' && Array.isArray(amounts)) {
          // Extrair o valor (assumindo primeira moeda)
          const firstAmount = amounts[0];
          if (firstAmount && firstAmount.aquantity) {
            const amount = firstAmount.aquantity.floatingPoint || 0;
            
            expenses.push({
              account: fullName,
              amount: Math.abs(amount), // Valor absoluto para despesas
            });
          }
        }
      }
    }

    return expenses;
  }
}

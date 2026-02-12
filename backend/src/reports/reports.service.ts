import { Injectable, Logger } from '@nestjs/common';
import { HledgerRunnerService } from '../hledger/hledger-runner.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { AccountsResponseDto } from './dto/accounts-response.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly hledgerRunner: HledgerRunnerService) {}

  /**
   * Executa o comando hledger balance
   * Retorna os saldos das contas
   */
  async getBalance(filters: ReportFilterDto): Promise<ReportResponseDto> {
    this.logger.log(`Gerando relatório balance com filtros: ${JSON.stringify(filters)}`);

    const args = this.hledgerRunner.buildFilterArgs(filters);
    // Não usa -O json, retorna formato texto padrão do hledger

    const output = await this.hledgerRunner.runCommand('balance', args);

    return {
      success: true,
      data: output || 'No data available',
    };
  }

  /**
   * Executa o comando hledger register
   * Retorna o registro de transações
   */
  async getRegister(filters: ReportFilterDto): Promise<ReportResponseDto> {
    this.logger.log(`Gerando relatório register com filtros: ${JSON.stringify(filters)}`);

    const args = this.hledgerRunner.buildFilterArgs(filters);
    // Não usa -O json, retorna formato texto padrão do hledger

    const output = await this.hledgerRunner.runCommand('register', args);

    return {
      success: true,
      data: output || 'No data available',
    };
  }

  /**
   * Executa o comando hledger incomestatement (is)
   * Retorna a demonstração de resultados
   */
  async getIncomeStatement(filters: ReportFilterDto): Promise<ReportResponseDto> {
    this.logger.log(`Gerando Income Statement com filtros: ${JSON.stringify(filters)}`);

    const args = this.hledgerRunner.buildFilterArgs(filters);
    // Não usa -O json, retorna formato texto padrão do hledger

    const output = await this.hledgerRunner.runCommand('is', args);

    return {
      success: true,
      data: output || 'No data available',
    };
  }

  /**
   * Executa o comando hledger accounts
   * Retorna lista de todas as contas
   */
  async getAccounts(): Promise<AccountsResponseDto> {
    this.logger.log('Listando todas as contas');

    const output = await this.hledgerRunner.runCommand('accounts');
    
    // accounts retorna texto, uma conta por linha
    const accounts = output
      .split('\n')
      .filter(line => line.trim().length > 0);

    return {
      success: true,
      accounts, // Retorna no formato correto { success, accounts: [] }
    };
  }
}

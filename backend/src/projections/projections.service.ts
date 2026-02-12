import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JsonStorageService } from '../storage/json-storage.service';
import { HledgerRunnerService } from '../hledger/hledger-runner.service';
import { PATHS } from '../config/paths';
import { RunProjectionDto } from './dto/run-projection.dto';
import {
  ProjectionDto,
  ProjectionResultDto,
  ProjectionResponseDto,
  ProjectionListResponseDto,
} from './dto/projection.dto';

interface ProjectionsData {
  projections: ProjectionDto[];
}

@Injectable()
export class ProjectionsService {
  private readonly logger = new Logger(ProjectionsService.name);

  constructor(
    private readonly jsonStorage: JsonStorageService,
    private readonly hledgerRunner: HledgerRunnerService,
  ) {}

  /**
   * Executa uma nova projeção financeira
   */
  async runProjection(
    dto: RunProjectionDto,
  ): Promise<ProjectionResponseDto> {
    this.logger.log(
      `Executando projeção: baseMonths=${dto.baseMonths}, horizonMonths=${dto.horizonMonths}, method=${dto.method || 'average'}`,
    );

    // Calcular período base (últimos N meses)
    const today = new Date();
    const toDate = new Date(today.getFullYear(), today.getMonth(), 1); // Primeiro dia do mês atual
    const fromDate = new Date(
      toDate.getFullYear(),
      toDate.getMonth() - dto.baseMonths,
      1,
    );

    // Obter dados históricos
    const historicalData = await this.getHistoricalData(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0],
    );

    // Calcular projeção
    const method = dto.method || 'average';
    const results = this.calculateProjection(
      historicalData,
      dto.horizonMonths,
      method,
    );

    // Criar objeto de projeção
    const projection: ProjectionDto = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      parameters: {
        baseMonths: dto.baseMonths,
        horizonMonths: dto.horizonMonths,
        method,
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      },
      results,
    };

    // Salvar no histórico
    await this.saveProjection(projection);

    return {
      success: true,
      projection,
    };
  }

  /**
   * Lista todas as projeções do histórico
   */
  async getHistory(): Promise<ProjectionListResponseDto> {
    this.logger.log('Listando histórico de projeções');

    const data = await this.jsonStorage.readJson<ProjectionsData>(
      PATHS.PROJECTIONS_JSON,
      { projections: [] },
    );

    // Ordenar por data de criação (mais recente primeiro)
    const sortedProjections = data.projections.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      success: true,
      projections: sortedProjections,
    };
  }

  /**
   * Busca uma projeção específica por ID
   */
  async getById(id: string): Promise<ProjectionResponseDto> {
    this.logger.log(`Buscando projeção: ${id}`);

    const data = await this.jsonStorage.readJson<ProjectionsData>(
      PATHS.PROJECTIONS_JSON,
      { projections: [] },
    );

    const projection = data.projections.find((p) => p.id === id);

    if (!projection) {
      throw new NotFoundException(`Projeção com ID ${id} não encontrada`);
    }

    return {
      success: true,
      projection,
    };
  }

  /**
   * Obtém dados históricos do hledger
   */
  private async getHistoricalData(
    from: string,
    to: string,
  ): Promise<{ income: number; expenses: number; net: number }[]> {
    this.logger.debug(`Buscando dados históricos de ${from} até ${to}`);

    // Executar comandos para obter income e expenses separadamente em formato CSV
    const incomeArgs = this.hledgerRunner.buildFilterArgs({ from, to });
    incomeArgs.push('-M', '--depth', '1', '-O', 'csv', '^income');
    
    const expensesArgs = this.hledgerRunner.buildFilterArgs({ from, to });
    expensesArgs.push('-M', '--depth', '1', '-O', 'csv', '^expenses');

    try {
      const incomeOutput = await this.hledgerRunner.runCommand('balance', incomeArgs);
      const expensesOutput = await this.hledgerRunner.runCommand('balance', expensesArgs);

      // Processar outputs CSV para extrair totais mensais
      const monthlyData = this.processMonthlyBalance(incomeOutput, expensesOutput);
      
      this.logger.debug(`Dados históricos processados: ${monthlyData.length} meses`);
      return monthlyData;
    } catch (error) {
      this.logger.error(`Erro ao obter dados históricos: ${error.message}`);
      return [];
    }
  }

  /**
   * Processa dados mensais do balance em formato CSV
   * Formato esperado:
   * "account","2026-01","2026-02"
   * "income","-11045.80 BRL","-10378.50 BRL"
   * "Total:","-11045.80 BRL","-10378.50 BRL"
   */
  private processMonthlyBalance(
    incomeOutput: string,
    expensesOutput: string,
  ): { income: number; expenses: number; net: number }[] {
    const result: { income: number; expenses: number; net: number }[] = [];

    // Parse CSV do income (pegar a linha "income", não "Total:")
    const incomeLines = incomeOutput.split('\n');
    const incomeDataLine = incomeLines.find(line => line.startsWith('"income"'));
    const incomeValues: number[] = [];
    
    if (incomeDataLine) {
      const matches = incomeDataLine.match(/"(-?\d+\.?\d*)\s+BRL"/g) || [];
      matches.forEach(m => {
        const match = m.match(/-?\d+\.?\d*/);
        if (match) {
          incomeValues.push(Math.abs(parseFloat(match[0]))); // Valor absoluto pois income é negativo
        }
      });
    }

    // Parse CSV do expenses (pegar a linha "expenses", não "Total:")
    const expensesLines = expensesOutput.split('\n');
    const expensesDataLine = expensesLines.find(line => line.startsWith('"expenses"'));
    const expensesValues: number[] = [];
    
    if (expensesDataLine) {
      const matches = expensesDataLine.match(/"(-?\d+\.?\d*)\s+BRL"/g) || [];
      matches.forEach(m => {
        const match = m.match(/-?\d+\.?\d*/);
        if (match) {
          expensesValues.push(Math.abs(parseFloat(match[0])));
        }
      });
    }

    // Combinar dados (assumindo que ambos têm o mesmo número de meses)
    const months = Math.max(incomeValues.length, expensesValues.length);
    for (let i = 0; i < months; i++) {
      const income = incomeValues[i] || 0;
      const expenses = expensesValues[i] || 0;
      result.push({
        income,
        expenses,
        net: income - expenses,
      });
    }

    this.logger.debug(`Processados ${result.length} meses: ${JSON.stringify(result)}`);
    return result;
  }

  /**
   * Calcula a projeção baseada nos dados históricos
   */
  private calculateProjection(
    historicalData: { income: number; expenses: number; net: number }[],
    horizonMonths: number,
    method: string,
  ): ProjectionResultDto[] {
    const results: ProjectionResultDto[] = [];

    if (historicalData.length === 0) {
      // Se não há dados históricos, retorna projeção vazia
      return results;
    }

    // Calcular médias
    const avgIncome =
      historicalData.reduce((sum, d) => sum + d.income, 0) /
      historicalData.length;
    const avgExpenses =
      historicalData.reduce((sum, d) => sum + d.expenses, 0) /
      historicalData.length;
    const avgNet = avgIncome - avgExpenses;

    // Gerar projeções para os próximos N meses
    const today = new Date();
    let currentBalance = avgNet; // Começar do saldo médio

    for (let i = 1; i <= horizonMonths; i++) {
      const projectionDate = new Date(
        today.getFullYear(),
        today.getMonth() + i,
        1,
      );
      const monthStr = `${projectionDate.getFullYear()}-${String(projectionDate.getMonth() + 1).padStart(2, '0')}`;

      // Método de média simples
      if (method === 'average') {
        currentBalance += avgNet;

        results.push({
          month: monthStr,
          projectedBalance: Math.round(currentBalance * 100) / 100,
          projectedIncome: Math.round(avgIncome * 100) / 100,
          projectedExpenses: Math.round(avgExpenses * 100) / 100,
        });
      }
      // Método de tendência linear poderia ser implementado aqui
      else if (method === 'linear') {
        // Implementação simplificada - usa mesma lógica da média
        currentBalance += avgNet;

        results.push({
          month: monthStr,
          projectedBalance: Math.round(currentBalance * 100) / 100,
          projectedIncome: Math.round(avgIncome * 100) / 100,
          projectedExpenses: Math.round(avgExpenses * 100) / 100,
        });
      }
    }

    return results;
  }

  /**
   * Salva a projeção no histórico
   */
  private async saveProjection(projection: ProjectionDto): Promise<void> {
    const data = await this.jsonStorage.readJson<ProjectionsData>(
      PATHS.PROJECTIONS_JSON,
      { projections: [] },
    );

    data.projections.push(projection);

    await this.jsonStorage.writeJsonAtomic(PATHS.PROJECTIONS_JSON, data);
    this.logger.log(`Projeção salva: ${projection.id}`);
  }
}

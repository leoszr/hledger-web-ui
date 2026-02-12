import { Injectable, Logger } from '@nestjs/common';
import { HledgerRunnerService } from '../hledger/hledger-runner.service';
import { HealthResponseDto } from './dto/health-response.dto';

/**
 * Serviço de health check
 * 
 * Verifica status de:
 * - hledger disponível
 * - Journal file existe
 * - Versão do hledger
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly hledgerRunner: HledgerRunnerService) {}

  /**
   * Executa health check completo
   * 
   * @returns Status de saúde da aplicação
   */
  async check(): Promise<HealthResponseDto> {
    this.logger.debug('Executando health check');

    try {
      // Verifica hledger
      const hledgerAvailable = await this.hledgerRunner.isHledgerAvailable();
      const hledgerVersion = hledgerAvailable
        ? await this.hledgerRunner.getVersion()
        : null;

      // Verifica journal
      const journalExists = this.hledgerRunner.journalExists();
      const journalPath = this.hledgerRunner.getJournalPath();

      const response: HealthResponseDto = {
        status: hledgerAvailable && journalExists ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        hledger: {
          available: hledgerAvailable,
          version: hledgerVersion,
        },
        journal: {
          exists: journalExists,
          path: journalPath,
        },
      };

      if (response.status === 'ok') {
        this.logger.log('Health check: OK');
      } else {
        this.logger.warn(
          `Health check: ERROR - hledger: ${hledgerAvailable}, journal: ${journalExists}`,
        );
      }

      return response;
    } catch (error) {
      this.logger.error('Erro ao executar health check:', error.message);
      throw error;
    }
  }
}

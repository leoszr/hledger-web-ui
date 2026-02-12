import { Controller, Get, Logger } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

/**
 * Controller para health check
 * 
 * Endpoint: GET /api/health
 */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  /**
   * Endpoint de health check
   * 
   * Verifica:
   * - Se o hledger está disponível
   * - Se o journal existe
   * - Versão do hledger
   * 
   * @returns Status de saúde da API
   */
  @Get()
  async check(): Promise<HealthResponseDto> {
    this.logger.debug('GET /api/health');
    return await this.healthService.check();
  }
}

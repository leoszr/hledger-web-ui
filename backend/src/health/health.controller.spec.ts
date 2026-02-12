import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HledgerRunnerService } from '../hledger/hledger-runner.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService, HledgerRunnerService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health', () => {
    it('deve retornar health response válido', async () => {
      const result = await controller.check();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(['ok', 'error']).toContain(result.status);
      expect(result.timestamp).toBeDefined();
      expect(result.hledger).toBeDefined();
      expect(result.journal).toBeDefined();
    });

    it('deve retornar status ok em ambiente funcional', async () => {
      const result = await controller.check();
      expect(result.status).toBe('ok');
    });
  });
});

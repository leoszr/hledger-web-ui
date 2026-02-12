import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { HledgerRunnerService } from '../hledger/hledger-runner.service';

describe('HealthService', () => {
  let service: HealthService;
  let hledgerRunner: HledgerRunnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, HledgerRunnerService],
    }).compile();

    service = module.get<HealthService>(HealthService);
    hledgerRunner = module.get<HledgerRunnerService>(HledgerRunnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('deve retornar status ok quando tudo está funcionando', async () => {
      const result = await service.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.hledger).toBeDefined();
      expect(result.hledger.available).toBe(true);
      expect(result.hledger.version).toBeTruthy();
      expect(result.journal).toBeDefined();
      expect(result.journal.exists).toBe(true);
      expect(result.journal.path).toContain('main.journal');
    });

    it('deve incluir timestamp ISO', async () => {
      const result = await service.check();
      
      // Verifica se é uma data válida ISO
      const date = new Date(result.timestamp);
      expect(date.toISOString()).toBe(result.timestamp);
    });

    it('deve retornar informações corretas do hledger', async () => {
      const result = await service.check();

      expect(result.hledger.available).toBe(true);
      expect(result.hledger.version).toBeTruthy();
      expect(typeof result.hledger.version).toBe('string');
    });

    it('deve retornar informações corretas do journal', async () => {
      const result = await service.check();

      expect(result.journal.exists).toBe(true);
      expect(result.journal.path).toBeTruthy();
      expect(typeof result.journal.path).toBe('string');
    });
  });
});

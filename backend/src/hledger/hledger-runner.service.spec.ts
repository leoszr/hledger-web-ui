import { Test, TestingModule } from '@nestjs/testing';
import { HledgerRunnerService } from './hledger-runner.service';

describe('HledgerRunnerService', () => {
  let service: HledgerRunnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HledgerRunnerService],
    }).compile();

    service = module.get<HledgerRunnerService>(HledgerRunnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isHledgerAvailable', () => {
    it('deve retornar true se hledger está disponível', async () => {
      const available = await service.isHledgerAvailable();
      expect(available).toBe(true);
    });
  });

  describe('getVersion', () => {
    it('deve retornar a versão do hledger', async () => {
      const version = await service.getVersion();
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+/); // Formato X.Y ou X.Y.Z
    });
  });

  describe('journalExists', () => {
    it('deve verificar se o arquivo journal existe', () => {
      const exists = service.journalExists();
      expect(typeof exists).toBe('boolean');
      // O arquivo deve existir pois criamos no storage
      expect(exists).toBe(true);
    });
  });

  describe('getJournalPath', () => {
    it('deve retornar o caminho do journal', () => {
      const path = service.getJournalPath();
      expect(path).toBeTruthy();
      expect(typeof path).toBe('string');
      expect(path).toContain('main.journal');
    });
  });

  describe('runCommand', () => {
    it('deve executar comando balance com sucesso', async () => {
      const output = await service.runCommand('balance');
      expect(output).toBeTruthy();
      expect(typeof output).toBe('string');
    });

    it('deve rejeitar comando não permitido', async () => {
      await expect(
        service.runCommand('rm' as any),
      ).rejects.toThrow('Comando não permitido');
    });

    it('deve executar comando register com sucesso', async () => {
      const output = await service.runCommand('register');
      expect(output).toBeTruthy();
      expect(typeof output).toBe('string');
    });

    it('deve executar comando is (income statement) com sucesso', async () => {
      const output = await service.runCommand('is');
      expect(output).toBeTruthy();
      expect(typeof output).toBe('string');
    });

    it('deve executar comando accounts com sucesso', async () => {
      const output = await service.runCommand('accounts');
      expect(output).toBeTruthy();
      expect(typeof output).toBe('string');
      expect(output).toContain('assets'); // Deve conter nossas contas de exemplo
    });
  });

  describe('buildFilterArgs', () => {
    it('deve construir argumentos com data inicial', () => {
      const args = service.buildFilterArgs({ from: '2025-01-01' });
      expect(args).toContain('--begin');
      expect(args).toContain('2025-01-01');
    });

    it('deve construir argumentos com data final', () => {
      const args = service.buildFilterArgs({ to: '2025-12-31' });
      expect(args).toContain('--end');
      expect(args).toContain('2025-12-31');
    });

    it('deve construir argumentos com filtro de conta', () => {
      const args = service.buildFilterArgs({ account: 'expenses:alimentacao' });
      expect(args).toContain('expenses:alimentacao');
    });

    it('deve construir argumentos com todos os filtros', () => {
      const args = service.buildFilterArgs({
        from: '2025-01-01',
        to: '2025-06-30',
        account: 'assets',
      });
      expect(args).toContain('--begin');
      expect(args).toContain('2025-01-01');
      expect(args).toContain('--end');
      expect(args).toContain('2025-06-30');
      expect(args).toContain('assets');
    });

    it('deve ignorar datas inválidas', () => {
      const args = service.buildFilterArgs({ from: 'invalid-date' });
      expect(args).not.toContain('invalid-date');
    });

    it('deve sanitizar nomes de conta', () => {
      const args = service.buildFilterArgs({ account: 'assets; rm -rf /' });
      expect(args[0]).not.toContain(';');
      expect(args[0]).not.toContain('/');
      expect(args[0]).not.toContain(' ');
      // Verifica que apenas caracteres válidos foram mantidos
      expect(args[0]).toMatch(/^[a-zA-Z0-9:_-]+$/);
    });
  });

  describe('integração com journal real', () => {
    it('deve executar balance com filtro de data', async () => {
      const args = service.buildFilterArgs({
        from: '2025-01-01',
        to: '2025-03-31',
      });
      const output = await service.runCommand('balance', args);
      expect(output).toBeTruthy();
    });

    it('deve executar register com filtro de conta', async () => {
      const args = service.buildFilterArgs({
        account: 'expenses:alimentacao',
      });
      const output = await service.runCommand('register', args);
      expect(output).toBeTruthy();
    });

    it('deve executar balance com formato JSON', async () => {
      const output = await service.runCommand('balance', ['-O', 'json']);
      expect(output).toBeTruthy();
      
      // Tenta parsear como JSON
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('deve executar register com formato JSON', async () => {
      const output = await service.runCommand('register', ['-O', 'json']);
      expect(output).toBeTruthy();
      
      // Tenta parsear como JSON
      expect(() => JSON.parse(output)).not.toThrow();
    });
  });
});

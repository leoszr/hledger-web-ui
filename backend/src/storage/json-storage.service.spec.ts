import { Test, TestingModule } from '@nestjs/testing';
import { JsonStorageService } from './json-storage.service';
import { existsSync, mkdirSync } from 'fs';
import { unlink, rm } from 'fs/promises';
import { join } from 'path';

describe('JsonStorageService', () => {
  let service: JsonStorageService;
  const testDir = join(process.cwd(), 'test-storage');
  const testFile = join(testDir, 'test.json');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonStorageService],
    }).compile();

    service = module.get<JsonStorageService>(JsonStorageService);

    // Cria diretório de teste
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(async () => {
    // Limpa arquivos de teste
    try {
      if (existsSync(testFile)) {
        await unlink(testFile);
      }
      if (existsSync(`${testFile}.tmp`)) {
        await unlink(`${testFile}.tmp`);
      }
      if (existsSync(testDir)) {
        await rm(testDir, { recursive: true, force: true });
      }
    } catch (error) {
      // Ignora erros de limpeza
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('readJson', () => {
    it('deve retornar fallback quando arquivo não existe', async () => {
      const fallback = { test: 'value' };
      const result = await service.readJson(testFile, fallback);
      expect(result).toEqual(fallback);
    });

    it('deve ler e parsear arquivo JSON existente', async () => {
      const data = { name: 'test', value: 123 };
      await service.writeJsonAtomic(testFile, data);

      const result = await service.readJson(testFile, {});
      expect(result).toEqual(data);
    });

    it('deve retornar fallback quando JSON é inválido', async () => {
      const fallback = { default: true };
      
      // Escreve JSON inválido manualmente
      const fs = require('fs');
      fs.writeFileSync(testFile, 'invalid json{]');

      const result = await service.readJson(testFile, fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe('writeJsonAtomic', () => {
    it('deve escrever dados JSON corretamente', async () => {
      const data = { test: 'data', number: 42, nested: { value: true } };
      
      await service.writeJsonAtomic(testFile, data);
      
      expect(existsSync(testFile)).toBe(true);
      const readData = await service.readJson(testFile, {});
      expect(readData).toEqual(data);
    });

    it('deve sobrescrever arquivo existente', async () => {
      const data1 = { version: 1 };
      const data2 = { version: 2 };

      await service.writeJsonAtomic(testFile, data1);
      await service.writeJsonAtomic(testFile, data2);

      const result = await service.readJson(testFile, {});
      expect(result).toEqual(data2);
    });

    it('não deve deixar arquivo .tmp após escrita bem-sucedida', async () => {
      const data = { clean: true };
      
      await service.writeJsonAtomic(testFile, data);
      
      expect(existsSync(testFile)).toBe(true);
      expect(existsSync(`${testFile}.tmp`)).toBe(false);
    });

    it('deve formatar JSON com indentação', async () => {
      const data = { formatted: true, nested: { value: 123 } };
      
      await service.writeJsonAtomic(testFile, data);
      
      const fs = require('fs');
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toContain('\n');
      expect(content).toContain('  '); // Verifica indentação
    });
  });

  describe('fileExists', () => {
    it('deve retornar false quando arquivo não existe', () => {
      expect(service.fileExists(testFile)).toBe(false);
    });

    it('deve retornar true quando arquivo existe', async () => {
      await service.writeJsonAtomic(testFile, { exists: true });
      expect(service.fileExists(testFile)).toBe(true);
    });
  });

  describe('ensureJsonFile', () => {
    it('deve criar arquivo com valor padrão se não existir', async () => {
      const defaultValue = { initialized: true, count: 0 };
      
      await service.ensureJsonFile(testFile, defaultValue);
      
      expect(existsSync(testFile)).toBe(true);
      const data = await service.readJson(testFile, {});
      expect(data).toEqual(defaultValue);
    });

    it('não deve sobrescrever arquivo existente', async () => {
      const existingData = { preserved: true };
      const defaultValue = { new: true };

      await service.writeJsonAtomic(testFile, existingData);
      await service.ensureJsonFile(testFile, defaultValue);

      const data = await service.readJson(testFile, {});
      expect(data).toEqual(existingData);
    });
  });

  describe('integração - múltiplas operações', () => {
    it('deve suportar ciclo completo de leitura e escrita', async () => {
      // 1. Ler arquivo que não existe (retorna fallback)
      const initial = await service.readJson(testFile, { count: 0 });
      expect(initial).toEqual({ count: 0 });

      // 2. Escrever dados
      await service.writeJsonAtomic(testFile, { count: 1 });

      // 3. Ler dados escritos
      const updated = await service.readJson(testFile, { count: 0 });
      expect(updated).toEqual({ count: 1 });

      // 4. Atualizar dados
      await service.writeJsonAtomic(testFile, { count: 2 });

      // 5. Verificar atualização
      const final = await service.readJson(testFile, { count: 0 });
      expect(final).toEqual({ count: 2 });
    });
  });
});

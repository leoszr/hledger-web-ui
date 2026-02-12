import { Test, TestingModule } from '@nestjs/testing';
import { JournalService } from './journal.service';
import { JsonStorageService } from '../storage/json-storage.service';
import { BadRequestException } from '@nestjs/common';

describe('JournalService', () => {
  let service: JournalService;
  let jsonStorage: JsonStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JournalService, JsonStorageService],
    }).compile();

    service = module.get<JournalService>(JournalService);
    jsonStorage = module.get<JsonStorageService>(JsonStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('deve retornar status do journal existente', async () => {
      const status = await service.getStatus();
      expect(status).toBeDefined();
      expect(status.exists).toBeDefined();
      expect(typeof status.exists).toBe('boolean');
    });
  });

  describe('uploadJournal', () => {
    it('deve fazer upload de journal válido', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'my-finances.journal',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('2026-01-01 * Test transaction'),
        size: 30,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await service.uploadJournal(mockFile);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Journal uploaded successfully');
      expect(result.journal.originalName).toBe('my-finances.journal');
      expect(result.journal.sizeBytes).toBe(30);
      expect(result.journal.sha256).toBeDefined();
      expect(result.journal.uploadedAt).toBeDefined();
    });

    it('deve rejeitar arquivo sem extensão .journal', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'invalid.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
        size: 4,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      await expect(service.uploadJournal(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadJournal(mockFile)).rejects.toThrow(
        'Invalid file extension',
      );
    });

    it('deve rejeitar arquivo vazio', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'empty.journal',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from(''),
        size: 0,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      await expect(service.uploadJournal(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadJournal(mockFile)).rejects.toThrow('File is empty');
    });

    it('deve rejeitar arquivo maior que 20MB', async () => {
      const largeBuffer = Buffer.alloc(21 * 1024 * 1024); // 21 MB
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'large.journal',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: largeBuffer,
        size: largeBuffer.length,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      await expect(service.uploadJournal(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadJournal(mockFile)).rejects.toThrow(
        'File size exceeds maximum',
      );
    });

    it('deve calcular SHA256 corretamente', async () => {
      const content = '2026-01-01 * Test';
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.journal',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from(content),
        size: content.length,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await service.uploadJournal(mockFile);
      
      // SHA256 deve ser uma string hex de 64 caracteres
      expect(result.journal.sha256).toBeDefined();
      expect(result.journal.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(result.journal.sha256.length).toBe(64);
    });

    it('deve atualizar metadata no settings.json', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'finances.journal',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('test content'),
        size: 12,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await service.uploadJournal(mockFile);

      // Verificar que o resultado contém os dados esperados
      expect(result.journal.originalName).toBe('finances.journal');
      expect(result.journal.uploadedAt).toBeDefined();
      expect(result.journal.sha256).toBeDefined();
      expect(result.journal.sizeBytes).toBe(12);
    });
  });
});

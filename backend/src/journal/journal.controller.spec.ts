import { Test, TestingModule } from '@nestjs/testing';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JsonStorageService } from '../storage/json-storage.service';

describe('JournalController', () => {
  let controller: JournalController;
  let service: JournalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalController],
      providers: [JournalService, JsonStorageService],
    }).compile();

    controller = module.get<JournalController>(JournalController);
    service = module.get<JournalService>(JournalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /journal/status', () => {
    it('deve retornar status do journal', async () => {
      const result = await controller.getStatus();
      expect(result).toBeDefined();
      expect(result.exists).toBeDefined();
    });
  });

  describe('POST /journal/upload', () => {
    it('deve fazer upload de journal', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.journal',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('2026-01-01 * Test'),
        size: 17,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await controller.uploadJournal(mockFile);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.journal).toBeDefined();
    });
  });
});

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { writeFileSync, existsSync, statSync } from 'fs';
import { PATHS } from '../config/paths';
import { JsonStorageService } from '../storage/json-storage.service';
import { JournalStatusResponseDto } from './dto/journal-status-response.dto';
import { UploadJournalResponseDto } from './dto/upload-journal-response.dto';

interface SettingsJson {
  journal?: {
    originalName?: string;
    lastUploadAt?: string;
    sizeBytes?: number;
    sha256?: string;
  };
  [key: string]: any;
}

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(private readonly jsonStorage: JsonStorageService) {}

  /**
   * Retorna o status do arquivo journal atual
   */
  async getStatus(): Promise<JournalStatusResponseDto> {
    const exists = existsSync(PATHS.JOURNAL_PATH);

    if (!exists) {
      return { exists: false };
    }

    // Ler metadata do settings.json
    const settings = await this.jsonStorage.readJson<SettingsJson>(
      PATHS.SETTINGS_JSON,
      {},
    );

    const stats = statSync(PATHS.JOURNAL_PATH);

    return {
      exists: true,
      path: PATHS.JOURNAL_PATH,
      originalName: settings.journal?.originalName,
      lastUploadAt: settings.journal?.lastUploadAt,
      sizeBytes: stats.size,
      sha256: settings.journal?.sha256,
    };
  }

  /**
   * Faz upload de um novo arquivo journal
   */
  async uploadJournal(
    file: Express.Multer.File,
  ): Promise<UploadJournalResponseDto> {
    this.logger.log(
      `Recebendo upload de journal: ${file.originalname} (${file.size} bytes)`,
    );

    // Validações
    this.validateJournalFile(file);

    // Calcular hash SHA256
    const sha256 = this.calculateSHA256(file.buffer);

    // Salvar o arquivo
    writeFileSync(PATHS.JOURNAL_PATH, file.buffer);
    this.logger.log(`Journal salvo em: ${PATHS.JOURNAL_PATH}`);

    // Atualizar metadata no settings.json
    const uploadedAt = new Date().toISOString();
    await this.updateJournalMetadata({
      originalName: file.originalname,
      lastUploadAt: uploadedAt,
      sizeBytes: file.size,
      sha256,
    });

    return {
      success: true,
      message: 'Journal uploaded successfully',
      journal: {
        path: PATHS.JOURNAL_PATH,
        originalName: file.originalname,
        sizeBytes: file.size,
        sha256,
        uploadedAt,
      },
    };
  }

  /**
   * Valida o arquivo de journal
   */
  private validateJournalFile(file: Express.Multer.File): void {
    // Validar extensão
    if (!file.originalname.endsWith('.journal')) {
      throw new BadRequestException(
        'Invalid file extension. Only .journal files are allowed.',
      );
    }

    // Validar tamanho (máximo 20 MB)
    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${MAX_SIZE / (1024 * 1024)} MB`,
      );
    }

    // Validar que não está vazio
    if (file.size === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  /**
   * Calcula o hash SHA256 de um buffer
   */
  private calculateSHA256(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Atualiza metadata do journal no settings.json
   */
  private async updateJournalMetadata(metadata: {
    originalName: string;
    lastUploadAt: string;
    sizeBytes: number;
    sha256: string;
  }): Promise<void> {
    const settings = await this.jsonStorage.readJson<SettingsJson>(
      PATHS.SETTINGS_JSON,
      {},
    );

    settings.journal = metadata;

    await this.jsonStorage.writeJsonAtomic(PATHS.SETTINGS_JSON, settings);
    this.logger.log('Metadata do journal atualizada em settings.json');
  }
}

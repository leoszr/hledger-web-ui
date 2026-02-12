import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JournalService } from './journal.service';
import { JournalStatusResponseDto } from './dto/journal-status-response.dto';
import { UploadJournalResponseDto } from './dto/upload-journal-response.dto';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  /**
   * GET /api/journal/status
   * Retorna informações sobre o arquivo journal atual
   */
  @Get('status')
  getStatus(): Promise<JournalStatusResponseDto> {
    return this.journalService.getStatus();
  }

  /**
   * POST /api/journal/upload
   * Faz upload de um novo arquivo journal
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadJournal(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadJournalResponseDto> {
    return this.journalService.uploadJournal(file);
  }
}

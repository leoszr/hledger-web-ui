import { Module, Global } from '@nestjs/common';
import { JsonStorageService } from './json-storage.service';

/**
 * Módulo global para o serviço de storage JSON
 * 
 * Marcado como @Global para que possa ser injetado
 * em qualquer módulo sem precisar importar
 */
@Global()
@Module({
  providers: [JsonStorageService],
  exports: [JsonStorageService],
})
export class StorageModule {}

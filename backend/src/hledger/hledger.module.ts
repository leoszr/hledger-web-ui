import { Module, Global } from '@nestjs/common';
import { HledgerRunnerService } from './hledger-runner.service';

/**
 * Módulo global para o serviço de execução do hledger
 * 
 * Marcado como @Global para que possa ser injetado
 * em qualquer módulo sem precisar importar
 */
@Global()
@Module({
  providers: [HledgerRunnerService],
  exports: [HledgerRunnerService],
})
export class HledgerModule {}

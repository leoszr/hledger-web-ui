import { Module } from '@nestjs/common';
import { ProjectionsController } from './projections.controller';
import { ProjectionsService } from './projections.service';
import { StorageModule } from '../storage/storage.module';
import { HledgerModule } from '../hledger/hledger.module';

@Module({
  imports: [StorageModule, HledgerModule],
  controllers: [ProjectionsController],
  providers: [ProjectionsService],
  exports: [ProjectionsService],
})
export class ProjectionsModule {}

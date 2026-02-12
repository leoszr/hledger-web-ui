import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { HledgerModule } from './hledger/hledger.module';

@Module({
  imports: [
    StorageModule,  // Global
    HledgerModule,  // Global
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

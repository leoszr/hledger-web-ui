import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { HledgerModule } from './hledger/hledger.module';
import { JournalModule } from './journal/journal.module';
import { ReportsModule } from './reports/reports.module';
import { ChartsModule } from './charts/charts.module';
import { ProjectionsModule } from './projections/projections.module';
import { InvestmentsModule } from './investments/investments.module';

@Module({
  imports: [
    StorageModule,  // Global
    HledgerModule,  // Global
    HealthModule,
    JournalModule,
    ReportsModule,
    ChartsModule,
    ProjectionsModule,
    InvestmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

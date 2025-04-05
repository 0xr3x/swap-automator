import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StartModule } from './start/start.module';
import { StopModule } from './stop/stop.module';
import { ExecuteModule } from './execute/execute.module';
import { PnlModule } from './pnl/pnl.module';

@Module({
  imports: [
    StartModule,
    StopModule,
    ExecuteModule,
    PnlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

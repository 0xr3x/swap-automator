import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PnlModule } from './pnl/pnl.module';

@Module({
  imports: [PnlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

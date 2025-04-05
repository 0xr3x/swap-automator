import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PnLController } from './pnl.controller';
import { PnLService } from './pnl.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PnLController],
  providers: [PnLService],
})
export class PnlModule {} 
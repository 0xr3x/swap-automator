import { Module } from '@nestjs/common';
import { PnlController } from './pnl.controller';

@Module({
  controllers: [PnlController],
})
export class PnlModule {} 
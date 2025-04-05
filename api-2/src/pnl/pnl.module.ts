import { Module } from '@nestjs/common';
import { PnLController } from './pnl.controller';

@Module({
  controllers: [PnLController],
})
export class StartModule {} 
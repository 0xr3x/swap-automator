import { Module } from '@nestjs/common';
import { TradeStorageService } from './trade-storage.service';
import { RequestStorageService } from './request-storage.service';

@Module({
  providers: [TradeStorageService, RequestStorageService],
  exports: [TradeStorageService],
})
export class TradeStorageModule {} 
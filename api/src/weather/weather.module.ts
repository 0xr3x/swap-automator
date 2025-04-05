import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherService } from './weather.service';
import { TradeStorageModule } from '../trade-storage/trade-storage.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TradeStorageModule,
  ],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {} 
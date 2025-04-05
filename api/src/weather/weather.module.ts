import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherService } from './weather.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {} 
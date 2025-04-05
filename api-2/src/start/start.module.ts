import { Module } from '@nestjs/common';
import { StartController } from './start.controller';
import { StartService } from './start.service';
import { WeatherService } from '../weather/weather.service';

@Module({
  controllers: [StartController],
  providers: [StartService, WeatherService],
})
export class StartModule {} 
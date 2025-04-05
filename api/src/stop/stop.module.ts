import { Module } from '@nestjs/common';
import { StopController } from './stop.controller';
import { StopService } from './stop.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule],
  controllers: [StopController],
  providers: [StopService],
})
export class StopModule {} 
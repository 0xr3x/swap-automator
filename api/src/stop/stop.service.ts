import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class StopService {
  constructor(private readonly weatherService: WeatherService) {}

  async stop(): Promise<{ status: string }> {
    await this.weatherService.stopTradingSchedule();
    return {
      status: 'stopped',
    };
  }
} 
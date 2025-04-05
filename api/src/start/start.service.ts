import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class StartService {
  constructor(private readonly weatherService: WeatherService) {}

  async start(): Promise<{ status: string }> {
    try {
      // Just verify we can connect to the oracle service
      await this.weatherService.requestTradingData();
      return {
        status: 'started - monitoring trading conditions every 5 minutes',
      };
    } catch (error) {
      throw new Error(`Failed to start system: ${error.message}`);
    }
  }
} 
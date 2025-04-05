import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class StartService {
  constructor(private readonly weatherService: WeatherService) {}

  async start(): Promise<{ status: string; weatherData?: any }> {
    try {
      const weatherData = await this.weatherService.requestWeatherData();
      return {
        status: 'started',
        weatherData
      };
    } catch (error) {
      throw new Error(`Failed to start system: ${error.message}`);
    }
  }
} 
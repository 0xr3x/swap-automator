import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';

interface TradeResult {
  shouldTrade: boolean;
  position?: string;
  amount?: string;
  price?: string;
  txHash?: string;
  requestId?: string;
}

@Injectable()
export class StartService {
  constructor(private readonly weatherService: WeatherService) {}

  async start(): Promise<{ 
    status: string;
    tradeDetails: string;
    transactionHash?: string;
    requestId?: string;
  }> {
    try {
      // Verify we can connect to the oracle service
      const weatherData = await this.weatherService.requestTradingData();
      // Start the trading schedule
      const tradeResult: TradeResult = await this.weatherService.startTradingSchedule();
      
      if (tradeResult.shouldTrade) {
        return {
          status: 'started - monitoring trading conditions every 5 minutes',
          tradeDetails: `Opened ${tradeResult.position} position for ${tradeResult.amount} tokens at ${tradeResult.price}`,
          transactionHash: tradeResult.txHash,
          requestId: tradeResult.requestId
        };
      } else {
        return {
          status: 'started - monitoring trading conditions every 5 minutes',
          tradeDetails: 'No trade needed at this time - doing alright!'
        };
      }
    } catch (error) {
      throw new Error(`Failed to start system: ${error.message}`);
    }
  }
} 
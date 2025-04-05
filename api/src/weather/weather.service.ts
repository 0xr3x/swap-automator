import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { TradeStorageService } from '../trade-storage/trade-storage.service';

interface TradeResult {
  shouldTrade: boolean;
  position?: string;
  amount?: string;
  price?: string;
  txHash?: string;
  requestId?: string;
}

@Injectable()
export class WeatherService {
  constructor(
    private readonly tradeStorageService: TradeStorageService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.logger = new Logger(WeatherService.name);
    this.DEFAULT_NETWORK = 'avalanche-testnet';
    this.POLL_INTERVAL = 10000; // 10 seconds
    this.MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes
    this.NETWORK = {
      name: 'avalanche-testnet',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    };

    this.LIFI_API_URL = 'https://li.quest/v1/quote';
    this.WETH_ADDRESS = '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB'; // Avalanche testnet WETH
    this.USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65'; // Avalanche testnet USDC

    this.lastTradeTimestamp = 0;
    this.TRADE_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

    this.isScheduleActive = false;
    this.cronJob = null;
  }

  private readonly logger: Logger;
  private readonly DEFAULT_NETWORK: string;
  private readonly POLL_INTERVAL: number;
  private readonly MAX_WAIT_TIME: number;
  private readonly NETWORK: { name: string; rpcUrl: string };

  private readonly LIFI_API_URL: string;
  private readonly WETH_ADDRESS: string;
  private readonly USDC_ADDRESS: string;

  private lastTradeTimestamp: number;
  private readonly TRADE_COOLDOWN: number;

  private isScheduleActive: boolean = false;
  private cronJob: any;

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'trading-conditions-check'
  })
  async checkTradingConditions() {
    if (!this.isScheduleActive) {
      return;
    }

    try {
      // Check if enough time has passed since last trade
      if (Date.now() - this.lastTradeTimestamp < this.TRADE_COOLDOWN) {
        return;
      }

      this.logger.log('Checking trading conditions...');
      const tradingData = await this.requestTradingData();
      
      if (Number(tradingData.signal) > 500) {
        this.logger.log('Trading signal threshold exceeded, executing buy trade...');
        await this.executeTrade(tradingData);
        this.lastTradeTimestamp = Date.now();
      } else {
        this.logger.log('Trading signal below threshold, no trade needed');
      }
    } catch (error) {
      this.logger.error(`Error in trading check: ${error.message}`);
    }
  }

  async requestTradingData(location: string = '90210'): Promise<any> {
    const network = this.NETWORK;
    
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
    
    const deploymentPath = path.join(process.cwd(), 'deployments', network.name, 'WeatherOracle.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment not found. Please run deploy.js first.`);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contract = new ethers.Contract(deployment.address, deployment.abi, wallet);

    const tx = await contract.requestWeather(location);
    const receipt = await tx.wait();
    
    let requestId;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'WeatherRequested') {
          requestId = parsedLog.args.requestId.toString();
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }

    if (!requestId) {
      throw new Error('Could not find request ID in transaction logs');
    }

    // Poll for results
    const startTime = Date.now();
    let tradingData: any = null;
    
    while (Date.now() - startTime < this.MAX_WAIT_TIME) {
      const isFulfilled = await contract.isRequestFulfilled(requestId);
      
      if (isFulfilled) {
        tradingData = await contract.getWeatherData(requestId);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
    }

    if (!tradingData || !tradingData.fulfilled) {
      throw new Error('Trading data request timed out');
    }

    return {
      location: tradingData.location,
      signal: tradingData.temperature, // This is actually our trading signal
      conditions: tradingData.conditions,
      timestamp: new Date(Number(tradingData.timestamp) * 1000).toLocaleString()
    };
  }

  private async executeTrade(tradingData: any): Promise<void> {
    const provider = new ethers.providers.JsonRpcProvider(this.NETWORK.rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

    // Get USDC balance
    const usdcContract = new ethers.Contract(
      this.USDC_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    
    const balance = await usdcContract.balanceOf(wallet.address);
    const tradeAmount = balance.mul(30).div(100); // 30% of balance

    // Prepare LIFI quote request
    const quoteRequest = {
      fromChain: 43113,
      fromToken: this.USDC_ADDRESS,
      fromAddress: wallet.address,
      fromAmount: tradeAmount.toString(),
      toChain: 43113,
      toToken: this.WETH_ADDRESS,
      slippage: 0.5,
    };

    try {
      // Get quote from LIFI
      const response = await axios.get(this.LIFI_API_URL, { params: quoteRequest });
      const transaction = response.data.transactionRequest;

      // Execute the trade
      const tx = await wallet.sendTransaction({
        to: transaction.to,
        data: transaction.data,
        value: ethers.utils.parseEther(transaction.value || '0'),
        gasPrice: transaction.gasPrice,
        gasLimit: transaction.gasLimit,
      });

      const receipt = await tx.wait();

      // Store the trade details
      await this.tradeStorageService.storeTrade({
        amount: tradeAmount.toString(),
        tokenAddress: this.USDC_ADDRESS,
        timestamp: Date.now(),
        signal: Number(tradingData.signal),
        conditions: tradingData.conditions,
      });

      this.logger.log(`Trade executed and stored successfully`);
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw new Error(`Failed to execute trade: ${error.message}`);
    }
  }

  async startTradingSchedule(): Promise<TradeResult> {
    this.isScheduleActive = true;
    this.logger.log('Trading schedule started');
    return {
      shouldTrade: false,
      position: 'LONG',
      amount: '1000',
      price: '1.234',
      txHash: '0x123...abc',
      requestId: '0x456...def'
    };
  }

  async stopTradingSchedule(): Promise<void> {
    this.isScheduleActive = false;
    this.logger.log('Trading schedule stopped');
  }
} 
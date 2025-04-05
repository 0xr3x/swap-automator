import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WeatherService {
  private readonly DEFAULT_NETWORK = 'avalanche-testnet';
  private readonly POLL_INTERVAL = 10000; // 10 seconds
  private readonly MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly NETWORK = {
    name: 'avalanche-testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  };

  async requestWeatherData(zipcode: string = '90210'): Promise<any> {
    const network = this.NETWORK;
    
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
    
    const deploymentPath = path.join(process.cwd(), 'deployments', network.name, 'WeatherOracle.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment not found. Please run deploy.js first.`);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contract = new ethers.Contract(deployment.address, deployment.abi, wallet);

    const tx = await contract.requestWeather(zipcode);
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
    let weatherData: any = null;
    
    while (Date.now() - startTime < this.MAX_WAIT_TIME) {
      const isFulfilled = await contract.isRequestFulfilled(requestId);
      
      if (isFulfilled) {
        weatherData = await contract.getWeatherData(requestId);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
    }

    if (!weatherData || !weatherData.fulfilled) {
      throw new Error('Weather data request timed out');
    }

    return {
      tokenId: weatherData.location,
      gradeTA: weatherData.temperature,
      signalDate: weatherData.conditions,
      timestamp: new Date(Number(weatherData.timestamp) * 1000).toLocaleString()
    };
  }
} 
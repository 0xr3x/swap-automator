import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname } from 'path';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants
const RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
const POLL_INTERVAL = 10000; // 10 seconds
const MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

interface WeatherData {
  location: string;
  temperature: string;
  conditions: string;
  timestamp: string;
  fulfilled: boolean;
}

interface WeatherRequestResult {
  requestId: string;
  weatherData: WeatherData | null;
}

export async function createEncryptedRequest(
  zipcode: string,
  privateKey: string,
  contractAddress: string,
  contractABI: any
): Promise<WeatherRequestResult> {
  try {
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    
    // Request weather data
    const tx = await contract.requestWeather(zipcode);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    // Get request ID from event
    let requestId: string | undefined;
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
    let weatherData: WeatherData | null = null;
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
      // Check if request is fulfilled
      const isFulfilled = await contract.isRequestFulfilled(requestId);
      
      if (isFulfilled) {
        weatherData = await contract.getWeatherData(requestId);
        break;
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    
    return {
      requestId,
      weatherData
    };
    
  } catch (error) {
    throw new Error(`Weather request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Example usage in main function
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const zipcode: string = args[0];

    if (!zipcode) {
      throw new Error('Please provide a zipcode as the first argument');
    }
    
    // Get deployment info
    const deploymentPath = path.join(__dirname, '../deployments', 'avalanche-testnet', 'SignalOracle.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment not found. Please run deploy.js first.`);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    const result = await createEncryptedRequest(
      zipcode,
      process.env.PRIVATE_KEY || '',
      deployment.address,
      deployment.abi
    );
    
    if (result.weatherData && result.weatherData.fulfilled) {
      console.log(`\n\n✅ Weather data received!`);
      console.log(`------------------------------------------`);
      console.log(`Token Id: ${result.weatherData.location}`);
      console.log(`Grade TA: ${result.weatherData.temperature}`);
      console.log(`Singal Date: ${result.weatherData.conditions}`);
      console.log(`Timestamp: ${new Date(Number(result.weatherData.timestamp) * 1000).toLocaleString()}`);
      console.log(`------------------------------------------`);
    } else {
      console.log(`\n\n⏳ Request is still pending.`);
      console.log(`The off-chain node has not yet fulfilled this request.`);
      console.log(`You can check again later by running:`);
      console.log(`node scripts/request-weather.js ${zipcode}`);
    }
    
  } catch (error) {
    console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
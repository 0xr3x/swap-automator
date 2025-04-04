/**
 * Signal Oracle Request Script
 * 
 * Requests signal data from the tokenmetrics SignalOracle contract fully on-chain.
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { networks } from '../network.config.js';
import dotenv from 'dotenv';
import { dirname } from 'path';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default network and polling settings
const DEFAULT_NETWORK = 'avalanche-testnet';
const POLL_INTERVAL = 10000; // 10 seconds
const MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const zipcode = args[0] || '90210';
    const networkName = args[1] || DEFAULT_NETWORK;

    if (!zipcode) {
      throw new Error('Please provide a zipcode as the first argument');
    }
    
    console.log(`=== Requesting signal data ===`);
    console.log(`Network: ${networkName}`);
    console.log(`Zipcode: ${zipcode}`);
    
    // Setup provider and wallet
    const network = networks[networkName];
    if (!network) {
      throw new Error(`Network ${networkName} not found`);
    }
    
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
    
    // Get deployment info
    const deploymentPath = path.join(__dirname, '../deployments', network.name, 'WeatherOracle.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment not found. Please run deploy.js first.`);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contract = new ethers.Contract(deployment.address, deployment.abi, wallet);
    
    console.log(`Oracle contract: ${deployment.address}`);
    console.log(`Your address: ${wallet.address}`);
    
    // Request weather data
    console.log(`\nSending request ...`);
    const tx = await contract.requestWeather(zipcode);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    
    // Get request ID from event
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
    
    console.log(`\nRequest confirmed! Request ID: ${requestId}`);
    console.log('Waiting for the off-chain node to process the request...');
    console.log('This may take a few minutes as the node fetches weather data.');
    
    // Poll for results
    const startTime = Date.now();
    let weatherData = null;
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
      // Check if request is fulfilled
      const isFulfilled = await contract.isRequestFulfilled(requestId);
      
      if (isFulfilled) {
        weatherData = await contract.getWeatherData(requestId);
        break;
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      process.stdout.write('.');
    }
    
    if (weatherData && weatherData.fulfilled) {
      console.log(`\n\n✅ Weather data received!`);
      console.log(`------------------------------------------`);
      console.log(`Token Id: ${weatherData.location}`);
      console.log(`Grade TA: ${weatherData.temperature}`);
      console.log(`Singal Date: ${weatherData.conditions}`);
      console.log(`Timestamp: ${new Date(Number(weatherData.timestamp) * 1000).toLocaleString()}`);
      console.log(`------------------------------------------`);
    } else {
      console.log(`\n\n⏳ Request is still pending.`);

      console.log(`The off-chain node has not yet fulfilled this request.`);
      console.log(`You can check again later by running:`);
      console.log(`node scripts/request-weather.js ${zipcode} ${networkName}`);
    }
    
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

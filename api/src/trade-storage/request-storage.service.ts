import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class RequestStorageService {
  private readonly logger = new Logger(RequestStorageService.name);
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc');
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

    // Contract address on Avalanche Fuji
    const contractAddress = '0x8e066c05BE1864BbA228165BDb6CDce17cbE0eba';

    // Contract ABI for the functions we need
    const abi = [
      "function addRequest(uint256 _timestamp, string memory _requestId) external",
      "function getRequest(uint256 index) external view returns (uint256 timestamp, string memory requestId)",
      "function getRequestCount() external view returns (uint256)",
      "event RequestAdded(uint256 timestamp, string requestId)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
    this.logger.log('RequestStorage service initialized with contract at: ' + contractAddress);
  }

  async storeRequest(timestamp: number, requestId: string): Promise<void> {
    try {
      const tx = await this.contract.addRequest(timestamp, requestId);
      await tx.wait();
      this.logger.log(`Stored request ${requestId} with timestamp ${timestamp} in contract`);
    } catch (error) {
      this.logger.error(`Failed to store request in contract: ${error.message}`);
      throw new Error(`Failed to store request in contract: ${error.message}`);
    }
  }
} 
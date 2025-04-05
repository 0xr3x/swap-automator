import { Injectable } from '@nestjs/common';
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';
import { EthereumPrivateKeyCipherProvider } from '@requestnetwork/epk-cipher';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { REQUEST_STORAGE_ABI } from './request-storage.interface';

@Injectable()
export class PnLService {
  private requestNetwork: RequestNetwork;
  private contract: ethers.Contract;
  private readonly CONTRACT_ADDRESS = '0x8e066c05BE1864BbA228165BDb6CDce17cbE0eba';
  private readonly FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

  constructor(private configService: ConfigService) {
    // Setup Request Network
    const cipherProvider = new EthereumPrivateKeyCipherProvider({
      key: this.configService.get<string>('PAYEE_PRIVATE_KEY'),
      method: Types.Encryption.METHOD.ECIES,
    });

    const signatureProvider = new EthereumPrivateKeySignatureProvider({
      method: Types.Signature.METHOD.ECDSA,
      privateKey: this.configService.get<string>('PAYEE_PRIVATE_KEY'),
    });

    this.requestNetwork = new RequestNetwork({
      cipherProvider,
      signatureProvider,
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    // Setup Contract Connection
    const provider = new ethers.providers.JsonRpcProvider(this.FUJI_RPC);
    this.contract = new ethers.Contract(
      this.CONTRACT_ADDRESS,
      REQUEST_STORAGE_ABI,
      provider
    );
  }

  private async getRequestIds(): Promise<string[]> {
    try {
      const count = await this.contract.getRequestCount();
      const requestIds: string[] = [];

      for (let i = 0; i < count.toNumber(); i++) {
        const [timestamp, requestId] = await this.contract.getRequest(i);
        requestIds.push(requestId);
      }

      return requestIds;
    } catch (error) {
      throw new Error(`Failed to fetch request IDs: ${error.message}`);
    }
  }

  async calculatePnL(): Promise<number> {
    try {
      let totalPnL = 0;
      const requestIds = await this.getRequestIds();

      // Process each request ID
      for (const requestId of requestIds) {
        const request = await this.requestNetwork.fromRequestId(requestId);
        const requestData = request.getData();
        
        // Assuming the encrypted values are stored in the requestData.contentData.values array
        const values = requestData.contentData.values || [];
        
        // Sum values for this request
        const requestPnL = values.reduce((sum: number, value: number) => sum + value, 0);
        totalPnL += requestPnL;
      }
      
      return totalPnL;
    } catch (error) {
      throw new Error(`Failed to calculate PnL: ${error.message}`);
    }
  }
} 
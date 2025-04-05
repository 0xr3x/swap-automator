import { Injectable, Logger } from '@nestjs/common';
import { EthereumPrivateKeyCipherProvider } from '@requestnetwork/epk-cipher';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { Wallet } from "ethers";
import { RequestStorageService } from './request-storage.service';

@Injectable()
export class TradeStorageService {
  private readonly logger = new Logger(TradeStorageService.name);
  private readonly requestNetwork: RequestNetwork;
  private readonly payeeIdentity: Types.Identity.IIdentity;
  private readonly payeeEncryptionPublicKey: Types.Encryption.IEncryptionParameters;
  private readonly payerEncryptionPublicKey: Types.Encryption.IEncryptionParameters;

  constructor(
    private readonly requestStorageService: RequestStorageService
  ) {
    const payeePrivateKey = process.env.PAYEE_PRIVATE_KEY;
    const payerPrivateKey = process.env.PAYER_PRIVATE_KEY;

    if (!payeePrivateKey || !payerPrivateKey) {
      throw new Error('Missing required private keys in environment variables');
    }

    const cipherProvider = new EthereumPrivateKeyCipherProvider({
      key: payeePrivateKey,
      method: Types.Encryption.METHOD.ECIES,
    });

    const signatureProvider = new EthereumPrivateKeySignatureProvider({
      method: Types.Signature.METHOD.ECDSA,
      privateKey: payeePrivateKey,
    });

    this.requestNetwork = new RequestNetwork({
      cipherProvider,
      signatureProvider,
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    const payeeWallet = new Wallet(payeePrivateKey);
    const payerWallet = new Wallet(payerPrivateKey);

    this.payeeEncryptionPublicKey = {
      key: payeeWallet.publicKey,
      method: Types.Encryption.METHOD.ECIES,
    };

    this.payerEncryptionPublicKey = {
      key: payerWallet.publicKey,
      method: Types.Encryption.METHOD.ECIES,
    };

    this.payeeIdentity = {
      type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
      value: payeeWallet.address,
    };
  }

  async storeTrade(tradeDetails: {
    amount: string;
    tokenAddress: string;
    timestamp: number;
    signal: number;
    conditions: string;
  }): Promise<string> {
    try {
      const requestCreateParameters: Types.IRequestInfo = {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: tradeDetails.tokenAddress,
          network: 'sepolia',
        },
        expectedAmount: tradeDetails.amount,
        payee: this.payeeIdentity,
        payer: this.payeeIdentity,
        timestamp: Utils.getCurrentTimestampInSecond(),
      };

      const createRequest: Types.ICreateRequestParameters = {
        requestInfo: requestCreateParameters,
        paymentNetwork: {
          id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
          parameters: {
            paymentAddress: this.payeeIdentity.value,
            feeAddress: '0x0000000000000000000000000000000000000000',
            feeAmount: '0',
          },
        },
        contentData: {
          tradeTimestamp: tradeDetails.timestamp,
          tradingSignal: tradeDetails.signal,
          conditions: tradeDetails.conditions,
        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: this.payeeIdentity.value,
        },
      };

      const invoice = await this.requestNetwork.createRequest(createRequest);
      const requestData = await invoice.waitForConfirmation();
      
      // Store the request ID in the contract
      await this.requestStorageService.storeRequest(
        tradeDetails.timestamp,
        requestData.requestId
      );
      
      this.logger.log(`Trade stored with request ID: ${requestData.requestId}`);
      return requestData.requestId;
    } catch (error) {
      this.logger.error(`Failed to store trade: ${error.message}`);
      throw new Error(`Failed to store trade: ${error.message}`);
    }
  }
} 
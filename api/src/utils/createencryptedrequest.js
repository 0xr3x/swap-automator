import { EthereumPrivateKeyCipherProvider } from '@requestnetwork/epk-cipher';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { config } from 'dotenv';
import { Wallet } from "ethers";

config();

const cipherProvider = new EthereumPrivateKeyCipherProvider({
  key: process.env.PAYEE_PRIVATE_KEY,
  method: Types.Encryption.METHOD.ECIES,
});

const signatureProvider = new EthereumPrivateKeySignatureProvider({
  method: Types.Signature.METHOD.ECDSA,
  privateKey: process.env.PAYEE_PRIVATE_KEY,
});

const requestNetwork = new RequestNetwork({
  cipherProvider,
  signatureProvider,
  //useMockStorage: true,
  nodeConnectionConfig: {
    baseURL: "https://sepolia.gateway.request.network/",
  },
});

const publickKey = new Wallet(process.env.PAYEE_PRIVATE_KEY).publicKey;

console.log('Public key:', publickKey);
const payeeEncryptionPublicKey = {
  key: new Wallet(process.env.PAYEE_PRIVATE_KEY).publicKey,
  method: Types.Encryption.METHOD.ECIES,
};
const payerEncryptionPublicKey = {
  key: new Wallet(process.env.PAYER_PRIVATE_KEY).publicKey,
  method: Types.Encryption.METHOD.ECIES,
};

const payeeIdentity = {
  type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
  value: new Wallet(process.env.PAYEE_PRIVATE_KEY).address,
};

//const payeeIdentity = new Wallet(process.env.PAYEE_PRIVATE_KEY).address;
const payerIdentity = payeeIdentity;
const paymentRecipient = payeeIdentity;
const feeRecipient = "0x0000000000000000000000000000000000000000";

// Create request parameters
const requestCreateParameters = {
  requestInfo: {
    currency: {
      type: Types.RequestLogic.CURRENCY.ERC20,
      value: '0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C',
      network: 'sepolia',
    },
    expectedAmount: '1000000000000000000',
    payee: payeeIdentity,
    payer: payerIdentity,
    timestamp: Utils.getCurrentTimestampInSecond(),
  },
  paymentNetwork: {
    id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
    parameters: {
      paymentNetworkName: 'sepolia',
      paymentAddress: payeeIdentity.value,
      feeAddress: '0x0000000000000000000000000000000000000000',
      feeAmount: '0',
    },
  },
  contentData: {
    reason: '🍕',
    dueDate: '2023.06.16',
  },
  signer: payeeIdentity,
};

async function main() {
  const invoice = await requestNetwork._createEncryptedRequest(
    requestCreateParameters,
    [payeeEncryptionPublicKey, payerEncryptionPublicKey],
  );

  const requestData = await invoice.waitForConfirmation();
  console.log(JSON.stringify(requestData));
}

main().catch(console.error);

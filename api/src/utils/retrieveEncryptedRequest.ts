import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { EthereumPrivateKeyCipherProvider } from '@requestnetwork/epk-cipher';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import { config } from "dotenv";

export async function retrieveEncryptedRequest(requestId: string) {
    config();

    const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
            baseURL: "https://sepolia.gateway.request.network/",
        },
    });

    const cipherProvider = new EthereumPrivateKeyCipherProvider({
        key: process.env.PAYEE_PRIVATE_KEY!,
        method: Types.Encryption.METHOD.ECIES,
    });

    const signatureProvider = new EthereumPrivateKeySignatureProvider({
        method: Types.Signature.METHOD.ECDSA,
        privateKey: process.env.PAYEE_PRIVATE_KEY!,
    });

    const requestNetwork = new RequestNetwork({
        cipherProvider,
        signatureProvider,
        //useMockStorage: true,
        nodeConnectionConfig: {
            baseURL: "https://sepolia.gateway.request.network/",
        },
    });

    const request = await requestNetwork.fromRequestId(requestId);
    return request.getData();
}
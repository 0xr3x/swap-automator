(async () => {

    const { RequestNetwork, Types, } = require("@requestnetwork/request-client.js");
   
   const requestClient = new RequestNetwork({ nodeConnectionConfig: { baseURL: "https://sepolia.gateway.request.network/", },});
   const { EthereumPrivateKeyCipherProvider } = require('@requestnetwork/epk-cipher');
   const { EthereumPrivateKeySignatureProvider } = require('@requestnetwork/epk-signature');
   const { config } = require("dotenv");
 
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
 
   //const identity = "0xd00bcA46fc35DEC572fa7a56E2DB16C618878629";
   const request = await requestNetwork.fromRequestId(
     '01364e19a9cb82a8bdd2a4afda5d0e8d3f7b7224c49b3b55e4a723714815fcfaf2',
   );
   const requestData = request.getData();
   console.log(JSON.stringify(requestData));
 })();
 
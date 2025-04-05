export const REQUEST_STORAGE_ABI = [
  {
    "inputs": [],
    "name": "getRequestCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getRequest",
    "outputs": [
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "string", "name": "requestId", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 
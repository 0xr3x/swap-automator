/**
 * Ultra-Simplified Weather Private Oracle
 * 
 * This Private Oracle returns static weather data to the oracle contract.
 * It only processes requests from the hardcoded contract address.
 */

const { ethers } = require('ethers');

/**
 * Weather Oracle feature that implements the IFeature interface from node-core.
 * This feature processes weather data requests and returns static weather data.
 */
class WeatherOracle {
    // Feature identification properties required by IFeature
    featureId = 1; // ID 1 for Private Oracle
    featureName = 'WeatherOracle';
    featureDescription = 'Private Oracle that returns static weather data';
    
    // Track processed requests to avoid duplicates
    processedRequests = new Set();
    
    // Hardcoded address of the deployed WeatherOracle contract on Avalanche testnet
    // This is the address we'll accept requests from
    deployedAddress = '0xd585eA7c1A821F7c4B4aB7357D2aB3d9C23324e1';
    
    /**
     * Process a message from the blockchain
     * This is called when the WeatherOracle contract requests weather data
     * 
     * @param {object} driver - The blockchain driver handling the message
     * @param {object} message - The message containing feature data
     * @returns {object} The processed message with feature reply
     */
    async process(driver, message) {
        const txId = message.values?.txId;
        console.log(`[WeatherOracle] Processing request: ${txId}`);
        
        // Check if we've already processed this request
        if (this.processedRequests.has(txId)) {
            console.log(`[WeatherOracle] Already processed request: ${txId}, skipping`);
            return message;
        }
        
        // Mark this request as processed
        this.processedRequests.add(txId);
        
        try {
            // Create ABI coder instance
            const abiCoder = new ethers.AbiCoder();
            
            // We MUST decode the requestId from featureData
            if (!message.featureData) {
                throw new Error("No featureData found in message");
            }
            
            // The contract encodes (requestId, zipcode) in featureData
            const decoded = abiCoder.decode(['uint256', 'string'], message.featureData);
            const requestId = decoded[0]; // Extract requestId
            const zipcode = decoded[1]; // Extract zipcode
            
            console.log(`[WeatherOracle] Decoded requestId: ${requestId}, zipcode: ${zipcode}`);
            
            // Encode the static response data - MUST match contract's expected format
            const featureReply = abiCoder.encode(
                ['uint256', 'string', 'string', 'string'],
                [
                    requestId,
                    '72F',
                    'sunny',
                    'Static Location'
                ]
            );
            
            // Set the feature reply on the message
            message.featureReply = featureReply;
            
            // CRITICAL: Ensure featureId is set on the message
            // This is needed by the executor to properly build the process args
            message.featureId = this.featureId;
            
            console.log(`[WeatherOracle] Static response encoded and ready to send for requestId: ${requestId}`);
            console.log(`[WeatherOracle] Message properties set: featureId=${message.featureId}, has featureReply=${!!message.featureReply}`);
            return message;
        } catch (error) {
            console.error(`[WeatherOracle] Error processing message:`, error);
            // If we can't decode the message, we can't process it
            // Just return the message without a featureReply
            return message;
        }
    }

    /**
     * Validate a message from the blockchain
     * This is called before process() to allow custom security checks
     * 
     * @param {object} driver - The blockchain driver handling the message
     * @param {object} message - The message to validate
     * @returns {boolean} Whether the message is valid for this feature
     */
    async isMessageValid(driver, message) {
        // Check if the sender matches our hardcoded deployed address
        if (message.sender && message.sender.toLowerCase() !== this.deployedAddress.toLowerCase()) {
            console.log(`[WeatherOracle] Ignoring request from non-deployed contract: ${message.sender}`);
            return false;
        }
        
        console.log(`[WeatherOracle] Valid request from deployed contract: ${message.sender}`);
        return true;
    }
}

module.exports = WeatherOracle;

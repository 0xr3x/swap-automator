# SwAutomator Trading Bot

A Telegram-based automated trading bot that combines real-time trading signals with encrypted receipt storage for tax compliance.

## Overview

SwAutomator enables secure, automated trading through Telegram with privacy-preserving trade documentation. It leverages multiple protocols to create a comprehensive trading solution:

- **TokenMetrics**: Real-time trading signals and analysis
- **VIA Labs**: Secure oracle implementation for signal verification
- **Request Network**: Encrypted storage of trade receipts
- **AgentKit/ElizaOS**: Bot orchestration and automation
- **UniChain**: DEX integration for trade execution

## Project Structure

```
swautomator/
├── api/                    # TokenMetrics API integration
├── api-basic/             # Basic API implementation for Eliza bot
├── contracts/
│   ├── WeatherOracle.sol  # VIA Labs oracle for signal verification
│   └── RequestStorage.sol # Storage contract for request tracking
├── deployments/           # Contract deployment configurations
├── oracle/               # Oracle node implementation
├── scripts/
│   ├── deploy.js         # Main contract deployment
│   ├── deploy-storage.js # Storage contract deployment
│   ├── createencryptedrequest.js  # Request Network integration
│   └── retrieveencryptedrequest.js # Encrypted data retrieval
└── README.md
```

## Prerequisites

- Node.js (v20+) and pnpm
- Telegram Bot Token
- TokenMetrics API Access
- Private keys for contract deployment
- Request Network credentials

## Setup

1. Clone the repository:
```bash
git clone https://github.com/armsves/EthBucharest2025TradingAgentBot.git
cd EthBucharest2025TradingAgentBot
```

2. Install main dependencies:
```bash
pnpm install
```

3. Install API dependencies:
```bash
cd api
pnpm install
cd ../api-basic
pnpm install
cd ..
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- TELEGRAM_BOT_TOKEN
- TOKENMETRICS_API_KEY
- PRIVATE_KEY
- REQUEST_NETWORK_CREDENTIALS

## Deployment

1. Deploy the main contracts:
```bash
pnpm run deploy
```

2. Deploy the storage contract:
```bash
pnpm run deploy-storage
```

3. Start the oracle node:
```bash
pnpm run oracle
```

## Features

### Trading Automation
- Real-time signal processing from TokenMetrics
- Automated trade execution based on configured strategies
- Risk management and position sizing

### Privacy & Compliance
- Encrypted trade receipt storage via Request Network
- On-chain verification of trading signals
- Tax-compliant documentation

### Telegram Integration
- User-friendly command interface
- Real-time trade notifications
- Strategy customization options

## Development Roadmap

| Phase | Target Date | Features |
|-------|-------------|----------|
| MVP | 2025-04-05 | Basic trading bot with signal integration |
| Alpha | 2025-05-01 | Strategy customization, dashboard |
| Beta | 2025-06-01 | Advanced analytics, receipt export |
| V1 | 2025-07-15 | Multi-bot support, tax tooling integration |

## Contributing

Please read our contributing guidelines before submitting pull requests.

## Contact

- Telegram: @Beerus_2020 & @oxr3x


## License

This project is proprietary software. All rights reserved.

https://testnet.avascan.info/blockchain/c/address/0x8e066c05BE1864BbA228165BDb6CDce17cbE0eba/transactions
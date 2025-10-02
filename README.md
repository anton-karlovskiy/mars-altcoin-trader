# 🚀 Mars Altcoin Trader - Multi-DEX Trading Bot

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet%20%7C%20Sepolia%20%7C%20Arbitrum-orange.svg)](https://ethereum.org/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-purple.svg)](https://solana.com/)

> **Advanced DeFi Trading Bot** supporting Uniswap V2, Uniswap V3, and Raydium DEXs with automated trading strategies, price analysis, and multi-chain support.

## 📋 Table of Contents

- [Features](#-features)
- [Supported DEXs](#-supported-dexs)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Trading Strategies](#-trading-strategies)
- [Configuration](#-configuration)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔄 **Multi-DEX Support**
- **Uniswap V2** - Classic AMM with stable liquidity
- **Uniswap V3** - Concentrated liquidity with capital efficiency
- **Raydium** - Solana's leading DEX for high-speed trading

### 🎯 **Trading Capabilities**
- **Automated Trading** - Buy/sell tokens with configurable slippage
- **Price Analysis** - Real-time price impact and execution price calculation
- **Multi-Chain Support** - Ethereum, Arbitrum, Sepolia, and Solana
- **RESTful API** - Easy integration with external systems

### 🛡️ **Security & Reliability**
- **Environment Variables** - Secure key management
- **Error Handling** - Comprehensive error management
- **Type Safety** - Full TypeScript implementation
- **Gas Optimization** - Efficient transaction handling

### 📊 **Advanced Features**
- **Trade Information** - Detailed trade analysis before execution
- **Slippage Protection** - Configurable slippage tolerance
- **Token Support** - Native tokens (ETH, SOL) and ERC-20/SPL tokens
- **Pool Analysis** - Liquidity pool information and statistics

## 🏪 Supported DEXs

| DEX | Network | Features | Status |
|-----|---------|----------|--------|
| **Uniswap V2** | Ethereum, Arbitrum, Sepolia | Classic AMM, Stable liquidity | ✅ Active |
| **Uniswap V3** | Ethereum, Arbitrum, Sepolia | Concentrated liquidity, Capital efficiency | ✅ Active |
| **Raydium** | Solana | High-speed trading, Low fees | ✅ Active |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Ethereum/Solana wallet** with private key
- **Infura API key** for Ethereum networks
- **Solana RPC endpoint** for Solana network

### Installation

```bash
# Clone the repository
git clone https://github.com/anton-karlovskiy/mars-altcoin-trader.git
cd mars-altcoin-trader

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Ethereum Configuration
INFURA_API_KEY=your_infura_api_key_here
METAMASK_WALLET_ACCOUNT_PRIVATE_KEY=your_ethereum_private_key_here

# Solana Configuration
SOLANA_NODE_JSON_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
SOLANA_WALLET_ACCOUNT_PRIVATE_KEY=your_solana_private_key_here

# Server Configuration
PORT=3000
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 🔍 Get Trade Information

**Uniswap V2/V3 Trade Info**
```http
GET /trade-info-on-uniswap/{version}?chainId={chainId}&inputTokenAddress={inputToken}&outputTokenAddress={outputToken}&inputAmount={amount}
```

**Parameters:**
- `version`: `2` or `3` (Uniswap version)
- `chainId`: `1` (Ethereum), `42161` (Arbitrum), `11155111` (Sepolia)
- `inputTokenAddress`: Input token contract address
- `outputTokenAddress`: Output token contract address
- `inputAmount`: Amount to trade

**Example:**
```bash
curl "http://localhost:3000/trade-info-on-uniswap/3?chainId=1&inputTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&outputTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&inputAmount=1000"
```

**Raydium Trade Info**
```http
GET /trade-info-on-radium?inputTokenAddress={inputToken}&outputTokenAddress={outputToken}&inputAmount={amount}&slippagePercentage={slippage}
```

**Parameters:**
- `inputTokenAddress`: Input token address (e.g., SOL: `So11111111111111111111111111111111111111112`)
- `outputTokenAddress`: Output token address
- `inputAmount`: Amount to trade
- `slippagePercentage`: Slippage tolerance (e.g., `5` for 5%)

**Example:**
```bash
curl "http://localhost:3000/trade-info-on-radium?inputTokenAddress=So11111111111111111111111111111111111111112&outputTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&inputAmount=1000&slippagePercentage=5"
```

### Response Format

**Uniswap V2/V3 Response:**
```json
{
  "inputAmount": "1000",
  "outputAmount": "2456.78",
  "priceImpact": "0.12",
  "executionPrice": "2.456",
  "route": ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0x6b175474e89094c44da98b954eedeac495271d0f"],
  "gasEstimate": "150000"
}
```

**Raydium Response:**
```json
{
  "inputAmount": "1000",
  "outputAmount": "2456.78",
  "priceImpact": "0.12",
  "executionPrice": "2.456",
  "slippage": "5",
  "poolInfo": {
    "baseReserve": "1000000",
    "quoteReserve": "2456789"
  }
}
```

## 🎯 Trading Strategies

### Simple TPSL (Take Profit / Stop Loss)
```typescript
// Example strategy implementation
const strategy = {
  entryPrice: 100,
  takeProfit: 110,    // 10% profit target
  stopLoss: 90,       // 10% loss limit
  amount: 1.0,        // Token amount
  pairAddress: "0x...", // Trading pair
  dexType: "uniswap-v3"
};
```

### Supported Strategy Types
- **Market Orders** - Immediate execution at current market price
- **Limit Orders** - Execute when price target is reached
- **DCA (Dollar Cost Averaging)** - Regular purchases over time
- **Grid Trading** - Automated buy/sell at price intervals

## ⚙️ Configuration

### Network Configuration

**Ethereum Networks:**
- **Mainnet**: `chainId: 1`
- **Arbitrum**: `chainId: 42161`
- **Sepolia Testnet**: `chainId: 11155111`

**Solana Networks:**
- **Mainnet**: `https://api.mainnet-beta.solana.com`
- **Devnet**: `https://api.devnet.solana.com`

### Token Addresses

**Ethereum:**
- WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`

**Solana:**
- SOL: `So11111111111111111111111111111111111111112`
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## 💡 Examples

### Basic Trading Example

```typescript
import { buyTokensOnUniswapV3, sellTokensOnUniswapV3 } from './utils/uniswap/v3-sdk';

// Buy tokens
const buyResult = await buyTokensOnUniswapV3(
  outputToken,    // Token to buy
  0.1,           // Amount in ETH
  0.5            // Slippage tolerance
);

// Sell tokens
const sellResult = await sellTokensOnUniswapV3(
  inputToken,    // Token to sell
  100,           // Amount in tokens
  0.5            // Slippage tolerance
);
```

### Raydium Trading Example

```typescript
import { buyTokensOnRadium, sellTokensOnRadium } from './utils/radium/sdk';

// Buy tokens on Raydium
const buyResult = await buyTokensOnRadium(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC address
  0.01,          // Amount in SOL
  5,             // Slippage percentage
  true           // Enable logging
);
```

## 🔧 Development

### Project Structure
```
src/
├── config/          # Configuration files
├── constants/       # Token addresses and contract addresses
├── middleware/      # Express middleware
├── routes/          # API routes
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
    ├── uniswap/     # Uniswap V2/V3 SDK integration
    └── radium/      # Raydium SDK integration
```

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server with hot reload

# Production
npm run build              # Build TypeScript to JavaScript
npm run start:prod         # Start production server

# TypeScript
npm run ts-prepare         # Prepare TypeScript patches
```

### Dependencies

**Core Dependencies:**
- `@uniswap/sdk-core` - Uniswap core SDK
- `@uniswap/v2-sdk` - Uniswap V2 SDK
- `@uniswap/v3-sdk` - Uniswap V3 SDK
- `@raydium-io/raydium-sdk` - Raydium SDK
- `ethers` - Ethereum library
- `express` - Web framework

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing code patterns
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

### Uniswap Integration
- [Uniswap V2 SDK](https://github.com/Uniswap/v2-sdk)
- [Uniswap V3 SDK](https://github.com/Uniswap/v3-sdk)
- [Uniswap Universal Router](https://github.com/Uniswap/universal-router-sdk)

### Solana/Raydium Integration
- [Raydium SDK](https://github.com/raydium-io/raydium-sdk)
- [Raydium SDK Examples](https://github.com/raydium-io/raydium-sdk-V1-demo)

### Trading Bot Examples
- [Decentralized Exchange Trading Scripts](https://github.com/henrytirla/Decentralized-Exchange-Trading-Scripts)
- [Crypto Sniper Bot](https://github.com/zookyy/crypto-sniper)

## 📚 Additional Resources

### Documentation
- [Uniswap Protocol Documentation](https://docs.uniswap.org/)
- [Raydium Documentation](https://docs.raydium.io/)
- [Ethereum Development](https://ethereum.org/developers/)
- [Solana Development](https://docs.solana.com/)

### Trading Strategies
- [DeFi Trading Strategies](https://blockgeeks.com/guides/6-of-the-best-crypto-trading-bots-strategies-updated-list/)
- [Uniswap V3 Capital Efficiency](https://zerocap.com/insights/research-lab/uniswap-v3-capital-efficiency)
- [Multi-hop Trading](https://medium.com/@arian.web3developer/multi-hopping-quote-and-swap-uniswap-v3-606a2c0ad197)

---

**⚠️ Disclaimer**: This software is for educational purposes only. Trading cryptocurrencies involves substantial risk of loss. Use at your own risk.

**🔒 Security**: Never commit private keys or sensitive information to version control. Always use environment variables for sensitive data.

---

<div align="center">
  <strong>Built with ❤️ for the DeFi community</strong>
</div>
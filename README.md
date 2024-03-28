## mars-altcoin-trader

### Features

- Scripts
  * getBuyInfo(dexType, pairAddress, inputAmount): { outputAmount, priceImpact, price }
  * getSellInfo(dexType, pairAddress, inputAmount): { outputAmount, priceImpact, price }
  * buy(dexType, pairAddress, amount, privateKey): { success, buyAmount, sellAmount, txId }
  * sell(dexType, pairAddress, amount, privateKey): { success, buyAmount, sellAmount, txId }

- Supported DEXes
  * Uniswap v2
  * Uniswap v3
  * Pancakeswap

- Strategies
  * simple-TPSL
    * input parameters: privateKey, entryPrice, TP, SL, amount, pairAddress, dexType

- Routes

e.g. UNI/ETH

## Assumptions (proof of concept)

- Ethereum mainnet
- Uniswap V2
- Routes consist of only one pair (direct pair).
- Token/ETH pools

### Relevant open-source projects

- [uniswap-price-feed](https://github.com/stefanmendoza/uniswap-price-feed)
- [Dex-aggregator](https://github.com/kaymen99/Dex-aggregator)
- [uniswap](https://github.com/sjuanati/uniswap)
- [All-Chains-EthereumX-Sniping-Bot](https://github.com/Abregud/All-Chains-EthereumX-Sniping-Bot)
- [crypto-sniper](https://github.com/zookyy/crypto-sniper)
- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk)
- [v2-sdk](https://github.com/Uniswap/v2-sdk)
- [Uniswap: Universal Router: ETH to USDC](https://gist.github.com/BlockmanCodes/52ede9384fd774ed18c5dea5912fbe3d)
- [universal-router-sdk](https://github.com/Uniswap/universal-router-sdk)

- [Decentralized-Exchange-Trading-Scripts](https://github.com/henrytirla/Decentralized-Exchange-Trading-Scripts)
- [ethereum-abi-types-generator](https://github.com/joshstevens19/ethereum-abi-types-generator)

### Relevant reads

- [6 of The Best Crypto Trading Bots Strategies](https://blockgeeks.com/guides/6-of-the-best-crypto-trading-bots-strategies-updated-list/#_Tool_2_DeFi_Derivatives)
- [Uniswap API: Get Pools Data, Tokens and Create Charts](https://bitquery.io/blog/uniswap-pool-api)
- [Introducing Uniswap v3](https://blog.uniswap.org/uniswap-v3)
- [Uniswap V3: Maximising Capital Efficiency](https://zerocap.com/insights/research-lab/uniswap-v3-capital-efficiency)
- [Introduction to Uniswap V3](https://uniswapv3book.com/milestone_0/uniswap-v3.html)
- [Uniswap V3: Maximising Capital Efficiency](https://zerocap.com/insights/research-lab/uniswap-v3-capital-efficiency)
- [Uniswap v3: Liquidity and Invariants 101](https://medium.com/blockapex/uniswap-v3-liquidity-and-invariants-101-cb956816d62d)

### TODOs

#### Feature-related

- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk) vs. [v2-sdk](https://github.com/Uniswap/v2-sdk)
- Fine-tuning e.g. `gasPrice` & `gasLimit`
  * https://stackoverflow.com/questions/70622074/set-gas-limit-on-contract-method-in-ethers-js
  * https://github.com/ethers-io/ethers.js/issues/40
- https://github.com/raydium-io/raydium-sdk & https://github.com/raydium-io

#### Code-related

- Set up `ESLint`.
- Set up `Prettier`.
- Add logs.
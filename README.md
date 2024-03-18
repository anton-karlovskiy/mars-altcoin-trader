## mars-altcoin-trader

### Features

- Scripts
  * getBuyInfo(dexType, pairAddress, amount): { amount, slippage, price }
  * getSellInfo(dexType, pairAddress, amount): { amount, slippage, price }
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

- [Decentralized-Exchange-Trading-Scripts](https://github.com/henrytirla/Decentralized-Exchange-Trading-Scripts)

### Relevant reads

- [6 of The Best Crypto Trading Bots Strategies](https://blockgeeks.com/guides/6-of-the-best-crypto-trading-bots-strategies-updated-list/#_Tool_2_DeFi_Derivatives)

### TODOs

#### Feature-related

- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk) vs. [v2-sdk](https://github.com/Uniswap/v2-sdk)
- Fine-tuning e.g. `gasPrice` & `gasLimit`
  * https://stackoverflow.com/questions/70622074/set-gas-limit-on-contract-method-in-ethers-js
  * https://github.com/ethers-io/ethers.js/issues/40

#### Code-related

- Set up `ESLint`.
- Set up `Prettier`.
- Add logs.
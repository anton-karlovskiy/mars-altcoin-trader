## mars-altcoin-trader

### Features

- Scripts
  * getBuyInfo(dexType, pairAddress, amount): { amount, slippage, price }
  * getSellInfo(dexType, pairAddress, amount): { amount, slippage, price }
  * buy(dexType, pairAddress, amount, privateKey): { success, buyAmount, sellAmount, txId }
  * sell(dexType, pairAddress, amount, privateKey): { success, buyAmount, sellAmount, txId }

- Supported dexes
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

### Open-source projects

- [uniswap-price-feed](https://github.com/stefanmendoza/uniswap-price-feed)
- [Dex-aggregator](https://github.com/kaymen99/Dex-aggregator)
- [uniswap](https://github.com/sjuanati/uniswap)
- [All-Chains-EthereumX-Sniping-Bot](https://github.com/Abregud/All-Chains-EthereumX-Sniping-Bot)
- [crypto-sniper](https://github.com/zookyy/crypto-sniper)
- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk)
- [v2-sdk](https://github.com/Uniswap/v2-sdk)

- [Decentralized-Exchange-Trading-Scripts](https://github.com/henrytirla/Decentralized-Exchange-Trading-Scripts)

### TODOs

- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk) vs. [v2-sdk](https://github.com/Uniswap/v2-sdk)
- Fine-tuning e.g. `gasPrice` & `gasLimit`
- Set up `ESLint`.
- Set up `Prettier`.
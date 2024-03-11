## mars-altcoin-trader

- Scripts
  * getBuyInfo(dexType, pairAddress, amount): { amount, slippage, price }
  * getSellInfo(dexType, pairAddress, amount): { amount, slippage, price }
  * buy(dexType, pairAddress, amount, privateKey): { success, buyAmount, sellAmount, txid }
  * sell(dexType, pairAddress, amount, prviateKey): { sucess, buyAmount, sellAmount, txid }

- Supported dexes
  * Uniswap v2
  * Uniswap v3
  * Pancakeswap

- Strategies
  * simple-tpsl
    * input parameters: privateKey, entryPrice, tp, sl, amount, pairAddress, dexType

- Routes


UNI/ETH

parameters\0.02 100, 10, 50

### Open-source projects

- [uniswap-price-feed](https://github.com/stefanmendoza/uniswap-price-feed)
- [Dex-aggregator](https://github.com/kaymen99/Dex-aggregator)
- [uniswap](https://github.com/sjuanati/uniswap)
- [All-Chains-EthereumX-Sniping-Bot](https://github.com/Abregud/All-Chains-EthereumX-Sniping-Bot)
- [crypto-sniper](https://github.com/zookyy/crypto-sniper)
- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk)
- [v2-sdk](https://github.com/Uniswap/v2-sdk)

- [Decentralized-Exchange-Trading-Scripts](https://github.com/henrytirla/Decentralized-Exchange-Trading-Scripts)
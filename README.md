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
  * Radium

- Strategies
  * simple-TPSL
    * input parameters: privateKey, entryPrice, TP, SL, amount, pairAddress, dexType

- Routes

- API call
  * encode/decode
  * buy/sell (market/limit)
  * get limit orders
  * get positions

- database

- position management
  * open position at buy (merge for same tokens)
  * position update (profit) (token amount check) (nice to have)
  * close/update position at sell 
  * calculate profit at position close (sell)

- order management
  * create/update/delete limit order
  * execute limit order if conditions are met 

market/limit sol 3 buy
market/limit sol 1 buy
market/limit sol 1 buy

market/limit sol 1 sell


buy position 4

1 100
2 105
1 110

(100 * 1 + 2 * 105 + 1 * 110) / 4

## Assumptions (proof of concept)

- Ethereum mainnet & Solana mainnet
- Uniswap V2 & Uniswap V3 & Radium
- Routes consist of only one pair (direct pair).
- Token/Native (ETH | SOL) pools

### Relevant open-source projects

- [uniswap-price-feed](https://github.com/stefanmendoza/uniswap-price-feed)
- [Dex-aggregator](https://github.com/kaymen99/Dex-aggregator)
- [uniswap](https://github.com/sjuanati/uniswap)
- [All-Chains-EthereumX-Sniping-Bot](https://github.com/Abregud/All-Chains-EthereumX-Sniping-Bot)
- [crypto-sniper](https://github.com/zookyy/crypto-sniper)
- [Uniswap: Universal Router: ETH to USDC](https://gist.github.com/BlockmanCodes/52ede9384fd774ed18c5dea5912fbe3d)

- [simple-uniswap-sdk](https://github.com/joshstevens19/simple-uniswap-sdk)
- [Uniswap V2 SDK](https://github.com/Uniswap/v2-sdk)
- [Uniswap V3 SDK](https://github.com/Uniswap/v3-sdk)
- [universal-router-sdk](https://github.com/Uniswap/universal-router-sdk)
- [Raydium SDK](https://github.com/raydium-io/raydium-sdk)

- [Uniswap/examples/v3-sdk](https://github.com/Uniswap/examples/tree/main/v3-sdk)
- [RAYDIUM SDK V1 demo](https://github.com/raydium-io/raydium-sdk-V1-demo)
- [Raydium SDK Swap Example](https://github.com/chainstacklabs/raydium-sdk-swap-example-typescript)

- [Decentralized-Exchange-Trading-Scripts](https://github.com/henrytirla/Decentralized-Exchange-Trading-Scripts)
- [ethereum-abi-types-generator](https://github.com/joshstevens19/ethereum-abi-types-generator)

### Relevant reads

- [6 of The Best Crypto Trading Bots Strategies](https://blockgeeks.com/guides/6-of-the-best-crypto-trading-bots-strategies-updated-list/#_Tool_2_DeFi_Derivatives)
- [The Uniswap Protocol](https://docs.uniswap.org/concepts/uniswap-protocol)
- [Uniswap API: Get Pools Data, Tokens and Create Charts](https://bitquery.io/blog/uniswap-pool-api)
- [Introducing Uniswap v3](https://blog.uniswap.org/uniswap-v3)
- [Uniswap V3: Maximising Capital Efficiency](https://zerocap.com/insights/research-lab/uniswap-v3-capital-efficiency)
- [Introduction to Uniswap V3](https://uniswapv3book.com/milestone_0/uniswap-v3.html)
- [Uniswap V3: Maximising Capital Efficiency](https://zerocap.com/insights/research-lab/uniswap-v3-capital-efficiency)
- [Uniswap v3: Liquidity and Invariants 101](https://medium.com/blockapex/uniswap-v3-liquidity-and-invariants-101-cb956816d62d)
- [Multi hopping quote and swap Uniswap V3](https://medium.com/@arian.web3developer/multi-hopping-quote-and-swap-uniswap-v3-606a2c0ad197)
- [Single Swaps](https://docs.uniswap.org/contracts/v3/guides/swaps/single-swaps)
- [Solana: How to perform token swaps using the Raydium SDK](https://docs.chainstack.com/docs/solana-how-to-perform-token-swaps-using-the-raydium-sdk)

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
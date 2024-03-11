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
import {
  TokenAmount,
  CurrencyAmount,
  Price,
  Percent
} from '@raydium-io/raydium-sdk';

interface TradeInfoOnUniswapV3 {
  inputAmount: number;
  outputAmount: string;
  priceImpact: string;
  executionPrice: string;
}

interface TradeInfoOnUniswapV2 extends TradeInfoOnUniswapV3 {
  midPrice: string;
}

interface TradeInfoOnRadium {
  amountIn: TokenAmount;
  amountOut: TokenAmount | CurrencyAmount;
  minAmountOut: TokenAmount | CurrencyAmount;
  currentPrice: Price;
  executionPrice: Price | null;
  priceImpact: Percent;
  fee: CurrencyAmount;
}

export {
  TradeInfoOnUniswapV2,
  TradeInfoOnUniswapV3,
  TradeInfoOnRadium
};
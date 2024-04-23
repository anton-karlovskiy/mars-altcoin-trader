interface TradeInfoOnUniswapV3 {
  inputAmount: number;
  outputAmount: string;
  priceImpact: string;
  executionPrice: string;
}

interface TradeInfoOnUniswapV2 extends TradeInfoOnUniswapV3 {
  midPrice: string;
}

export {
  TradeInfoOnUniswapV2,
  TradeInfoOnUniswapV3
};
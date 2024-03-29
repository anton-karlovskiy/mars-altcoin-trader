import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';

import {
  buyTokensOnUniswapV2,
  sellTokensOnUniswapV2,
  getTradeInfoOnUniswapV2
} from '@/utils/uniswap-v2';
import {
  createToken,
  prepareWETH
} from '@/utils/helpers';
import {
  USDC_TOKEN,
  WETH_TOKEN
} from '@/constants/tokens';
import {
  getQuote,
  createTrade,
  executeTrade
} from '@/utils/uniswap-v3';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6b175474e89094c44da98b954eedeac495271d0f', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

  const tradeInfoOnUniswapV2 = await getTradeInfoOnUniswapV2(WETH, DAI, 1000);
  console.log('tradeInfo:', tradeInfoOnUniswapV2);

  // TODO: test with Uniswap V3 stuff
  // const txReceipt = await buyTokensOnUniswapV2(WETH, DAI, 0.001, 0.5);
  // console.log('TX receipt:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV2(DAI, WETH, 0.4, 0.5);
  // console.log('TX receipt:', txReceipt);

  const quote = await getQuote(WETH_TOKEN, USDC_TOKEN, 1); // TODO: quote for WETH -> USDC is misleading
  console.log('quote:', quote);

  const inputToken = WETH_TOKEN;
  const outputToken = USDC_TOKEN;
  const inputAmount = 0.00014;

  // ray test touch <
  const trade = await createTrade(inputToken, outputToken, inputAmount);
  console.log('trade:', trade);
  
  // const txState = await executeTrade(trade);
  // ray test touch >
};

main();

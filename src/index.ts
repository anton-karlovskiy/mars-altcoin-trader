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
import { createToken } from '@/utils/helpers';
import {
  USDC_TOKEN,
  WETH_TOKEN
} from '@/constants/tokens';
import {
  getQuoteOnUniswapV3,
  buyTokensOnUniswapV3,
  sellTokensOnUniswapV3,
  getTradeInfoOnUniswapV3
} from '@/utils/uniswap-v3';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6b175474e89094c44da98b954eedeac495271d0f', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

  const tradeInfoOnUniswapV2 = await getTradeInfoOnUniswapV2(WETH, DAI, 1000);
  console.log('Trade info on Uniswap V2:', tradeInfoOnUniswapV2);

  // const txReceipt = await buyTokensOnUniswapV2(DAI, 0.0001, 0.5);
  // console.log('Buy TX receipt on Uniswap V2:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV2(DAI, 0.01, 0.5);
  // console.log('Sell TX receipt on Uniswap V2:', txReceipt);

  const quote = await getQuoteOnUniswapV3(WETH_TOKEN, USDC_TOKEN, 1); // TODO: quote for WETH -> USDC is misleading
  console.log('quote on Uniswap V3:', quote);

  // const txReceipt = await buyTokensOnUniswapV3(USDC_TOKEN, 0.00001, 0.5);
  // console.log('Buy TX receipt on Uniswap V3:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV3(USDC_TOKEN, 0.01, 0.5);
  // console.log('Sell TX receipt on Uniswap V3:', txReceipt);

  const tradeInfoOnUniswapV3 = await getTradeInfoOnUniswapV3(WETH, DAI, 1000);
  console.log('Trade info on Uniswap V3:', tradeInfoOnUniswapV3);
};

main();

import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';
import express, { Express } from 'express';

import {
  buyTokensOnUniswapV2,
  sellTokensOnUniswapV2
} from '@/utils/uniswap/v2-sdk';
import { createToken } from '@/utils/uniswap/helpers';
import {
  USDC_TOKEN,
  WETH_TOKEN
} from '@/constants/uniswap/tokens';
import {
  SOL_ADDRESS,
  USDC_ADDRESS
} from '@/constants/radium/tokens';
import {
  getQuoteOnUniswapV3,
  buyTokensOnUniswapV3,
  sellTokensOnUniswapV3,
  getTradeInfoOnUniswapV3
} from '@/utils/uniswap/v3-sdk';
import {
  buyTokensOnRadium,
  sellTokensOnRadium,
  getTradeInfoOnRadium
} from '@/utils/radium/sdk';
import { configureRoutes } from '@/routes';
import { errorHandler } from '@/middleware/error';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6b175474e89094c44da98b954eedeac495271d0f', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

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

  // await buyTokensOnRadium(USDC_ADDRESS, 0.01, 5, true); // 5% slippage
  // await sellTokensOnRadium(USDC_ADDRESS, 1, 5, true);

  const tradeInfoOnRadium = await getTradeInfoOnRadium(SOL_ADDRESS, USDC_ADDRESS, 1000, 5);
  console.log('Trade info on Radium:', tradeInfoOnRadium);
};

const app: Express = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Register the error handling middleware in your Express app
app.use(errorHandler);

configureRoutes(app);

// RE: https://docs.railway.app/guides/fixing-common-errors
const port = process.env.PORT || 3000;
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
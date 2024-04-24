import * as dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';

import {
  buyTokensOnUniswapV2,
  sellTokensOnUniswapV2
} from '@/utils/uniswap/v2-sdk';
import {
  buyTokensOnUniswapV3,
  sellTokensOnUniswapV3
} from '@/utils/uniswap/v3-sdk';
import {
  buyTokensOnRadium,
  sellTokensOnRadium
} from '@/utils/radium/sdk';
import { configureRoutes } from '@/routes';
import { errorHandler } from '@/middleware/error';

const main = async () => {
  // const txReceipt = await buyTokensOnUniswapV2(DAI, 0.0001, 0.5);
  // console.log('Buy TX receipt on Uniswap V2:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV2(DAI, 0.01, 0.5);
  // console.log('Sell TX receipt on Uniswap V2:', txReceipt);

  // const txReceipt = await buyTokensOnUniswapV3(USDC_TOKEN, 0.00001, 0.5);
  // console.log('Buy TX receipt on Uniswap V3:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV3(USDC_TOKEN, 0.01, 0.5);
  // console.log('Sell TX receipt on Uniswap V3:', txReceipt);

  // await buyTokensOnRadium(USDC_ADDRESS, 0.01, 5, true); // 5% slippage
  // await sellTokensOnRadium(USDC_ADDRESS, 1, 5, true);
};
main();

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
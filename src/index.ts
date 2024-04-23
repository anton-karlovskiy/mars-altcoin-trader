import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';
import express, { Express, Request, Response } from 'express';

import {
  buyTokensOnUniswapV2,
  sellTokensOnUniswapV2,
  getTradeInfoOnUniswapV2
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
import { TradeInfoOnUniswapV2 } from '@/types/general';

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

  // await buyTokensOnRadium(USDC_ADDRESS, 0.01, 5, true); // 5% slippage
  // await sellTokensOnRadium(USDC_ADDRESS, 1, 5, true);

  const tradeInfoOnRadium = await getTradeInfoOnRadium(SOL_ADDRESS, USDC_ADDRESS, 1000, 5);
  console.log('Trade info on Radium:', tradeInfoOnRadium);
};

// ray test touch <
interface ProcessRequest {
  data: string;
}

interface ProcessResponse {
  processedData: string;
}

function processData(data: string): ProcessResponse {
  return { processedData: data.toUpperCase() };
}

const app: Express = express();

// Middleware to parse JSON request bodies
app.use(express.json());

interface GetTradeInfoOnUniswapV2Query {
  chainId: string;
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputAmount: string;
}

// GET request to /trade-info-on-uniswap-v2?chainId=1&inputTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&outputTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&inputAmount=1000
app.get('/trade-info-on-uniswap-v2', async (req: Request<any, any, any, GetTradeInfoOnUniswapV2Query>, res: Response<TradeInfoOnUniswapV2>) => {
  const chainId = Number(req.query.chainId) as ChainId;
  const inputTokenAddress = req.query.inputTokenAddress;
  const outputTokenAddress = req.query.outputTokenAddress;
  const inputAmount = Number(req.query.inputAmount);

  // TODO: decimals
  console.log('ray : ***** req.query => ', req.query);

  const WETH = await createToken(inputTokenAddress, chainId);
  const DAI = await createToken(outputTokenAddress, chainId);

  const tradeInfoOnUniswapV2 = await getTradeInfoOnUniswapV2(WETH, DAI, inputAmount);
  console.log('Trade info on Uniswap V2:', tradeInfoOnUniswapV2);

  res.json(tradeInfoOnUniswapV2);
});

// POST request to /process endpoint
app.post<ProcessRequest, ProcessResponse>('/process', (req, res) => {
  const data = req.body.data;
  const processedData = processData(data);
  res.json(processedData);
});

// RE: https://docs.railway.app/guides/fixing-common-errors
const port = process.env.PORT || 3000;
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
// ray test touch >
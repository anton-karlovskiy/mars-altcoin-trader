import express, {
  Request,
  Response,
  NextFunction
} from 'express';
import { ChainId } from '@uniswap/sdk-core';

import { getTradeInfoOnUniswapV2 } from '@/utils/uniswap/v2-sdk';
import { createToken } from '@/utils/uniswap/helpers';
import { TradeInfoOnUniswapV2 } from '@/types/general';

function configureRoutes(app: express.Application) {
  // GET request to /trade-info-on-uniswap-v2?chainId=1&inputTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&outputTokenAddress=0x6b175474e89094c44da98b954eedeac495271d0f&inputAmount=1000
  app.get(
    '/trade-info-on-uniswap-v2',
    async (
      req: Request<any, any, any, { chainId: string; inputTokenAddress: string; outputTokenAddress: string; inputAmount: string; }>,
      res: Response<TradeInfoOnUniswapV2>,
      next: NextFunction
    ) => {
      try {
        const chainId = Number(req.query.chainId) as ChainId;
        const inputTokenAddress = req.query.inputTokenAddress;
        const outputTokenAddress = req.query.outputTokenAddress;
        const inputAmount = Number(req.query.inputAmount);
      
        const WETH = await createToken(inputTokenAddress, chainId);
        const DAI = await createToken(outputTokenAddress, chainId);
      
        const tradeInfoOnUniswapV2 = await getTradeInfoOnUniswapV2(WETH, DAI, inputAmount);
        console.log('Trade info on Uniswap V2:', tradeInfoOnUniswapV2);
      
        res.json(tradeInfoOnUniswapV2);
      } catch (error) {
        next(error); // Pass the error to the next middleware
      }
    }
);
  
  interface ProcessRequest {
    data: string;
  }
  
  interface ProcessResponse {
    processedData: string;
  }
  
  function processData(data: string): ProcessResponse {
    return { processedData: data.toUpperCase() };
  }
  
  // POST request to /process endpoint
  app.post<ProcessRequest, ProcessResponse>('/process', (req, res) => {
    const data = req.body.data;
    const processedData = processData(data);
    res.json(processedData);
  });
}

export { configureRoutes };
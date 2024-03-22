import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';

import {
  createToken,
  buyTokens,
  sellTokens,
  getTradeInfo
} from '@/utils/uniswap-v2';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6b175474e89094c44da98b954eedeac495271d0f', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

  const tradeInfo = await getTradeInfo(WETH, DAI, 1000);
  console.log('tradeInfo:', tradeInfo);

  // const txReceipt = await buyTokens(WETH, DAI, 0.001, 0.5);
  // console.log('TX receipt:', txReceipt);

  // const txReceipt = await sellTokens(DAI, WETH, 0.4, 0.5);
  // console.log('TX receipt:', txReceipt);
};

main();

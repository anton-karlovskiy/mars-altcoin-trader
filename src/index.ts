import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';

import {
  createToken,
  calculateExePrice,
  calculateMidPrice,
  buyTokens
} from '@/utils/uniswap';

const main = async () => {
  const targetChainId = ChainId.GOERLI;

  const DAI = await createToken('0x3ee54fa122f884ab89c39b2d7b1a0c40e426a9a9', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

  const exePrice = await calculateExePrice(WETH, DAI, 0.1, 10);
  console.log('Execution Price:', exePrice);

  const midPrice = await calculateMidPrice(WETH, DAI, 10);
  console.log('Mid Price', midPrice);

  const txReceipt = await buyTokens(WETH, DAI, 0.01, 0.5);
  console.log(txReceipt);
};

main();

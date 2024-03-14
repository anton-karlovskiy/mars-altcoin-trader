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
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6B175474E89094C44Da98b954EedeAC495271d0F', targetChainId);
  const WETH = WETH9[targetChainId];

  const exePrice = await calculateExePrice(WETH, DAI, 0.1, 10);
  console.log('Execution Price:', exePrice);

  const midPrice = await calculateMidPrice(WETH, DAI, 10);
  console.log('Mid Price', midPrice);

  const txReceipt = await buyTokens(WETH, DAI, 0.01, 0.5);
  console.log(txReceipt);
};

main();

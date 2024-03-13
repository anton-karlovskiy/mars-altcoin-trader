import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';

import {
  createToken,
  calculateExecutionPrice
} from '@/utils/helpers';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6B175474E89094C44Da98b954EedeAC495271d0F', targetChainId);
  const WETH = WETH9[targetChainId];

  const executionPrice = await calculateExecutionPrice(WETH, DAI, BigInt(1000), 10);
  console.log(executionPrice);
};

main();

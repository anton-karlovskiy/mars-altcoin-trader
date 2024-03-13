import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';

import {
  createToken,
  createPair
} from '@/utils/helpers';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6B175474E89094C44Da98b954EedeAC495271d0F', targetChainId);
  const WETH = WETH9[targetChainId];

  const pair = await createPair(DAI, WETH);
  console.log(pair);
};

main();

import {
  ChainId,
  Token,
  WETH9
} from '@uniswap/sdk-core';

import {
  getDecimals,
  createPair
} from '@/utils/helpers';

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiDecimals = await getDecimals(daiAddress, targetChainId);
  const DAI = new Token(targetChainId, daiAddress, Number(daiDecimals));

  const WETH = WETH9[targetChainId];

  const pair = await createPair(DAI, WETH, targetChainId);
  console.log(pair);
};

main();

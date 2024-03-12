import {
  ChainId,
  Token
} from '@uniswap/sdk-core';

import { getProvider } from './utils/helpers';

const main = async () => {
  const chainId = ChainId.MAINNET;
  const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const decimals = 18;
  
  const DAI = new Token(chainId, tokenAddress, decimals);

  console.log(DAI);
  
  const provider = getProvider();
  const blockNumber = await provider.getBlockNumber();
  
  console.log(blockNumber);
};

main();

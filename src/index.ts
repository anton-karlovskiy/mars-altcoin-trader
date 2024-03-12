import {
  ChainId,
  Token
} from '@uniswap/sdk-core';

// ray test touch <
import { getProvider } from './utils/helpers';
// ray test touch >

const main = async () => {
  const chainId = ChainId.MAINNET;
  const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const decimals = 18;
  
  const DAI = new Token(chainId, tokenAddress, decimals);

  console.log(DAI);
  
  // ray test touch <
  const provider = getProvider();
  const blockNumber = await provider.getBlockNumber();
  
  console.log(blockNumber);
  // ray test touch >
};

main();

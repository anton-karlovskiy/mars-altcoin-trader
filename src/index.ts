import {
  ChainId,
  Token
} from '@uniswap/sdk-core';

import {
  getProvider,
  getDecimals
} from '@/utils/helpers';

const main = async () => {
  const mainnetId = ChainId.MAINNET;
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiDecimals = 18;
  const DAI = new Token(mainnetId, daiAddress, daiDecimals);
  console.log(DAI);
  
  const provider = getProvider();

  const decimals = await getDecimals(daiAddress, provider);
  console.log(decimals);
};

main();

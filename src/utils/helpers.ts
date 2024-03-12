import {
  JsonRpcProvider,
  Network
} from 'ethers';
import { ChainId } from '@uniswap/sdk-core';

import { INFURA_API_KEY } from '../config/keys';

const getProvider = () => {
  if (!INFURA_API_KEY) {
    throw new Error(`Infura API key is undefined: ${INFURA_API_KEY}`);
  }

  return  new JsonRpcProvider(
      `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      // RE: https://github.com/ethers-io/ethers.js/issues/4377#issuecomment-1837559329
      Network.from(ChainId.MAINNET),
      { staticNetwork: true }
    );
}

export {
  getProvider
};
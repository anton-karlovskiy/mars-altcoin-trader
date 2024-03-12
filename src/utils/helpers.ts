import {
  JsonRpcProvider,
  Network,
  Contract
} from 'ethers';
import { ChainId } from '@uniswap/sdk-core';
import { abiERC20 } from '@metamask/metamask-eth-abis';

import { INFURA_API_KEY } from '@/config/keys';

const getProvider = () => {
  if (!INFURA_API_KEY) {
    throw new Error(`Infura API key is undefined: ${INFURA_API_KEY}`);
  }

  try {
    return  new JsonRpcProvider(
      `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      // RE: https://github.com/ethers-io/ethers.js/issues/4377#issuecomment-1837559329
      Network.from(ChainId.MAINNET),
      { staticNetwork: true }
    );
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const getDecimals = async (tokenAddress: string, provider: JsonRpcProvider): Promise<BigInt> => {
  try {
    const tokenContract = new Contract(tokenAddress, abiERC20, provider);
  
    return await tokenContract['decimals']();
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

export {
  getProvider,
  getDecimals
};
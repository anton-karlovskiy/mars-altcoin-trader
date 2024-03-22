import { Contract } from 'ethers';
import {
  ChainId,
  Token
} from '@uniswap/sdk-core';
import IUniswapV2ERC20 from '@uniswap/v2-core/build/IUniswapV2ERC20.json';

import { getProvider } from '@/utils/web3';

const getDecimals = async (tokenAddress: string, chainId: ChainId) => {
  try {
    const provider = getProvider(chainId);

    const tokenContract = new Contract(tokenAddress, IUniswapV2ERC20.abi, provider);
  
    return Number(await tokenContract['decimals']());
  } catch (error) {
    throw new Error(`Thrown at "getDecimals": ${error}`);
  }
};

const createToken = async (address: string, chainId: ChainId, decimals: number | undefined = undefined, symbol = '', name = '') => {
  try {
    if (!decimals) {
      decimals = await getDecimals(address, chainId);
    }
  
    return new Token(chainId, address, decimals, symbol, name);
  } catch (error) {
    throw new Error(`Thrown at "createToken": ${error}`);
  }
};

export {
  getDecimals,
  createToken
};
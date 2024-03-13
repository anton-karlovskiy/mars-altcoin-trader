import {
  JsonRpcProvider,
  Network,
  Contract
} from 'ethers';
import {
  ChainId,
  Token,
  CurrencyAmount
} from '@uniswap/sdk-core';
import { Pair } from '@uniswap/v2-sdk';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IUniswapV2ERC20 from '@uniswap/v2-core/build/IUniswapV2ERC20.json';

import { INFURA_API_KEY } from '@/config/keys';

const getProvider = (chainId: ChainId) => {
  if (!INFURA_API_KEY) {
    throw new Error(`Infura API key is undefined: ${INFURA_API_KEY}`);
  }

  let infuraEndpoint: string;

  switch (chainId) {
    case ChainId.MAINNET:
      infuraEndpoint = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
      break;
    default:
      throw new Error('Invalid blockchain network!');
  }

  return  new JsonRpcProvider(
    infuraEndpoint,
    // RE: https://github.com/ethers-io/ethers.js/issues/4377#issuecomment-1837559329
    Network.from(chainId),
    { staticNetwork: true }
  );
};

const getDecimals = async (tokenAddress: string, chainId: ChainId): Promise<bigint> => {
  try {
    const provider = getProvider(chainId);

    const tokenContract = new Contract(tokenAddress, IUniswapV2ERC20.abi, provider);
  
    return await tokenContract['decimals']();
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const createPair = async (tokenA: Token, tokenB: Token, chainId: ChainId): Promise<Pair> => {
  try {
    const pairAddress = Pair.getAddress(tokenA, tokenB);

    const provider = getProvider(chainId);
    const pairContract = new Contract(pairAddress, IUniswapV2Pair.abi, provider);
    const reserves: bigint[] = await pairContract['getReserves']();
    const [reserve0, reserve1] = reserves;
    
    const tokens = [tokenA, tokenB];
    const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]];
    
    const pair = new Pair(CurrencyAmount.fromRawAmount(token0, reserve0.toString()), CurrencyAmount.fromRawAmount(token1, reserve1.toString()));
  
    return pair;
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

export {
  getProvider,
  getDecimals,
  createPair
};
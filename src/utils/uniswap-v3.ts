// ray test touch <
import { Contract } from 'ethers';
import {
  computePoolAddress,
  FeeAmount
} from '@uniswap/v3-sdk';
import { ChainId } from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';

import { getProvider } from '@/utils/web3';
import {
  fromReadableAmount,
  toReadableAmount
} from '@/utils/conversion';
import {
  getUniswapV3QuoterContractAddress,
  getUniswapV3PoolFactoryContractAddress
} from '@/constants/addresses';
import {
  USDC_TOKEN,
  WETH_TOKEN
} from '@/constants/tokens';

async function quote(): Promise<string> {
  const quoterContract = new Contract(
    getUniswapV3QuoterContractAddress(ChainId.MAINNET),
    Quoter.abi,
    getProvider(ChainId.MAINNET)
  );
  const poolConstants = await getPoolConstants();
  
  // RE: https://docs.ethers.org/v6/migrating/#migrate-contracts
  // RE: https://betterprogramming.pub/sending-static-calls-to-a-smart-contract-with-ethers-js-e2b4ceccc9ab
  const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
    poolConstants.token0,
    poolConstants.token1,
    poolConstants.fee,
    fromReadableAmount(
      1000,
      USDC_TOKEN.decimals
    ).toString(),
    0
  );

  return toReadableAmount(quotedAmountOut, WETH_TOKEN.decimals);
}

async function getPoolConstants(): Promise<{
  token0: string
  token1: string
  fee: number
}> {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: getUniswapV3PoolFactoryContractAddress(ChainId.MAINNET),
    tokenA: USDC_TOKEN,
    tokenB: WETH_TOKEN,
    fee: FeeAmount.MEDIUM
  });

  const poolContract = new Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getProvider(ChainId.MAINNET)
  );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
}

export {
  quote
};
// ray test touch >

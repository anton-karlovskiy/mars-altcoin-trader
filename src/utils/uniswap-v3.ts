import { Contract } from 'ethers';
import {
  computePoolAddress,
  FeeAmount
} from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
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

const getPoolConstants = async (inputToken: Token, outputToken: Token, poolFee = FeeAmount.MEDIUM): Promise<{
  token0: string
  token1: string
  fee: number
}> => {
  const chainId = inputToken.chainId;

  const currentPoolAddress = computePoolAddress({
    factoryAddress: getUniswapV3PoolFactoryContractAddress(chainId),
    tokenA: inputToken,
    tokenB: outputToken,
    fee: poolFee
  });

  const poolContract = new Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getProvider(chainId)
  );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee
  };
};

// RE: https://docs.uniswap.org/sdk/v3/guides/swaps/quoting
const getQuote = async (inputToken: Token, outputToken: Token, inputAmount: number): Promise<string> => {
  const chainId = inputToken.chainId;

  const quoterContract = new Contract(
    getUniswapV3QuoterContractAddress(chainId),
    Quoter.abi,
    getProvider(chainId)
  );
  const poolConstants = await getPoolConstants(inputToken, outputToken);
  
  // RE: https://docs.ethers.org/v6/migrating/#migrate-contracts
  // RE: https://github.com/ethers-io/ethers.js/discussions/2367
  // RE: https://betterprogramming.pub/sending-static-calls-to-a-smart-contract-with-ethers-js-e2b4ceccc9ab
  const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
    poolConstants.token0,
    poolConstants.token1,
    poolConstants.fee,
    fromReadableAmount(
      inputAmount,
      inputToken.decimals
    ).toString(),
    0
  );

  return toReadableAmount(quotedAmountOut, outputToken.decimals);
};

export {
  getQuote
};

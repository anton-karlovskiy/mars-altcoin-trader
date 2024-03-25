import {
  Contract,
  AbiCoder
} from 'ethers';
import {
  computePoolAddress,
  FeeAmount,
  Pool,
  Route,
  SwapQuoter,
  Trade
} from '@uniswap/v3-sdk';
import {
  Currency,
  CurrencyAmount,
  TradeType,
  Token
} from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import JSBI from 'jsbi';

import { getProvider } from '@/utils/web3';
import {
  fromReadableAmount,
  toReadableAmount
} from '@/utils/conversion';
import {
  getUniswapV3QuoterContractAddress,
  getUniswapV3PoolFactoryContractAddress,
  getUniswapV3QuoterV2ContractAddress
} from '@/constants/addresses';

const getPoolConstants = async (inputToken: Token, outputToken: Token, poolFee = FeeAmount.MEDIUM): Promise<{
  token0: string
  token1: string
  fee: number
}> => {
  try {
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
  } catch (error) {
    throw new Error(`Thrown at "getPoolConstants": ${error}`);
  }
};

// RE: https://docs.uniswap.org/sdk/v3/guides/swaps/quoting
const getQuote = async (inputToken: Token, outputToken: Token, inputAmount: number): Promise<string> => {
  try {
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
  } catch (error) {
    throw new Error(`Thrown at "getQuote": ${error}`);
  }
};

interface PoolInfo {
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  sqrtPriceX96: bigint
  liquidity: bigint
  tick: number
}

const getPoolInfo = async (inputToken: Token, outputToken: Token, poolFee = FeeAmount.MEDIUM): Promise<PoolInfo> => {
  try {
    const chainId = inputToken.chainId;
  
    const provider = getProvider(chainId);
    if (!provider) {
      throw new Error('No provider');
    }
  
    const currentPoolAddress = computePoolAddress({
      factoryAddress: getUniswapV3PoolFactoryContractAddress(chainId),
      tokenA: inputToken,
      tokenB: outputToken,
      fee: poolFee
    });
  
    const poolContract = new Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      provider
    );
  
    const [
      token0,
      token1,
      fee,
      tickSpacing,
      liquidity,
      slot0
    ] =
      await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.liquidity(),
        poolContract.slot0()
      ]);
  
    return {
      token0,
      token1,
      fee,
      tickSpacing,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1]
    };
  } catch (error) {
    throw new Error(`Thrown at "getPoolInfo": ${error}`);
  }
};

const getOutputQuote = async (route: Route<Currency, Currency>, inputAmount: number) => {
  try {
    const inputToken = route.input;
    const chainId = inputToken.chainId;
  
    const provider = getProvider(chainId);
    if (!provider) {
      throw new Error('Provider required to get pool state');
    }
  
    const { calldata } = await SwapQuoter.quoteCallParameters(
      route,
      CurrencyAmount.fromRawAmount(
        inputToken,
        fromReadableAmount(
          inputAmount,
          inputToken.decimals
        ).toString()
      ),
      TradeType.EXACT_INPUT,
      {
        useQuoterV2: true
      }
    );
  
    const quoteCallReturnData = await provider.call({
      to: getUniswapV3QuoterV2ContractAddress(chainId),
      data: calldata
    });
  
    return AbiCoder.defaultAbiCoder().decode(['uint256'], quoteCallReturnData);
  } catch (error) {
    throw new Error(`Thrown at "getOutputQuote": ${error}`);
  }
};

const createTrade = async (inputToken: Token, outputToken: Token, inputAmount: number, poolFee = FeeAmount.MEDIUM) => {
  try {
    const poolInfo = await getPoolInfo(inputToken, outputToken, poolFee);

    const pool = new Pool(
      inputToken,
      outputToken,
      poolFee,
      poolInfo.sqrtPriceX96.toString(),
      poolInfo.liquidity.toString(),
      Number(poolInfo.tick.toString())
    );

    const swapRoute = new Route(
      [pool],
      inputToken,
      outputToken
    );

    const amountOut = await getOutputQuote(swapRoute, inputAmount);

    return Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
        inputToken,
        fromReadableAmount(
          inputAmount,
          inputToken.decimals
        ).toString()
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
        outputToken,
        JSBI.BigInt(amountOut)
      ),
      tradeType: TradeType.EXACT_INPUT
    });
  } catch (error) {
    throw new Error(`Thrown at "createTrade": ${error}`);
  }
};

export {
  getQuote,
  getPoolInfo,
  createTrade
};

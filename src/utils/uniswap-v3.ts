// RE: https://docs.uniswap.org/sdk/v3/overview

import {
  Contract,
  AbiCoder,
  TransactionReceipt
} from 'ethers';
import {
  computePoolAddress,
  FeeAmount,
  Pool,
  Route,
  SwapQuoter,
  Trade,
  SwapOptions,
  SwapRouter
} from '@uniswap/v3-sdk';
import {
  Currency,
  CurrencyAmount,
  TradeType,
  Token,
  Percent,
  WETH9
} from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import JSBI from 'jsbi';

import {
  getProvider,
  getWallet,
  sendTransaction
} from '@/utils/web3';
import {
  fromReadableAmount,
  toReadableAmount
} from '@/utils/conversion';
import {
  getUniswapV3QuoterContractAddress,
  getUniswapV3PoolFactoryContractAddress,
  getUniswapV3QuoterV2ContractAddress,
  getUniswapV3SwapRouterContractAddress
} from '@/constants/addresses';
import {
  approveTokenSpending,
  prepareWETH
} from '@/utils/helpers';

const getPoolConstantsOnUniswapV3 = async (inputToken: Token, outputToken: Token, poolFee = FeeAmount.MEDIUM): Promise<{
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
    throw new Error(`Thrown at "getPoolConstantsOnUniswapV3": ${error}`);
  }
};

// RE: https://docs.uniswap.org/sdk/v3/guides/swaps/quoting
const getQuoteOnUniswapV3 = async (inputToken: Token, outputToken: Token, inputAmount: number): Promise<string> => {
  try {
    const chainId = inputToken.chainId;
  
    const quoterContract = new Contract(
      getUniswapV3QuoterContractAddress(chainId),
      Quoter.abi,
      getProvider(chainId)
    );
    const poolConstants = await getPoolConstantsOnUniswapV3(inputToken, outputToken);
    
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
    throw new Error(`Thrown at "getQuoteOnUniswapV3": ${error}`);
  }
};

interface PoolInfo {
  token0: string
  token1: string
  fee: bigint
  tickSpacing: bigint
  sqrtPriceX96: bigint
  liquidity: bigint
  tick: bigint
}

const getPoolInfoOnUniswapV3 = async (inputToken: Token, outputToken: Token, poolFee = FeeAmount.MEDIUM): Promise<PoolInfo> => {
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
    throw new Error(`Thrown at "getPoolInfoOnUniswapV3": ${error}`);
  }
};

const getOutputQuoteOnUniswapV3 = async (route: Route<Currency, Currency>, inputAmount: number) => {
  try {
    const inputToken = route.input;
    const chainId = route.chainId;
  
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
    throw new Error(`Thrown at "getOutputQuoteOnUniswapV3": ${error}`);
  }
};

type TokenTrade = Trade<Token, Token, TradeType>;

// RE: https://docs.uniswap.org/sdk/v3/guides/swaps/trading
const createTradeOnUniswapV3 = async (inputToken: Token, outputToken: Token, inputAmount: number, poolFee = FeeAmount.MEDIUM): Promise<TokenTrade> => {
  try {
    const poolInfo = await getPoolInfoOnUniswapV3(inputToken, outputToken, poolFee);

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

    const amountOut = await getOutputQuoteOnUniswapV3(swapRoute, inputAmount);

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
    throw new Error(`Thrown at "createTradeOnUniswapV3": ${error}`);
  }
};

const executeTradeOnUniswapV3 = async (
  trade: TokenTrade,
  slippage: number
): Promise<TransactionReceipt | undefined> => {
  try {
    const chainId = trade.swaps[0].route.chainId;
  
    const wallet = getWallet(chainId);
  
    const options: SwapOptions = {
      slippageTolerance: new Percent(slippage * 100, 10_000), // 50 bips, or 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: wallet.address
    };
  
    const methodParameters = SwapRouter.swapCallParameters([trade], options);
  
    const tx = {
      data: methodParameters.calldata,
      to: getUniswapV3SwapRouterContractAddress(chainId),
      value: methodParameters.value,
      from: wallet.address
    };

    return await sendTransaction(tx, wallet);
  } catch (error) {
    throw new Error(`Thrown at "executeTradeOnUniswapV3": ${error}`);
  }
};

const buyTokensOnUniswapV3 = async (outputToken: Token, inputAmount: number, slippage = 0.5) => {
  try {
    const chainId = outputToken.chainId;
    const WETH = WETH9[chainId];
    if (!WETH) {
      throw new Error('Invalid WETH!');
    }

    await prepareWETH(inputAmount, chainId);

    await approveTokenSpending(WETH, getUniswapV3SwapRouterContractAddress(chainId));

    const trade = await createTradeOnUniswapV3(WETH, outputToken, inputAmount);

    return await executeTradeOnUniswapV3(trade, slippage);
  } catch (error) {
    throw new Error(`Thrown at "buyTokensOnUniswapV3": ${error}`);
  }
};

const sellTokensOnUniswapV3 = async (inputToken: Token, inputAmount: number, slippage = 0.5) => {
  try {
    const chainId = inputToken.chainId;
    const WETH = WETH9[chainId];
    if (!WETH) {
      throw new Error('Invalid WETH!');
    }

    await approveTokenSpending(inputToken, getUniswapV3SwapRouterContractAddress(chainId));

    const trade = await createTradeOnUniswapV3(inputToken, WETH, inputAmount);

    return await executeTradeOnUniswapV3(trade, slippage);
    
    // TODO: might want to unwrap WETH
  } catch (error) {
    throw new Error(`Thrown at "sellTokensOnUniswapV3": ${error}`);
  }
};

const getTradeInfoOnUniswapV3 = async (inputToken: Token, outputToken: Token, inputAmount: number, priceSignificantDigits = 6, priceImpactDecimalPlaces = 2) => {
  try {
    const trade = await createTradeOnUniswapV3(inputToken, outputToken, inputAmount);

    const outputAmount = trade.outputAmount.toExact();

    const priceImpact = trade.priceImpact.toFixed(priceImpactDecimalPlaces);
    
    const executionPrice = trade.executionPrice.toSignificant(priceSignificantDigits);

    return {
      inputAmount,
      outputAmount,
      priceImpact,
      executionPrice
    };
  } catch (error) {
    throw new Error(`Thrown at "getTradeInfoOnUniswapV3": ${error}`);
  }
};

export {
  getQuoteOnUniswapV3,
  buyTokensOnUniswapV3,
  sellTokensOnUniswapV3,
  getTradeInfoOnUniswapV3
};

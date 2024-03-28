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
  Trade,
  SwapOptions,
  SwapRouter
} from '@uniswap/v3-sdk';
import {
  Currency,
  CurrencyAmount,
  TradeType,
  Token,
  Percent
} from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import JSBI from 'jsbi';

import {
  getProvider,
  getSigner,
  TransactionState,
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
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  GAS_LIMIT
} from '@/constants/msc';

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
    throw new Error(`Thrown at "getOutputQuote": ${error}`);
  }
};

type TokenTrade = Trade<Token, Token, TradeType>;

const createTrade = async (inputToken: Token, outputToken: Token, inputAmount: number, poolFee = FeeAmount.MEDIUM): Promise<TokenTrade> => {
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

// ray test touch <
const executeTrade = async (
  trade: TokenTrade
): Promise<TransactionState> => {
  try {
    const chainId = trade.swaps[0].route.chainId;
  
    const signer = getSigner(chainId);
  
    // Give approval to the router to spend the token
    // const tokenApproval = await getTokenTransferApproval(CurrentConfig.tokens.in);
  
    // Fail if transfer approvals do not go through
    // if (tokenApproval !== TransactionState.Sent) {
    //   return TransactionState.Failed
    // }
  
    const options: SwapOptions = {
      slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: signer.address
    };
  
    const methodParameters = SwapRouter.swapCallParameters([trade], options);
  
    const tx = {
      data: methodParameters.calldata,
      to: getUniswapV3SwapRouterContractAddress(chainId),
      value: methodParameters.value,
      from: signer.address,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
      gasLimit: GAS_LIMIT
    };

    console.log('ray : ***** tx => ', tx);
  
    return await sendTransaction(tx, signer);
  } catch (error) {
    throw new Error(`Thrown at "executeTrade": ${error}`);
  }
};
// ray test touch >

export {
  getQuote,
  getPoolInfo,
  createTrade,
  executeTrade
};

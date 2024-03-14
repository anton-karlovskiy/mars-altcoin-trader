import {
  Contract,
  parseUnits,
  TransactionResponse
} from 'ethers';
import {
  ChainId,
  Token,
  CurrencyAmount,
  TradeType,
  Percent
} from '@uniswap/sdk-core';
import {
  Pair,
  Route,
  Trade
} from '@uniswap/v2-sdk';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IUniswapV2ERC20 from '@uniswap/v2-core/build/IUniswapV2ERC20.json';
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';

import { UNISWAP_V2_ROUTER_02_ADDRESS } from '@/constants/addresses';
import {
  getProvider,
  getSigner
} from '@/utils/web3';

const getDecimals = async (tokenAddress: string, chainId: ChainId) => {
  try {
    const provider = getProvider(chainId);

    const tokenContract = new Contract(tokenAddress, IUniswapV2ERC20.abi, provider);
  
    return Number(await tokenContract['decimals']());
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const createToken = async (tokenAddress: string, chainId: ChainId, decimals: number | undefined = undefined) => {
  try {
    if (!decimals) {
      decimals = await getDecimals(tokenAddress, chainId);
    }
  
    return new Token(chainId, tokenAddress, decimals);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const createPair = async (tokenA: Token, tokenB: Token) => {
  try {
    const pairAddress = Pair.getAddress(tokenA, tokenB);

    const provider = getProvider(tokenA.chainId);
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

// baseToken: ETH
// quoteToken: DAI
// The amount of DAI per 1 WETH
// RE: https://docs.uniswap.org/sdk/v2/guides/pricing
// RE: https://docs.uniswap.org/sdk/v2/guides/pricing#direct

// Execution Price
const calculateExePrice = async (baseToken: Token, quoteToken: Token, baseTokenAmount = 1, significantDigits = 6) => {
  try {
    const pair = await createPair(quoteToken, baseToken);

    const route = new Route([pair], baseToken, quoteToken); // Only the direct pair case is considered.
    const baseTokenRawAmount = parseUnits(baseTokenAmount.toString(), baseToken.decimals);
    const trade = new Trade(route, CurrencyAmount.fromRawAmount(baseToken, baseTokenRawAmount.toString()), TradeType.EXACT_INPUT);

    return trade.executionPrice.toSignificant(significantDigits);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

// Mid Price
const calculateMidPrice = async (baseToken: Token, quoteToken: Token, significantDigits = 6) => {
  try {
    const pair = await createPair(quoteToken, baseToken);

    const route = new Route([pair], baseToken, quoteToken); // Only the direct pair case is considered.

    return route.midPrice.toSignificant(significantDigits);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const createTrade = async (inputToken: Token, outputToken: Token, inputAmount: number) => {
  try {
    const pair = await createPair(inputToken, outputToken);
  
    const route = new Route([pair], inputToken, outputToken);
  
    const rawInputAmount = parseUnits(inputAmount.toString(), inputToken.decimals);
  
    return new Trade(route, CurrencyAmount.fromRawAmount(inputToken, rawInputAmount.toString()), TradeType.EXACT_INPUT);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const buyTokens = async (inputToken: Token, outputToken: Token, inputAmount: number, slippage: number = 0.5) => {
  try {
    const trade = await createTrade(inputToken, outputToken, inputAmount);

    const signer = getSigner(inputToken.chainId);
    
    const uniswapV2Router02Contract = new Contract(UNISWAP_V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, signer);
  
    const slippageTolerance = new Percent(slippage * 100, '10000') // 50 bips, or 0.50%
  
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact(); // Needs to be converted to e.g. decimal string
    const path = [inputToken.address, outputToken.address];
    const to = signer.address; // Should be a check-summed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
    const value = trade.inputAmount.toExact() // Needs to be converted to e.g. decimal string

    const transaction: TransactionResponse = await uniswapV2Router02Contract.swapExactETHForTokens(
      parseUnits(amountOutMin, outputToken.decimals),
      path,
      to,
      deadline,
      {
        value: parseUnits(value, inputToken.decimals),
        // RE: https://github.com/ethers-io/ethers.js/discussions/3297#discussioncomment-4074779
        gasPrice: parseUnits("500.0", "gwei"), // Optional: Gas price (in Gwei)
        gasLimit: 210000, // Optional: Gas limit for the transaction
      }
    );

    return await transaction.wait();
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

export {
  getDecimals,
  createPair,
  createToken,
  calculateExePrice,
  calculateMidPrice,
  createTrade,
  buyTokens
};
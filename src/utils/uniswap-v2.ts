import {
  Contract,
  parseUnits,
  TransactionResponse
} from 'ethers';
import {
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
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';

import { getUniswapV2Router02ContractAddress } from '@/constants/addresses';
import {
  getProvider,
  getWallet
} from '@/utils/web3';
import { fromReadableAmount } from '@/utils/conversion';
import { approveTokenSpending } from '@/utils/helpers';

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
    throw new Error(`Thrown at "createPair": ${error}`);
  }
};

// baseToken: ETH
// quoteToken: DAI
// The amount of DAI per 1 WETH
// RE: https://docs.uniswap.org/sdk/v2/guides/pricing
// RE: https://docs.uniswap.org/sdk/v2/guides/pricing#direct

// Execution Price
const calculateExecutionPrice = async (baseToken: Token, quoteToken: Token, baseTokenAmount = 1, significantDigits = 6) => {
  try {
    const pair = await createPair(quoteToken, baseToken);

    const route = new Route([pair], baseToken, quoteToken); // Only the direct pair case is considered.
    const baseTokenRawAmount = fromReadableAmount(baseTokenAmount, baseToken.decimals);
    const trade = new Trade(route, CurrencyAmount.fromRawAmount(baseToken, baseTokenRawAmount.toString()), TradeType.EXACT_INPUT);

    return trade.executionPrice.toSignificant(significantDigits);
  } catch (error) {
    throw new Error(`Thrown at "calculateExePrice": ${error}`);
  }
};

// Mid Price
const calculateMidPrice = async (baseToken: Token, quoteToken: Token, significantDigits = 6) => {
  try {
    const pair = await createPair(quoteToken, baseToken);

    const route = new Route([pair], baseToken, quoteToken); // Only the direct pair case is considered.

    return route.midPrice.toSignificant(significantDigits);
  } catch (error) {
    throw new Error(`Thrown at "calculateMidPrice": ${error}`);
  }
};

const createTrade = async (inputToken: Token, outputToken: Token, inputAmount: number) => {
  try {
    const pair = await createPair(inputToken, outputToken);
  
    const route = new Route([pair], inputToken, outputToken);
  
    const rawInputAmount = fromReadableAmount(inputAmount, inputToken.decimals);
  
    return new Trade(route, CurrencyAmount.fromRawAmount(inputToken, rawInputAmount.toString()), TradeType.EXACT_INPUT);
  } catch (error) {
    throw new Error(`Thrown at "createTrade": ${error}`);
  }
};

// TODO: `swapExactETHForTokens` vs. `swapExactETHForTokensSupportingFeeOnTransferTokens` and `swapExactTokensForETH` vs. `swapExactTokensForETHSupportingFeeOnTransferTokens`
enum UniswapV2Router02Methods {
  SwapExactETHForTokens = 'swapExactETHForTokens',
  SwapExactETHForTokensSupportingFeeOnTransferTokens = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  SwapExactTokensForETH = 'swapExactTokensForETH',
  SwapExactTokensForETHSupportingFeeOnTransferTokens = 'swapExactTokensForETHSupportingFeeOnTransferTokens'
};

const swap = async (inputToken: Token, outputToken: Token, inputAmount: number, slippage: number = 0.5, swapMethod: UniswapV2Router02Methods) => {
  try {
    const trade = await createTrade(inputToken, outputToken, inputAmount);

    const chainId = inputToken.chainId;

    const wallet = getWallet(chainId);

    const uniswapV2Router02Contract = new Contract(getUniswapV2Router02ContractAddress(chainId), IUniswapV2Router02.abi, wallet);

    const slippageTolerance = new Percent(slippage * 100, '10000'); // 50 bips, or 0.50%

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    const path = [inputToken.address, outputToken.address];
    const to = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    let txResponse: TransactionResponse;
    switch (swapMethod) {
      case UniswapV2Router02Methods.SwapExactETHForTokensSupportingFeeOnTransferTokens: // Buy
        const value = trade.inputAmount.toExact();

        txResponse = await uniswapV2Router02Contract.swapExactETHForTokensSupportingFeeOnTransferTokens(
          parseUnits(amountOutMin, outputToken.decimals),
          path,
          to,
          deadline,
          {
            value: parseUnits(value, inputToken.decimals),
            // gasPrice: parseUnits("50.0", "gwei"), // Optional: Gas price (in Gwei)
            // gasLimit: 21000, // Optional: Gas limit for the transaction
          }
        );
        break;
      case UniswapV2Router02Methods.SwapExactTokensForETHSupportingFeeOnTransferTokens: // Sell
        const amountIn = trade.inputAmount.toExact();

        txResponse = await uniswapV2Router02Contract.swapExactTokensForETHSupportingFeeOnTransferTokens(
          parseUnits(amountIn, inputToken.decimals),
          parseUnits(amountOutMin, outputToken.decimals),
          path,
          to,
          deadline,
          {
            // gasPrice: parseUnits("50.0", "gwei"),
            // gasLimit: 21000,
          }
        );
        break;
      default:
        throw new Error('Invalid method!');
    }

    return await txResponse.wait();
  } catch (error) {
    throw new Error(`Thrown at "swap": ${error}`);
  }
};

const buyTokens = async (inputToken: Token, outputToken: Token, inputAmount: number, slippage: number = 0.5) => {
  try {
    return await swap(
      inputToken,
      outputToken,
      inputAmount,
      slippage,
      UniswapV2Router02Methods.SwapExactETHForTokensSupportingFeeOnTransferTokens
    );
  } catch (error) {
    throw new Error(`Thrown at "buyTokens": ${error}`);
  }
};

const sellTokens = async (inputToken: Token, outputToken: Token, inputAmount: number, slippage: number = 0.5) => {
  try {
    await approveTokenSpending(inputToken, getUniswapV2Router02ContractAddress(inputToken.chainId));

    return await swap(
      inputToken,
      outputToken,
      inputAmount,
      slippage,
      UniswapV2Router02Methods.SwapExactTokensForETHSupportingFeeOnTransferTokens
    );
  } catch (error) {
    throw new Error(`Thrown at "sellTokens": ${error}`);
  }
};

const getTradeInfo = async (inputToken: Token, outputToken: Token, inputAmount: number, priceSignificantDigits = 6, priceImpactDecimalPlaces = 2) => {
  try {
    const [
      trade,
      midPrice
    ] = await Promise.all([
      createTrade(inputToken, outputToken, inputAmount),
      calculateMidPrice(inputToken, outputToken, priceSignificantDigits)
    ]);

    // RE: https://docs.uniswap.org/sdk/core/reference/classes/CurrencyAmount
    // RE: https://docs.uniswap.org/sdk/v2/reference/trade#outputamount
    const outputAmount = trade.outputAmount.toExact();

    // RE: https://docs.uniswap.org/sdk/v2/reference/trade#priceimpact
    const priceImpact = trade.priceImpact.toFixed(priceImpactDecimalPlaces);
    
    const executionPrice = trade.executionPrice.toSignificant(priceSignificantDigits);

    return {
      outputAmount,
      priceImpact,
      executionPrice,
      midPrice
    };
  } catch (error) {
    throw new Error(`Thrown at "getTradeInfo": ${error}`);
  }
};

export {
  createPair,
  calculateExecutionPrice,
  calculateMidPrice,
  createTrade,
  buyTokens,
  sellTokens,
  getTradeInfo
};
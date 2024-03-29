import {
  Contract,
  ContractTransaction,
  parseUnits
} from 'ethers';
import {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
  WETH9
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
  getWallet,
  sendTransaction
} from '@/utils/web3';
import { fromReadableAmount } from '@/utils/conversion';
import { approveTokenSpending } from '@/utils/helpers';

const createPairOnUniswapV2 = async (tokenA: Token, tokenB: Token) => {
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
    throw new Error(`Thrown at "createPairOnUniswapV2": ${error}`);
  }
};

// baseToken: ETH
// quoteToken: DAI
// The amount of DAI per 1 WETH
// RE: https://docs.uniswap.org/sdk/v2/guides/pricing
// RE: https://docs.uniswap.org/sdk/v2/guides/pricing#direct

// Execution Price
const calculateExecutionPriceOnUniswapV2 = async (baseToken: Token, quoteToken: Token, baseTokenAmount = 1, significantDigits = 6) => {
  try {
    const pair = await createPairOnUniswapV2(quoteToken, baseToken);

    const route = new Route([pair], baseToken, quoteToken); // Only the direct pair case is considered.
    const baseTokenRawAmount = fromReadableAmount(baseTokenAmount, baseToken.decimals);
    const trade = new Trade(route, CurrencyAmount.fromRawAmount(baseToken, baseTokenRawAmount.toString()), TradeType.EXACT_INPUT);

    return trade.executionPrice.toSignificant(significantDigits);
  } catch (error) {
    throw new Error(`Thrown at "calculateExecutionPriceOnUniswapV2": ${error}`);
  }
};

// Mid Price
const calculateMidPriceOnUniswapV2 = async (baseToken: Token, quoteToken: Token, significantDigits = 6) => {
  try {
    const pair = await createPairOnUniswapV2(quoteToken, baseToken);

    const route = new Route([pair], baseToken, quoteToken); // Only the direct pair case is considered.

    return route.midPrice.toSignificant(significantDigits);
  } catch (error) {
    throw new Error(`Thrown at "calculateMidPriceOnUniswapV2": ${error}`);
  }
};

const createTradeOnUniswapV2 = async (inputToken: Token, outputToken: Token, inputAmount: number) => {
  try {
    const pair = await createPairOnUniswapV2(inputToken, outputToken);
  
    const route = new Route([pair], inputToken, outputToken);
  
    const rawInputAmount = fromReadableAmount(inputAmount, inputToken.decimals);
  
    return new Trade(route, CurrencyAmount.fromRawAmount(inputToken, rawInputAmount.toString()), TradeType.EXACT_INPUT);
  } catch (error) {
    throw new Error(`Thrown at "createTradeOnUniswapV2": ${error}`);
  }
};

// TODO: `swapExactETHForTokens` vs. `swapExactETHForTokensSupportingFeeOnTransferTokens` and `swapExactTokensForETH` vs. `swapExactTokensForETHSupportingFeeOnTransferTokens`
enum UniswapV2Router02Methods {
  SwapExactETHForTokens = 'swapExactETHForTokens',
  SwapExactETHForTokensSupportingFeeOnTransferTokens = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  SwapExactTokensForETH = 'swapExactTokensForETH',
  SwapExactTokensForETHSupportingFeeOnTransferTokens = 'swapExactTokensForETHSupportingFeeOnTransferTokens'
};

// TODO: inputToken | outputToken will be explicit (ETH)
const swapOnUniswapV2 = async (inputToken: Token, outputToken: Token, inputAmount: number, slippage: number = 0.5, swapMethod: UniswapV2Router02Methods) => {
  try {
    const trade = await createTradeOnUniswapV2(inputToken, outputToken, inputAmount);

    const chainId = inputToken.chainId;

    const wallet = getWallet(chainId);

    const uniswapV2Router02Contract = new Contract(getUniswapV2Router02ContractAddress(chainId), IUniswapV2Router02.abi, wallet);

    const slippageTolerance = new Percent(slippage * 100, '10000'); // 50 bips, or 0.50%

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    const path = [inputToken.address, outputToken.address];
    const to = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    let tx: ContractTransaction;
    switch (swapMethod) {
      case UniswapV2Router02Methods.SwapExactETHForTokensSupportingFeeOnTransferTokens: // Buy
        const value = trade.inputAmount.toExact();

        tx = await uniswapV2Router02Contract.swapExactETHForTokensSupportingFeeOnTransferTokens.populateTransaction(
          parseUnits(amountOutMin, outputToken.decimals),
          path,
          to,
          deadline,
          {
            value: parseUnits(value, inputToken.decimals)
          }
        );
        break;
      case UniswapV2Router02Methods.SwapExactTokensForETHSupportingFeeOnTransferTokens: // Sell
        const amountIn = trade.inputAmount.toExact();

        tx = await uniswapV2Router02Contract.swapExactTokensForETHSupportingFeeOnTransferTokens.populateTransaction(
          parseUnits(amountIn, inputToken.decimals),
          parseUnits(amountOutMin, outputToken.decimals),
          path,
          to,
          deadline
        );
        break;
      default:
        throw new Error('Invalid method!');
    }

    return await sendTransaction({
      ...tx,
      from: wallet.address
    }, wallet);
  } catch (error) {
    throw new Error(`Thrown at "swapOnUniswapV2": ${error}`);
  }
};

const buyTokensOnUniswapV2 = async (outputToken: Token, inputAmount: number, slippage: number = 0.5) => {
  try {
    const chainId = outputToken.chainId;
    const WETH = WETH9[chainId];
    if (!WETH) {
      throw new Error('Invalid WETH!');
    }

    return await swapOnUniswapV2(
      WETH,
      outputToken,
      inputAmount,
      slippage,
      UniswapV2Router02Methods.SwapExactETHForTokensSupportingFeeOnTransferTokens
    );
  } catch (error) {
    throw new Error(`Thrown at "buyTokensOnUniswapV2": ${error}`);
  }
};

const sellTokensOnUniswapV2 = async (inputToken: Token, inputAmount: number, slippage: number = 0.5) => {
  try {
    const chainId = inputToken.chainId;
    const WETH = WETH9[chainId];
    if (!WETH) {
      throw new Error('Invalid WETH!');
    }

    await approveTokenSpending(inputToken, getUniswapV2Router02ContractAddress(inputToken.chainId));

    return await swapOnUniswapV2(
      inputToken,
      WETH,
      inputAmount,
      slippage,
      UniswapV2Router02Methods.SwapExactTokensForETHSupportingFeeOnTransferTokens
    );
  } catch (error) {
    throw new Error(`Thrown at "sellTokensOnUniswapV2": ${error}`);
  }
};

const getTradeInfoOnUniswapV2 = async (inputToken: Token, outputToken: Token, inputAmount: number, priceSignificantDigits = 6, priceImpactDecimalPlaces = 2) => {
  try {
    const [
      trade,
      midPrice
    ] = await Promise.all([
      createTradeOnUniswapV2(inputToken, outputToken, inputAmount),
      calculateMidPriceOnUniswapV2(inputToken, outputToken, priceSignificantDigits)
    ]);

    // RE: https://docs.uniswap.org/sdk/core/reference/classes/CurrencyAmount
    // RE: https://docs.uniswap.org/sdk/v2/reference/trade#outputamount
    const outputAmount = trade.outputAmount.toExact();

    // RE: https://docs.uniswap.org/sdk/v2/reference/trade#priceimpact
    const priceImpact = trade.priceImpact.toFixed(priceImpactDecimalPlaces);
    
    const executionPrice = trade.executionPrice.toSignificant(priceSignificantDigits);

    return {
      inputAmount,
      outputAmount,
      priceImpact,
      executionPrice,
      midPrice
    };
  } catch (error) {
    throw new Error(`Thrown at "getTradeInfoOnUniswapV2": ${error}`);
  }
};

export {
  calculateExecutionPriceOnUniswapV2,
  calculateMidPriceOnUniswapV2,
  buyTokensOnUniswapV2,
  sellTokensOnUniswapV2,
  getTradeInfoOnUniswapV2
};
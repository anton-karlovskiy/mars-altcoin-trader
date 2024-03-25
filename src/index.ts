import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9,
  Currency,
  CurrencyAmount,
  TradeType
} from '@uniswap/sdk-core';
import {
  FeeAmount,
  Pool,
  Route,
  SwapQuoter,
  Trade
} from '@uniswap/v3-sdk';
import { AbiCoder } from 'ethers';
import JSBI from 'jsbi';

import {
  buyTokens,
  sellTokens,
  getTradeInfo
} from '@/utils/uniswap-v2';
import { createToken } from '@/utils/helpers';
import {
  USDC_TOKEN,
  WETH_TOKEN
} from '@/constants/tokens';
import { getUniswapV3QuoterV2ContractAddress } from '@/constants/addresses';
import {
  getPoolInfo,
  getQuote
} from '@/utils/uniswap-v3';
import { getProvider } from '@/utils/web3';
import { fromReadableAmount } from '@/utils/conversion';

// ray test touch <
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
// ray test touch >

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6b175474e89094c44da98b954eedeac495271d0f', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

  const tradeInfo = await getTradeInfo(WETH, DAI, 1000);
  console.log('tradeInfo:', tradeInfo);

  // const txReceipt = await buyTokens(WETH, DAI, 0.001, 0.5);
  // console.log('TX receipt:', txReceipt);

  // const txReceipt = await sellTokens(DAI, WETH, 0.4, 0.5);
  // console.log('TX receipt:', txReceipt);

  const quote = await getQuote(WETH_TOKEN, USDC_TOKEN, 1); // TODO: quote for WETH -> USDC is misleading
  console.log('quote:', quote);

  // ray test touch <
  const poolFee = FeeAmount.MEDIUM;
  const inputToken = WETH_TOKEN;
  const outputToken = USDC_TOKEN;
  const inputAmount = 0.001;

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

  const uncheckedTrade = Trade.createUncheckedTrade({
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

  console.log('ray : ***** uncheckedTrade => ', uncheckedTrade);
  // ray test touch >
};

main();

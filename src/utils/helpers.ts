import {
  JsonRpcProvider,
  Network,
  Contract,
  parseUnits,
  Wallet
} from 'ethers';
import {
  ChainId,
  Token,
  CurrencyAmount,
  TradeType
} from '@uniswap/sdk-core';
import {
  Pair,
  Route,
  Trade
} from '@uniswap/v2-sdk';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IUniswapV2ERC20 from '@uniswap/v2-core/build/IUniswapV2ERC20.json';

import {
  INFURA_API_KEY,
  WALLET_ACCOUNT_PRIVATE_KEY
} from '@/config/keys';

const getProvider = (chainId: ChainId) => {
  if (!INFURA_API_KEY) {
    throw new Error('Infura API key is undefined!');
  }

  let infuraEndpoint: string;

  switch (chainId) {
    case ChainId.MAINNET:
      infuraEndpoint = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
      break;
    // ray test touch <
    case ChainId.GOERLI:
      infuraEndpoint = `https://goerli.infura.io/v3/${INFURA_API_KEY}`;
      break;
    // ray test touch >
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

// ray test touch <
const getSigner = (chainId: ChainId) => {
  if (!WALLET_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Wallet account private key is undefined!');
  }

  const provider = getProvider(chainId);

  return new Wallet(WALLET_ACCOUNT_PRIVATE_KEY, provider);
};
// ray test touch >

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
    console.log('Hi createToken');
    if (!decimals) {
      decimals = await getDecimals(tokenAddress, chainId);
    }
    console.log('ray : ***** decimals => ', decimals);
  
    return new Token(chainId, tokenAddress, decimals);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
};

const createPair = async (tokenA: Token, tokenB: Token) => {
  try {
    const pairAddress = Pair.getAddress(tokenA, tokenB);
    console.log('ray : ***** pairAddress => ', pairAddress);

    const provider = getProvider(tokenA.chainId);
    const pairContract = new Contract(pairAddress, IUniswapV2Pair.abi, provider);
    console.log('Hi createPair');
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
    console.log('Hi calculateExePrice');
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
    console.log('Hi calculateMidPrice');
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

export {
  getProvider,
  getDecimals,
  createPair,
  createToken,
  calculateExePrice,
  calculateMidPrice,
  createTrade,
  getSigner
};
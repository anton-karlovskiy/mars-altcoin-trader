import * as dotenv from 'dotenv';
dotenv.config();

import {
  ChainId,
  WETH9
} from '@uniswap/sdk-core';
// ray test touch <
import { VersionedTransaction } from '@solana/web3.js';
// ray test touch >

import {
  buyTokensOnUniswapV2,
  sellTokensOnUniswapV2,
  getTradeInfoOnUniswapV2
} from '@/utils/uniswap/v2-sdk';
import { createToken } from '@/utils/uniswap/helpers';
import {
  USDC_TOKEN,
  WETH_TOKEN
} from '@/constants/uniswap/tokens';
// ray test touch <
import {
  SOL_ADDRESS,
  USDC_ADDRESS
} from '@/constants/radium/tokens';
// ray test touch >
import {
  getQuoteOnUniswapV3,
  buyTokensOnUniswapV3,
  sellTokensOnUniswapV3,
  getTradeInfoOnUniswapV3
} from '@/utils/uniswap/v3-sdk';
// ray test touch <
import { RaydiumSwap } from '@/utils/radium/sdk';
import {
  SOLANA_NODE_JSON_RPC_ENDPOINT,
  SOLANA_WALLET_ACCOUNT_PRIVATE_KEY
} from '@/config/keys';
import {
  SWAP_MAX_LAMPORTS,
  SWAP_LIQUIDITY_FILE,
  SWAP_MAX_RETRIES,
  SWAP_EXECUTE
} from '@/config/radium/swap';
// ray test touch >

const main = async () => {
  const targetChainId = ChainId.MAINNET;

  const DAI = await createToken('0x6b175474e89094c44da98b954eedeac495271d0f', targetChainId);
  const WETH = WETH9[targetChainId];
  if (!WETH) {
    throw new Error('Invalid WETH!');
  }

  const tradeInfoOnUniswapV2 = await getTradeInfoOnUniswapV2(WETH, DAI, 1000);
  console.log('Trade info on Uniswap V2:', tradeInfoOnUniswapV2);

  // const txReceipt = await buyTokensOnUniswapV2(DAI, 0.0001, 0.5);
  // console.log('Buy TX receipt on Uniswap V2:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV2(DAI, 0.01, 0.5);
  // console.log('Sell TX receipt on Uniswap V2:', txReceipt);

  const quote = await getQuoteOnUniswapV3(WETH_TOKEN, USDC_TOKEN, 1); // TODO: quote for WETH -> USDC is misleading
  console.log('quote on Uniswap V3:', quote);

  // const txReceipt = await buyTokensOnUniswapV3(USDC_TOKEN, 0.00001, 0.5);
  // console.log('Buy TX receipt on Uniswap V3:', txReceipt);
  // const txReceipt = await sellTokensOnUniswapV3(USDC_TOKEN, 0.01, 0.5);
  // console.log('Sell TX receipt on Uniswap V3:', txReceipt);

  const tradeInfoOnUniswapV3 = await getTradeInfoOnUniswapV3(WETH, DAI, 1000);
  console.log('Trade info on Uniswap V3:', tradeInfoOnUniswapV3);

  // ray test touch <
  const inputTokenAddress = SOL_ADDRESS;
  const outputTokenAddress = USDC_ADDRESS;
  const inputAmount = 0.01;

  /**
   * The RaydiumSwap instance for handling swaps.
   */
  const raydiumSwap = new RaydiumSwap(SOLANA_NODE_JSON_RPC_ENDPOINT, SOLANA_WALLET_ACCOUNT_PRIVATE_KEY);
  console.log(`Raydium swap initialized`);
  console.log(`Swapping ${inputAmount} of ${inputTokenAddress} for ${outputTokenAddress}...`);

  /**
   * Load pool keys from the Raydium API to enable finding pool information.
   */
  await raydiumSwap.loadPoolKeys(SWAP_LIQUIDITY_FILE);
  console.log(`Loaded pool keys`);

  /**
   * Find pool information for the given token pair.
   */
  const poolInfo = raydiumSwap.findPoolInfoForTokens(inputTokenAddress, outputTokenAddress);
  console.log('Found pool info:', poolInfo);

  if (!poolInfo) {
    throw new Error('No pool!');
  }

  /**
   * Prepare the swap transaction with the given parameters.
   */
  const tx = await raydiumSwap.getSwapTransaction(
    outputTokenAddress,
    inputAmount,
    poolInfo,
    SWAP_MAX_LAMPORTS
  );

  /**
   * Depending on the configuration, execute or simulate the swap.
   */
  if (SWAP_EXECUTE) {
    /**
     * Send the transaction to the network and log the transaction ID.
     */
    const txId = await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction, SWAP_MAX_RETRIES);

    console.log(`https://solscan.io/tx/${txId}`);

  } else {
    /**
     * Simulate the transaction and log the result.
     */
    const simRes = await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction);

    console.log(simRes);
  }
  // ray test touch >
};

main();

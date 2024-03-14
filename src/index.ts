import {
  ChainId,
  WETH9,
  Percent
} from '@uniswap/sdk-core';
import {
  Contract,
  parseUnits
} from 'ethers';

import {
  createToken,
  calculateExePrice,
  calculateMidPrice,
  createTrade,
  getSigner
} from '@/utils/helpers';
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';

import { UNISWAP_V2_ROUTER_02_ADDRESS } from '@/constants/addresses';

const main = async () => {
  const targetChainId = ChainId.GOERLI;

  const DAI = await createToken('0x3ee54fa122f884ab89c39b2d7b1a0c40e426a9a9', targetChainId);
  const WETH = WETH9[targetChainId];

  const exePrice = await calculateExePrice(WETH, DAI, 0.1, 10);
  console.log('Execution Price:', exePrice);

  const midPrice = await calculateMidPrice(WETH, DAI, 10);
  console.log('Mid Price', midPrice);

  const trade = await createTrade(WETH, DAI, 0.01);
  // console.log(trade.executionPrice.quote(CurrencyAmount.fromRawAmount(WETH, '2000000000000000000')).toExact());

  // ray test touch <
  try {
    const signer = getSigner(targetChainId);
    
    const uniswapV2Router02Contract = new Contract(UNISWAP_V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, signer);
  
    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%
  
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact(); // Needs to be converted to e.g. decimal string
    const path = [WETH9[DAI.chainId].address, DAI.address];
    const to = signer.address; // Should be a check-summed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
    const value = trade.inputAmount.toExact() // Needs to be converted to e.g. decimal string

    const transaction = await uniswapV2Router02Contract.swapExactETHForTokens(
      parseUnits(amountOutMin, DAI.decimals),
      path,
      to,
      deadline,
      {
        value: parseUnits(value, WETH.decimals),
        // RE: https://github.com/ethers-io/ethers.js/discussions/3297#discussioncomment-4074779
        gasPrice: parseUnits("500.0", "gwei"), // Optional: Gas price (in Gwei)
        gasLimit: 210000, // Optional: Gas limit for the transaction
      }
    );

    const transactionReceipt = await transaction.wait();
    console.log(transactionReceipt);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
  // ray test touch >
};

main();

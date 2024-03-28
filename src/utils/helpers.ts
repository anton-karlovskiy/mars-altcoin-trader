import { Contract } from 'ethers';
import {
  ChainId,
  Token
} from '@uniswap/sdk-core';
import IUniswapV2ERC20 from '@uniswap/v2-core/build/IUniswapV2ERC20.json';

import {
  getProvider,
  getWallet,
  sendTransaction
} from '@/utils/web3';
import {
  WETH_ABI,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS
} from '@/constants/msc';
import { getWethContractAddress } from '@/constants/addresses';
import { fromReadableAmount } from '@/utils/conversion';

const getDecimals = async (tokenAddress: string, chainId: ChainId) => {
  try {
    const provider = getProvider(chainId);

    const tokenContract = new Contract(tokenAddress, IUniswapV2ERC20.abi, provider);
  
    return Number(await tokenContract['decimals']());
  } catch (error) {
    throw new Error(`Thrown at "getDecimals": ${error}`);
  }
};

const createToken = async (address: string, chainId: ChainId, decimals: number | undefined = undefined, symbol = '', name = '') => {
  try {
    if (!decimals) {
      decimals = await getDecimals(address, chainId);
    }
  
    return new Token(chainId, address, decimals, symbol, name);
  } catch (error) {
    throw new Error(`Thrown at "createToken": ${error}`);
  }
};

// RE: https://stackoverflow.com/questions/71289482/doing-uniswap-v3-swaps-with-native-eth
const wrapETH = async (amount: number, chainId: ChainId) => {
  const wallet = getWallet(chainId);
  const wethContractAddress = getWethContractAddress(chainId);

  const wethContract = new Contract(
    wethContractAddress,
    WETH_ABI,
    wallet.provider
  );

  const transaction = {
    data: wethContract.interface.encodeFunctionData('deposit'),
    value: fromReadableAmount(amount, 18),
    from: wallet.address,
    to: wethContractAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
  };

  return await sendTransaction(transaction, wallet);
};

export {
  getDecimals,
  createToken,
  wrapETH
};
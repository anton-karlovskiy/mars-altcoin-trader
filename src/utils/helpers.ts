import {
  Contract,
  TransactionReceipt,
  MaxUint256
} from 'ethers';
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
import { WETH_ABI } from '@/constants/msc';
import { getWethContractAddress } from '@/constants/addresses';
import {
  fromReadableAmount,
  toReadableAmount
} from '@/utils/conversion';

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
const wrapETH = async (rawAmount: bigint, chainId: ChainId): Promise<TransactionReceipt> => {
  try {
    const wallet = getWallet(chainId);
    const wethContractAddress = getWethContractAddress(chainId);
  
    const wethContract = new Contract(
      wethContractAddress,
      WETH_ABI,
      wallet.provider
    );
  
    const transaction = {
      data: wethContract.interface.encodeFunctionData('deposit'),
      value: rawAmount,
      from: wallet.address,
      to: wethContractAddress
    };
  
    return await sendTransaction(transaction, wallet);
  } catch (error) {
    throw new Error(`Thrown at "wrapETH": ${error}`);
  }
};

const getTokenBalance = async (tokenAddress: string, chainId: ChainId, walletAddress: string): Promise<bigint> => {
  try {
    const provider = getProvider(chainId);
    const tokenContract = new Contract(tokenAddress, IUniswapV2ERC20.abi, provider);

    return await tokenContract.balanceOf(walletAddress);
  } catch (error) {
    throw new Error(`Thrown at "getTokenBalance": ${error}`);
  }
};

const prepareWETH = async (amount: number, chainId: ChainId) => {
  try {
    const wethContractAddress = getWethContractAddress(chainId);
    const wallet = getWallet(chainId);
    const remainingWeth = await getTokenBalance(wethContractAddress, chainId, wallet.address);
  
    const neededWeth = fromReadableAmount(amount, 18);
  
    if (remainingWeth >= neededWeth) {
      console.log('The wallet has enough WETH balance.');
      return;
    }
  
    const deltaWeth = neededWeth - remainingWeth;
  
    return wrapETH(deltaWeth, chainId);
  } catch (error) {
    throw new Error(`Thrown at "prepareWETH": ${error}`);
  }
};

const approveTokenSpending = async (
  token: Token,
  spenderAddress: string,
  approvalAmount = MaxUint256 // Allow maximum token spend (can be adjusted)
): Promise<TransactionReceipt | undefined> => {
  try {
    const chainId = token.chainId;
  
    const wallet = getWallet(chainId);
  
    const tokenContract = new Contract(token.address, IUniswapV2ERC20.abi, wallet);
  
    const currentAllowance: bigint = await tokenContract.allowance(wallet.address, spenderAddress);
  
    if (currentAllowance < approvalAmount) {
      const tx = await tokenContract.approve.populateTransaction(spenderAddress, approvalAmount);

      const txReceipt = await sendTransaction({
        ...tx,
        from: wallet.address
      }, wallet);

      console.log('Approve tx hash:', txReceipt.hash);
      return txReceipt;
    } else {
      console.log('The spender has been approved:', toReadableAmount(approvalAmount, token.decimals));
    }
  } catch (error) {
    throw new Error(`Thrown at "approveTokenSpending": ${error}`);
  }
};

export {
  getDecimals,
  createToken,
  prepareWETH,
  approveTokenSpending
};
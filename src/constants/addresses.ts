import { ChainId } from '@uniswap/sdk-core';

const getUniswapV2Router02Address = (chainId: ChainId) => {
  let uniswapV2Router02Address: string;

  switch (chainId) {
    case ChainId.MAINNET:
      uniswapV2Router02Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
      break;
    case ChainId.GOERLI:
      uniswapV2Router02Address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
      break;
    case ChainId.SEPOLIA:
      uniswapV2Router02Address = '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008'; // RE: https://ethereum.stackexchange.com/questions/150654/uniswap-v2-router-factory-on-sepolia-test-network
      break;
    default:
      throw new Error('Invalid blockchain network!');
  }

  return uniswapV2Router02Address;
};

export {
  getUniswapV2Router02Address
};
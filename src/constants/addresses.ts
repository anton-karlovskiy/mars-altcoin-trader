import {
  // QUOTER_ADDRESSES,
  // V2_ROUTER_ADDRESSES,
  // V3_CORE_FACTORY_ADDRESSES,
  ChainId
} from '@uniswap/sdk-core';

// RE: https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments
const getUniswapV2Router02ContractAddress = (chainId: ChainId) => {
  // return V2_ROUTER_ADDRESSES[chainId];
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.GOERLI:
      return '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    case ChainId.SEPOLIA:
      // RE: https://ethereum.stackexchange.com/questions/150654/uniswap-v2-router-factory-on-sepolia-test-network
      // RE: https://github.com/Uniswap/docs/issues/640
      return '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
    default:
      throw new Error(`Uniswap V2 router02 contract address is not set on this chain: ${chainId}!`);
  }
};

// RE: https://docs.uniswap.org/contracts/v3/reference/deployments

const getUniswapV3PoolFactoryContractAddress = (chainId: ChainId) => {
  // return V3_CORE_FACTORY_ADDRESSES[chainId];
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.GOERLI:
      return '0x1F98431c8aD98523631AE4a59f267346ea31F984';
    default:
      throw new Error(`Uniswap V3 pool factory contract address is not set on this chain: ${chainId}!`);
  }
};

const getUniswapV3QuoterContractAddress = (chainId: ChainId) => {
  // return QUOTER_ADDRESSES[chainId];
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.GOERLI:
      return '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
    default:
      throw new Error(`Uniswap V3 quoter contract address is not set on this chain: ${chainId}!`);
  }
};

// ray test touch <
const getUniswapV3QuoterV2ContractAddress = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.GOERLI:
      return '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
    default:
      throw new Error(`Uniswap V3 quoter V2 contract address is not set on this chain: ${chainId}!`);
  }
};
// ray test touch >

export {
  getUniswapV2Router02ContractAddress,
  getUniswapV3PoolFactoryContractAddress,
  getUniswapV3QuoterContractAddress,
  getUniswapV3QuoterV2ContractAddress
};
import {
  JsonRpcProvider,
  Network,
  Wallet
} from 'ethers';
import { ChainId } from '@uniswap/sdk-core';

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
    case ChainId.GOERLI:
      infuraEndpoint = `https://goerli.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case ChainId.SEPOLIA:
      infuraEndpoint = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case ChainId.ARBITRUM_ONE:
      infuraEndpoint = `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`;
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

const getSigner = (chainId: ChainId) => {
  if (!WALLET_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Wallet account private key is undefined!');
  }

  const provider = getProvider(chainId);

  return new Wallet(WALLET_ACCOUNT_PRIVATE_KEY, provider);
};

export {
  getProvider,
  getSigner
}
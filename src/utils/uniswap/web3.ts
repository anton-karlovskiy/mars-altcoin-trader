import {
  JsonRpcProvider,
  Network,
  Wallet,
  TransactionRequest,
  TransactionReceipt
} from 'ethers';
import { ChainId } from '@uniswap/sdk-core';

import {
  INFURA_API_KEY,
  WALLET_ACCOUNT_PRIVATE_KEY
} from '@/config/keys';

const wallets: { [chainId: string]: Wallet } = {};
const providers: { [chainId: string]: JsonRpcProvider } = {};

const getWallet = (chainId: ChainId): Wallet => {
  if (!wallets[chainId]) {
    wallets[chainId] = createWallet(chainId);
  }
  return wallets[chainId];
};

const getProvider = (chainId: ChainId): JsonRpcProvider => {
  if (!providers[chainId]) {
    providers[chainId] = createProvider(chainId);
  }
  return providers[chainId];
};

// enum TransactionState {
//   Failed = 'Failed',
//   New = 'New',
//   Rejected = 'Rejected',
//   Sending = 'Sending',
//   Sent = 'Sent',
// }

const sendTransaction = async (
  transaction: TransactionRequest,
  wallet: Wallet
): Promise<TransactionReceipt> => {
  try {
    if (transaction.value) {
      transaction.value = BigInt(transaction.value);
    }
    const txResponse = await wallet.sendTransaction(transaction);
  
    let txReceipt: TransactionReceipt | null = null;
    const provider = wallet.provider;
    if (!provider) {
      throw new Error('Something went wrong!');
    }
  
    while (txReceipt === null) {
      txReceipt = await provider.getTransactionReceipt(txResponse.hash);

      if (txReceipt === null) {
        continue;
      }
    }
  
    return txReceipt;
  } catch (error) {
    throw new Error(`Thrown at "sendTransaction": ${error}`);
  }
};

// Internal functionality

const createProvider = (chainId: ChainId) => {
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

  const provider = new JsonRpcProvider(
    infuraEndpoint,
    // RE: https://github.com/ethers-io/ethers.js/issues/4377#issuecomment-1837559329
    Network.from(chainId),
    { staticNetwork: true }
  );
  if (!provider) {
    throw new Error('Cannot execute a trade without a connected wallet!');
  }

  return provider;
};

const createWallet = (chainId: ChainId): Wallet => {
  if (!WALLET_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Wallet account private key is undefined!');
  }

  const provider = getProvider(chainId);

  return new Wallet(WALLET_ACCOUNT_PRIVATE_KEY, provider);
};

export {
  getProvider,
  getWallet,
  sendTransaction
};
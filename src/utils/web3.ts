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

// TODO:
// signer -> wallet
// getSigner -> createWallet
// wallet.provider -> getSigner
const getSigner = (chainId: ChainId) => {
  if (!WALLET_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Wallet account private key is undefined!');
  }

  const provider = getProvider(chainId);

  return new Wallet(WALLET_ACCOUNT_PRIVATE_KEY, provider);
};

// ray test touch <
enum TransactionState {
  Failed = 'Failed',
  New = 'New',
  Rejected = 'Rejected',
  Sending = 'Sending',
  Sent = 'Sent',
}

const sendTransaction = async (
  transaction: TransactionRequest,
  signer: Wallet
): Promise<TransactionState> => {
  try {
    if (transaction.value) {
      transaction.value = BigInt(transaction.value);
    }
    const txResponse = await signer.sendTransaction(transaction);
    console.log('ray : ***** txResponse => ', txResponse);
  
    let txReceipt: TransactionReceipt | null = null;
    const provider = signer.provider;
    if (!provider) {
      return TransactionState.Failed;
    }
  
    while (txReceipt === null) {
      try {
        txReceipt = await provider.getTransactionReceipt(txResponse.hash);
  
        if (txReceipt === null) {
          continue;
        }
      } catch (error) {
        console.log('Receipt error:', error);
        break;
      }
    }
    console.log('ray : ***** txReceipt => ', txReceipt);
  
    // Transaction was successful if status === 1
    if (txReceipt) {
      return TransactionState.Sent;
    } else {
      return TransactionState.Failed;
    }
  } catch (error) {
    throw new Error(`Thrown at "sendTransaction": ${error}`);
  }
};
// ray test touch >

export {
  getProvider,
  getSigner,
  sendTransaction,
  TransactionState
}
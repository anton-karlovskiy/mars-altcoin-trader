import {
  JsonRpcProvider,
  Network
} from 'ethers';

const getProvider = (): JsonRpcProvider => {
  const INFURA_API_KEY = '529882cf33164ad9b6d20b276b8f9a71'; // TODO: process.env.INFURA_API_KEY
  const network = 1; // TODO: hardcoded
  let provider: JsonRpcProvider;

  if (INFURA_API_KEY) {
    provider =
      new JsonRpcProvider(
        `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
        // RE: https://github.com/ethers-io/ethers.js/issues/4377#issuecomment-1837559329
        Network.from(network),
        { staticNetwork: true }
      );
  } else {
    throw new Error('Something went wrong!');
  }

  return provider;
}

export {
  getProvider
};
const SWAP_MAX_LAMPORTS = 1500000; // Micro lamports for priority fee

const SWAP_LIQUIDITY_FILE = 'https://api.raydium.io/v2/sdk/liquidity/mainnet.json';

const SWAP_MAX_RETRIES = 20;

const SWAP_EXECUTE = false; // Send tx when true, simulate tx when false

export {
  SWAP_MAX_LAMPORTS,
  SWAP_LIQUIDITY_FILE,
  SWAP_MAX_RETRIES,
  SWAP_EXECUTE
};
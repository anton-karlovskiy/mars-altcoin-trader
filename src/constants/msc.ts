const MAX_FEE_PER_GAS = 100000000000;
const MAX_PRIORITY_FEE_PER_GAS = 100000000000;
const GAS_LIMIT = 500000;

const WETH_ABI = [
  // Wrap ETH
  'function deposit() payable',

  // Unwrap ETH
  'function withdraw(uint wad) public',
];

export {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  GAS_LIMIT,
  WETH_ABI
};
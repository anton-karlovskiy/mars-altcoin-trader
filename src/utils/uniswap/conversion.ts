import {
  parseUnits,
  formatUnits
} from 'ethers';

function fromReadableAmount(
  amount: number,
  decimals: number
): bigint {
  return parseUnits(amount.toString(), decimals);
}

function toReadableAmount(rawAmount: bigint, decimals: number): string {
  return formatUnits(rawAmount, decimals);
}

export {
  fromReadableAmount,
  toReadableAmount
};
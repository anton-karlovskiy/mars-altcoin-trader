import {
  parseUnits,
  formatUnits
} from 'ethers';

const READABLE_FORM_LEN = 4;

function fromReadableAmount(
  amount: number,
  decimals: number
): bigint {
  return parseUnits(amount.toString(), decimals);
}

function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}

export {
  fromReadableAmount,
  toReadableAmount
};
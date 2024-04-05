// ray test touch <
import { Connection, PublicKey } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  // TokenAccount,
  // SPL_ACCOUNT_LAYOUT,
  LIQUIDITY_STATE_LAYOUT_V4,
} from "@raydium-io/raydium-sdk";
// import { OpenOrders } from "@project-serum/serum";
import BN from "bn.js";

import { SOLANA_NODE_JSON_RPC_ENDPOINT } from '@/config/keys';

// async function getTokenAccounts(connection: Connection, owner: PublicKey) {
//   const tokenResp = await connection.getTokenAccountsByOwner(owner, {
//     programId: TOKEN_PROGRAM_ID,
//   });
//   const accounts: TokenAccount[] = [];
//   for (const { pubkey, account } of tokenResp.value) {
//     accounts.push({
//       pubkey,
//       accountInfo: SPL_ACCOUNT_LAYOUT.decode(account.data),
//     });
//   }
//   return accounts;
// }

// raydium pool id can get from api: https://api.raydium.io/v2/sdk/liquidity/mainnet.json
const SOL_USDC_POOL_ID = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2";
// const OPENBOOK_PROGRAM_ID = new PublicKey(
//   "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
// );

async function parsePoolInfo() {
  const connection = new Connection(SOLANA_NODE_JSON_RPC_ENDPOINT, "confirmed");
  // const owner = new PublicKey("VnxDzsZ7chE88e9rB6UKztCt2HUwrkgCTx8WieWf5mM");

  // const tokenAccounts = await getTokenAccounts(connection, owner);

  // example to get pool info
  const info = await connection.getAccountInfo(new PublicKey(SOL_USDC_POOL_ID));
  if (!info) return;

  const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(info.data);
  // const openOrders = await OpenOrders.load(
  //   connection,
  //   poolState.openOrders,
  //   OPENBOOK_PROGRAM_ID // OPENBOOK_PROGRAM_ID(marketProgramId) of each pool can get from api: https://api.raydium.io/v2/sdk/liquidity/mainnet.json
  // );

  // const baseDecimal = 10 ** poolState.baseDecimal.toNumber(); // e.g. 10 ^ 6
  // const quoteDecimal = 10 ** poolState.quoteDecimal.toNumber();

  const baseTokenAmount = await connection.getTokenAccountBalance(
    poolState.baseVault
  );
  const quoteTokenAmount = await connection.getTokenAccountBalance(
    poolState.quoteVault
  );

  // const basePnl = poolState.baseNeedTakePnl.toNumber() / baseDecimal;
  // const quotePnl = poolState.quoteNeedTakePnl.toNumber() / quoteDecimal;

  // const openOrdersBaseTokenTotal =
  //   openOrders.baseTokenTotal.toNumber() / baseDecimal;
  // const openOrdersQuoteTokenTotal =
  //   openOrders.quoteTokenTotal.toNumber() / quoteDecimal;

  // const base =
  //   (baseTokenAmount.value?.uiAmount || 0) + openOrdersBaseTokenTotal - basePnl;
  // const quote =
  //   (quoteTokenAmount.value?.uiAmount || 0) +
  //   openOrdersQuoteTokenTotal -
  //   quotePnl;

  const denominator = new BN(10).pow(poolState.baseDecimal);

  // const addedLpAccount = tokenAccounts.find((a) =>
  //   a.accountInfo.mint.equals(poolState.lpMint)
  // );

  console.log(
    "SOL_USDC pool info:",
    // "pool total base " + base,
    // "pool total quote " + quote,

    "base vault balance " + baseTokenAmount.value.uiAmount,
    "quote vault balance " + quoteTokenAmount.value.uiAmount,

    // "base tokens in openorders " + openOrdersBaseTokenTotal,
    // "quote tokens in openorders  " + openOrdersQuoteTokenTotal,

    "base token decimals " + poolState.baseDecimal.toNumber(),
    "quote token decimals " + poolState.quoteDecimal.toNumber(),
    "total lp " + poolState.lpReserve.div(denominator).toString(),

    // "addedLpAmount " +
    //   (addedLpAccount?.accountInfo.amount.toNumber() || 0) / baseDecimal
  );
}

const swapConfig = {
  executeSwap: true, // Send tx when true, simulate tx when false
  useVersionedTransaction: true,
  tokenAAmount: 0.01, // Swap 0.01 SOL for USDT in this example
  tokenAAddress: "So11111111111111111111111111111111111111112", // Token to swap for the other, SOL in this case
  tokenBAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC address
  maxLamports: 1500000, // Micro lamports for priority fee
  direction: "in" as "in" | "out", // Swap direction: 'in' or 'out'
  liquidityFile: "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
  maxRetries: 20,
};
// ray test touch >

export {
  parsePoolInfo,
  swapConfig
};
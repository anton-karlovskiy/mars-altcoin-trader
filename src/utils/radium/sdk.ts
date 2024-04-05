// RE: https://docs.chainstack.com/docs/solana-how-to-perform-token-swaps-using-the-raydium-sdk#the-raydiumswapts-file
// RE: https://github.com/chainstacklabs/raydium-sdk-swap-example-typescript

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';
import {
  Liquidity,
  LiquidityPoolKeys,
  jsonInfo2PoolKeys,
  LiquidityPoolJsonInfo,
  TokenAccount,
  Token,
  TokenAmount,
  TOKEN_PROGRAM_ID,
  Percent,
  SPL_ACCOUNT_LAYOUT
} from '@raydium-io/raydium-sdk';
import { Wallet } from '@coral-xyz/anchor';
import bs58 from 'bs58';

import {
  SOLANA_NODE_JSON_RPC_ENDPOINT,
  SOLANA_WALLET_ACCOUNT_PRIVATE_KEY
} from '@/config/keys';
import {
  SWAP_MAX_LAMPORTS,
  SWAP_LIQUIDITY_FILE,
  SWAP_MAX_RETRIES
} from '@/config/radium/swap';
import { SOL_ADDRESS } from '@/constants/radium/tokens';

/**
 * Class representing a Raydium Swap operation.
 */
class RaydiumSwap {
  allPoolKeysJson: LiquidityPoolJsonInfo[] = [];
  connection: Connection;
  wallet: Wallet;

  /**
   * Creates a RaydiumSwap instance.
   * @param {string} RPC_URL - The RPC URL for connecting to the Solana blockchain.
   * @param {string} WALLET_PRIVATE_KEY - The private key of the wallet in base58 format.
   */
  constructor(RPC_URL: string, WALLET_PRIVATE_KEY: string) {
    this.connection = new Connection(RPC_URL, { commitment: 'confirmed' });
    this.wallet = new Wallet(Keypair.fromSecretKey(Uint8Array.from(bs58.decode(WALLET_PRIVATE_KEY))));
  }

  /**
   * Loads all the pool keys available from a JSON configuration file.
   * @async
   * @returns {Promise<void>}
   */
  async loadPoolKeys(liquidityFile: string) {
    try {
      const liquidityJsonResp = await fetch(liquidityFile);
      if (!liquidityJsonResp.ok) return;
      const liquidityJson = (await liquidityJsonResp.json()) as { official: any; unOfficial: any };
      const allPoolKeysJson = [...(liquidityJson?.official ?? []), ...(liquidityJson?.unOfficial ?? [])];
  
      this.allPoolKeysJson = allPoolKeysJson;
    } catch (error) {
      throw new Error(`Thrown at "loadPoolKeys": ${error}`);
    }
  }

  /**
   * Finds pool information for the given token pair.
   * @param {string} mintA - The mint address of the first token.
   * @param {string} mintB - The mint address of the second token.
   * @returns {LiquidityPoolKeys | null} The liquidity pool keys if found, otherwise null.
   */
  findPoolInfoForTokens(mintA: string, mintB: string) {
    const poolData = this.allPoolKeysJson.find(
      (index) => (index.baseMint === mintA && index.quoteMint === mintB) || (index.baseMint === mintB && index.quoteMint === mintA)
    );

    if (!poolData) return null;

    return jsonInfo2PoolKeys(poolData) as LiquidityPoolKeys;
  }

  /**
   * Retrieves token accounts owned by the wallet.
   * @async
   * @returns {Promise<TokenAccount[]>} An array of token accounts.
   */
  async getOwnerTokenAccounts() {
    try {
      const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID
      });
  
      return walletTokenAccount.value.map((item) => ({
        pubkey: item.pubkey,
        programId: item.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(item.account.data)
      }));
    } catch (error) {
      throw new Error(`Thrown at "getOwnerTokenAccounts": ${error}`);
    }
  }

  /**
   * Builds a swap transaction.
   * @async
   * @param {string} toToken - The mint address of the token to receive.
   * @param {number} amount - The amount of the token to swap.
   * @param {LiquidityPoolKeys} poolKeys - The liquidity pool keys.
   * @param {number} [maxLamports=100000] - The maximum lamports to use for transaction fees.
   * @param {boolean} [useVersionedTransaction=true] - Whether to use a versioned transaction.
   * @param {'in' | 'out'} [fixedSide='in'] - The fixed side of the swap ('in' or 'out').
   * @returns {Promise<Transaction | VersionedTransaction>} The constructed swap transaction.
   */
  async getSwapTransaction(
    toToken: string,
    // fromToken: string,
    amount: number,
    poolKeys: LiquidityPoolKeys,
    maxLamports: number = 100000, // RE: https://docs.chainstack.com/docs/solana-how-to-perform-token-swaps-using-the-raydium-sdk#maxlamports
    useVersionedTransaction = true,
    fixedSide: 'in' | 'out' = 'in' // RE: https://docs.chainstack.com/docs/solana-how-to-perform-token-swaps-using-the-raydium-sdk#direction
  ): Promise<Transaction | VersionedTransaction> {
    try {
      const directionIn = poolKeys.quoteMint.toString() == toToken;
      const {
        minAmountOut,
        amountIn
      } = await this.calcAmountOut(poolKeys, amount, directionIn);
      console.log({ minAmountOut, amountIn });
      const userTokenAccounts = await this.getOwnerTokenAccounts();
      const swapTransaction = await Liquidity.makeSwapInstructionSimple({
        connection: this.connection,
        makeTxVersion: useVersionedTransaction ? 0 : 1,
        poolKeys: {
          ...poolKeys
        },
        userKeys: {
          tokenAccounts: userTokenAccounts,
          owner: this.wallet.publicKey
        },
        amountIn: amountIn,
        amountOut: minAmountOut,
        fixedSide: fixedSide,
        config: {
          bypassAssociatedCheck: false
        },
        computeBudgetConfig: {
          microLamports: maxLamports
        }
      });
  
      const recentBlockhashForSwap = await this.connection.getLatestBlockhash();
      const instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean);
  
      if (useVersionedTransaction) {
        const versionedTransaction = new VersionedTransaction(
          new TransactionMessage({
            payerKey: this.wallet.publicKey,
            recentBlockhash: recentBlockhashForSwap.blockhash,
            instructions: instructions
          }).compileToV0Message()
        );
  
        versionedTransaction.sign([this.wallet.payer]);
  
        return versionedTransaction;
      }
  
      const legacyTransaction = new Transaction({
        blockhash: recentBlockhashForSwap.blockhash,
        lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
        feePayer: this.wallet.publicKey
      });
  
      legacyTransaction.add(...instructions);
  
      return legacyTransaction;
    } catch (error) {
      throw new Error(`Thrown at "getSwapTransaction": ${error}`);
    }
  }

  /**
   * Sends a legacy transaction.
   * @async
   * @param {Transaction} tx - The transaction to send.
   * @returns {Promise<string>} The transaction ID.
   */
  async sendLegacyTransaction(tx: Transaction, maxRetries?: number) {
    try {
      const txId = await this.connection.sendTransaction(tx, [this.wallet.payer], {
        skipPreflight: true,
        maxRetries: maxRetries
      });
  
      return txId;
    } catch (error) {
      throw new Error(`Thrown at "sendLegacyTransaction": ${error}`);
    }
  }

  /**
   * Sends a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to send.
   * @returns {Promise<string>} The transaction ID.
   */
  async sendVersionedTransaction(tx: VersionedTransaction, maxRetries?: number) {
    try {
      const txId = await this.connection.sendTransaction(tx, {
        skipPreflight: true,
        maxRetries: maxRetries
      });
  
      return txId;
    } catch (error) {
      throw new Error(`Thrown at "sendVersionedTransaction": ${error}`);
    }
  }

  /**
   * Simulates a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to simulate.
   * @returns {Promise<any>} The simulation result.
   */
  async simulateLegacyTransaction(tx: Transaction) {
    try {
      const txId = await this.connection.simulateTransaction(tx, [this.wallet.payer]);
  
      return txId;
    } catch (error) {
      throw new Error(`Thrown at "simulateLegacyTransaction": ${error}`);
    }
  }

  /**
   * Simulates a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to simulate.
   * @returns {Promise<any>} The simulation result.
   */
  async simulateVersionedTransaction(tx: VersionedTransaction) {
    try {
      const txId = await this.connection.simulateTransaction(tx);
  
      return txId;
    } catch (error) {
      throw new Error(`Thrown at "simulateVersionedTransaction": ${error}`);
    }
  }

  /**
   * Gets a token account by owner and mint address.
   * @param {PublicKey} mint - The mint address of the token.
   * @returns {TokenAccount} The token account.
   */
  getTokenAccountByOwnerAndMint(mint: PublicKey) {
    return {
      programId: TOKEN_PROGRAM_ID,
      pubkey: PublicKey.default,
      accountInfo: {
        mint: mint,
        amount: 0
      }
    } as unknown as TokenAccount;
  }

  /**
   * Calculates the amount out for a swap.
   * @async
   * @param {LiquidityPoolKeys} poolKeys - The liquidity pool keys.
   * @param {number} rawAmountIn - The raw amount of the input token.
   * @param {boolean} swapInDirection - The direction of the swap (true for in, false for out).
   * @returns {Promise<Object>} The swap calculation result.
   */
  async calcAmountOut(poolKeys: LiquidityPoolKeys, rawAmountIn: number, swapInDirection: boolean) {
    try {
      const poolInfo = await Liquidity.fetchInfo({
        connection: this.connection,
        poolKeys
      });
  
      let currencyInMint = poolKeys.baseMint;
      let currencyInDecimals = poolInfo.baseDecimals;
      let currencyOutMint = poolKeys.quoteMint;
      let currencyOutDecimals = poolInfo.quoteDecimals;
  
      if (!swapInDirection) {
        currencyInMint = poolKeys.quoteMint;
        currencyInDecimals = poolInfo.quoteDecimals;
        currencyOutMint = poolKeys.baseMint;
        currencyOutDecimals = poolInfo.baseDecimals;
      }
  
      const currencyIn = new Token(TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
      const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);
      const currencyOut = new Token(TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
      // ray test touch <
      const slippage = new Percent(5, 100); // 5% slippage
      // ray test touch >
  
      const {
        amountOut,
        minAmountOut,
        currentPrice,
        executionPrice,
        priceImpact,
        fee
      } = Liquidity.computeAmountOut({
        poolKeys,
        poolInfo,
        amountIn,
        currencyOut,
        slippage
      })
  
      return {
        amountIn,
        amountOut,
        minAmountOut,
        currentPrice,
        executionPrice,
        priceImpact,
        fee
      }
    } catch (error) {
      throw new Error(`Thrown at "calcAmountOut": ${error}`);
    }
  }
}

const swapOnRadium = async (
  inputTokenAddress: string,
  outputTokenAddress: string,
  inputAmount: number,
  executeSwap = false // Send tx when true, simulate tx when false
) => {
  try {
    /**
     * The RaydiumSwap instance for handling swaps.
     */
    const raydiumSwap = new RaydiumSwap(SOLANA_NODE_JSON_RPC_ENDPOINT, SOLANA_WALLET_ACCOUNT_PRIVATE_KEY);
    console.log('Raydium swap initialized.');
    console.log(`Swapping ${inputAmount} of ${inputTokenAddress} for ${outputTokenAddress}...`);

    /**
     * Load pool keys from the Raydium API to enable finding pool information.
     */
    await raydiumSwap.loadPoolKeys(SWAP_LIQUIDITY_FILE);
    console.log(`Loaded pool keys.`);

    /**
     * Find pool information for the given token pair.
     */
    const poolInfo = raydiumSwap.findPoolInfoForTokens(inputTokenAddress, outputTokenAddress);
    console.log('Found pool info');

    if (!poolInfo) {
      throw new Error(`No pool info thrown at "swap": ${poolInfo}`);
    }

    /**
     * Prepare the swap transaction with the given parameters.
     */
    const tx = await raydiumSwap.getSwapTransaction(
      outputTokenAddress,
      inputAmount,
      poolInfo,
      SWAP_MAX_LAMPORTS
    );

    /**
     * Depending on the configuration, execute or simulate the swap.
     */
    if (executeSwap) {
      /**
       * Send the transaction to the network and log the transaction ID.
       */
      const txId = await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction, SWAP_MAX_RETRIES);

      console.log('Swap TX on Radium:', `https://solscan.io/tx/${txId}`);

      return txId;
    } else {
      /**
       * Simulate the transaction and log the result.
       */
      const simRes = await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction);

      console.log('Simulation result on Radium:', simRes);

      return simRes;
    }
  } catch (error) {
    throw new Error(`Thrown at "swap": ${error}`);
  }
};

const buyTokensOnRadium = async (outputTokenAddress: string, inputAmount: number, executeSwap = false) => {
  try {
    return await swapOnRadium(SOL_ADDRESS, outputTokenAddress, inputAmount, executeSwap);
  } catch (error) {
    throw new Error(`Thrown at "buyTokensOnRadium": ${error}`);
  }
};

export {
  RaydiumSwap,
  buyTokensOnRadium
};

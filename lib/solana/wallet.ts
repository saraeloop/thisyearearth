"use client";

import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SendTransactionError,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import {
  buildPledgeMemo,
  getSolanaDevnetExplorerUrl,
  SOLANA_CONFIGURED_NETWORK,
  SOLANA_DEBUG_MEMO_ENABLED,
  SOLANA_MEMO_PROGRAM_ID,
  SOLANA_NETWORK,
  SOLANA_RPC_URL,
  type PledgeMintMetadata,
} from "./mint";
import { encodeBase58, normalizeWalletSignature } from "./signature";

const MIN_TEST_CLUSTER_FEE_LAMPORTS = 10_000;
const TEST_CLUSTER_AIRDROP_LAMPORTS = Math.floor(0.05 * LAMPORTS_PER_SOL);
type SolanaTransaction = Transaction | VersionedTransaction;
export type WalletProviderAvailability =
  | "injected"
  | "mobile-no-provider"
  | "missing";

export type PledgeMintConfirmation = {
  blockhash: string;
  lastValidBlockHeight: number;
};

export type PreparedPledgeMintTransaction = {
  transaction: Transaction;
  walletAddress: string;
  memo: string;
  confirmation: PledgeMintConfirmation;
};

type WalletConnectResult = {
  publicKey?: { toString: () => string };
};

type SolanaWalletProvider = {
  isConnected?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<WalletConnectResult>;
  signAndSendTransaction?: (
    transaction: SolanaTransaction,
  ) => Promise<{ signature: string | Uint8Array | number[] }>;
  signTransaction?: (
    transaction: SolanaTransaction,
  ) => Promise<SolanaTransaction>;
};

type SolanaProviderWindow = Window & {
  solana?: SolanaWalletProvider;
  phantom?: {
    solana?: SolanaWalletProvider;
  };
};

function getBrowserWalletProvider() {
  if (typeof window === "undefined") return null;
  const solanaWindow = window as SolanaProviderWindow;
  return solanaWindow.phantom?.solana ?? solanaWindow.solana ?? null;
}

export function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isTouchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return (
    isTouchMac ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      ua,
    )
  );
}

export function getWalletProviderAvailability(): WalletProviderAvailability {
  if (getBrowserWalletProvider()) return "injected";
  return isMobileBrowser() ? "mobile-no-provider" : "missing";
}

function logSolanaDebug(
  scope: string,
  details: Record<string, unknown>,
) {
  console.info(`[solana:${scope}]`, details);
}

function isWalletRejection(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  return (
    code === 4001 ||
    (typeof message === "string" &&
      message.toLowerCase().includes("user rejected"))
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function isAlreadyProcessedError(error: unknown) {
  return getErrorMessage(error).toLowerCase().includes("already been processed");
}

function firstTransactionSignature(transaction: SolanaTransaction) {
  if (transaction instanceof VersionedTransaction) {
    return transaction.signatures[0] ?? null;
  }
  return transaction.signatures[0]?.signature ?? null;
}

async function logSolanaError(
  scope: string,
  error: unknown,
  connection?: Connection,
) {
  console.error(`[solana:${scope}]`, error);
  if (connection && error instanceof SendTransactionError) {
    try {
      console.error(`[solana:${scope}:logs]`, await error.getLogs(connection));
    } catch {
      // The original error above is the important one.
    }
  }
  if (error && typeof error === "object") {
    const maybeLogs = (error as { logs?: unknown }).logs;
    if (maybeLogs) console.error(`[solana:${scope}:logs]`, maybeLogs);
    const maybeGetLogs = (error as {
      getLogs?: (connection: Connection) => Promise<unknown>;
    }).getLogs;
    if (connection && typeof maybeGetLogs === "function") {
      try {
        console.error(`[solana:${scope}:logs]`, await maybeGetLogs(connection));
      } catch {
        // The original error above is the important one.
      }
    }
  }
}

async function connectWallet(provider: SolanaWalletProvider) {
  let connectedPublicKey = provider.publicKey?.toString();
  if (!provider.publicKey || !provider.isConnected) {
    const result = await provider.connect();
    connectedPublicKey = result.publicKey?.toString() ?? provider.publicKey?.toString();
  }
  const publicKey = connectedPublicKey ?? provider.publicKey?.toString();
  if (!publicKey) throw new Error("Wallet connection failed.");
  return publicKey;
}

async function ensureTestClusterFeeBalance(
  connection: Connection,
  feePayer: PublicKey,
) {
  const balance = await connection.getBalance(feePayer, "confirmed");
  if (balance >= MIN_TEST_CLUSTER_FEE_LAMPORTS) return balance;

  try {
    const signature = await connection.requestAirdrop(
      feePayer,
      TEST_CLUSTER_AIRDROP_LAMPORTS,
    );
    const latestBlockhash = await connection.getLatestBlockhash("confirmed");
    await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      "confirmed",
    );
  } catch (error) {
    await logSolanaError("airdrop", error, connection);
    throw new Error(
      `${SOLANA_NETWORK} faucet is unavailable. Add ${SOLANA_NETWORK} SOL in Phantom and try again.`,
    );
  }

  const refreshedBalance = await connection.getBalance(feePayer, "confirmed");
  if (refreshedBalance < MIN_TEST_CLUSTER_FEE_LAMPORTS) {
    throw new Error(
      `Wallet needs ${SOLANA_NETWORK} SOL before minting. Add ${SOLANA_NETWORK} SOL in Phantom and try again.`,
    );
  }
  return refreshedBalance;
}

async function assertLocalSimulationPasses(
  connection: Connection,
  transaction: Transaction,
) {
  const simulation = await connection.simulateTransaction(transaction);
  logSolanaDebug("simulate", {
    err: simulation.value.err,
    logs: simulation.value.logs,
    unitsConsumed: simulation.value.unitsConsumed,
  });
  if (simulation.value.err) {
    throw new Error("Solana simulation failed before wallet signing.");
  }
}

export async function preparePledgeMintTransaction(
  pledgeText: string,
  walletAddress: string,
): Promise<PreparedPledgeMintTransaction> {
  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  const feePayer = new PublicKey(walletAddress);
  const balance = await ensureTestClusterFeeBalance(connection, feePayer);

  const memo = buildPledgeMemo(pledgeText);
  const memoPayload = Buffer.from(new TextEncoder().encode(memo));
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const genesisHash = await connection.getGenesisHash().catch(() => null);
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: new PublicKey(SOLANA_MEMO_PROGRAM_ID),
    data: memoPayload,
  });

  const transaction = new Transaction({
    feePayer,
    recentBlockhash: latestBlockhash.blockhash,
  }).add(memoInstruction);

  logSolanaDebug("prepare", {
    walletAddress,
    rpcUrl: SOLANA_RPC_URL,
    network: SOLANA_NETWORK,
    configuredNetwork: SOLANA_CONFIGURED_NETWORK,
    genesisHash,
    balanceLamports: balance,
    recentBlockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    memo,
    memoBytes: memoPayload.length,
    debugMemo: SOLANA_DEBUG_MEMO_ENABLED,
    transactionVersion: "legacy",
    instructionProgramIds: [memoInstruction.programId.toBase58()],
    instructionKeys: memoInstruction.keys.map((key) => ({
      pubkey: key.pubkey.toBase58(),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
  });
  await assertLocalSimulationPasses(connection, transaction);

  return {
    transaction,
    walletAddress,
    memo,
    confirmation: {
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
  };
}

export async function confirmPledgeMintSignature(
  txHash: string,
  confirmation: PledgeMintConfirmation,
) {
  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  try {
    await connection.confirmTransaction(
      {
        signature: txHash,
        blockhash: confirmation.blockhash,
        lastValidBlockHeight: confirmation.lastValidBlockHeight,
      },
      "confirmed",
    );
  } catch (error) {
    await logSolanaError("confirm", error, connection);
    throw error;
  }
}

export function buildPledgeMintMetadataFromSignature(
  txHash: string,
  walletAddress: string,
  memo: string,
): PledgeMintMetadata {
  return {
    txHash,
    network: SOLANA_NETWORK,
    walletAddress,
    memo,
    memoProgramId: SOLANA_MEMO_PROGRAM_ID,
    explorerUrl: getSolanaDevnetExplorerUrl(txHash),
    mintedAt: new Date().toISOString(),
  };
}

export async function mintPledgeOnSolana(
  pledgeText: string,
): Promise<PledgeMintMetadata> {
  const provider = getBrowserWalletProvider();
  if (!provider) {
    if (isMobileBrowser()) {
      throw new Error("Open this page in Phantom to mint on Solana.");
    }
    throw new Error("Install Phantom or Solflare to mint on Solana.");
  }

  const walletAddress = await connectWallet(provider);
  const prepared = await preparePledgeMintTransaction(pledgeText, walletAddress);
  const connection = new Connection(SOLANA_RPC_URL, "confirmed");

  let txHash: string;
  try {
    if (provider.signTransaction) {
      const signed = await provider.signTransaction(prepared.transaction);
      try {
        txHash = await connection.sendRawTransaction(signed.serialize(), {
          preflightCommitment: "confirmed",
          maxRetries: 3,
        });
      } catch (error) {
        const signature = firstTransactionSignature(signed);
        if (isAlreadyProcessedError(error) && signature) {
          txHash = encodeBase58(signature);
        } else {
          throw error;
        }
      }
    } else if (provider.signAndSendTransaction) {
      const result = await provider.signAndSendTransaction(prepared.transaction);
      txHash = normalizeWalletSignature(result.signature);
    } else {
      throw new Error("Wallet does not support transaction signing.");
    }
  } catch (error) {
    if (isWalletRejection(error)) {
      throw new Error("Mint cancelled.");
    }
    await logSolanaError("send", error, connection);
    throw error;
  }

  await confirmPledgeMintSignature(txHash, prepared.confirmation);
  return buildPledgeMintMetadataFromSignature(
    txHash,
    prepared.walletAddress,
    prepared.memo,
  );
}

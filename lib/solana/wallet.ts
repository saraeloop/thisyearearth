"use client";

import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
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

const MIN_TEST_CLUSTER_FEE_LAMPORTS = 10_000;

type WalletConnectResult = {
  publicKey?: { toString: () => string };
};

type SolanaWalletProvider = {
  isConnected?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<WalletConnectResult>;
  signAndSendTransaction?: (
    transaction: VersionedTransaction,
  ) => Promise<{ signature: string }>;
  signTransaction?: (
    transaction: VersionedTransaction,
  ) => Promise<VersionedTransaction>;
};

declare global {
  interface Window {
    solana?: SolanaWalletProvider & {
      isPhantom?: boolean;
      isSolflare?: boolean;
    };
    phantom?: {
      solana?: SolanaWalletProvider & {
        isPhantom?: boolean;
      };
    };
  }
}

function getBrowserWalletProvider() {
  if (typeof window === "undefined") return null;
  return window.phantom?.solana ?? window.solana ?? null;
}

function logSolanaDebug(
  scope: string,
  details: Record<string, unknown>,
) {
  console.info(`[solana:${scope}]`, details);
}

function logSimulation(scope: string, value: unknown) {
  console.info(`[solana:${scope}]`, value);
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

async function logSolanaError(
  scope: string,
  error: unknown,
  connection?: Connection,
) {
  console.error(`[solana:${scope}]`, error);
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

async function simulateUnsignedTransaction({
  connection,
  feePayer,
  recentBlockhash,
  instruction,
}: {
  connection: Connection;
  feePayer: PublicKey;
  recentBlockhash: string;
  instruction: TransactionInstruction;
}) {
  const message = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash,
    instructions: [instruction],
  }).compileToV0Message();
  const simulation = await connection.simulateTransaction(
    new VersionedTransaction(message),
    {
      sigVerify: false,
      commitment: "confirmed",
    },
  );

  logSimulation("preflight", {
    err: simulation.value.err,
    logs: simulation.value.logs,
    unitsConsumed: simulation.value.unitsConsumed,
  });

  if (simulation.value.err) {
    throw new Error(
      `Solana preflight simulation failed: ${JSON.stringify(simulation.value.err)}`,
    );
  }
}

export async function mintPledgeOnDevnet(
  pledgeText: string,
): Promise<PledgeMintMetadata> {
  const provider = getBrowserWalletProvider();
  if (!provider) {
    throw new Error("Install Phantom or Solflare to mint on Solana.");
  }

  const walletAddress = await connectWallet(provider);
  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  const feePayer = new PublicKey(walletAddress);
  const balance = await connection.getBalance(feePayer, "confirmed");
  if (balance < MIN_TEST_CLUSTER_FEE_LAMPORTS) {
    throw new Error(
      `Wallet needs ${SOLANA_NETWORK} SOL before minting. Add ${SOLANA_NETWORK} SOL in Phantom and try again.`,
    );
  }

  const memo = buildPledgeMemo(pledgeText);
  const memoPayload = Buffer.from(new TextEncoder().encode(memo));
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const genesisHash = await connection.getGenesisHash().catch(() => null);
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: new PublicKey(SOLANA_MEMO_PROGRAM_ID),
    data: memoPayload,
  });
  const message = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [memoInstruction],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(message);

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
    transactionVersion: 0,
    instructionProgramIds: [memoInstruction.programId.toBase58()],
    instructionKeys: [memoInstruction.keys],
  });

  let txHash: string;
  let appPreflightPassed = false;
  try {
    await simulateUnsignedTransaction({
      connection,
      feePayer,
      recentBlockhash: latestBlockhash.blockhash,
      instruction: memoInstruction,
    });
    appPreflightPassed = true;

    if (provider.signTransaction) {
      const signed = await provider.signTransaction(transaction);
      const simulation = await connection.simulateTransaction(signed, {
        sigVerify: true,
        commitment: "confirmed",
      });
      if (simulation.value.err) {
        console.error("[solana:simulate:logs]", simulation.value.logs);
        console.error("[solana:simulate:error]", simulation.value.err);
        throw new Error(`Solana simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
      txHash = await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });
    } else if (provider.signAndSendTransaction) {
      const result = await provider.signAndSendTransaction(transaction);
      txHash = result.signature;
    } else {
      throw new Error("Wallet does not support transaction signing.");
    }
  } catch (error) {
    if (isWalletRejection(error)) {
      throw new Error("Mint cancelled.");
    }
    if (appPreflightPassed) {
      await logSolanaError("wallet-preflight", error, connection);
      throw new Error(
        `Phantom rejected this after ${SOLANA_NETWORK} preflight passed. Confirm Phantom is set to ${SOLANA_NETWORK}, then try again.`,
      );
    }
    await logSolanaError("send", error, connection);
    throw error;
  }

  try {
    await connection.confirmTransaction(
      {
        signature: txHash,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed",
    );
  } catch (error) {
    await logSolanaError("confirm", error, connection);
    throw error;
  }

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

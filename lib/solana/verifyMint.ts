import { Connection, PublicKey } from "@solana/web3.js";
import {
  buildPledgeMemo,
  getSolanaDevnetExplorerUrl,
  SOLANA_MEMO_PROGRAM_ID,
  SOLANA_NETWORK,
  SOLANA_RPC_URL,
  type PledgeMintMetadata,
  type SolanaNetwork,
} from "./mint";

const CLUSTER_GENESIS_HASHES: Record<SolanaNetwork, string> = {
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  testnet: "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY",
};

type ParsedTransaction = NonNullable<
  Awaited<ReturnType<Connection["getParsedTransaction"]>>
>;
type ParsedInstruction =
  ParsedTransaction["transaction"]["message"]["instructions"][number];

export type PledgeMintVerificationResult =
  | { ok: true; metadata: PledgeMintMetadata }
  | { ok: false; error: string; status: number };

function fail(error: string, status = 400): PledgeMintVerificationResult {
  return { ok: false, error, status };
}

function getMemoPayload(instruction: ParsedInstruction) {
  if (instruction.programId.toBase58() !== SOLANA_MEMO_PROGRAM_ID) return null;
  if (!("parsed" in instruction)) return null;

  const parsed = instruction.parsed;
  if (typeof parsed === "string") return parsed;
  if (parsed && typeof parsed === "object") {
    const maybeMemo = (parsed as { memo?: unknown }).memo;
    if (typeof maybeMemo === "string") return maybeMemo;
  }
  return null;
}

export async function verifyPledgeMintOnChain(
  metadata: PledgeMintMetadata,
  pledgeText: string,
): Promise<PledgeMintVerificationResult> {
  if (metadata.network !== SOLANA_NETWORK) {
    return fail("mint network does not match server configuration");
  }
  if (metadata.memoProgramId !== SOLANA_MEMO_PROGRAM_ID) {
    return fail("mint memo program does not match server configuration");
  }

  const expectedMemo = buildPledgeMemo(pledgeText);
  if (metadata.memo !== expectedMemo) {
    return fail("mint memo does not match pledge text");
  }

  let walletPublicKey: PublicKey;
  try {
    walletPublicKey = new PublicKey(metadata.walletAddress);
  } catch {
    return fail("mint wallet address is invalid");
  }

  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  const expectedGenesisHash = CLUSTER_GENESIS_HASHES[SOLANA_NETWORK];
  const actualGenesisHash = await connection.getGenesisHash();
  if (actualGenesisHash !== expectedGenesisHash) {
    return fail("configured Solana RPC does not match the expected network", 502);
  }

  const status = await connection.getSignatureStatuses([metadata.txHash], {
    searchTransactionHistory: true,
  });
  const signatureStatus = status.value[0];
  if (!signatureStatus) return fail("mint transaction was not found");
  if (signatureStatus.err) return fail("mint transaction failed on-chain");
  const isConfirmedEnough =
    signatureStatus.confirmationStatus === "confirmed" ||
    signatureStatus.confirmationStatus === "finalized" ||
    signatureStatus.confirmations === null;
  if (!isConfirmedEnough) {
    return fail("mint transaction is not confirmed");
  }

  const transaction = await connection.getParsedTransaction(metadata.txHash, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!transaction) return fail("mint transaction was not found");
  if (transaction.meta?.err) return fail("mint transaction failed on-chain");
  if (!transaction.transaction.signatures.includes(metadata.txHash)) {
    return fail("mint transaction signature does not match submitted hash");
  }

  const walletSigned = transaction.transaction.message.accountKeys.some(
    (account) =>
      account.signer && account.pubkey.toBase58() === walletPublicKey.toBase58(),
  );
  if (!walletSigned) {
    return fail("mint wallet did not sign the transaction");
  }

  const memoMatches = transaction.transaction.message.instructions.some(
    (instruction) => getMemoPayload(instruction) === expectedMemo,
  );
  if (!memoMatches) {
    return fail("mint transaction memo does not match pledge text");
  }

  return {
    ok: true,
    metadata: {
      txHash: metadata.txHash,
      network: SOLANA_NETWORK,
      walletAddress: walletPublicKey.toBase58(),
      memo: expectedMemo,
      memoProgramId: SOLANA_MEMO_PROGRAM_ID,
      explorerUrl: getSolanaDevnetExplorerUrl(metadata.txHash),
      mintedAt: transaction.blockTime
        ? new Date(transaction.blockTime * 1000).toISOString()
        : new Date().toISOString(),
    },
  };
}

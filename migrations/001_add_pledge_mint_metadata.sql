ALTER TABLE pledges
  ADD COLUMN IF NOT EXISTS tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS mint_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS minted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS co2_ppm_at_mint INTEGER,
  ADD COLUMN IF NOT EXISTS mint_network TEXT,
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS mint_memo TEXT,
  ADD COLUMN IF NOT EXISTS memo_program_id TEXT,
  ADD COLUMN IF NOT EXISTS explorer_url TEXT;

DO $$
BEGIN
  ALTER TABLE pledges
    ADD CONSTRAINT pledges_mint_status_check
    CHECK (mint_status IN ('none', 'minted'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS pledges_tx_hash_unique
  ON pledges (tx_hash)
  WHERE tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS pledges_minted_ledger_idx
  ON pledges (minted_at DESC, created_at DESC)
  WHERE mint_status = 'minted' AND tx_hash IS NOT NULL;

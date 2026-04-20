import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPhantomBrowseTargetUrl,
  buildPhantomBrowseUrl,
} from "../lib/solana/wallet";

test("buildPhantomBrowseUrl preserves query params and hash inside the encoded target URL", () => {
  const targetUrl =
    "https://thisyear.earth/?utm_source=safari&pledge=repair%20more#pledge";
  const refUrl = "https://thisyear.earth/?from=mobile share";

  const deeplink = new URL(buildPhantomBrowseUrl(targetUrl, refUrl));

  assert.equal(deeplink.origin, "https://phantom.app");
  assert.equal(deeplink.pathname, `/ul/browse/${encodeURIComponent(targetUrl)}`);
  assert.equal(deeplink.searchParams.get("ref"), refUrl);
});

test("buildPhantomBrowseUrl encodes nested URL characters without dropping existing query params", () => {
  const targetUrl =
    "https://thisyear.earth/pledges?name=Ada%20Lovelace&next=%2Fledger%3Fcluster%3Dtestnet#pledge";
  const refUrl = "https://thisyear.earth";

  const deeplink = buildPhantomBrowseUrl(targetUrl, refUrl);

  assert.equal(
    deeplink,
    `https://phantom.app/ul/browse/${encodeURIComponent(targetUrl)}?ref=${encodeURIComponent(refUrl)}`,
  );
});

test("buildPhantomBrowseTargetUrl applies handoff params and replaces the hash", () => {
  const targetUrl = buildPhantomBrowseTargetUrl(
    "https://thisyear.earth/?utm_source=safari#final",
    "pledge",
    {
      ewPledgeDraft: '{"choice":"vote"}',
      removeMe: null,
    },
  );
  const target = new URL(targetUrl);

  assert.equal(target.origin, "https://thisyear.earth");
  assert.equal(target.searchParams.get("utm_source"), "safari");
  assert.equal(target.searchParams.get("ewPledgeDraft"), '{"choice":"vote"}');
  assert.equal(target.searchParams.has("removeMe"), false);
  assert.equal(target.hash, "#pledge");
});

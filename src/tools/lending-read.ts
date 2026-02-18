/**
 * Lending Protocol Read Tools
 *
 * Read-only tools for querying Fluid's fToken lending protocol:
 * - List all fTokens
 * - Get fToken details (rates, TVL, underlying asset)
 * - Query user lending positions
 */

import { z } from "zod";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS, CONTRACTS } from "../config/chains.js";
import { LENDING_RESOLVER_ABI } from "../abis/index.js";
import { serializeBigInts } from "../utils/formatting.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

export const lendingReadTools = {
  // ── List all fTokens ───────────────────────────────────────────────────
  fluid_get_all_ftokens: {
    description:
      "List all fToken (Fluid lending token) addresses on a chain. fTokens are ERC4626-compliant and represent a user's share in the lending pool.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.lendingResolver, LENDING_RESOLVER_ABI, provider);

      const fTokens: string[] = await resolver.getAllFTokens();
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ chain: args.chain, totalFTokens: fTokens.length, fTokens }, null, 2) }],
      };
    },
  },

  // ── Get fToken details ─────────────────────────────────────────────────
  fluid_get_ftoken_details: {
    description:
      "Get detailed information about a specific fToken including name, symbol, underlying asset, supply rate, rewards rate, total assets, and total supply.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; ftoken_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.lendingResolver, LENDING_RESOLVER_ABI, provider);

      const details = await resolver.getFTokenDetails(args.ftoken_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                fToken: args.ftoken_address,
                details: serializeBigInts({
                  tokenAddress: details.tokenAddress,
                  isNativeUnderlying: details.isNativeUnderlying,
                  name: details.name,
                  symbol: details.symbol,
                  decimals: Number(details.decimals),
                  asset: details.asset,
                  totalAssets: details.totalAssets,
                  totalSupply: details.totalSupply,
                  convertToShares: details.convertToShares,
                  convertToAssets: details.convertToAssets,
                  supplyRate: details.supplyRate,
                  rewardsRate: details.rewardsRate,
                  rebalanceDifference: details.rebalanceDifference,
                  liquidityBalance: details.liquidityBalance,
                }),
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get all fTokens details ────────────────────────────────────────────
  fluid_get_all_ftokens_details: {
    description:
      "Get details for ALL fTokens on a chain in a single call — names, rates, TVL, and underlying assets. Perfect for a lending dashboard.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.lendingResolver, LENDING_RESOLVER_ABI, provider);

      const allDetails = await resolver.getFTokensEntireData();
      const formatted = serializeBigInts({
        tokenAddress: allDetails.tokenAddress,
        name: allDetails.name,
        symbol: allDetails.symbol,
        decimals: Number(allDetails.decimals),
        asset: allDetails.asset,
        totalAssets: allDetails.totalAssets,
        totalSupply: allDetails.totalSupply,
        supplyRate: allDetails.supplyRate,
        rewardsRate: allDetails.rewardsRate,
        isNativeUnderlying: allDetails.isNativeUnderlying,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ chain: args.chain, fToken: formatted }, null, 2) }],
      };
    },
  },

  // ── Get user lending position ──────────────────────────────────────────
  fluid_get_user_lending_position: {
    description:
      "Get a user's position in a specific fToken lending pool. Returns fToken shares, underlying asset value, wallet balance, and allowance.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      user_address: z.string().describe("User wallet address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; ftoken_address: string; user_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.lendingResolver, LENDING_RESOLVER_ABI, provider);

      const position = await resolver.getUserPosition(args.ftoken_address, args.user_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                fToken: args.ftoken_address,
                user: args.user_address,
                position: serializeBigInts({
                  fTokenShares: position.fTokenShares,
                  underlyingAssets: position.underlyingAssets,
                  underlyingBalance: position.underlyingBalance,
                  allowance: position.allowance,
                }),
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get user all positions ────────────────────────────────────────────
  fluid_get_user_all_positions: {
    description:
      "Get all of a user's lending positions across all fTokens on a chain. Returns combined fToken details and user position data.",
    schema: z.object({
      chain: ChainParam,
      user_address: z.string().describe("User wallet address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; user_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.lendingResolver, LENDING_RESOLVER_ABI, provider);

      const positions = await resolver.getUserPositions(args.user_address);
      const formatted = positions.map((p: any) =>
        serializeBigInts({
          fToken: p.fToken,
          fTokenShares: p.fTokenShares,
          underlyingAssets: p.underlyingAssets,
          underlyingBalance: p.underlyingBalance,
          allowance: p.allowance,
          asset: p.asset,
          totalAssets: p.totalAssets,
          totalSupply: p.totalSupply,
          supplyRate: p.supplyRate,
          rewardsRate: p.rewardsRate,
        })
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ chain: args.chain, user: args.user_address, totalPositions: formatted.length, positions: formatted }, null, 2),
          },
        ],
      };
    },
  },

  // ── Get previews ───────────────────────────────────────────────────────
  fluid_get_previews: {
    description:
      "Get conversion previews for deposit/mint/withdraw/redeem operations on an fToken. Useful for estimating output before transacting.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      assets: z.string().describe("Comma-separated list of asset amounts to preview (in raw units)").optional(),
      shares: z.string().describe("Comma-separated list of share amounts to preview (in raw units)").optional(),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; ftoken_address: string; assets?: string; shares?: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.lendingResolver, LENDING_RESOLVER_ABI, provider);

      const assetAmounts = args.assets ? args.assets.split(",").map((a) => BigInt(a.trim())) : [];
      const shareAmounts = args.shares ? args.shares.split(",").map((s) => BigInt(s.trim())) : [];

      const previews = await resolver.getPreviews(args.ftoken_address, assetAmounts, shareAmounts);
      const formatted = previews.map((p: any) =>
        serializeBigInts({
          previewAsset: p.previewAsset,
          previewShare: p.previewShare,
        })
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ chain: args.chain, fToken: args.ftoken_address, previews: formatted }, null, 2),
          },
        ],
      };
    },
  },
};

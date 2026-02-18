/**
 * Liquidity Layer Read Tools
 *
 * Read-only tools for querying the Fluid Liquidity Layer:
 * - List all tokens with supply/borrow data
 * - Get token rates and exchange prices
 * - Query user supply/borrow positions
 * - Get protocol revenue
 */

import { z } from "zod";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS, CONTRACTS } from "../config/chains.js";
import { LIQUIDITY_RESOLVER_ABI } from "../abis/index.js";
import { serializeBigInts, formatRateToAPY } from "../utils/formatting.js";

const ChainParam = z
  .string()
  .describe(
    `Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`
  );

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const liquidityReadTools = {
  // ── Get all listed tokens ──────────────────────────────────────────────
  fluid_get_listed_tokens: {
    description:
      "Get all tokens listed in the Fluid Liquidity Layer on a given chain. Returns token addresses that can be supplied or borrowed.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z
        .string()
        .optional()
        .describe("Custom RPC URL (optional, uses default if omitted)"),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(
        CONTRACTS.liquidityResolver,
        LIQUIDITY_RESOLVER_ABI,
        provider
      );

      const tokens: string[] = await resolver.listedTokens();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                totalTokens: tokens.length,
                tokens,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get token rate data ────────────────────────────────────────────────
  fluid_get_token_rates: {
    description:
      "Get supply/borrow rates, exchange prices, total supply, and total borrow for a specific token on the Fluid Liquidity Layer.",
    schema: z.object({
      chain: ChainParam,
      token_address: z
        .string()
        .describe("Token address to query (e.g., USDC, WETH address)"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      token_address: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(
        CONTRACTS.liquidityResolver,
        LIQUIDITY_RESOLVER_ABI,
        provider
      );

      const data = await resolver.getOverallTokenData(args.token_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                token: args.token_address,
                data: {
                  ...serializeBigInts({
                    supplyRate: data.supplyRate,
                    borrowRate: data.borrowRate,
                    fee: data.fee,
                    lastUpdateTimestamp: data.lastUpdateTimestamp,
                    supplyExchangePrice: data.supplyExchangePrice,
                    borrowExchangePrice: data.borrowExchangePrice,
                    supplyRawInterest: data.supplyRawInterest,
                    supplyInterestFree: data.supplyInterestFree,
                    borrowRawInterest: data.borrowRawInterest,
                    borrowInterestFree: data.borrowInterestFree,
                    totalSupply: data.totalSupply,
                    totalBorrow: data.totalBorrow,
                    revenue: data.revenue,
                    maxUtilization: data.maxUtilization,
                  }),
                  supplyAPY: formatRateToAPY(BigInt(data.supplyRate.toString())),
                  borrowAPY: formatRateToAPY(BigInt(data.borrowRate.toString())),
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get all tokens overview ────────────────────────────────────────────
  fluid_get_all_tokens_data: {
    description:
      "Get a comprehensive overview of ALL tokens on the Fluid Liquidity Layer — rates, supply, borrow, revenue for every listed token. Great for a protocol dashboard view.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(
        CONTRACTS.liquidityResolver,
        LIQUIDITY_RESOLVER_ABI,
        provider
      );

      const tokensData = await resolver.getAllOverallTokensData();
      const formatted = tokensData.map((t: any) => ({
        ...serializeBigInts({
          token: t.token,
          supplyRate: t.data.supplyRate,
          borrowRate: t.data.borrowRate,
          totalSupply: t.data.totalSupply,
          totalBorrow: t.data.totalBorrow,
          revenue: t.data.revenue,
          supplyExchangePrice: t.data.supplyExchangePrice,
          borrowExchangePrice: t.data.borrowExchangePrice,
        }),
        supplyAPY: formatRateToAPY(BigInt(t.data.supplyRate.toString())),
        borrowAPY: formatRateToAPY(BigInt(t.data.borrowRate.toString())),
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { chain: args.chain, totalTokens: formatted.length, tokens: formatted },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get user supply data ───────────────────────────────────────────────
  fluid_get_user_supply: {
    description:
      "Get a user's supply position for a specific token on the Fluid Liquidity Layer. Shows supply amount, withdrawal limit, and permissions.",
    schema: z.object({
      chain: ChainParam,
      user_address: z.string().describe("User wallet address"),
      token_address: z.string().describe("Token address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      user_address: string;
      token_address: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(
        CONTRACTS.liquidityResolver,
        LIQUIDITY_RESOLVER_ABI,
        provider
      );

      const data = await resolver.getUserSupplyData(
        args.user_address,
        args.token_address
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                user: args.user_address,
                token: args.token_address,
                supplyData: serializeBigInts({
                  isAllowed: data.isAllowed,
                  supply: data.supply,
                  withdrawalLimit: data.withdrawalLimit,
                  lastUpdateTimestamp: data.lastUpdateTimestamp,
                  expandPercent: data.expandPercent,
                  expandDuration: data.expandDuration,
                  baseWithdrawalLimit: data.baseWithdrawalLimit,
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

  // ── Get user borrow data ───────────────────────────────────────────────
  fluid_get_user_borrow: {
    description:
      "Get a user's borrow position for a specific token on the Fluid Liquidity Layer. Shows borrowed amount, borrow limit, and permissions.",
    schema: z.object({
      chain: ChainParam,
      user_address: z.string().describe("User wallet address"),
      token_address: z.string().describe("Token address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      user_address: string;
      token_address: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(
        CONTRACTS.liquidityResolver,
        LIQUIDITY_RESOLVER_ABI,
        provider
      );

      const data = await resolver.getUserBorrowData(
        args.user_address,
        args.token_address
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                user: args.user_address,
                token: args.token_address,
                borrowData: serializeBigInts({
                  isAllowed: data.isAllowed,
                  borrow: data.borrow,
                  borrowLimit: data.borrowLimit,
                  lastUpdateTimestamp: data.lastUpdateTimestamp,
                  expandPercent: data.expandPercent,
                  expandDuration: data.expandDuration,
                  baseBorrowLimit: data.baseBorrowLimit,
                  maxBorrowLimit: data.maxBorrowLimit,
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

  // ── Get protocol revenue ───────────────────────────────────────────────
  fluid_get_revenue: {
    description:
      "Get accumulated protocol revenue for a specific token on the Fluid Liquidity Layer.",
    schema: z.object({
      chain: ChainParam,
      token_address: z.string().describe("Token address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      token_address: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(
        CONTRACTS.liquidityResolver,
        LIQUIDITY_RESOLVER_ABI,
        provider
      );

      const revenue = await resolver.getRevenue(args.token_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                token: args.token_address,
                revenue: revenue.toString(),
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },
};

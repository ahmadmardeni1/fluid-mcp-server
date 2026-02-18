/**
 * DEX Protocol Read Tools
 *
 * Read-only tools for querying the Fluid DEX:
 * - List all DEX pools
 * - Get pool reserves and data
 * - Estimate swap amounts (both in and out)
 * - Get adjusted reserves for swap calculations
 */

import { z } from "zod";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS, CONTRACTS } from "../config/chains.js";
import { DEX_RESOLVER_ABI, DEX_RESERVES_RESOLVER_ABI } from "../abis/index.js";
import { serializeBigInts } from "../utils/formatting.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

export const dexReadTools = {
  // ── List all DEX pools ─────────────────────────────────────────────────
  fluid_get_dex_pools: {
    description:
      "List all Fluid DEX pool addresses on a chain. Each pool is a token pair with reserves and fee configuration.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.dexResolver, DEX_RESOLVER_ABI, provider);

      const [pools, total] = await Promise.all([
        resolver.getAllPoolAddresses(),
        resolver.getTotalPools(),
      ]);
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ chain: args.chain, totalPools: Number(total), pools }, null, 2) },
        ],
      };
    },
  },

  // ── Get pool reserves ──────────────────────────────────────────────────
  fluid_get_pool_reserves: {
    description:
      "Get reserves (token0, token1, fee, reserve amounts, total shares) for a specific Fluid DEX pool.",
    schema: z.object({
      chain: ChainParam,
      pool_address: z.string().describe("DEX pool contract address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; pool_address: string; rpc_url?: string }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.dexResolver, DEX_RESOLVER_ABI, provider);

      const reserves = await resolver.getPoolReserves(args.pool_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                pool: args.pool_address,
                reserves: serializeBigInts({
                  token0: reserves.token0,
                  token1: reserves.token1,
                  fee: reserves.fee,
                  reserve0: reserves.reserve0,
                  reserve1: reserves.reserve1,
                  totalSupplyShares: reserves.totalSupplyShares,
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

  // ── Get all pools reserves ─────────────────────────────────────────────
  fluid_get_all_pools_reserves: {
    description:
      "Get reserves for ALL Fluid DEX pools on a chain in one call. Returns token pairs, fees, and reserve amounts.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.dexResolver, DEX_RESOLVER_ABI, provider);

      const allReserves = await resolver.getAllPoolsReserves();
      const formatted = allReserves.map((r: any) =>
        serializeBigInts({
          pool: r.pool,
          token0: r.token0,
          token1: r.token1,
          fee: r.fee,
          reserve0: r.reserve0,
          reserve1: r.reserve1,
          totalSupplyShares: r.totalSupplyShares,
        })
      );
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ chain: args.chain, totalPools: formatted.length, pools: formatted }, null, 2) },
        ],
      };
    },
  },

  // ── Get adjusted reserves ──────────────────────────────────────────────
  fluid_get_pool_adjusted_reserves: {
    description:
      "Get adjusted reserves for a Fluid DEX pool (scaled to 1e12). These are needed for accurate swap estimation. Returns collateral and debt reserves, fee, and token addresses.",
    schema: z.object({
      chain: ChainParam,
      pool_address: z.string().describe("DEX pool contract address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; pool_address: string; rpc_url?: string }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.dexReservesResolver, DEX_RESERVES_RESOLVER_ABI, provider);

      const reserves = await resolver.getPoolReservesAdjusted(args.pool_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                pool: args.pool_address,
                adjustedReserves: serializeBigInts({
                  colReserves0Adjusted: reserves.colReserves0Adjusted,
                  colReserves1Adjusted: reserves.colReserves1Adjusted,
                  debtReserves0Adjusted: reserves.debtReserves0Adjusted,
                  debtReserves1Adjusted: reserves.debtReserves1Adjusted,
                  dexFee: reserves.dexFee,
                  token0: reserves.token0,
                  token1: reserves.token1,
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

  // ── Estimate swap in ───────────────────────────────────────────────────
  fluid_estimate_swap_in: {
    description:
      "Estimate the output amount for a given input amount on a Fluid DEX pool. Uses the constant product formula (x*y=k). Fetches adjusted reserves automatically.",
    schema: z.object({
      chain: ChainParam,
      pool_address: z.string().describe("DEX pool contract address"),
      swap_0_to_1: z
        .boolean()
        .describe("Direction: true = token0→token1, false = token1→token0"),
      amount_in: z.string().describe("Input amount in raw token units (wei)"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      pool_address: string;
      swap_0_to_1: boolean;
      amount_in: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.dexReservesResolver, DEX_RESERVES_RESOLVER_ABI, provider);

      // First fetch adjusted reserves
      const reserves = await resolver.getPoolReservesAdjusted(args.pool_address);

      // Then estimate
      const amountOut = await resolver.estimateSwapIn(
        args.pool_address,
        args.swap_0_to_1,
        BigInt(args.amount_in),
        reserves.colReserves0Adjusted,
        reserves.colReserves1Adjusted,
        reserves.debtReserves0Adjusted,
        reserves.debtReserves1Adjusted
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                pool: args.pool_address,
                direction: args.swap_0_to_1 ? "token0 → token1" : "token1 → token0",
                amountIn: args.amount_in,
                estimatedAmountOut: amountOut.toString(),
                token0: reserves.token0,
                token1: reserves.token1,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Estimate swap out ──────────────────────────────────────────────────
  fluid_estimate_swap_out: {
    description:
      "Estimate the input amount needed to receive a desired output amount on a Fluid DEX pool. Fetches adjusted reserves automatically.",
    schema: z.object({
      chain: ChainParam,
      pool_address: z.string().describe("DEX pool contract address"),
      swap_0_to_1: z
        .boolean()
        .describe("Direction: true = token0→token1, false = token1→token0"),
      amount_out: z.string().describe("Desired output amount in raw token units (wei)"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      pool_address: string;
      swap_0_to_1: boolean;
      amount_out: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.dexReservesResolver, DEX_RESERVES_RESOLVER_ABI, provider);

      const reserves = await resolver.getPoolReservesAdjusted(args.pool_address);

      const amountIn = await resolver.estimateSwapOut(
        args.pool_address,
        args.swap_0_to_1,
        BigInt(args.amount_out),
        reserves.colReserves0Adjusted,
        reserves.colReserves1Adjusted,
        reserves.debtReserves0Adjusted,
        reserves.debtReserves1Adjusted
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                pool: args.pool_address,
                direction: args.swap_0_to_1 ? "token0 → token1" : "token1 → token0",
                desiredAmountOut: args.amount_out,
                estimatedAmountIn: amountIn.toString(),
                token0: reserves.token0,
                token1: reserves.token1,
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

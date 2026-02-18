/**
 * DEX Protocol Write Tools
 *
 * Transaction-building tools for Fluid DEX swap operations:
 * - Swap with exact input (swapIn)
 * - Swap with exact output (swapOut)
 *
 * IMPORTANT: Returns unsigned transaction data. Agent must sign and broadcast.
 */

import { z } from "zod";
import { ethers } from "ethers";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS, CONTRACTS } from "../config/chains.js";
import { DEX_POOL_ABI, DEX_RESERVES_RESOLVER_ABI } from "../abis/index.js";
import { serializeBigInts } from "../utils/formatting.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

export const dexWriteTools = {
  // ── Build swapIn transaction ───────────────────────────────────────────
  fluid_build_swap_exact_input: {
    description:
      "Build an unsigned transaction to swap an exact input amount on a Fluid DEX pool. Automatically estimates the output and applies slippage tolerance.",
    schema: z.object({
      chain: ChainParam,
      pool_address: z.string().describe("DEX pool contract address"),
      swap_0_to_1: z
        .boolean()
        .describe("Direction: true = token0→token1, false = token1→token0"),
      amount_in: z.string().describe("Exact input amount (in raw units / wei)"),
      slippage_bps: z
        .number()
        .optional()
        .describe("Slippage tolerance in basis points (default: 50 = 0.5%)"),
      receiver: z.string().describe("Address to receive the output tokens"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      pool_address: string;
      swap_0_to_1: boolean;
      amount_in: string;
      slippage_bps?: number;
      receiver: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const pool = getContract(args.pool_address, DEX_POOL_ABI, provider);
      const resolver = getContract(
        CONTRACTS.dexReservesResolver,
        DEX_RESERVES_RESOLVER_ABI,
        provider
      );

      // Estimate output
      const reserves = await resolver.getPoolReservesAdjusted(args.pool_address);
      const estimatedOut = await resolver.estimateSwapIn(
        args.pool_address,
        args.swap_0_to_1,
        BigInt(args.amount_in),
        reserves.colReserves0Adjusted,
        reserves.colReserves1Adjusted,
        reserves.debtReserves0Adjusted,
        reserves.debtReserves1Adjusted
      );

      // Apply slippage
      const slippageBps = BigInt(args.slippage_bps || 50);
      const amountOutMin =
        (estimatedOut * (10000n - slippageBps)) / 10000n;

      const txData = pool.interface.encodeFunctionData("swapIn", [
        args.swap_0_to_1,
        BigInt(args.amount_in),
        amountOutMin,
        args.receiver,
      ]);

      // Determine value (ETH) if input token is native
      let value = "0";
      const inputToken = args.swap_0_to_1 ? reserves.token0 : reserves.token1;
      const nativeAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      if (inputToken.toLowerCase() === nativeAddr.toLowerCase()) {
        value = args.amount_in;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "swapIn",
                to: args.pool_address,
                data: txData,
                value,
                direction: args.swap_0_to_1 ? "token0 → token1" : "token1 → token0",
                amountIn: args.amount_in,
                estimatedAmountOut: estimatedOut.toString(),
                amountOutMin: amountOutMin.toString(),
                slippageBps: Number(slippageBps),
                token0: reserves.token0,
                token1: reserves.token1,
                description: `Swap ${args.amount_in} (exact input) on pool ${args.pool_address}. Min output: ${amountOutMin.toString()}`,
                note: "If the input token is ERC20, approve the pool contract first using fluid_build_token_approve.",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build swapOut transaction ──────────────────────────────────────────
  fluid_build_swap_exact_output: {
    description:
      "Build an unsigned transaction to swap for an exact output amount on a Fluid DEX pool. Automatically estimates the required input and applies slippage tolerance.",
    schema: z.object({
      chain: ChainParam,
      pool_address: z.string().describe("DEX pool contract address"),
      swap_0_to_1: z
        .boolean()
        .describe("Direction: true = token0→token1, false = token1→token0"),
      amount_out: z.string().describe("Desired output amount (in raw units / wei)"),
      slippage_bps: z
        .number()
        .optional()
        .describe("Slippage tolerance in basis points (default: 50 = 0.5%)"),
      receiver: z.string().describe("Address to receive the output tokens"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      pool_address: string;
      swap_0_to_1: boolean;
      amount_out: string;
      slippage_bps?: number;
      receiver: string;
      rpc_url?: string;
    }) => {
      const config = getChainConfig(args.chain);
      const provider = getProvider(args.chain, args.rpc_url);
      const pool = getContract(args.pool_address, DEX_POOL_ABI, provider);
      const resolver = getContract(
        CONTRACTS.dexReservesResolver,
        DEX_RESERVES_RESOLVER_ABI,
        provider
      );

      // Estimate required input
      const reserves = await resolver.getPoolReservesAdjusted(args.pool_address);
      const estimatedIn = await resolver.estimateSwapOut(
        args.pool_address,
        args.swap_0_to_1,
        BigInt(args.amount_out),
        reserves.colReserves0Adjusted,
        reserves.colReserves1Adjusted,
        reserves.debtReserves0Adjusted,
        reserves.debtReserves1Adjusted
      );

      // Apply slippage
      const slippageBps = BigInt(args.slippage_bps || 50);
      const amountInMax = (estimatedIn * (10000n + slippageBps)) / 10000n;

      const txData = pool.interface.encodeFunctionData("swapOut", [
        args.swap_0_to_1,
        BigInt(args.amount_out),
        amountInMax,
        args.receiver,
      ]);

      let value = "0";
      const inputToken = args.swap_0_to_1 ? reserves.token0 : reserves.token1;
      const nativeAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      if (inputToken.toLowerCase() === nativeAddr.toLowerCase()) {
        value = amountInMax.toString();
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "swapOut",
                to: args.pool_address,
                data: txData,
                value,
                direction: args.swap_0_to_1 ? "token0 → token1" : "token1 → token0",
                desiredAmountOut: args.amount_out,
                estimatedAmountIn: estimatedIn.toString(),
                amountInMax: amountInMax.toString(),
                slippageBps: Number(slippageBps),
                token0: reserves.token0,
                token1: reserves.token1,
                description: `Swap for exact ${args.amount_out} output on pool ${args.pool_address}. Max input: ${amountInMax.toString()}`,
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

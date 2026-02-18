/**
 * Lending Protocol Write Tools
 *
 * Transaction-building tools for Fluid fToken lending operations:
 * - Deposit assets (get fTokens)
 * - Mint fTokens (specify shares)
 * - Withdraw assets (redeem for exact amount)
 * - Redeem fTokens (specify shares)
 * - Deposit native (ETH) without approval
 * - Withdraw native
 * - Approve token spending
 *
 * IMPORTANT: These tools return unsigned transaction data.
 * The agent must sign and broadcast using the user's wallet/signer.
 */

import { z } from "zod";
import { ethers } from "ethers";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS } from "../config/chains.js";
import { FTOKEN_ABI, ERC20_ABI } from "../abis/index.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

export const lendingWriteTools = {
  // ── Build deposit transaction ──────────────────────────────────────────
  fluid_build_lending_deposit: {
    description:
      "Build an unsigned transaction to deposit assets into a Fluid fToken lending pool. Returns the transaction data that must be signed and sent by the agent's wallet. Uses the ERC4626 deposit() method.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address to deposit into"),
      amount: z.string().describe("Amount of underlying assets to deposit (in raw units / wei)"),
      receiver: z.string().describe("Address that will receive the fToken shares"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      ftoken_address: string;
      amount: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const fToken = getContract(args.ftoken_address, FTOKEN_ABI, provider);

      const txData = fToken.interface.encodeFunctionData("deposit", [
        BigInt(args.amount),
        args.receiver,
      ]);

      let previewShares = "0";
      try {
        const shares = await fToken.previewDeposit(BigInt(args.amount));
        previewShares = shares.toString();
      } catch {}

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "deposit",
                to: args.ftoken_address,
                data: txData,
                value: "0",
                previewSharesReceived: previewShares,
                description: `Deposit ${args.amount} raw units into fToken ${args.ftoken_address}. Receiver: ${args.receiver}`,
                note: "You must first approve the fToken contract to spend the underlying asset. Use fluid_build_token_approve if needed.",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build mint transaction ─────────────────────────────────────────────
  fluid_build_lending_mint: {
    description:
      "Build an unsigned transaction to mint a specific number of fToken shares by depositing underlying assets.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      shares: z.string().describe("Number of fToken shares to mint (in raw units)"),
      receiver: z.string().describe("Address that will receive the fToken shares"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      ftoken_address: string;
      shares: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const fToken = getContract(args.ftoken_address, FTOKEN_ABI, provider);

      const txData = fToken.interface.encodeFunctionData("mint", [
        BigInt(args.shares),
        args.receiver,
      ]);

      let previewAssets = "0";
      try {
        const assets = await fToken.previewMint(BigInt(args.shares));
        previewAssets = assets.toString();
      } catch {}

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "mint",
                to: args.ftoken_address,
                data: txData,
                value: "0",
                previewAssetsNeeded: previewAssets,
                description: `Mint ${args.shares} fToken shares from ${args.ftoken_address}. Receiver: ${args.receiver}`,
                note: "You must first approve the fToken contract to spend the underlying asset.",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build withdraw transaction ─────────────────────────────────────────
  fluid_build_lending_withdraw: {
    description:
      "Build an unsigned transaction to withdraw underlying assets from a Fluid fToken lending pool. Burns fToken shares in exchange for underlying assets.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      amount: z.string().describe("Amount of underlying assets to withdraw (in raw units)"),
      receiver: z.string().describe("Address that will receive the underlying assets"),
      owner: z.string().describe("Address that owns the fToken shares (usually same as receiver)"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      ftoken_address: string;
      amount: string;
      receiver: string;
      owner: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const fToken = getContract(args.ftoken_address, FTOKEN_ABI, provider);

      const txData = fToken.interface.encodeFunctionData("withdraw", [
        BigInt(args.amount),
        args.receiver,
        args.owner,
      ]);

      let previewShares = "0";
      try {
        const shares = await fToken.previewWithdraw(BigInt(args.amount));
        previewShares = shares.toString();
      } catch {}

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "withdraw",
                to: args.ftoken_address,
                data: txData,
                value: "0",
                previewSharesBurned: previewShares,
                description: `Withdraw ${args.amount} raw units from fToken ${args.ftoken_address}. Receiver: ${args.receiver}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build redeem transaction ───────────────────────────────────────────
  fluid_build_lending_redeem: {
    description:
      "Build an unsigned transaction to redeem fToken shares for underlying assets. Specify how many shares to burn rather than how many assets to receive.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      shares: z.string().describe("Number of fToken shares to redeem (in raw units)"),
      receiver: z.string().describe("Address that will receive the underlying assets"),
      owner: z.string().describe("Address that owns the fToken shares"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      ftoken_address: string;
      shares: string;
      receiver: string;
      owner: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const fToken = getContract(args.ftoken_address, FTOKEN_ABI, provider);

      const txData = fToken.interface.encodeFunctionData("redeem", [
        BigInt(args.shares),
        args.receiver,
        args.owner,
      ]);

      let previewAssets = "0";
      try {
        const assets = await fToken.previewRedeem(BigInt(args.shares));
        previewAssets = assets.toString();
      } catch {}

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "redeem",
                to: args.ftoken_address,
                data: txData,
                value: "0",
                previewAssetsReceived: previewAssets,
                description: `Redeem ${args.shares} fToken shares from ${args.ftoken_address}. Receiver: ${args.receiver}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build deposit native (ETH) transaction ─────────────────────────────
  fluid_build_lending_deposit_native: {
    description:
      "Build an unsigned transaction to deposit native ETH into a Fluid fToken lending pool (for ETH-based fTokens). No approval needed.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address (must be a native ETH fToken)"),
      amount: z.string().describe("Amount of ETH to deposit (in wei)"),
      receiver: z.string().describe("Address that will receive the fToken shares"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      ftoken_address: string;
      amount: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const fToken = getContract(args.ftoken_address, FTOKEN_ABI, provider);

      const txData = fToken.interface.encodeFunctionData("depositNative", [args.receiver]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "depositNative",
                to: args.ftoken_address,
                data: txData,
                value: args.amount,
                description: `Deposit ${args.amount} wei of native ETH into fToken ${args.ftoken_address}. Receiver: ${args.receiver}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build withdraw native transaction ───────────────────────────────────
  fluid_build_lending_withdraw_native: {
    description:
      "Build an unsigned transaction to withdraw native ETH from a Fluid fToken lending pool.",
    schema: z.object({
      chain: ChainParam,
      ftoken_address: z.string().describe("fToken contract address"),
      amount: z.string().describe("Amount of ETH to withdraw (in wei)"),
      receiver: z.string().describe("Address that will receive the ETH"),
      owner: z.string().describe("Address that owns the fToken shares"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      ftoken_address: string;
      amount: string;
      receiver: string;
      owner: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const fToken = getContract(args.ftoken_address, FTOKEN_ABI, provider);

      const txData = fToken.interface.encodeFunctionData("withdrawNative", [
        BigInt(args.amount),
        args.receiver,
        args.owner,
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "withdrawNative",
                to: args.ftoken_address,
                data: txData,
                value: "0",
                description: `Withdraw ${args.amount} wei of native ETH from fToken ${args.ftoken_address}. Receiver: ${args.receiver}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Build token approval ───────────────────────────────────────────────
  fluid_build_token_approve: {
    description:
      "Build an unsigned transaction to approve an ERC20 token for spending by a Fluid contract (fToken, vault, DEX pool). Required before deposit/supply operations.",
    schema: z.object({
      chain: ChainParam,
      token_address: z.string().describe("ERC20 token address to approve"),
      spender: z.string().describe("Address to approve (fToken, vault, or pool address)"),
      amount: z
        .string()
        .optional()
        .describe("Amount to approve in raw units. Defaults to max uint256 (unlimited)."),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      token_address: string;
      spender: string;
      amount?: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const token = getContract(args.token_address, ERC20_ABI, provider);

      const approveAmount = args.amount
        ? BigInt(args.amount)
        : ethers.MaxUint256;

      const txData = token.interface.encodeFunctionData("approve", [
        args.spender,
        approveAmount,
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "approve",
                to: args.token_address,
                data: txData,
                value: "0",
                description: `Approve ${args.spender} to spend ${args.amount || "unlimited"} of token ${args.token_address}`,
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

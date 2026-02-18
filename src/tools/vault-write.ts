/**
 * Vault Protocol Write Tools
 *
 * Transaction-building tools for Fluid Vault operations on T1, T2, T3, T4 vaults:
 * - T1: Single-asset collateral, single-asset debt
 * - T2: Dual-asset collateral, single-asset debt
 * - T3: Single-asset collateral, dual-asset debt
 * - T4: Dual-asset collateral, dual-asset debt
 *
 * IMPORTANT: Returns unsigned transaction data. Agent must sign and broadcast.
 */

import { z } from "zod";
import { ethers } from "ethers";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS } from "../config/chains.js";
import { VAULT_T1_ABI, VAULT_T2_ABI, VAULT_T3_ABI, VAULT_T4_ABI } from "../abis/index.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

// INT256_MIN for closing positions (withdraw all + repay all)
const INT256_MIN = "-57896044618658097711785492504343953926634992332820282019728792003956564819968";

export const vaultWriteTools = {
  // ── Vault T1 operate ───────────────────────────────────────────────────
  fluid_build_vault_t1_operate: {
    description:
      "Build an unsigned transaction to interact with a Vault T1 (single-asset collateral, single-asset debt). T1 operate function is payable.",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault T1 contract address"),
      nft_id: z.number().describe("Position NFT ID (0 to open new position)"),
      new_col: z.string().describe("Collateral change in raw units (negative to withdraw, use INT256_MIN to close)"),
      new_debt: z.string().describe("Debt change in raw units (negative to repay, use INT256_MIN to close)"),
      receiver: z.string().describe("Address to receive withdrawn collateral or borrowed tokens"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      vault_address: string;
      nft_id: number;
      new_col: string;
      new_debt: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const vault = getContract(args.vault_address, VAULT_T1_ABI, provider);

      // Handle INT256_MIN for closing
      const newColValue = args.new_col === "INT256_MIN" ? INT256_MIN : args.new_col;
      const newDebtValue = args.new_debt === "INT256_MIN" ? INT256_MIN : args.new_debt;

      const txData = vault.interface.encodeFunctionData("operate", [
        args.nft_id,
        BigInt(newColValue),
        BigInt(newDebtValue),
        args.receiver,
      ]);

      // Determine if we need to send ETH
      let value = "0";
      if (newColValue !== "INT256_MIN" && BigInt(newColValue) > 0n) {
        value = newColValue;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "vault_t1_operate",
                to: args.vault_address,
                data: txData,
                value,
                nftId: args.nft_id,
                newCol: newColValue,
                newDebt: newDebtValue,
                receiver: args.receiver,
                description: `Vault T1 operate: nftId=${args.nft_id}, collateral=${newColValue}, debt=${newDebtValue}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Vault T2 operate ───────────────────────────────────────────────────
  fluid_build_vault_t2_operate: {
    description:
      "Build an unsigned transaction to interact with a Vault T2 (dual-asset collateral, single-asset debt).",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault T2 contract address"),
      nft_id: z.number().describe("Position NFT ID (0 to open new position)"),
      new_col_token0: z.string().describe("Token0 collateral amount in raw units"),
      new_col_token1: z.string().describe("Token1 collateral amount in raw units"),
      col_shares_min: z.string().describe("Minimum collateral shares (slippage protection)"),
      col_shares_max: z.string().describe("Maximum collateral shares (slippage protection)"),
      new_debt: z.string().describe("Debt change in raw units"),
      receiver: z.string().describe("Address to receive withdrawn collateral or borrowed tokens"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      vault_address: string;
      nft_id: number;
      new_col_token0: string;
      new_col_token1: string;
      col_shares_min: string;
      col_shares_max: string;
      new_debt: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const vault = getContract(args.vault_address, VAULT_T2_ABI, provider);

      const txData = vault.interface.encodeFunctionData("operate", [
        args.nft_id,
        BigInt(args.new_col_token0),
        BigInt(args.new_col_token1),
        {
          min: BigInt(args.col_shares_min),
          max: BigInt(args.col_shares_max),
        },
        BigInt(args.new_debt),
        args.receiver,
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "vault_t2_operate",
                to: args.vault_address,
                data: txData,
                value: "0",
                nftId: args.nft_id,
                colToken0: args.new_col_token0,
                colToken1: args.new_col_token1,
                colSharesMinMax: { min: args.col_shares_min, max: args.col_shares_max },
                newDebt: args.new_debt,
                receiver: args.receiver,
                description: `Vault T2 operate: nftId=${args.nft_id}, col0=${args.new_col_token0}, col1=${args.new_col_token1}, debt=${args.new_debt}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Vault T3 operate ───────────────────────────────────────────────────
  fluid_build_vault_t3_operate: {
    description:
      "Build an unsigned transaction to interact with a Vault T3 (single-asset collateral, dual-asset debt).",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault T3 contract address"),
      nft_id: z.number().describe("Position NFT ID (0 to open new position)"),
      new_col: z.string().describe("Collateral change in raw units"),
      new_debt_token0: z.string().describe("Token0 debt change in raw units"),
      new_debt_token1: z.string().describe("Token1 debt change in raw units"),
      debt_shares_min: z.string().describe("Minimum debt shares (slippage protection)"),
      debt_shares_max: z.string().describe("Maximum debt shares (slippage protection)"),
      receiver: z.string().describe("Address to receive withdrawn collateral or borrowed tokens"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      vault_address: string;
      nft_id: number;
      new_col: string;
      new_debt_token0: string;
      new_debt_token1: string;
      debt_shares_min: string;
      debt_shares_max: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const vault = getContract(args.vault_address, VAULT_T3_ABI, provider);

      const txData = vault.interface.encodeFunctionData("operate", [
        args.nft_id,
        BigInt(args.new_col),
        BigInt(args.new_debt_token0),
        BigInt(args.new_debt_token1),
        {
          min: BigInt(args.debt_shares_min),
          max: BigInt(args.debt_shares_max),
        },
        args.receiver,
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "vault_t3_operate",
                to: args.vault_address,
                data: txData,
                value: "0",
                nftId: args.nft_id,
                newCol: args.new_col,
                debtToken0: args.new_debt_token0,
                debtToken1: args.new_debt_token1,
                debtSharesMinMax: { min: args.debt_shares_min, max: args.debt_shares_max },
                receiver: args.receiver,
                description: `Vault T3 operate: nftId=${args.nft_id}, col=${args.new_col}, debt0=${args.new_debt_token0}, debt1=${args.new_debt_token1}`,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Vault T4 operate ───────────────────────────────────────────────────
  fluid_build_vault_t4_operate: {
    description:
      "Build an unsigned transaction to interact with a Vault T4 (dual-asset collateral, dual-asset debt).",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault T4 contract address"),
      nft_id: z.number().describe("Position NFT ID (0 to open new position)"),
      new_col_token0: z.string().describe("Token0 collateral amount in raw units"),
      new_col_token1: z.string().describe("Token1 collateral amount in raw units"),
      col_shares_min: z.string().describe("Minimum collateral shares (slippage protection)"),
      col_shares_max: z.string().describe("Maximum collateral shares (slippage protection)"),
      new_debt_token0: z.string().describe("Token0 debt change in raw units"),
      new_debt_token1: z.string().describe("Token1 debt change in raw units"),
      debt_shares_min: z.string().describe("Minimum debt shares (slippage protection)"),
      debt_shares_max: z.string().describe("Maximum debt shares (slippage protection)"),
      receiver: z.string().describe("Address to receive withdrawn collateral or borrowed tokens"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: {
      chain: string;
      vault_address: string;
      nft_id: number;
      new_col_token0: string;
      new_col_token1: string;
      col_shares_min: string;
      col_shares_max: string;
      new_debt_token0: string;
      new_debt_token1: string;
      debt_shares_min: string;
      debt_shares_max: string;
      receiver: string;
      rpc_url?: string;
    }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const vault = getContract(args.vault_address, VAULT_T4_ABI, provider);

      const txData = vault.interface.encodeFunctionData("operate", [
        args.nft_id,
        BigInt(args.new_col_token0),
        BigInt(args.new_col_token1),
        {
          min: BigInt(args.col_shares_min),
          max: BigInt(args.col_shares_max),
        },
        BigInt(args.new_debt_token0),
        BigInt(args.new_debt_token1),
        {
          min: BigInt(args.debt_shares_min),
          max: BigInt(args.debt_shares_max),
        },
        args.receiver,
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                action: "vault_t4_operate",
                to: args.vault_address,
                data: txData,
                value: "0",
                nftId: args.nft_id,
                colToken0: args.new_col_token0,
                colToken1: args.new_col_token1,
                colSharesMinMax: { min: args.col_shares_min, max: args.col_shares_max },
                debtToken0: args.new_debt_token0,
                debtToken1: args.new_debt_token1,
                debtSharesMinMax: { min: args.debt_shares_min, max: args.debt_shares_max },
                receiver: args.receiver,
                description: `Vault T4 operate: nftId=${args.nft_id}, col0=${args.new_col_token0}, col1=${args.new_col_token1}, debt0=${args.new_debt_token0}, debt1=${args.new_debt_token1}`,
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

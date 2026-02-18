/**
 * Vault Protocol Read Tools
 *
 * Read-only tools for querying Fluid Vaults:
 * - List all vaults and their types (T1, T2, T3, T4)
 * - Get vault data (collateral, debt, rates, limits)
 * - Query vault positions by NFT ID or user
 */

import { z } from "zod";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS, CONTRACTS } from "../config/chains.js";
import { VAULT_RESOLVER_ABI } from "../abis/index.js";
import { serializeBigInts } from "../utils/formatting.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

// Vault type constants
const VAULT_TYPES: Record<number, string> = {
  10000: "T1",
  20000: "T2",
  30000: "T3",
  40000: "T4",
};

export const vaultReadTools = {
  // ── List all vaults ────────────────────────────────────────────────────
  fluid_get_all_vaults: {
    description:
      "List all Fluid vault addresses on a chain. Returns vault addresses and their types (T1, T2, T3, T4).",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const [vaults, total] = await Promise.all([
        resolver.getAllVaultsAddresses(),
        resolver.getTotalVaults(),
      ]);

      // Get vault types for each vault
      const vaultsWithTypes = await Promise.all(
        vaults.map(async (vault: string) => {
          try {
            const typeRaw = await resolver.getVaultType(vault);
            const typeNum = Number(typeRaw);
            return {
              address: vault,
              type: VAULT_TYPES[typeNum] || `UNKNOWN(${typeNum})`,
              typeValue: typeNum,
            };
          } catch {
            return {
              address: vault,
              type: "UNKNOWN",
              typeValue: 0,
            };
          }
        })
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ chain: args.chain, totalVaults: Number(total), vaults: vaultsWithTypes }, null, 2),
          },
        ],
      };
    },
  },

  // ── Get vault type ─────────────────────────────────────────────────────
  fluid_get_vault_type: {
    description:
      "Get the type of a specific vault (T1, T2, T3, or T4). T1=10000, T2=20000, T3=30000, T4=40000.",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault contract address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; vault_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const typeRaw = await resolver.getVaultType(args.vault_address);
      const typeNum = Number(typeRaw);
      const typeStr = VAULT_TYPES[typeNum] || "UNKNOWN";

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                vault: args.vault_address,
                type: typeStr,
                typeValue: typeNum,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get vault entire data ──────────────────────────────────────────────
  fluid_get_vault_data: {
    description:
      "Get comprehensive data for a specific Fluid vault: supply/borrow tokens, rates, collateral factor, liquidation threshold, LTV limits, total supply/borrow, and availability limits.",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault contract address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; vault_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const data = await resolver.getVaultEntireData(args.vault_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                vault: data.vault,
                constants: serializeBigInts({
                  supplyToken: data.constantVariables.supplyToken,
                  borrowToken: data.constantVariables.borrowToken,
                  supplyDecimals: Number(data.constantVariables.supplyDecimals),
                  borrowDecimals: Number(data.constantVariables.borrowDecimals),
                  vaultId: data.constantVariables.vaultId,
                }),
                configs: serializeBigInts({
                  collateralFactor: Number(data.configs.collateralFactor),
                  liquidationThreshold: Number(data.configs.liquidationThreshold),
                  liquidationMaxLimit: Number(data.configs.liquidationMaxLimit),
                  liquidationPenalty: Number(data.configs.liquidationPenalty),
                  borrowFee: Number(data.configs.borrowFee),
                  oraclePrice: data.configs.oraclePrice,
                }),
                rates: serializeBigInts({
                  supplyRate: data.exchangePricesAndRates.supplyRate,
                  borrowRate: data.exchangePricesAndRates.borrowRate,
                  supplyExchangePrice: data.exchangePricesAndRates.supplyExchangePrice,
                  borrowExchangePrice: data.exchangePricesAndRates.borrowExchangePrice,
                }),
                totals: serializeBigInts({
                  totalSupplyVault: data.totalSupplyAndBorrow.totalSupplyVault,
                  totalBorrowVault: data.totalSupplyAndBorrow.totalBorrowVault,
                  totalSupplyLiquidity: data.totalSupplyAndBorrow.totalSupplyLiquidity,
                  totalBorrowLiquidity: data.totalSupplyAndBorrow.totalBorrowLiquidity,
                }),
                limits: serializeBigInts({
                  withdrawLimit: data.limitsAndAvailability.withdrawLimit,
                  withdrawable: data.limitsAndAvailability.withdrawable,
                  borrowLimit: data.limitsAndAvailability.borrowLimit,
                  borrowable: data.limitsAndAvailability.borrowable,
                  minimumBorrowing: data.limitsAndAvailability.minimumBorrowing,
                }),
                isSmartCol: data.isSmartCol,
                isSmartDebt: data.isSmartDebt,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get vault position by NFT ID ───────────────────────────────────────
  fluid_get_vault_position: {
    description:
      "Get a specific vault position by its NFT ID. Each Fluid vault position is represented as an NFT. Returns supply (collateral), borrow (debt), liquidation status, and exchange prices.",
    schema: z.object({
      chain: ChainParam,
      nft_id: z.number().describe("Position NFT ID"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; nft_id: number; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const [position, vaultAddr] = await Promise.all([
        resolver.positionByNftId(args.nft_id),
        resolver.vaultByNftId(args.nft_id),
      ]);

      // Get vault data as well
      let vaultData = null;
      try {
        vaultData = await resolver.getVaultEntireData(vaultAddr);
      } catch {}

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                nftId: args.nft_id,
                vault: vaultAddr,
                position: serializeBigInts({
                  nftId: position.nftId,
                  owner: position.owner,
                  isLiquidated: position.isLiquidated,
                  supply: position.supply,
                  borrow: position.borrow,
                  supplyExchangePrice: position.supplyExchangePrice,
                  borrowExchangePrice: position.borrowExchangePrice,
                }),
                vaultData: vaultData
                  ? serializeBigInts({
                      supplyToken: vaultData.constantVariables.supplyToken,
                      borrowToken: vaultData.constantVariables.borrowToken,
                      collateralFactor: Number(vaultData.configs.collateralFactor),
                      liquidationThreshold: Number(vaultData.configs.liquidationThreshold),
                    })
                  : null,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get user vault NFT IDs ─────────────────────────────────────────────
  fluid_get_user_vault_nft_ids: {
    description:
      "Get all vault position NFT IDs owned by a specific user address.",
    schema: z.object({
      chain: ChainParam,
      user_address: z.string().describe("User wallet address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; user_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const nftIds = await resolver.positionsNftIdOfUser(args.user_address);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                user: args.user_address,
                totalNfts: nftIds.length,
                nftIds: nftIds.map((id: bigint) => id.toString()),
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get vault by NFT ID ────────────────────────────────────────────────
  fluid_get_vault_by_nft: {
    description:
      "Get the vault address for a specific vault position NFT ID.",
    schema: z.object({
      chain: ChainParam,
      nft_id: z.number().describe("Position NFT ID"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; nft_id: number; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const vault = await resolver.vaultByNftId(args.nft_id);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                nftId: args.nft_id,
                vault: vault,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ── Get total positions ────────────────────────────────────────────────
  fluid_get_total_positions: {
    description:
      "Get the total number of vault positions (NFTs) across all vaults on a chain.",
    schema: z.object({
      chain: ChainParam,
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const total = await resolver.totalPositions();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                totalPositions: total.toString(),
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

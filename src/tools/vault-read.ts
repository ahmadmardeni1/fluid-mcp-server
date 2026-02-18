/**
 * Vault Protocol Read Tools
 *
 * Read-only tools for querying Fluid Vaults:
 * - List all vaults and their types (T1, T2, T3, T4)
 * - Get vault data (collateral, debt, rates, limits)
 * - Query vault positions by NFT ID or user
 */

import { z } from "zod";
import { ethers } from "ethers";
import { getProvider, getContract } from "../utils/provider.js";
import { getChainConfig, SUPPORTED_CHAINS, CONTRACTS } from "../config/chains.js";
import { VAULT_RESOLVER_ABI, ERC20_ABI } from "../abis/index.js";
import {
  serializeBigInts,
  formatTokenAmount,
  formatVaultPercent,
  formatRateToAPY,
} from "../utils/formatting.js";

const ChainParam = z.string().describe(`Blockchain network. Supported: ${SUPPORTED_CHAINS.join(", ")}`);

// Vault type constants
const VAULT_TYPES: Record<number, string> = {
  10000: "T1",
  20000: "T2",
  30000: "T3",
  40000: "T4",
};

/**
 * Helper: get the primary supply token address from ConstantViews.
 * T1/T3 vaults have supply as a single token (token0 of supplyToken struct).
 * T2/T4 vaults have supply as a DEX pair (token0 and token1).
 */
function getSupplyTokenAddress(cv: any): string {
  // New ABI: supplyToken is a Tokens struct {token0, token1}
  if (cv.supplyToken?.token0) return cv.supplyToken.token0;
  // Also try the `supply` field which is the direct supply address
  if (cv.supply && cv.supply !== ethers.ZeroAddress) return cv.supply;
  return ethers.ZeroAddress;
}

function getBorrowTokenAddress(cv: any): string {
  if (cv.borrowToken?.token0) return cv.borrowToken.token0;
  if (cv.borrow && cv.borrow !== ethers.ZeroAddress) return cv.borrow;
  return ethers.ZeroAddress;
}

/**
 * Helper: get token symbol and decimals.
 */
async function getTokenInfo(address: string, provider: any): Promise<{ symbol: string; decimals: number }> {
  if (!address || address === ethers.ZeroAddress) return { symbol: "UNKNOWN", decimals: 18 };
  try {
    const token = getContract(address, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([
      token.symbol().catch(() => "UNKNOWN"),
      token.decimals().catch(() => 18),
    ]);
    return { symbol, decimals: Number(decimals) };
  } catch {
    return { symbol: "UNKNOWN", decimals: 18 };
  }
}

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
      "Get comprehensive data for a specific Fluid vault: supply/borrow tokens with symbols, rates as APY, human-readable collateral factor, liquidation threshold, LTV limits, total supply/borrow, and availability limits.",
    schema: z.object({
      chain: ChainParam,
      vault_address: z.string().describe("Vault contract address"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; vault_address: string; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      const data = await resolver.getVaultEntireData(args.vault_address);

      const cv = data.constantVariables;
      const supplyAddr = getSupplyTokenAddress(cv);
      const borrowAddr = getBorrowTokenAddress(cv);

      const [supplyInfo, borrowInfo] = await Promise.all([
        getTokenInfo(supplyAddr, provider),
        getTokenInfo(borrowAddr, provider),
      ]);

      const vaultTypeNum = Number(cv.vaultType || 0);
      const vaultType = VAULT_TYPES[vaultTypeNum] || `UNKNOWN(${vaultTypeNum})`;

      const epr = data.exchangePricesAndRates;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                vault: data.vault,
                vaultType,
                isSmartCol: data.isSmartCol,
                isSmartDebt: data.isSmartDebt,
                tokens: {
                  supplyToken: supplyAddr,
                  supplySymbol: supplyInfo.symbol,
                  supplyDecimals: supplyInfo.decimals,
                  borrowToken: borrowAddr,
                  borrowSymbol: borrowInfo.symbol,
                  borrowDecimals: borrowInfo.decimals,
                  vaultId: serializeBigInts(cv.vaultId),
                },
                configs: {
                  collateralFactor: formatVaultPercent(Number(data.configs.collateralFactor)),
                  liquidationThreshold: formatVaultPercent(Number(data.configs.liquidationThreshold)),
                  liquidationMaxLimit: formatVaultPercent(Number(data.configs.liquidationMaxLimit)),
                  withdrawalGap: formatVaultPercent(Number(data.configs.withdrawalGap)),
                  liquidationPenalty: formatVaultPercent(Number(data.configs.liquidationPenalty)),
                  borrowFee: formatVaultPercent(Number(data.configs.borrowFee)),
                  oraclePriceOperate: serializeBigInts(data.configs.oraclePriceOperate),
                  oraclePriceLiquidate: serializeBigInts(data.configs.oraclePriceLiquidate),
                },
                rates: {
                  supplyRateLiquidity: formatRateToAPY(BigInt(epr.supplyRateLiquidity.toString())),
                  borrowRateLiquidity: formatRateToAPY(BigInt(epr.borrowRateLiquidity.toString())),
                  supplyRateVault: formatRateToAPY(BigInt(epr.supplyRateVault.toString())),
                  borrowRateVault: formatRateToAPY(BigInt(epr.borrowRateVault.toString())),
                  vaultSupplyExchangePrice: serializeBigInts(epr.vaultSupplyExchangePrice),
                  vaultBorrowExchangePrice: serializeBigInts(epr.vaultBorrowExchangePrice),
                },
                totals: {
                  totalSupplyVault: formatTokenAmount(BigInt(data.totalSupplyAndBorrow.totalSupplyVault.toString()), supplyInfo.decimals),
                  totalBorrowVault: formatTokenAmount(BigInt(data.totalSupplyAndBorrow.totalBorrowVault.toString()), borrowInfo.decimals),
                  totalSupplyLiquidityOrDex: formatTokenAmount(BigInt(data.totalSupplyAndBorrow.totalSupplyLiquidityOrDex.toString()), supplyInfo.decimals),
                  totalBorrowLiquidityOrDex: formatTokenAmount(BigInt(data.totalSupplyAndBorrow.totalBorrowLiquidityOrDex.toString()), borrowInfo.decimals),
                },
                limits: serializeBigInts({
                  withdrawLimit: data.limitsAndAvailability.withdrawLimit,
                  withdrawable: data.limitsAndAvailability.withdrawable,
                  borrowLimit: data.limitsAndAvailability.borrowLimit,
                  borrowable: data.limitsAndAvailability.borrowable,
                  minimumBorrowing: data.limitsAndAvailability.minimumBorrowing,
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

  // ── Get vault position by NFT ID ───────────────────────────────────────
  fluid_get_vault_position: {
    description:
      "Get a specific vault position by its NFT ID. Each Fluid vault position is represented as an NFT. Returns decoded supply (collateral), borrow (debt) in human-readable token amounts, liquidation status, vault config, and rates.",
    schema: z.object({
      chain: ChainParam,
      nft_id: z.number().describe("Position NFT ID"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; nft_id: number; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      // positionByNftId returns (UserPosition, VaultEntireData)
      const [position, vaultData] = await resolver.positionByNftId(args.nft_id);

      const cv = vaultData.constantVariables;
      const supplyAddr = getSupplyTokenAddress(cv);
      const borrowAddr = getBorrowTokenAddress(cv);

      const [supplyInfo, borrowInfo] = await Promise.all([
        getTokenInfo(supplyAddr, provider),
        getTokenInfo(borrowAddr, provider),
      ]);

      const vaultTypeNum = Number(cv.vaultType || 0);
      const vaultType = VAULT_TYPES[vaultTypeNum] || `UNKNOWN(${vaultTypeNum})`;

      // position.supply and position.borrow are already in token's smallest unit
      const rawSupply = BigInt(position.supply.toString());
      const rawBorrow = BigInt(position.borrow.toString());

      const result: any = {
        chain: args.chain,
        nftId: args.nft_id,
        vault: vaultData.vault,
        vaultType,
        owner: position.owner,
        isLiquidated: position.isLiquidated,
        isSmartCol: vaultData.isSmartCol,
        isSmartDebt: vaultData.isSmartDebt,
        supply: {
          token: supplyAddr,
          symbol: supplyInfo.symbol,
          amount: formatTokenAmount(rawSupply, supplyInfo.decimals),
          amountRaw: rawSupply.toString(),
        },
        borrow: {
          token: borrowAddr,
          symbol: borrowInfo.symbol,
          amount: formatTokenAmount(rawBorrow, borrowInfo.decimals),
          amountRaw: rawBorrow.toString(),
        },
        config: {
          collateralFactor: formatVaultPercent(Number(vaultData.configs.collateralFactor)),
          liquidationThreshold: formatVaultPercent(Number(vaultData.configs.liquidationThreshold)),
          liquidationMaxLimit: formatVaultPercent(Number(vaultData.configs.liquidationMaxLimit)),
          liquidationPenalty: formatVaultPercent(Number(vaultData.configs.liquidationPenalty)),
          borrowFee: formatVaultPercent(Number(vaultData.configs.borrowFee)),
          oraclePriceOperate: serializeBigInts(vaultData.configs.oraclePriceOperate),
          oraclePriceLiquidate: serializeBigInts(vaultData.configs.oraclePriceLiquidate),
        },
        rates: {
          supplyRateLiquidity: formatRateToAPY(BigInt(vaultData.exchangePricesAndRates.supplyRateLiquidity.toString())),
          borrowRateLiquidity: formatRateToAPY(BigInt(vaultData.exchangePricesAndRates.borrowRateLiquidity.toString())),
          supplyRateVault: formatRateToAPY(BigInt(vaultData.exchangePricesAndRates.supplyRateVault.toString())),
          borrowRateVault: formatRateToAPY(BigInt(vaultData.exchangePricesAndRates.borrowRateVault.toString())),
        },
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
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
      "Get the vault address and decoded position summary for a specific vault position NFT ID.",
    schema: z.object({
      chain: ChainParam,
      nft_id: z.number().describe("Position NFT ID"),
      rpc_url: z.string().optional(),
    }),
    handler: async (args: { chain: string; nft_id: number; rpc_url?: string }) => {
      const provider = getProvider(args.chain, args.rpc_url);
      const resolver = getContract(CONTRACTS.vaultResolver, VAULT_RESOLVER_ABI, provider);

      // positionByNftId returns (UserPosition, VaultEntireData)
      const [position, vaultData] = await resolver.positionByNftId(args.nft_id);

      const cv = vaultData.constantVariables;
      const supplyAddr = getSupplyTokenAddress(cv);
      const borrowAddr = getBorrowTokenAddress(cv);

      const [supplyInfo, borrowInfo] = await Promise.all([
        getTokenInfo(supplyAddr, provider),
        getTokenInfo(borrowAddr, provider),
      ]);

      const vaultTypeNum = Number(cv.vaultType || 0);
      const vaultType = VAULT_TYPES[vaultTypeNum] || `UNKNOWN(${vaultTypeNum})`;

      const rawSupply = BigInt(position.supply.toString());
      const rawBorrow = BigInt(position.borrow.toString());

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                chain: args.chain,
                nftId: args.nft_id,
                vault: vaultData.vault,
                vaultType,
                isSmartCol: vaultData.isSmartCol,
                isSmartDebt: vaultData.isSmartDebt,
                owner: position.owner,
                isLiquidated: position.isLiquidated,
                supply: {
                  token: supplyAddr,
                  symbol: supplyInfo.symbol,
                  amount: formatTokenAmount(rawSupply, supplyInfo.decimals),
                  amountRaw: rawSupply.toString(),
                },
                borrow: {
                  token: borrowAddr,
                  symbol: borrowInfo.symbol,
                  amount: formatTokenAmount(rawBorrow, borrowInfo.decimals),
                  amountRaw: rawBorrow.toString(),
                },
                config: {
                  collateralFactor: formatVaultPercent(Number(vaultData.configs.collateralFactor)),
                  liquidationThreshold: formatVaultPercent(Number(vaultData.configs.liquidationThreshold)),
                  liquidationPenalty: formatVaultPercent(Number(vaultData.configs.liquidationPenalty)),
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

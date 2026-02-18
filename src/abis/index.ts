/**
 * Fluid Protocol ABI definitions for all resolver and protocol contracts.
 *
 * These are minimal ABIs containing only the functions we need.
 * LendingResolver and VaultResolver use JSON format due to complex struct returns.
 */

// ============================================================================
// LENDING RESOLVER (fTokens)
// ============================================================================
export const LENDING_RESOLVER_ABI = [
  {
    inputs: [],
    name: "getAllFTokens",
    outputs: [{ internalType: "address[]", name: "fTokens_", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "fToken_", type: "address" }],
    name: "getFTokensEntireData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "bool", name: "isNativeUnderlying", type: "bool" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "uint256", name: "decimals", type: "uint256" },
          { internalType: "address", name: "asset", type: "address" },
          { internalType: "uint256", name: "totalAssets", type: "uint256" },
          { internalType: "uint256", name: "totalSupply", type: "uint256" },
          { internalType: "uint256", name: "convertToShares", type: "uint256" },
          { internalType: "uint256", name: "convertToAssets", type: "uint256" },
          { internalType: "uint256", name: "supplyRate", type: "uint256" },
          { internalType: "uint256", name: "rewardsRate", type: "uint256" },
          { internalType: "bool", name: "rebalanceDifference", type: "bool" },
          { internalType: "uint256", name: "liquidityBalance", type: "uint256" },
        ],
        internalType: "struct FTokenResolver.FTokenEntireData",
        name: "fTokenData_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "fToken_", type: "address" }],
    name: "getFTokenDetails",
    outputs: [
      {
        components: [
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "bool", name: "isNativeUnderlying", type: "bool" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "uint256", name: "decimals", type: "uint256" },
          { internalType: "address", name: "asset", type: "address" },
          { internalType: "uint256", name: "totalAssets", type: "uint256" },
          { internalType: "uint256", name: "totalSupply", type: "uint256" },
          { internalType: "uint256", name: "convertToShares", type: "uint256" },
          { internalType: "uint256", name: "convertToAssets", type: "uint256" },
          { internalType: "uint256", name: "supplyRate", type: "uint256" },
          { internalType: "uint256", name: "rewardsRate", type: "uint256" },
          { internalType: "bool", name: "rebalanceDifference", type: "bool" },
          { internalType: "uint256", name: "liquidityBalance", type: "uint256" },
        ],
        internalType: "struct FTokenResolver.FTokenEntireData",
        name: "details_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "fToken_", type: "address" },
      { internalType: "address", name: "user_", type: "address" },
    ],
    name: "getUserPosition",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "fTokenShares", type: "uint256" },
          { internalType: "uint256", name: "underlyingAssets", type: "uint256" },
          { internalType: "uint256", name: "underlyingBalance", type: "uint256" },
          { internalType: "uint256", name: "allowance", type: "uint256" },
        ],
        internalType: "struct FTokenResolver.UserPosition",
        name: "userPosition_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user_", type: "address" }],
    name: "getUserPositions",
    outputs: [
      {
        components: [
          { internalType: "address", name: "fToken", type: "address" },
          { internalType: "uint256", name: "fTokenShares", type: "uint256" },
          { internalType: "uint256", name: "underlyingAssets", type: "uint256" },
          { internalType: "uint256", name: "underlyingBalance", type: "uint256" },
          { internalType: "uint256", name: "allowance", type: "uint256" },
          { internalType: "address", name: "asset", type: "address" },
          { internalType: "uint256", name: "totalAssets", type: "uint256" },
          { internalType: "uint256", name: "totalSupply", type: "uint256" },
          { internalType: "uint256", name: "supplyRate", type: "uint256" },
          { internalType: "uint256", name: "rewardsRate", type: "uint256" },
        ],
        internalType: "struct FTokenResolver.UserPositionFull",
        name: "userPositions_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "fToken_", type: "address" },
      { internalType: "uint256[]", name: "assets_", type: "uint256[]" },
      { internalType: "uint256[]", name: "shares_", type: "uint256[]" },
    ],
    name: "getPreviews",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "previewAsset", type: "uint256" },
          { internalType: "uint256", name: "previewShare", type: "uint256" },
        ],
        internalType: "struct FTokenResolver.Preview",
        name: "previews_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ============================================================================
// VAULT RESOLVER
// ============================================================================
export const VAULT_RESOLVER_ABI = [
  {
    inputs: [],
    name: "getAllVaultsAddresses",
    outputs: [{ internalType: "address[]", name: "vaults_", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalVaults",
    outputs: [{ internalType: "uint256", name: "totalVaults_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "vault_", type: "address" }],
    name: "getVaultType",
    outputs: [{ internalType: "uint256", name: "vaultType_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "vault_", type: "address" }],
    name: "getVaultEntireData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "vault", type: "address" },
          {
            components: [
              { internalType: "address", name: "liquidity", type: "address" },
              { internalType: "address", name: "factory", type: "address" },
              { internalType: "address", name: "adminImplementation", type: "address" },
              { internalType: "address", name: "secondaryImplementation", type: "address" },
              { internalType: "address", name: "supplyToken", type: "address" },
              { internalType: "address", name: "borrowToken", type: "address" },
              { internalType: "uint8", name: "supplyDecimals", type: "uint8" },
              { internalType: "uint8", name: "borrowDecimals", type: "uint8" },
              { internalType: "uint256", name: "vaultId", type: "uint256" },
              { internalType: "bytes32", name: "liquiditySupplyExchangePriceSlot", type: "bytes32" },
              { internalType: "bytes32", name: "liquidityBorrowExchangePriceSlot", type: "bytes32" },
              { internalType: "bytes32", name: "liquidityUserSupplySlot", type: "bytes32" },
              { internalType: "bytes32", name: "liquidityUserBorrowSlot", type: "bytes32" },
            ],
            internalType: "struct IFluidVaultResolver.ConstantVariables",
            name: "constantVariables",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint16", name: "supplyRateMagnifier", type: "uint16" },
              { internalType: "uint16", name: "borrowRateMagnifier", type: "uint16" },
              { internalType: "uint16", name: "collateralFactor", type: "uint16" },
              { internalType: "uint16", name: "liquidationThreshold", type: "uint16" },
              { internalType: "uint16", name: "liquidationMaxLimit", type: "uint16" },
              { internalType: "uint16", name: "withdrawGap", type: "uint16" },
              { internalType: "uint16", name: "liquidationPenalty", type: "uint16" },
              { internalType: "uint16", name: "borrowFee", type: "uint16" },
              { internalType: "address", name: "oracle", type: "address" },
              { internalType: "uint256", name: "oraclePrice", type: "uint256" },
              { internalType: "address", name: "rebalancer", type: "address" },
            ],
            internalType: "struct IFluidVaultResolver.Configs",
            name: "configs",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "totalSupply", type: "uint256" },
              { internalType: "uint256", name: "totalBorrow", type: "uint256" },
              { internalType: "uint256", name: "supplyRate", type: "uint256" },
              { internalType: "uint256", name: "borrowRate", type: "uint256" },
              { internalType: "uint256", name: "supplyExchangePrice", type: "uint256" },
              { internalType: "uint256", name: "borrowExchangePrice", type: "uint256" },
              { internalType: "uint256", name: "lastUpdateTimestamp", type: "uint256" },
            ],
            internalType: "struct IFluidVaultResolver.ExchangePricesAndRates",
            name: "exchangePricesAndRates",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "totalSupplyVault", type: "uint256" },
              { internalType: "uint256", name: "totalBorrowVault", type: "uint256" },
              { internalType: "uint256", name: "totalSupplyLiquidity", type: "uint256" },
              { internalType: "uint256", name: "totalBorrowLiquidity", type: "uint256" },
              { internalType: "uint256", name: "absorbedSupply", type: "uint256" },
              { internalType: "uint256", name: "absorbedBorrow", type: "uint256" },
            ],
            internalType: "struct IFluidVaultResolver.TotalSupplyAndBorrow",
            name: "totalSupplyAndBorrow",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "withdrawLimit", type: "uint256" },
              { internalType: "uint256", name: "withdrawableUntilLimit", type: "uint256" },
              { internalType: "uint256", name: "withdrawable", type: "uint256" },
              { internalType: "uint256", name: "borrowLimit", type: "uint256" },
              { internalType: "uint256", name: "borrowableUntilLimit", type: "uint256" },
              { internalType: "uint256", name: "borrowable", type: "uint256" },
              { internalType: "uint256", name: "minimumBorrowing", type: "uint256" },
            ],
            internalType: "struct IFluidVaultResolver.LimitsAndAvailability",
            name: "limitsAndAvailability",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "supplyExchangePrice", type: "uint256" },
              { internalType: "uint256", name: "borrowExchangePrice", type: "uint256" },
            ],
            internalType: "struct IFluidVaultResolver.LiquidityExchangePrices",
            name: "liquidityExchangePrices",
            type: "tuple",
          },
          { internalType: "bool", name: "isSmartCol", type: "bool" },
          { internalType: "bool", name: "isSmartDebt", type: "bool" },
        ],
        internalType: "struct IFluidVaultResolver.VaultEntireData",
        name: "entireData_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "nftId_", type: "uint256" }],
    name: "positionByNftId",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "nftId", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bool", name: "isLiquidated", type: "bool" },
          { internalType: "uint256", name: "supply", type: "uint256" },
          { internalType: "uint256", name: "borrow", type: "uint256" },
          { internalType: "uint256", name: "supplyExchangePrice", type: "uint256" },
          { internalType: "uint256", name: "borrowExchangePrice", type: "uint256" },
        ],
        internalType: "struct IFluidVaultResolver.Position",
        name: "position_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user_", type: "address" }],
    name: "positionsByUser",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "nftId", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bool", name: "isLiquidated", type: "bool" },
          { internalType: "uint256", name: "supply", type: "uint256" },
          { internalType: "uint256", name: "borrow", type: "uint256" },
          { internalType: "uint256", name: "supplyExchangePrice", type: "uint256" },
          { internalType: "uint256", name: "borrowExchangePrice", type: "uint256" },
        ],
        internalType: "struct IFluidVaultResolver.Position",
        name: "positions_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user_", type: "address" }],
    name: "positionsNftIdOfUser",
    outputs: [{ internalType: "uint256[]", name: "nftIds_", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "nftId_", type: "uint256" }],
    name: "vaultByNftId",
    outputs: [{ internalType: "address", name: "vault_", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPositions",
    outputs: [{ internalType: "uint256", name: "totalPositions_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// ============================================================================
// fToken (Lending) — for write operations
// ============================================================================
export const FTOKEN_ABI = [
  // ERC4626 standard
  {
    inputs: [
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "redeem",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "depositNative",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "withdrawNative",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Views
  {
    inputs: [],
    name: "asset",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAssets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "maxDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "maxMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "maxWithdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "maxRedeem",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "previewMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "previewRedeem",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

// ============================================================================
// VAULT TYPE 1 (T1) — Single-asset collateral, single-asset debt
// ============================================================================
export const VAULT_T1_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "nftId_", type: "uint256" },
      { internalType: "int256", name: "newCol_", type: "int256" },
      { internalType: "int256", name: "newDebt_", type: "int256" },
      { internalType: "address", name: "to_", type: "address" },
    ],
    name: "operate",
    outputs: [
      { internalType: "uint256", name: "nftId", type: "uint256" },
      { internalType: "int256", name: "supplyAmt", type: "int256" },
      { internalType: "int256", name: "borrowAmt", type: "int256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

// ============================================================================
// VAULT TYPE 2 (T2) — Dual-asset collateral, single-asset debt
// ============================================================================
export const VAULT_T2_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "nftId_", type: "uint256" },
      { internalType: "uint256", name: "newColToken0_", type: "uint256" },
      { internalType: "uint256", name: "newColToken1_", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "min", type: "uint256" },
          { internalType: "uint256", name: "max", type: "uint256" },
        ],
        internalType: "struct IFluidVaultT2.ColSharesMinMax",
        name: "colSharesMinMax_",
        type: "tuple",
      },
      { internalType: "int256", name: "newDebt_", type: "int256" },
      { internalType: "address", name: "to_", type: "address" },
    ],
    name: "operate",
    outputs: [
      { internalType: "uint256", name: "nftId", type: "uint256" },
      { internalType: "uint256", name: "colAmount0", type: "uint256" },
      { internalType: "uint256", name: "colAmount1", type: "uint256" },
      { internalType: "int256", name: "borrowAmt", type: "int256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ============================================================================
// VAULT TYPE 3 (T3) — Single-asset collateral, dual-asset debt
// ============================================================================
export const VAULT_T3_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "nftId_", type: "uint256" },
      { internalType: "int256", name: "newCol_", type: "int256" },
      { internalType: "int256", name: "newDebtToken0_", type: "int256" },
      { internalType: "int256", name: "newDebtToken1_", type: "int256" },
      {
        components: [
          { internalType: "uint256", name: "min", type: "uint256" },
          { internalType: "uint256", name: "max", type: "uint256" },
        ],
        internalType: "struct IFluidVaultT3.DebtSharesMinMax",
        name: "debtSharesMinMax_",
        type: "tuple",
      },
      { internalType: "address", name: "to_", type: "address" },
    ],
    name: "operate",
    outputs: [
      { internalType: "uint256", name: "nftId", type: "uint256" },
      { internalType: "int256", name: "supplyAmt", type: "int256" },
      { internalType: "int256", name: "borrowAmt0", type: "int256" },
      { internalType: "int256", name: "borrowAmt1", type: "int256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ============================================================================
// VAULT TYPE 4 (T4) — Dual-asset collateral, dual-asset debt
// ============================================================================
export const VAULT_T4_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "nftId_", type: "uint256" },
      { internalType: "uint256", name: "newColToken0_", type: "uint256" },
      { internalType: "uint256", name: "newColToken1_", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "min", type: "uint256" },
          { internalType: "uint256", name: "max", type: "uint256" },
        ],
        internalType: "struct IFluidVaultT4.ColSharesMinMax",
        name: "colSharesMinMax_",
        type: "tuple",
      },
      { internalType: "int256", name: "newDebtToken0_", type: "int256" },
      { internalType: "int256", name: "newDebtToken1_", type: "int256" },
      {
        components: [
          { internalType: "uint256", name: "min", type: "uint256" },
          { internalType: "uint256", name: "max", type: "uint256" },
        ],
        internalType: "struct IFluidVaultT4.DebtSharesMinMax",
        name: "debtSharesMinMax_",
        type: "tuple",
      },
      { internalType: "address", name: "to_", type: "address" },
    ],
    name: "operate",
    outputs: [
      { internalType: "uint256", name: "nftId", type: "uint256" },
      { internalType: "uint256", name: "colAmount0", type: "uint256" },
      { internalType: "uint256", name: "colAmount1", type: "uint256" },
      { internalType: "int256", name: "borrowAmt0", type: "int256" },
      { internalType: "int256", name: "borrowAmt1", type: "int256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ============================================================================
// LIQUIDITY RESOLVER
// ============================================================================
export const LIQUIDITY_RESOLVER_ABI = [
  {
    inputs: [],
    name: "listedTokens",
    outputs: [{ internalType: "address[]", name: "listedTokens_", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token_", type: "address" }],
    name: "getOverallTokenData",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "supplyRate", type: "uint256" },
          { internalType: "uint256", name: "borrowRate", type: "uint256" },
          { internalType: "uint256", name: "fee", type: "uint256" },
          { internalType: "uint256", name: "lastUpdateTimestamp", type: "uint256" },
          { internalType: "uint256", name: "supplyExchangePrice", type: "uint256" },
          { internalType: "uint256", name: "borrowExchangePrice", type: "uint256" },
          { internalType: "uint256", name: "supplyRawInterest", type: "uint256" },
          { internalType: "uint256", name: "supplyInterestFree", type: "uint256" },
          { internalType: "uint256", name: "borrowRawInterest", type: "uint256" },
          { internalType: "uint256", name: "borrowInterestFree", type: "uint256" },
          { internalType: "uint256", name: "totalSupply", type: "uint256" },
          { internalType: "uint256", name: "totalBorrow", type: "uint256" },
          { internalType: "uint256", name: "revenue", type: "uint256" },
          { internalType: "uint256", name: "maxUtilization", type: "uint256" },
        ],
        internalType: "struct ILiquidityResolver.OverallTokenData",
        name: "overallTokenData_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllOverallTokensData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          {
            components: [
              { internalType: "uint256", name: "supplyRate", type: "uint256" },
              { internalType: "uint256", name: "borrowRate", type: "uint256" },
              { internalType: "uint256", name: "fee", type: "uint256" },
              { internalType: "uint256", name: "lastUpdateTimestamp", type: "uint256" },
              { internalType: "uint256", name: "supplyExchangePrice", type: "uint256" },
              { internalType: "uint256", name: "borrowExchangePrice", type: "uint256" },
              { internalType: "uint256", name: "supplyRawInterest", type: "uint256" },
              { internalType: "uint256", name: "supplyInterestFree", type: "uint256" },
              { internalType: "uint256", name: "borrowRawInterest", type: "uint256" },
              { internalType: "uint256", name: "borrowInterestFree", type: "uint256" },
              { internalType: "uint256", name: "totalSupply", type: "uint256" },
              { internalType: "uint256", name: "totalBorrow", type: "uint256" },
              { internalType: "uint256", name: "revenue", type: "uint256" },
              { internalType: "uint256", name: "maxUtilization", type: "uint256" },
            ],
            internalType: "struct ILiquidityResolver.OverallTokenData",
            name: "data",
            type: "tuple",
          },
        ],
        internalType: "struct ILiquidityResolver.TokenWithData[]",
        name: "tokensData_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user_", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
    ],
    name: "getUserSupplyData",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "isAllowed", type: "bool" },
          { internalType: "uint256", name: "supply", type: "uint256" },
          { internalType: "uint256", name: "withdrawalLimit", type: "uint256" },
          { internalType: "uint256", name: "lastUpdateTimestamp", type: "uint256" },
          { internalType: "uint256", name: "expandPercent", type: "uint256" },
          { internalType: "uint256", name: "expandDuration", type: "uint256" },
          { internalType: "uint256", name: "baseWithdrawalLimit", type: "uint256" },
        ],
        internalType: "struct ILiquidityResolver.UserSupplyData",
        name: "userSupplyData_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user_", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
    ],
    name: "getUserBorrowData",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "isAllowed", type: "bool" },
          { internalType: "uint256", name: "borrow", type: "uint256" },
          { internalType: "uint256", name: "borrowLimit", type: "uint256" },
          { internalType: "uint256", name: "lastUpdateTimestamp", type: "uint256" },
          { internalType: "uint256", name: "expandPercent", type: "uint256" },
          { internalType: "uint256", name: "expandDuration", type: "uint256" },
          { internalType: "uint256", name: "baseBorrowLimit", type: "uint256" },
          { internalType: "uint256", name: "maxBorrowLimit", type: "uint256" },
        ],
        internalType: "struct ILiquidityResolver.UserBorrowData",
        name: "userBorrowData_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token_", type: "address" }],
    name: "getRevenue",
    outputs: [{ internalType: "uint256", name: "revenue_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// ============================================================================
// DEX RESOLVER
// ============================================================================
export const DEX_RESOLVER_ABI = [
  {
    inputs: [],
    name: "getAllPoolAddresses",
    outputs: [{ internalType: "address[]", name: "pools_", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPools",
    outputs: [{ internalType: "uint256", name: "totalPools_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "pool_", type: "address" }],
    name: "getPoolReserves",
    outputs: [
      {
        components: [
          { internalType: "address", name: "pool", type: "address" },
          { internalType: "address", name: "token0", type: "address" },
          { internalType: "address", name: "token1", type: "address" },
          { internalType: "uint256", name: "fee", type: "uint256" },
          { internalType: "uint256", name: "reserve0", type: "uint256" },
          { internalType: "uint256", name: "reserve1", type: "uint256" },
          { internalType: "uint256", name: "totalSupplyShares", type: "uint256" },
        ],
        internalType: "struct IDexResolver.PoolReserves",
        name: "reserves_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPoolsReserves",
    outputs: [
      {
        components: [
          { internalType: "address", name: "pool", type: "address" },
          { internalType: "address", name: "token0", type: "address" },
          { internalType: "address", name: "token1", type: "address" },
          { internalType: "uint256", name: "fee", type: "uint256" },
          { internalType: "uint256", name: "reserve0", type: "uint256" },
          { internalType: "uint256", name: "reserve1", type: "uint256" },
          { internalType: "uint256", name: "totalSupplyShares", type: "uint256" },
        ],
        internalType: "struct IDexResolver.PoolReserves[]",
        name: "allReserves_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ============================================================================
// DEX RESERVES RESOLVER
// ============================================================================
export const DEX_RESERVES_RESOLVER_ABI = [
  {
    inputs: [{ internalType: "address", name: "pool_", type: "address" }],
    name: "getPoolReservesAdjusted",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "colReserves0Adjusted", type: "uint256" },
          { internalType: "uint256", name: "colReserves1Adjusted", type: "uint256" },
          { internalType: "uint256", name: "debtReserves0Adjusted", type: "uint256" },
          { internalType: "uint256", name: "debtReserves1Adjusted", type: "uint256" },
          { internalType: "uint256", name: "dexFee", type: "uint256" },
          { internalType: "address", name: "token0", type: "address" },
          { internalType: "address", name: "token1", type: "address" },
        ],
        internalType: "struct IDexReservesResolver.AdjustedReserves",
        name: "adjustedReserves_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool_", type: "address" },
      { internalType: "bool", name: "swap0to1_", type: "bool" },
      { internalType: "uint256", name: "amountIn_", type: "uint256" },
      { internalType: "uint256", name: "colReserves0_", type: "uint256" },
      { internalType: "uint256", name: "colReserves1_", type: "uint256" },
      { internalType: "uint256", name: "debtReserves0_", type: "uint256" },
      { internalType: "uint256", name: "debtReserves1_", type: "uint256" },
    ],
    name: "estimateSwapIn",
    outputs: [{ internalType: "uint256", name: "amountOut_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool_", type: "address" },
      { internalType: "bool", name: "swap0to1_", type: "bool" },
      { internalType: "uint256", name: "amountOut_", type: "uint256" },
      { internalType: "uint256", name: "colReserves0_", type: "uint256" },
      { internalType: "uint256", name: "colReserves1_", type: "uint256" },
      { internalType: "uint256", name: "debtReserves0_", type: "uint256" },
      { internalType: "uint256", name: "debtReserves1_", type: "uint256" },
    ],
    name: "estimateSwapOut",
    outputs: [{ internalType: "uint256", name: "amountIn_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// ============================================================================
// DEX POOL — for swap operations
// ============================================================================
export const DEX_POOL_ABI = [
  {
    inputs: [
      { internalType: "bool", name: "swap0to1_", type: "bool" },
      { internalType: "uint256", name: "amountIn_", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin_", type: "uint256" },
      { internalType: "address", name: "to_", type: "address" },
    ],
    name: "swapIn",
    outputs: [{ internalType: "uint256", name: "amountOut_", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bool", name: "swap0to1_", type: "bool" },
      { internalType: "uint256", name: "amountOut_", type: "uint256" },
      { internalType: "uint256", name: "amountInMax_", type: "uint256" },
      { internalType: "address", name: "to_", type: "address" },
    ],
    name: "swapOut",
    outputs: [{ internalType: "uint256", name: "amountIn_", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

// ============================================================================
// ERC20 — basic token interface
// ============================================================================
export const ERC20_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

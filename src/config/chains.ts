/**
 * Fluid Protocol — Multi-chain contract configuration
 *
 * All resolver contracts use CREATE2 deployment with the SAME address on every chain.
 * This means LendingResolver, VaultResolver, and the factories have identical addresses
 * across Ethereum, Arbitrum, Base, Polygon, and Plasma.
 *
 * Source: https://github.com/Instadapp/fluid-contracts-public/blob/main/deployments/deployments.md
 */

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcDefault: string;
  explorer: string;
  nativeToken: string;
  wrappedNativeToken: string;
}

// Single contract addresses used across ALL chains (CREATE2 deployment)
export const CONTRACTS = {
  lendingResolver: "0x48D32f49aFeAEC7AE66ad7B9264f446fc11a1569",
  vaultResolver: "0xA5C3E16523eeeDDcC34706b0E6bE88b4c6EA95cC",
  lendingFactory: "0x54B91A0D94cb471F37f949c60F7Fa7935b551D03",
  vaultFactory: "0x324c5Dc1fC42c7a4D43d92df1eBA58a54d13Bf2d",
  liquidityResolver: "0xca13A15de31235A37134B4717021C35A3CF25C60",
  dexResolver: "0x11D80CfF056Cef4F9E6d23da8672fE9873e5cC07",
  dexReservesResolver: "0x05Bd8269A20C472b148246De20E6852091BF16Ff",
};

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcDefault: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
    nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    wrappedNativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcDefault: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    wrappedNativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcDefault: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    wrappedNativeToken: "0x4200000000000000000000000000000000000006",
  },
  polygon: {
    chainId: 137,
    name: "Polygon PoS",
    rpcDefault: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    wrappedNativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  plasma: {
    chainId: 9745,
    name: "Plasma",
    rpcDefault: "https://rpc.plasma.to",
    explorer: "https://plasmascan.to",
    nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    wrappedNativeToken: "0x4200000000000000000000000000000000000006",
  },
};

export const SUPPORTED_CHAINS = Object.keys(CHAINS);

export function getChainConfig(chain: string): ChainConfig {
  const config = CHAINS[chain.toLowerCase()];
  if (!config) {
    throw new Error(
      `Unsupported chain: ${chain}. Supported: ${SUPPORTED_CHAINS.join(", ")}`
    );
  }
  return config;
}

export function getChainByChainId(chainId: number): ChainConfig | undefined {
  return Object.values(CHAINS).find((c) => c.chainId === chainId);
}
